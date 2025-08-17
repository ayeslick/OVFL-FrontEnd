import { MarketsTable } from '@/components/Markets/MarketsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { fetchPendleMarket, type MarketData } from '@/lib/pendle'


export default function Markets() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const market = await fetchPendleMarket()
        if (!market) {
          setError('Failed to load market data. Please try again later.')
        } else {
          setMarketData(market)
        }
      } catch (error) {
        console.error('Failed to load market data:', error)
        setError('Failed to load market data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    loadMarketData()
  }, [])

  const markets = marketData ? [{
    ...marketData,
    name: marketData.ptSymbol, // Use PT symbol as name
    expiry: marketData.expiry.toISOString().split('T')[0] // Convert Date to string
  }] : []

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
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Markets</CardTitle>
              <div className="text-2xl font-bold">{isLoading ? '...' : markets.length}</div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total TVL</CardTitle>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : marketData ? formatNumber(marketData.tvl) : '--'}
              </div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current APY</CardTitle>
              <div className="text-2xl font-bold text-success">
                {isLoading ? '...' : marketData ? `${marketData.impliedAPY.toFixed(1)}%` : '--'}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Markets Table */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Available Markets</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading market data...</div>
          ) : error ? (
            <div className="text-center text-destructive py-8">{error}</div>
          ) : markets.length > 0 ? (
            <MarketsTable markets={markets} showFilters={false} />
          ) : (
            <div className="text-center text-muted-foreground py-8">No market data available</div>
          )}
        </div>
      </div>
    </div>
  )
}