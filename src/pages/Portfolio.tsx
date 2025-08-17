import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreamsList } from '@/components/Portfolio/StreamsList'
import { TrendingUp, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getActiveStreamsCount, getTotalWithdrawableAmount, getUserStreams, SABLIER_ADDRESS, SABLIER_ABI } from '@/lib/sablier'
import { useToast } from '@/hooks/use-toast'

export default function Portfolio() {
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const [claimableAmount, setClaimableAmount] = useState<bigint>(0n)
  const [activeStreamsCount, setActiveStreamsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTick, setRefreshTick] = useState(0)
  const [isClaimingAll, setIsClaimingAll] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      const fetchPortfolioData = async (isInitial = false) => {
        try {
          if (isInitial) setIsLoading(true)
          const [claimable, streamsCount] = await Promise.all([
            getTotalWithdrawableAmount(address),
            getActiveStreamsCount(address)
          ])
          setClaimableAmount(claimable)
          setActiveStreamsCount(streamsCount)
        } catch (error) {
          console.error('Failed to fetch portfolio data:', error)
        } finally {
          if (isInitial) setIsLoading(false)
        }
      }
      fetchPortfolioData(true)
      
      // Polling every 30 seconds to keep data fresh (smoother polling)
      const interval = setInterval(() => fetchPortfolioData(false), 30000)
      return () => clearInterval(interval)
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const handleClaimAll = async () => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to claim funds',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsClaimingAll(true)
      
      // Fetch streams with withdrawable amounts
      const streams = await getUserStreams(address)
      const claimableStreams = streams.filter(s => s.withdrawableAmount > 0n)
      
      if (claimableStreams.length === 0) {
        toast({
          title: 'Nothing to Claim',
          description: 'No withdrawable funds available',
        })
        return
      }

      toast({
        title: 'Claiming All Available',
        description: `Processing ${claimableStreams.length} streams...`,
      })

      // Process withdrawals sequentially
      for (let i = 0; i < claimableStreams.length; i++) {
        const stream = claimableStreams[i]
        try {
          const hash = await writeContractAsync({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            functionName: 'withdrawMax',
            args: [BigInt(stream.streamId), address],
          } as any)
          
          // Wait for confirmation
          if (publicClient) {
            await publicClient.waitForTransactionReceipt({ hash })
          }
          
          toast({
            title: 'Progress',
            description: `Claimed ${i + 1}/${claimableStreams.length} streams`,
          })
        } catch (error) {
          console.error(`Failed to claim stream ${stream.streamId}:`, error)
          toast({
            title: 'Partial Success',
            description: `Failed to claim stream #${stream.streamId}`,
            variant: 'destructive',
          })
        }
      }

      toast({
        title: 'Claim All Complete',
        description: 'Successfully processed all available claims',
      })

      // Refresh data and trigger StreamsList refresh
      const [claimable, streamsCount] = await Promise.all([
        getTotalWithdrawableAmount(address),
        getActiveStreamsCount(address)
      ])
      setClaimableAmount(claimable)
      setActiveStreamsCount(streamsCount)
      setRefreshTick(prev => prev + 1)

    } catch (error: any) {
      console.error('Claim all failed:', error)
      toast({
        title: 'Claim All Failed',
        description: error?.message || 'Failed to process claim all',
        variant: 'destructive',
      })
    } finally {
      setIsClaimingAll(false)
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Portfolio Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor and manage your OVFL positions and streaming yields
          </p>
        </div>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Claimable Now</CardTitle>
              <div className="text-2xl font-bold text-success">
                {isLoading ? '...' : `${(Number(claimableAmount) / 1e18).toFixed(4)} ETH`}
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Streams</CardTitle>
              <div className="text-2xl font-bold">{isLoading ? '...' : activeStreamsCount}</div>
            </CardHeader>
          </Card>
        </div>

        {/* Active Streams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Active Streams</h2>
            <Button 
              onClick={handleClaimAll}
              disabled={isClaimingAll || Number(claimableAmount) <= 0}
            >
              {isClaimingAll ? 'Claiming...' : 'Claim All Available'}
            </Button>
          </div>
          <StreamsList key={refreshTick} />
        </div>
      </div>
    </div>
  )
}