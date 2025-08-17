import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { MarketsTable } from '@/components/Markets/MarketsTable'

const topMarkets = [
  {
    id: '1',
    name: 'weETH-PT-26DEC24',
    underlying: 'weETH',
    currentRate: 0.9156,
    impliedAPY: 12.8,
    tvl: 45200000,
    volume24h: 2100000,
    expiry: '2024-12-26',
    daysToExpiry: 45,
    status: 'active' as const
  },
  {
    id: '2',
    name: 'ezETH-PT-28FEB25',
    underlying: 'ezETH',
    currentRate: 0.9234,
    impliedAPY: 11.2,
    tvl: 38700000,
    volume24h: 1800000,
    expiry: '2025-02-28',
    daysToExpiry: 89,
    status: 'active' as const
  },
  {
    id: '3',
    name: 'rETH-PT-30MAR25',
    underlying: 'rETH',
    currentRate: 0.9087,
    impliedAPY: 13.5,
    tvl: 28900000,
    volume24h: 950000,
    expiry: '2025-03-30',
    daysToExpiry: 119,
    status: 'active' as const
  }
]

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Borrow Against Your Streaming Yield
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Deposit PT tokens, receive instant liquidity with ovflETH, borrow/sell your stream
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/deposit">Deposit PT</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/portfolio">View Portfolio</Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}