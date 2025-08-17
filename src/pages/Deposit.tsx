import { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useLocation } from 'react-router-dom'
import { formatEther, parseEther, parseUnits, formatUnits } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { PiggyBank, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react'
import { fetchPendleMarket, type MarketData } from '@/lib/pendle'
import { OVFL_ABI } from '@/lib/abi/ovfl'
import { ERC20_ABI } from '@/lib/abi/erc20'
import { OVFL_ADDRESS, WSTETH } from '@/lib/addresses'
import { ovflTenderly } from '@/config/wagmi'
import { BuyPTModal } from '@/components/Pendle/BuyPTModal'

export default function Deposit() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const location = useLocation()
  const [selectedMarket, setSelectedMarket] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [isLoadingMarket, setIsLoadingMarket] = useState(true)

  const { writeContract, data: txHash, error: txError } = useWriteContract()

  // Wait for transaction confirmations
  const { isLoading: isApprovalPending, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
    },
  })

  // Read PT balance
  const { data: ptBalance, refetch: refetchPtBalance } = useReadContract({
    address: marketData?.ptAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!marketData?.ptAddress,
    },
  })

  // Read PT decimals for proper parsing
  const { data: ptDecimals } = useReadContract({
    address: marketData?.ptAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!marketData?.ptAddress,
    },
  })

  // Read ovflETH balance  
  const { data: ovflETHAddress } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'ovflETH',
  })

  const { data: ovflETHBalance } = useReadContract({
    address: ovflETHAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!ovflETHAddress,
    },
  })

  // Read PT allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: marketData?.ptAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, OVFL_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!marketData?.ptAddress,
    },
  })

  // Read wstETH balance
  const { data: wstETHBalance, refetch: refetchWstETHBalance } = useReadContract({
    address: WSTETH,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read wstETH allowance
  const { data: wstETHAllowance, refetch: refetchWstETHAllowance } = useReadContract({
    address: WSTETH,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, OVFL_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read fee parameters
  const { data: feeBps } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'feeBps',
  })

  const { data: basisPoints } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'BASIS_POINTS',
  })

  // Helper to display amounts without decimals
  const noDec = (s: string) => (s?.split?.('.')?.[0] || '0')

  // Safe parsing for deposit amount (whole numbers only)
  const parsedDepositAmount = useMemo(() => {
    if (!ptDecimals || !depositAmount) return undefined
    
    // Validate input format: whole numbers only
    const validFormat = /^[0-9]+$/.test(depositAmount)
    if (!validFormat) return undefined
    
    const num = Number(depositAmount)
    if (num <= 0) return undefined
    
    try {
      return parseUnits(depositAmount, Number(ptDecimals))
    } catch {
      return undefined
    }
  }, [depositAmount, ptDecimals])

  // Read OVFL preview  
  const { data: previewData } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'previewStream',
    args: marketData?.id && parsedDepositAmount !== undefined ? [
      marketData.id as `0x${string}`, 
      parsedDepositAmount
    ] : undefined,
    query: {
      enabled: Boolean(marketData?.id && parsedDepositAmount !== undefined),
    },
  })

  // Read minimum PT amount
  const { data: minPtAmount } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'MIN_PT_AMOUNT',
  })

  // Check if market is approved
  const { data: marketApproval } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'series',
    args: marketData?.id ? [marketData.id as `0x${string}`] : undefined,
    query: {
      enabled: !!marketData?.id,
    },
  })

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoadingMarket(true)
        
        // Read query parameters
        const searchParams = new URLSearchParams(location.search)
        const marketParam = searchParams.get('market')
        const amountParam = searchParams.get('amount')
        
        // Fetch market data with specific market if provided
        const market = await fetchPendleMarket(marketParam || undefined)
        if (market) {
          setMarketData(market)
          setSelectedMarket(market.id)
        }
        
        // Set amount if provided in query params
        if (amountParam && !isNaN(Number(amountParam))) {
          setDepositAmount(amountParam)
        }
      } catch (error) {
        console.error('Failed to load market data:', error)
      } finally {
        setIsLoadingMarket(false)
      }
    }
    loadMarketData()
  }, [location.search])

  const handleMaxClick = () => {
    if (ptBalance && ptDecimals) {
      const decimals = Number(ptDecimals)
      const balance = ptBalance as bigint
      const formattedBalance = formatUnits(balance, decimals)
      // Store only the integer part
      const integerPart = formattedBalance.split('.')[0] || '0'
      setDepositAmount(integerPart)
    }
  }

  const handleApprovePT = async () => {
    if (!marketData?.ptAddress || !parsedDepositAmount) return

    try {
      setIsLoading(true)
      console.log('[DEPOSIT] PT Approval starting:', { ptAddress: marketData.ptAddress, depositAmount, amount: parsedDepositAmount.toString() })
      
      await writeContract({
        address: marketData.ptAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [OVFL_ADDRESS, parsedDepositAmount],
        chain: ovflTenderly,
        account: address!,
      })
      
      toast({
        title: 'PT Approval Submitted',
        description: 'Please wait for the transaction to confirm',
      })
    } catch (error) {
      console.error('PT Approval failed:', error)
      toast({
        title: 'PT Approval Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveWstETH = async () => {
    try {
      setIsLoading(true)
      // Approve unlimited amount
      const MAX_APPROVAL = 2n ** 256n - 1n
      console.log('[DEPOSIT] wstETH Approval starting:', { WSTETH, OVFL_ADDRESS, MAX_APPROVAL: MAX_APPROVAL.toString() })
      
      await writeContract({
        address: WSTETH,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [OVFL_ADDRESS, MAX_APPROVAL],
        chain: ovflTenderly,
        account: address!,
      })
      
      toast({
        title: 'Approving unlimited wstETH allowance to OVFL…',
        description: 'Please wait for the transaction to confirm',
      })
    } catch (error) {
      console.error('wstETH Approval failed:', error)
      toast({
        title: 'wstETH Approval Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!marketData || !parsedDepositAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a market and enter a valid amount',
        variant: 'destructive'
      })
      return
    }

    // Validate minimum amount
    if (minPtAmount && parsedDepositAmount < (minPtAmount as bigint)) {
      const minFormatted = formatUnits(minPtAmount as bigint, Number(ptDecimals))
      toast({
        title: 'Amount Too Small',
        description: `Minimum deposit is ${minFormatted} PT`,
        variant: 'destructive'
      })
      return
    }

    // Check market approval
    if (!marketApproval?.[0]) {
      toast({
        title: 'Market Not Approved',
        description: 'This market is not approved for deposits',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      console.log('[DEPOSIT] Deposit starting:', { marketId: marketData.id, amount: parsedDepositAmount.toString() })
      
      await writeContract({
        address: OVFL_ADDRESS,
        abi: OVFL_ABI,
        functionName: 'deposit',
        args: [marketData.id as `0x${string}`, parsedDepositAmount],
        chain: ovflTenderly,
        account: address!,
      })
      
      toast({
        title: 'Deposit Submitted!',
        description: `Depositing ${depositAmount} ${marketData.ptSymbol}`,
      })
      
      // Reset form
      setDepositAmount('')
      
    } catch (error) {
      console.error('Deposit failed:', error)
      toast({
        title: 'Deposit Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle transaction confirmations
  useEffect(() => {
    if (isApprovalConfirmed) {
      refetchAllowance()
      refetchWstETHAllowance()
      refetchPtBalance()
      refetchWstETHBalance()
      toast({
        title: 'wstETH allowance granted',
        description: 'You can now proceed with your deposit',
      })
    }
  }, [isApprovalConfirmed, refetchAllowance, refetchWstETHAllowance, refetchPtBalance, refetchWstETHBalance, toast])

  // Calculate required wstETH fee
  const requiredWstETHFee = previewData && feeBps && basisPoints ? (() => {
    const toUser = previewData[0] as bigint
    const feeBpsBn = feeBps as unknown as bigint
    const basisBn = basisPoints as unknown as bigint
    return (toUser * feeBpsBn) / basisBn
  })() : 0n

  const isPTApprovalNeeded = Boolean(allowance !== undefined && parsedDepositAmount !== undefined && parsedDepositAmount > (allowance as bigint))

  const isWstETHApprovalNeeded = Boolean(wstETHAllowance !== undefined && wstETHAllowance === 0n)
  
  const hasZeroPTBalance = ptBalance === 0n
  const hasInsufficientWstETH = wstETHBalance !== undefined && requiredWstETHFee > (wstETHBalance as bigint)
  
  const getButtonDisabledReason = () => {
    if (!marketData) return 'Loading market data...'
    if (!depositAmount) return 'Enter deposit amount'
    if (depositAmount && parsedDepositAmount === undefined) return 'Enter a valid amount'
    if (hasZeroPTBalance) return 'No PT balance'
    if (hasInsufficientWstETH) return 'Insufficient wstETH for fee'
    if (!marketApproval?.[0]) return 'Market not approved by OVFL'
    if (isLoading || isApprovalPending) return 'Transaction pending...'
    return null
  }
  
  const buttonDisabledReason = getButtonDisabledReason()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Deposit Principal Tokens</h1>
          <p className="text-xl text-muted-foreground">
            Convert your PTs into instant liquidity plus streaming yield
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Deposit Form
              </CardTitle>
              <CardDescription>
                Select a market and enter the amount you want to deposit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Market</label>
                {isLoadingMarket ? (
                  <div className="text-sm text-muted-foreground">Loading market data...</div>
                ) : marketData ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">{marketData.ptSymbol}</div>
                    <div className="text-sm text-success">{isFinite(marketData.impliedAPY) ? marketData.impliedAPY.toFixed(1) : '0.0'}% APY</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {marketApproval?.[0] ? 'Approved' : 'Not Approved'}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No market data available</div>
                )}
              </div>

              {/* Market Info */}
              {marketData && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Rate</span>
                    <span className="text-sm font-mono">{isFinite(marketData.currentRate) ? marketData.currentRate.toFixed(4) : '0.0000'} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="text-sm font-mono text-success">{isFinite(marketData.impliedAPY) ? marketData.impliedAPY.toFixed(1) : '0.0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expiry</span>
                    <span className="text-sm font-mono">{marketData.expiry.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVL</span>
                    <span className="text-sm font-mono">${isFinite(marketData.tvl / 1e6) ? (marketData.tvl / 1e6).toFixed(1) : '0.0'}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Days to Expiry</span>
                    <span className="text-sm font-mono">{marketData.daysToExpiry}</span>
                  </div>
                </div>
              )}

              {/* Balances */}
              {address && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">PT Balance</span>
                        <span className="text-sm font-mono">
                          {ptBalance && ptDecimals ? (() => {
                            const decimals = Number(ptDecimals)
                            const balance = ptBalance as bigint
                            const formatted = formatUnits(balance, decimals)
                            return `${noDec(formatted)} ${marketData?.ptSymbol || 'PT'}`
                          })() : `0 ${marketData?.ptSymbol || 'PT'}`}
                        </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">ovflETH Balance</span>
                       <span className="text-sm font-mono">
                         {ovflETHBalance ? noDec(formatEther(ovflETHBalance as bigint)) : '0'} ovflETH
                       </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-sm text-muted-foreground">wstETH Balance</span>
                       <span className="text-sm font-mono">
                         {wstETHBalance ? noDec(formatEther(wstETHBalance as bigint)) : '0'} wstETH
                       </span>
                   </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                 <Input
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => {
                    // Sanitize to digits only
                    const value = e.target.value.replace(/\D/g, '')
                    setDepositAmount(value)
                  }}
                />
                {marketData && depositAmount && (
                  <div className="text-sm text-muted-foreground">
                    Price: {isFinite(marketData.currentRate) ? marketData.currentRate.toFixed(4) : '0.0000'} PT/ETH • Discount: {isFinite((1 - marketData.currentRate) * 100) ? ((1 - marketData.currentRate) * 100).toFixed(2) : '0.00'}%
                  </div>
                )}
                 <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Balance: {ptBalance && ptDecimals ? (() => {
                      const decimals = Number(ptDecimals)
                      const balance = ptBalance as bigint
                      return formatUnits(balance, decimals)
                    })() : '0'} {marketData?.ptSymbol || 'PT'}</span>
                   <button 
                     className="text-primary hover:underline"
                     onClick={handleMaxClick}
                     disabled={!ptBalance}
                   >
                     Max
                   </button>
                 </div>
              </div>

              {/* Get PT Helper */}
              {hasZeroPTBalance && marketData && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-warning">No PT Balance</div>
                      <div className="text-xs text-muted-foreground">Get PT tokens first to make deposits</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setBuyModalOpen(true)}
                        className="ml-2"
                      >
                        Buy PT on Tenderly
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(marketData.pendleUrl, '_blank')}
                        className="ml-1"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Get PT
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {isWstETHApprovalNeeded ? (
                <Button 
                  onClick={handleApproveWstETH}
                  disabled={!!buttonDisabledReason || isApprovalPending}
                  className="w-full"
                  size="lg"
                >
                  {isLoading || isApprovalPending ? 'Approving...' : 'Approve wstETH Fee'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : isPTApprovalNeeded ? (
                <Button 
                  onClick={handleApprovePT}
                  disabled={!!buttonDisabledReason || isApprovalPending}
                  className="w-full"
                  size="lg"
                >
                  {isLoading || isApprovalPending ? 'Approving...' : `Approve ${marketData?.ptSymbol || 'PT'}`}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleDeposit}
                  disabled={!!buttonDisabledReason}
                  className="w-full"
                  size="lg"
                >
                  {buttonDisabledReason || (isLoading ? 'Processing...' : 'Deposit Principal Tokens')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Transaction Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Transaction Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketData && depositAmount && previewData ? (
                <>
                  {/* Price Info */}
                  <div className="text-sm text-muted-foreground mb-4">
                    Price: {isFinite(marketData.currentRate) ? marketData.currentRate.toFixed(4) : '0.0000'} PT/ETH • Discount: {isFinite((1 - marketData.currentRate) * 100) ? ((1 - marketData.currentRate) * 100).toFixed(2) : '0.00'}%
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You deposit</span>
                      <span className="font-mono">{depositAmount} {marketData.ptSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You receive now (ovflETH)</span>
                      <span className="font-mono text-success">{noDec(formatEther(previewData[0]))} ovflETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You stream (ETH)</span>
                      <span className="font-mono text-success">{noDec(formatEther(previewData[1]))} ETH</span>
                    </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Effective Rate</span>
                        <span className="font-mono">{(() => {
                          const rate = Number(formatEther(previewData[2]));
                          return isFinite(rate) ? rate.toFixed(4) : '0.0000';
                        })()} ETH</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Protocol Fee</span>
                       <span className="font-mono">{requiredWstETHFee > 0n ? noDec(formatEther(requiredWstETHFee)) : '0'} wstETH</span>
                     </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Stream ends in</span>
                      <span className="font-mono">{marketData.daysToExpiry} days</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {isLoadingMarket ? 'Loading market data...' : 'Enter an amount to see preview'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Buy PT Modal */}
      {marketData && (
                  <BuyPTModal
                    open={buyModalOpen}
                    onOpenChange={setBuyModalOpen}
                    marketAddress={marketData.id}
                    underlyingTokenAddress={marketData.underlyingAddress || WSTETH}
                    ptAddress={marketData.ptAddress}
                    onPurchased={() => {
                      refetchPtBalance()
                      setBuyModalOpen(false)
                    }}
                  />
      )}
    </div>
  )
}