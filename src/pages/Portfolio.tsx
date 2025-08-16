import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StreamsList } from '@/components/Portfolio/StreamsList'
import { PositionsTable } from '@/components/Portfolio/PositionsTable'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { TrendingUp, Wallet } from 'lucide-react'

export default function Portfolio() {
  const { isConnected } = useAccount()
  const isConnectedDemo = true
  const displayConnected = isConnectedDemo || isConnected

  if (!displayConnected) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="ovfl-card max-w-md w-full text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">ovflETH Balance</CardTitle>
              <div className="text-2xl font-bold">32.4567 ovflETH</div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Claimable Now</CardTitle>
              <div className="text-2xl font-bold text-success">2.1234 ETH</div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Streams</CardTitle>
              <div className="text-2xl font-bold">3</div>
            </CardHeader>
          </Card>
        </div>

        {/* Portfolio Tabs */}
        <Tabs defaultValue="positions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Your Positions</h2>
              <div className="text-sm text-muted-foreground">
                3 active positions
              </div>
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
            <div className="space-y-4">
              {/* Mock Transaction History */}
              {[
                {
                  id: '1',
                  type: 'Deposit',
                  amount: '5.2500 PT-weETH',
                  timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
                  status: 'Completed',
                  txHash: '0x1234...5678'
                },
                {
                  id: '2',
                  type: 'Withdrawal',
                  amount: '0.3420 ETH',
                  timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
                  status: 'Completed',
                  txHash: '0x9876...4321'
                },
                {
                  id: '3',
                  type: 'Deposit',
                  amount: '2.1000 PT-ezETH',
                  timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
                  status: 'Completed',
                  txHash: '0xabcd...efgh'
                },
                {
                  id: '4',
                  type: 'Withdrawal',
                  amount: '1.2500 ETH',
                  timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
                  status: 'Completed',
                  txHash: '0xijkl...mnop'
                }
              ].map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'Deposit' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                        }`}>
                          {tx.type === 'Deposit' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <Wallet className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{tx.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(tx.timestamp).toLocaleDateString()} at {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {tx.type === 'Deposit' ? '+' : '-'}{tx.amount}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <a 
                            href={`https://etherscan.io/tx/${tx.txHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {tx.txHash}
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}