import { MarketsTable } from '@/components/Markets/MarketsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const markets = [
  {
    id: '1',
    name: 'weETH-PT-26DEC24',
    underlying: 'weETH',
    expiry: '2024-12-26',
    currentRate: 0.9156,
    impliedAPY: 12.8,
    tvl: 45200000,
    volume24h: 2100000,
    status: 'active' as const,
    daysToExpiry: 45
  },
  {
    id: '2',
    name: 'ezETH-PT-28FEB25',
    underlying: 'ezETH',
    expiry: '2025-02-28',
    currentRate: 0.9234,
    impliedAPY: 11.2,
    tvl: 38700000,
    volume24h: 1800000,
    status: 'active' as const,
    daysToExpiry: 89
  },
  {
    id: '3',
    name: 'rETH-PT-30MAR25',
    underlying: 'rETH',
    expiry: '2025-03-30',
    currentRate: 0.9087,
    impliedAPY: 13.5,
    tvl: 28900000,
    volume24h: 950000,
    status: 'active' as const,
    daysToExpiry: 119
  },
  {
    id: '4',
    name: 'stETH-PT-15NOV24',
    underlying: 'stETH',
    expiry: '2024-11-15',
    currentRate: 0.9456,
    impliedAPY: 9.8,
    tvl: 15600000,
    volume24h: 420000,
    status: 'expiring' as const,
    daysToExpiry: 3
  }
]

export default function Markets() {
  const totalTVL = markets.reduce((sum, market) => sum + market.tvl, 0)
  const totalMarkets = markets.length
  const avgAPY = markets.reduce((sum, market) => sum + market.impliedAPY, 0) / markets.length

  const formatNumber = (value: number, decimals = 2) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`
    return `$${value.toFixed(decimals)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">OVFL Markets</h1>
          <p className="text-xl text-muted-foreground">
            Discover and deposit into Principal Token markets with instant liquidity
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Markets</CardTitle>
              <div className="text-2xl font-bold">{totalMarkets}</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-success">+2 this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total TVL</CardTitle>
              <div className="text-2xl font-bold">{formatNumber(totalTVL)}</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-success">+12.3% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. APY</CardTitle>
              <div className="text-2xl font-bold text-success">{avgAPY.toFixed(1)}%</div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-success">+2.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Markets Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Available Markets</h2>
          <MarketsTable markets={markets} showFilters={true} />
        </div>
      </div>
    </div>
  )
}