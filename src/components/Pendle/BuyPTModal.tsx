import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ERC20_ABI } from '@/lib/abi/erc20'
import { fetchPendleQuote } from '@/lib/pendle-quote'
import { ovflTenderly } from '@/config/wagmi'
import { PENDLE_ROUTER_V3 } from '@/lib/addresses'

interface BuyPTModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketAddress: string
  underlyingTokenAddress: string
  ptAddress: string
  onPurchased: () => void
}

export function BuyPTModal({
  open,
  onOpenChange,
  marketAddress,
  underlyingTokenAddress,
  ptAddress,
  onPurchased,
}: BuyPTModalProps) {
  const { address } = useAccount()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [isBuying, setIsBuying] = useState(false)

  const { writeContract, data: approvalTxHash } = useWriteContract()
  const { sendTransaction, data: txHash } = useSendTransaction()
  
  // Wait for approval transaction confirmation
  const { isLoading: isApprovalPending, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  })
  
  // Wait for buy transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Read underlying token balance
  const { data: balance } = useReadContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ovflTenderly.id,
  })

  // Read underlying token decimals
  const { data: decimals } = useReadContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
    chainId: ovflTenderly.id,
  })

  // Read underlying token symbol
  const { data: symbol } = useReadContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'symbol',
    chainId: ovflTenderly.id,
  })

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PENDLE_ROUTER_V3] : undefined,
    chainId: ovflTenderly.id,
  })

  const handleMaxClick = () => {
    if (balance && decimals) {
      setAmount(formatUnits(balance as bigint, Number(decimals)))
    }
  }

  const handleApprove = async () => {
    if (!amount || !address || !decimals) return

    setIsApproving(true)
    try {
      const amountBigInt = parseUnits(amount, Number(decimals))
      
      await writeContract({
        address: underlyingTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PENDLE_ROUTER_V3, amountBigInt],
        chain: ovflTenderly,
        account: address,
      })

      toast({
        title: `Approving ${amount} ${symbol || 'tokens'}`,
        description: 'Waiting for confirmation...',
      })
    } catch (error) {
      toast({
        title: `Approval failed for ${symbol || 'tokens'}`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      setIsApproving(false)
    }
  }

  const handleBuy = async () => {
    if (!amount || !address || !decimals) return

    setIsBuying(true)
    try {
      const amountBigInt = parseUnits(amount, Number(decimals))
      
      const quote = await fetchPendleQuote({
        marketAddress,
        tokenIn: underlyingTokenAddress,
        amountIn: amountBigInt.toString(),
        slippageBps: 100, // 1% slippage
        receiver: address,
      })

      // Validate quote has valid transaction data
      if (!quote.data || quote.data === '0x') {
        throw new Error('Invalid quote: no transaction data')
      }

      await sendTransaction({
        to: quote.to as `0x${string}`,
        data: quote.data as `0x${string}`,
        value: quote.value ? BigInt(quote.value) : undefined,
        chainId: ovflTenderly.id,
        account: address,
      })
      
      toast({
        title: `Swapping ${amount} ${symbol || 'tokens'} for PT`,
        description: `Transaction sent. Waiting for confirmation...`,
      })
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
      setIsBuying(false)
    }
  }

  // Handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed && approvalTxHash) {
      toast({
        title: `Approval confirmed for ${symbol || 'tokens'}`,
        description: 'You can now proceed with the swap',
      })
      setIsApproving(false)
      refetchAllowance()
    }
  }, [isApprovalConfirmed, approvalTxHash, symbol, toast, refetchAllowance])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      toast({
        title: 'Swap confirmed!',
        description: `Successfully spent ${amount} ${symbol || 'tokens'} for PT`,
      })
      
      onPurchased()
      onOpenChange(false)
      setIsBuying(false)
      setAmount('')
    }
  }, [isConfirmed, txHash, amount, symbol, onPurchased, onOpenChange, toast])

  const amountBigInt = amount && decimals ? parseUnits(amount, Number(decimals)) : 0n
  const isApprovalNeeded = allowance !== undefined && amountBigInt > (allowance as bigint)
  const hasBalance = balance && amountBigInt <= (balance as bigint)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy PT on Tenderly</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (Underlying Tokens)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleMaxClick}>
                Max
              </Button>
            </div>
            {balance && decimals && (
              <p className="text-sm text-muted-foreground mt-1">
                Balance: {formatUnits(balance as bigint, Number(decimals))} {String(symbol) || 'tokens'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            {isApprovalNeeded && (
              <Button
                onClick={handleApprove}
                disabled={isApproving || isApprovalPending || !hasBalance || allowance === undefined}
                className="w-full"
              >
                {isApproving || isApprovalPending ? 'Approving...' : `Approve ${symbol || 'Tokens'}`}
              </Button>
            )}
            
            <Button
              onClick={handleBuy}
              disabled={isBuying || isConfirming || !hasBalance || isApprovalNeeded || !amount || allowance === undefined}
              className="w-full"
            >
              {allowance === undefined ? 'Loading allowance...' : (isBuying || isConfirming ? 'Processing...' : 'Buy PT')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}