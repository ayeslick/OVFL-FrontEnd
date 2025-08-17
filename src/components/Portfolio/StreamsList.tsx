import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getUserStreams, type StreamInfo, SABLIER_ADDRESS } from '@/lib/sablier'

// Simplified ABI for withdrawal functions only
const WITHDRAWAL_ABI = [
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint128' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'withdrawMax',
    outputs: [{ name: 'withdrawnAmount', type: 'uint128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

interface StreamsListProps {
  refreshNonce?: number
  onMetricsUpdate?: (activeCount: number, inactiveCount: number) => void
}

export function StreamsList({ refreshNonce, onMetricsUpdate }: StreamsListProps) {
  const { toast } = useToast()
  const { isConnected, address } = useAccount()
  const [streams, setStreams] = useState<StreamInfo[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [withdrawAmounts, setWithdrawAmounts] = useState<{ [key: string]: string }>({})
  const [isLoadingStreams, setIsLoadingStreams] = useState(true)
  const [processingStream, setProcessingStream] = useState<string | null>(null)
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConnected && address) {
      const fetchStreams = async (isInitial = false) => {
        try {
          if (isInitial) setIsLoadingStreams(true)
          const userStreams = await getUserStreams(address)
          setStreams(userStreams)
          
          // Update metrics
          if (onMetricsUpdate) {
            const activeCount = userStreams.filter(s => s.withdrawableAmount > 0n).length
            const inactiveCount = userStreams.filter(s => s.withdrawableAmount === 0n).length
            onMetricsUpdate(activeCount, inactiveCount)
          }
        } catch (error) {
          console.error('Failed to fetch streams:', error)
        } finally {
          if (isInitial) setIsLoadingStreams(false)
        }
      }
      fetchStreams(true)
      
      // Polling every 30 seconds to refresh stream data (smoother polling)
      const interval = setInterval(() => fetchStreams(false), 30000)
      return () => clearInterval(interval)
    } else {
      setIsLoadingStreams(false)
    }
  }, [isConnected, address, onMetricsUpdate])

  // Handle refreshNonce changes for smooth refresh
  useEffect(() => {
    if (refreshNonce && refreshNonce > 0 && isConnected && address) {
      getUserStreams(address).then((userStreams) => {
        setStreams(userStreams)
        if (onMetricsUpdate) {
          const activeCount = userStreams.filter(s => s.withdrawableAmount > 0n).length
          const inactiveCount = userStreams.filter(s => s.withdrawableAmount === 0n).length
          onMetricsUpdate(activeCount, inactiveCount)
        }
      }).catch(console.error)
    }
  }, [refreshNonce, isConnected, address, onMetricsUpdate])

  // Remove per-second time updates to avoid jarring re-renders

  const formatAvailable = (withdrawableAmount: bigint): string => {
    return (Number(withdrawableAmount) / 1e18).toFixed(4)
  }

  const handleWithdraw = async (streamId: string, isMax: boolean = false) => {
    if (!address) return
    
    try {
      setProcessingStream(streamId)
      
      if (isMax) {
        // Withdraw all available
        writeContract({
          address: SABLIER_ADDRESS,
          abi: WITHDRAWAL_ABI,
          functionName: 'withdrawMax',
          args: [BigInt(streamId), address],
        } as any)
      } else {
        // Withdraw specific amount
        const amount = withdrawAmounts[streamId]
        if (!amount || Number(amount) <= 0) {
          toast({
            title: 'Invalid Amount',
            description: 'Please enter a valid withdrawal amount',
            variant: 'destructive',
          })
          setProcessingStream(null)
          return
        }
        
        writeContract({
          address: SABLIER_ADDRESS,
          abi: WITHDRAWAL_ABI,
          functionName: 'withdraw',
          args: [BigInt(streamId), address, BigInt(Math.floor(Number(amount) * 1e18))],
        } as any)
      }
      
      toast({
        title: 'Transaction Submitted',
        description: 'Your withdrawal is being processed...',
      })
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      setProcessingStream(null)
      toast({
        title: 'Withdrawal Failed',
        description: error?.message || 'Failed to submit withdrawal transaction',
        variant: 'destructive',
      })
    }
  }
  
  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && processingStream) {
      toast({
        title: 'Withdrawal Successful',
        description: 'Your funds have been withdrawn successfully',
      })
      // Clear the input for the processed stream
      setWithdrawAmounts(prev => ({
        ...prev,
        [processingStream]: ''
      }))
      setProcessingStream(null)
      // Refresh streams data
      if (address) {
        getUserStreams(address).then((userStreams) => {
          setStreams(userStreams)
          if (onMetricsUpdate) {
            const activeCount = userStreams.filter(s => s.withdrawableAmount > 0n).length
            const inactiveCount = userStreams.filter(s => s.withdrawableAmount === 0n).length
            onMetricsUpdate(activeCount, inactiveCount)
          }
        }).catch(console.error)
      }
    }
  }, [isConfirmed, processingStream, address])

  if (!isConnected) {
    return null
  }

  if (isLoadingStreams) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Loading streams...</p>
      </div>
    )
  }

  const activeStreams = streams.filter(s => s.withdrawableAmount > 0n)
  const inactiveStreams = streams.filter(s => s.withdrawableAmount === 0n)

  const renderStreamCard = (stream: StreamInfo) => {
    const available = formatAvailable(stream.withdrawableAmount)
    const isFullyWithdrawn = stream.withdrawnAmount >= stream.amount
    
    return (
      <Card key={stream.streamId} className="ovfl-shadow hover:ovfl-shadow-lg transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Stream #{stream.streamId}</CardTitle>
            <Badge variant="outline" className="text-xs">
              ETH
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stream Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Amount</div>
              <div className="font-mono font-medium">
                {(Number(stream.amount) / 1e18).toFixed(4)} ETH
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Withdrawn</div>
              <div className="font-mono font-medium">
                {(Number(stream.withdrawnAmount) / 1e18).toFixed(4)} ETH
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Available Now</div>
              <div className="font-mono font-medium text-success">
                {available} ETH
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-mono font-medium">
                {stream.isDepleted || isFullyWithdrawn ? 'Depleted' : 
                 Date.now() < stream.startTime ? 'Not started' :
                 Date.now() >= stream.endTime ? 'Ended' : 'Active'}
              </div>
            </div>
          </div>

          {/* Withdrawal Section - Only show for active streams */}
          {stream.withdrawableAmount > 0n && (
            <div className="space-y-3 pt-3 border-t">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={withdrawAmounts[stream.streamId] || ''}
                  onChange={(e) => setWithdrawAmounts(prev => ({
                    ...prev,
                    [stream.streamId]: e.target.value
                  }))}
                  step="0.0001"
                  max={available}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setWithdrawAmounts(prev => ({
                    ...prev,
                    [stream.streamId]: available
                  }))}
                >
                  Max
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleWithdraw(stream.streamId, false)}
                  disabled={isPending || isConfirming || !withdrawAmounts[stream.streamId] || Number(available) <= 0 || processingStream === stream.streamId}
                  className="flex-1"
                  size="sm"
                >
                  {(isPending || isConfirming) && processingStream === stream.streamId ? 'Processing...' : 'Withdraw'}
                  <Wallet className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => handleWithdraw(stream.streamId, true)}
                  disabled={isPending || isConfirming || Number(available) <= 0 || processingStream === stream.streamId}
                  variant="outline"
                  size="sm"
                >
                  Withdraw All
                </Button>
              </div>
            </div>
          )}
          
          {stream.withdrawableAmount === 0n && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
              <AlertCircle className="w-3 h-3" />
              No funds available for withdrawal
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No Streams Found</p>
        <p className="text-sm">Your streams will appear here once you start earning yield</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="active" className="space-y-6">
      <TabsList>
        <TabsTrigger value="active">Active ({activeStreams.length})</TabsTrigger>
        <TabsTrigger value="inactive">Inactive ({inactiveStreams.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="space-y-6">
        {activeStreams.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No Active Streams</p>
            <p className="text-sm">No claimable funds available at this time</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeStreams.map(renderStreamCard)}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="inactive" className="space-y-6">
        {inactiveStreams.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No Inactive Streams</p>
            <p className="text-sm">Ended or depleted streams will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {inactiveStreams.map(renderStreamCard)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}