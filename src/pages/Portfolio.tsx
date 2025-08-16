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
      <div className="min-h-screen bg-background scan-lines relative">
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="max-w-md w-full text-center ovfl-card">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mb-4 ovfl-terminal-glow">
                <TrendingUp className="w-8 h-8 text-primary terminal-glow" />
              </div>
              <CardTitle className="text-2xl terminal-text">CONNECT_WALLET</CardTitle>
              <CardDescription className="text-base font-mono">
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
    <div className="min-h-screen bg-background scan-lines relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 terminal-text terminal-glow">PORTFOLIO_DASHBOARD</h1>
          <p className="text-xl text-muted-foreground font-mono">
            &gt; Monitor and manage your OVFL positions and streaming yields
          </p>
        </div>

        {/* Portfolio Stats */}
        <PortfolioStats />

        {/* Active Streams */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary terminal-text">&gt; ACTIVE_STREAMS</h2>
            <div className="flex items-center gap-2 text-sm text-success font-mono">
              <AlertCircle className="w-4 h-4 terminal-glow" />
              [REAL_TIME_UPDATES]
            </div>
          </div>
          <StreamsList />
        </div>
      </div>
    </div>
  )
}