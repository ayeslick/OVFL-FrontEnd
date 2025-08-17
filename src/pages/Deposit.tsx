import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useLocation } from 'react-router-dom'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { PiggyBank, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react'
import { fetchPendleMarket, type MarketData } from '@/lib/pendle'
import { OVFL_ABI } from '@/lib/abi/ovfl'
import { ERC20_ABI } from '@/lib/abi/erc20'
import { OVFL_ADDRESS } from '@/lib/addresses'
import { ovflTenderly } from '@/config/wagmi'

export default function Deposit() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const location = useLocation()
  const [selectedMarket, setSelectedMarket] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoadingMarket, setIsLoadingMarket] = useState(true)

  const { writeContract } = useWriteContract()

  // Read PT balance
  const { data: ptBalance } = useReadContract({
    address: marketData?.ptAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!marketData?.ptAddress,
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

  // Read allowance
  const { data: allowance } = useReadContract({
    address: marketData?.ptAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, OVFL_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!marketData?.ptAddress,
    },
  })

  // Read OVFL preview
  const { data: previewData } = useReadContract({
    address: OVFL_ADDRESS,
    abi: OVFL_ABI,
    functionName: 'previewStream',
    args: marketData?.id && depositAmount ? [marketData.id as `0x${string}`, parseEther(depositAmount || '0')] : undefined,
    query: {
      enabled: !!marketData?.id && !!depositAmount && !isNaN(Number(depositAmount)) && Number(depositAmount) > 0,
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
    if (ptBalance) {
      setDepositAmount(formatEther(ptBalance as bigint))
    }
  }

  const handleApprove = async () => {
    if (!marketData?.ptAddress || !depositAmount) return

    try {
      setIsLoading(true)
      await writeContract({
        address: marketData.ptAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [OVFL_ADDRESS, parseEther(depositAmount)],
        chain: ovflTenderly,
        account: address!,
      })
      
      toast({
        title: 'Approval Submitted',
        description: 'Please wait for the transaction to confirm',
      })
    } catch (error) {
      console.error('Approval failed:', error)
      toast({
        title: 'Approval Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!marketData || !depositAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a market and enter an amount',
        variant: 'destructive'
      })
      return
    }

    // Validate minimum amount
    if (minPtAmount && parseEther(depositAmount) < (minPtAmount as bigint)) {
      toast({
        title: 'Amount Too Small',
        description: `Minimum deposit is ${formatEther(minPtAmount as bigint)} PT`,
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
      
      await writeContract({
        address: OVFL_ADDRESS,
        abi: OVFL_ABI,
        functionName: 'deposit',
        args: [marketData.id as `0x${string}`, parseEther(depositAmount)],
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

  const isApprovalNeeded = allowance && depositAmount && parseEther(depositAmount) > (allowance as bigint)
  const hasZeroPTBalance = ptBalance === 0n

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
                    <div className="font-medium">{marketData.name}</div>
                    <div className="text-sm text-success">{marketData.impliedAPY.toFixed(1)}% APY</div>
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
                    <span className="text-sm font-mono">{marketData.currentRate.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="text-sm font-mono text-success">{marketData.impliedAPY.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expiry</span>
                    <span className="text-sm font-mono">{marketData.expiry.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVL</span>
                    <span className="text-sm font-mono">${(marketData.tvl / 1e6).toFixed(1)}M</span>
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
                       {ptBalance ? formatEther(ptBalance as bigint) : '0'} {marketData?.ptSymbol || 'PT'}
                     </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">ovflETH Balance</span>
                     <span className="text-sm font-mono">
                       {ovflETHBalance ? formatEther(ovflETHBalance as bigint) : '0'} ovflETH
                     </span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                />
                {marketData && depositAmount && (
                  <div className="text-sm text-muted-foreground">
                    Price: {marketData.currentRate.toFixed(4)} PT/ETH • Discount: {((1 - marketData.currentRate) * 100).toFixed(2)}%
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Balance: {ptBalance ? formatEther(ptBalance as bigint) : '0'} {marketData?.ptSymbol || 'PT'}</span>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(marketData.pendleUrl, '_blank')}
                      className="ml-2"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Get PT
                    </Button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {isApprovalNeeded ? (
                <Button 
                  onClick={handleApprove}
                  disabled={!marketData || !depositAmount || isLoading || isLoadingMarket}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Approving...' : `Approve ${marketData?.ptSymbol || 'PT'}`}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleDeposit}
                  disabled={!marketData || !depositAmount || isLoading || isLoadingMarket || hasZeroPTBalance || !marketApproval?.[0]}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : 'Deposit Principal Tokens'}
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
                    Price: {marketData.currentRate.toFixed(4)} PT/ETH • Discount: {((1 - marketData.currentRate) * 100).toFixed(2)}%
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You deposit</span>
                      <span className="font-mono">{depositAmount} {marketData.ptSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You receive now (ovflETH)</span>
                      <span className="font-mono text-success">{formatEther(previewData[0])} ovflETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You stream (ETH)</span>
                      <span className="font-mono text-success">{formatEther(previewData[1])} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Effective Rate</span>
                      <span className="font-mono">{(Number(formatEther(previewData[2]))).toFixed(4)} ETH</span>
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
    </div>
  )
}