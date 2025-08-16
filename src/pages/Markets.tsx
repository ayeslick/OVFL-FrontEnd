import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ExternalLink, Calendar, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const markets = [
  {
    id: '1',
    name: 'PT-weETH-26DEC2024',
    token: 'PT-weETH',
    underlying: 'Wrapped eETH',
    expiry: '2024-12-26',
    currentRate: '0.9234',
    impliedAPY: '8.7%',
    tvl: '$2.4M',
    volume24h: '$125K',
    status: 'active' as const,
    daysToExpiry: 45
  },
  {
    id: '2',
    name: 'PT-ezETH-27MAR2025', 
    token: 'PT-ezETH',
    underlying: 'Renzo ezETH',
    expiry: '2025-03-27',
    currentRate: '0.9156',
    impliedAPY: '9.2%',
    tvl: '$1.8M',
    volume24h: '$89K',
    status: 'active' as const,
    daysToExpiry: 136
  },
  {
    id: '3',
    name: 'PT-rETH-28JUN2025',
    token: 'PT-rETH',
    underlying: 'Rocket Pool ETH',
    expiry: '2025-06-28',
    currentRate: '0.9078',
    impliedAPY: '10.1%',
    tvl: '$3.1M',
    volume24h: '$203K',
    status: 'active' as const,
    daysToExpiry: 229
  },
  {
    id: '4',
    name: 'PT-stETH-15NOV2024',
    token: 'PT-stETH',
    underlying: 'Lido Staked ETH',
    expiry: '2024-11-15',
    currentRate: '0.9567',
    impliedAPY: '6.2%',
    tvl: '$890K',
    volume24h: '$34K',
    status: 'ending' as const,
    daysToExpiry: 4
  }
]

export default function Markets() {
  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(Number(num.replace('$', '').replace('K', '000').replace('M', '000000')))
  }

  const getStatusBadge = (status: string, daysToExpiry: number) => {
    if (status === 'ending' || daysToExpiry <= 7) {
      return <Badge variant="outline" className="text-danger border-danger">Ending Soon</Badge>
    }
    if (daysToExpiry <= 30) {
      return <Badge variant="secondary">Maturing</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Principal Token Markets</h1>
          <p className="text-xl text-muted-foreground">
            Explore approved Pendle markets and their current rates
          </p>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="ovfl-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Markets</p>
                  <p className="text-2xl font-bold text-primary">{markets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="ovfl-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total TVL</p>
                  <p className="text-2xl font-bold text-primary">$8.2M</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="ovfl-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. APY</p>
                  <p className="text-2xl font-bold text-primary">8.6%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {markets.map((market) => (
            <Card key={market.id} className="ovfl-shadow hover:ovfl-shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{market.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {market.underlying}
                    </CardDescription>
                  </div>
                  {getStatusBadge(market.status, market.daysToExpiry)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Current Rate</p>
                    <p className="font-semibold text-lg">{market.currentRate} ETH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Implied APY</p>
                    <p className="font-semibold text-lg text-success">{market.impliedAPY}</p>
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">TVL</p>
                    <p className="font-medium">{market.tvl}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">24h Volume</p>
                    <p className="font-medium">{market.volume24h}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{market.expiry}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Days to Expiry</p>
                    <p className="font-medium">{market.daysToExpiry} days</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Link to="/deposit" className="flex-1">
                    <Button className="w-full" disabled={market.daysToExpiry <= 1}>
                      {market.daysToExpiry <= 1 ? 'Market Expired' : 'Deposit PT'}
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                {/* Warning for expiring markets */}
                {market.daysToExpiry <= 7 && market.daysToExpiry > 0 && (
                  <div className="p-3 bg-warning-light rounded-lg">
                    <p className="text-xs text-warning font-medium">
                      ⚠️ This market expires in {market.daysToExpiry} day{market.daysToExpiry > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-8 ovfl-shadow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">About Principal Token Markets</CardTitle>
            <CardDescription className="text-base">
              Understanding how OVFL works with Pendle Principal Tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto">
            <div className="bg-muted/50 rounded-lg p-8">
              <h4 className="text-lg font-semibold mb-6 text-center text-primary">How It Works</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Principal Tokens (PTs)</span> represent the principal value of yield-bearing assets
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Redeemable at maturity</span> - each PT equals 1 underlying token
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Current rate</span> reflects the discount to face value
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">OVFL converts</span> this discount into streaming yield
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}