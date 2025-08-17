import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useSendTransaction } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ERC20_ABI } from '@/lib/abi/erc20'
import { PENDLE_ROUTER_V3 } from '@/lib/addresses'
import { fetchPendleQuote } from '@/lib/pendle-quote'
import { ovflTenderly } from '@/config/wagmi'

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

  const { writeContract } = useWriteContract()
  const { sendTransaction } = useSendTransaction()

  // Read underlying token balance
  const { data: balance } = useReadContract({
    address: underlyingTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
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
    if (balance) {
      setAmount(formatEther(balance as bigint))
    }
  }

  const handleApprove = async () => {
    if (!amount || !address) return

    setIsApproving(true)
    try {
      await writeContract({
        address: underlyingTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [PENDLE_ROUTER_V3, parseEther(amount)],
        chain: ovflTenderly,
        account: address,
      })

      toast({
        title: 'Approval submitted',
        description: 'Waiting for confirmation...',
      })

      // Refetch allowance after approval
      setTimeout(() => refetchAllowance(), 2000)
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleBuy = async () => {
    if (!amount || !address) return

    setIsBuying(true)
    try {
      const quote = await fetchPendleQuote({
        marketAddress,
        tokenIn: underlyingTokenAddress,
        amountIn: parseEther(amount).toString(),
        slippageBps: 100, // 1% slippage
        receiver: address,
      })

      await sendTransaction({
        to: quote.to as `0x${string}`,
        data: quote.data as `0x${string}`,
        value: quote.value ? BigInt(quote.value) : undefined,
        chainId: ovflTenderly.id,
        account: address,
      })

      toast({
        title: 'Purchase submitted',
        description: `Buying PT with ${amount} underlying tokens`,
      })

      onPurchased()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setIsBuying(false)
    }
  }

  const amountBigInt = amount ? parseEther(amount) : 0n
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
            {balance && (
              <p className="text-sm text-muted-foreground mt-1">
                Balance: {formatEther(balance as bigint)} tokens
              </p>
            )}
          </div>

          <div className="space-y-2">
            {isApprovalNeeded && (
              <Button
                onClick={handleApprove}
                disabled={isApproving || !hasBalance}
                className="w-full"
              >
                {isApproving ? 'Approving...' : 'Approve Tokens'}
              </Button>
            )}
            
            <Button
              onClick={handleBuy}
              disabled={isBuying || !hasBalance || isApprovalNeeded || !amount}
              className="w-full"
            >
              {isBuying ? 'Buying...' : 'Buy PT'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}