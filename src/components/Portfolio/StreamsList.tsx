import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, TrendingUp, Wallet, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useAccount } from 'wagmi'
import { getUserStreams, type StreamInfo } from '@/lib/sablier'

export function StreamsList() {
  const { toast } = useToast()
  const { isConnected, address } = useAccount()
  const [streams, setStreams] = useState<StreamInfo[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [withdrawAmounts, setWithdrawAmounts] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStreams, setIsLoadingStreams] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      const fetchStreams = async () => {
        try {
          setIsLoadingStreams(true)
          const userStreams = await getUserStreams(address)
          setStreams(userStreams)
        } catch (error) {
          console.error('Failed to fetch streams:', error)
        } finally {
          setIsLoadingStreams(false)
        }
      }
      fetchStreams()
      
      // Polling every 20 seconds to refresh stream data
      const interval = setInterval(fetchStreams, 20000)
      return () => clearInterval(interval)
    } else {
      setIsLoadingStreams(false)
    }
  }, [isConnected, address])

  // Update time every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatAvailable = (withdrawableAmount: bigint): string => {
    return (Number(withdrawableAmount) / 1e18).toFixed(4)
  }

  const handleWithdraw = async (streamId: string) => {
    // Real withdrawal implementation would go here
    toast({
      title: 'Feature Coming Soon',
      description: 'Stream withdrawals will be available soon',
    })
  }

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

  if (streams.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No Active Streams</p>
        <p className="text-sm">Your streams will appear here once you start earning yield</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => {
          const available = formatAvailable(stream.withdrawableAmount)
          
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
                      {stream.isDepleted ? 'Depleted' : 
                       currentTime.getTime() < stream.startTime ? 'Not started' :
                       currentTime.getTime() >= stream.endTime ? 'Ended' : 'Active'}
                    </div>
                  </div>
                </div>

                {/* Withdrawal Section */}
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
                      onClick={() => handleWithdraw(stream.streamId)}
                      disabled={isLoading || !withdrawAmounts[stream.streamId] || Number(available) <= 0}
                      className="flex-1"
                      size="sm"
                    >
                      {isLoading ? 'Processing...' : 'Withdraw'}
                      <Wallet className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => handleWithdraw(stream.streamId)}
                      disabled={isLoading || Number(available) <= 0}
                      variant="outline"
                      size="sm"
                    >
                      Withdraw All
                    </Button>
                  </div>
                  
                  {Number(available) <= 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-3 h-3" />
                      No funds available for withdrawal yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}