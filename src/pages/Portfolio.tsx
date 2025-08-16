import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StreamsList } from '@/components/Portfolio/StreamsList'
import { PortfolioStats } from '@/components/Portfolio/PortfolioStats'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { TrendingUp, AlertCircle } from 'lucide-react'

export default function Portfolio() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="max-w-md w-full text-center ovfl-shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base">
                Connect your wallet to view and manage your OVFL portfolio and active streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Portfolio Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Monitor and manage your OVFL positions and streaming yields
          </p>
        </div>

        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Active Streams */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Active Streams</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Real-time updates
            </div>
          </div>
          <StreamsList />
        </div>
      </div>
    </div>
  )
}