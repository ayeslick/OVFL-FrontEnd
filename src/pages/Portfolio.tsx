import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StreamsList } from '@/components/Portfolio/StreamsList'
import { PositionsTable } from '@/components/Portfolio/PositionsTable'
import { HistoryList } from '@/components/Portfolio/HistoryList'
import { TrendingUp, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getActiveStreamsCount } from '@/lib/sablier'
import { getClaimableOVFL } from '@/lib/ovfl'

export default function Portfolio() {
  const { isConnected, address } = useAccount()
  const [claimableAmount, setClaimableAmount] = useState<bigint>(0n)
  const [activeStreamsCount, setActiveStreamsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      const fetchPortfolioData = async () => {
        try {
          setIsLoading(true)
          const [claimable, streamsCount] = await Promise.all([
            getClaimableOVFL(address),
            getActiveStreamsCount(address)
          ])
          setClaimableAmount(claimable)
          setActiveStreamsCount(streamsCount)
        } catch (error) {
          console.error('Failed to fetch portfolio data:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchPortfolioData()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])


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

        {/* Portfolio Tabs */}
        <Tabs defaultValue="streams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Your Positions</h2>
            </div>
            <PositionsTable />
          </TabsContent>

          <TabsContent value="streams" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Active Streams</h2>
              <Button>Claim All Available</Button>
            </div>
            <StreamsList />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Transaction History</h2>
            </div>
            <HistoryList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}