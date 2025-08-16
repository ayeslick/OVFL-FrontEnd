import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'

interface Market {
  id: string
  name: string
  underlying: string
  currentRate: number
  impliedAPY: number
  tvl: number
  volume24h: number
  expiry: string
  daysToExpiry: number
  status: 'active' | 'expiring' | 'expired'
}

interface MarketsTableProps {
  markets: Market[]
  limit?: number
  showFilters?: boolean
}

type SortField = 'impliedAPY' | 'tvl' | 'volume24h' | 'currentRate' | 'daysToExpiry'
type SortDirection = 'asc' | 'desc'

export function MarketsTable({ markets, limit, showFilters = false }: MarketsTableProps) {
  const [sortField, setSortField] = useState<SortField>('impliedAPY')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [tokenFilter, setTokenFilter] = useState<string>('all')
  const [maturityFilter, setMaturityFilter] = useState<string>('all')

  const formatNumber = (value: number, decimals = 2) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`
    return `$${value.toFixed(decimals)}`
  }

  const calculateDiscount = (rate: number) => {
    return ((1 - rate) * 100).toFixed(2)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const getStatusBadge = (market: Market) => {
    if (market.status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (market.daysToExpiry <= 7) {
      return <Badge variant="destructive">Expiring Soon</Badge>
    }
    if (market.daysToExpiry <= 30) {
      return <Badge variant="secondary">Expiring</Badge>
    }
    return <Badge variant="outline">Active</Badge>
  }

  // Filter markets
  let filteredMarkets = markets
  if (tokenFilter !== 'all') {
    filteredMarkets = filteredMarkets.filter(market => 
      market.underlying.toLowerCase().includes(tokenFilter.toLowerCase())
    )
  }
  if (maturityFilter !== 'all') {
    filteredMarkets = filteredMarkets.filter(market => {
      const days = market.daysToExpiry
      switch (maturityFilter) {
        case '30': return days <= 30
        case '30-90': return days > 30 && days <= 90
        case '90-180': return days > 90 && days <= 180
        case '180+': return days > 180
        default: return true
      }
    })
  }

  // Sort markets
  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const multiplier = sortDirection === 'asc' ? 1 : -1
    return (aValue - bValue) * multiplier
  })

  // Apply limit if specified
  const displayMarkets = limit ? sortedMarkets.slice(0, limit) : sortedMarkets

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-4 items-center">
          <Select value={tokenFilter} onValueChange={setTokenFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Tokens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              <SelectItem value="weeth">weETH</SelectItem>
              <SelectItem value="ezeth">ezETH</SelectItem>
              <SelectItem value="reth">rETH</SelectItem>
              <SelectItem value="steth">stETH</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maturityFilter} onValueChange={setMaturityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Maturities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Maturities</SelectItem>
              <SelectItem value="30">≤30 days</SelectItem>
              <SelectItem value="30-90">30-90 days</SelectItem>
              <SelectItem value="90-180">90-180 days</SelectItem>
              <SelectItem value="180+">180+ days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">Market</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 font-semibold"
                onClick={() => handleSort('currentRate')}
              >
                <div className="flex items-center gap-1">
                  Price (PT/ETH)
                  {getSortIcon('currentRate')}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Discount</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 font-semibold"
                onClick={() => handleSort('impliedAPY')}
              >
                <div className="flex items-center gap-1">
                  Implied APY
                  {getSortIcon('impliedAPY')}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Maturity</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 font-semibold"
                onClick={() => handleSort('tvl')}
              >
                <div className="flex items-center gap-1">
                  TVL
                  {getSortIcon('tvl')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 font-semibold"
                onClick={() => handleSort('volume24h')}
              >
                <div className="flex items-center gap-1">
                  24h Volume
                  {getSortIcon('volume24h')}
                </div>
              </TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayMarkets.map((market) => (
              <TableRow key={market.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{market.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {market.underlying}
                      {getStatusBadge(market)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">
                  {market.currentRate.toFixed(4)}
                </TableCell>
                <TableCell className="font-mono text-success">
                  {calculateDiscount(market.currentRate)}%
                </TableCell>
                <TableCell className="font-mono text-success">
                  {market.impliedAPY.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{market.expiry}</div>
                    <div className="text-xs text-muted-foreground">
                      {market.daysToExpiry} days
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">
                  {formatNumber(market.tvl)}
                </TableCell>
                <TableCell className="font-mono">
                  {formatNumber(market.volume24h)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8">
                      Deposit PT
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(`https://app.pendle.finance/trade/markets/${market.id}/swap?view=pt&chain=ethereum`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}