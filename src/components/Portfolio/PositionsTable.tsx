import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Eye } from 'lucide-react'

interface Position {
  id: string
  market: string
  underlying: string
  notionalPT: number
  ovflETHMinted: number
  accruedStream: number
  remainingDays: number
  status: 'active' | 'matured' | 'expiring'
  maturityDate: string
}

const mockPositions: Position[] = [
  {
    id: '1',
    market: 'weETH-PT-26DEC24',
    underlying: 'weETH',
    notionalPT: 10.5,
    ovflETHMinted: 9.8,
    accruedStream: 2.34,
    remainingDays: 45,
    status: 'active',
    maturityDate: '2024-12-26'
  },
  {
    id: '2',
    market: 'ezETH-PT-28FEB25',
    underlying: 'ezETH',
    notionalPT: 25.0,
    ovflETHMinted: 22.8,
    accruedStream: 4.67,
    remainingDays: 89,
    status: 'active',
    maturityDate: '2025-02-28'
  },
  {
    id: '3',
    market: 'stETH-PT-15NOV24',
    underlying: 'stETH',
    notionalPT: 5.2,
    ovflETHMinted: 4.9,
    accruedStream: 1.23,
    remainingDays: 3,
    status: 'expiring',
    maturityDate: '2024-11-15'
  }
]

export function PositionsTable() {
  const formatNumber = (value: number, decimals = 4) => {
    return value.toFixed(decimals)
  }

  const getStatusBadge = (position: Position) => {
    if (position.status === 'matured') {
      return <Badge variant="secondary">Matured</Badge>
    }
    if (position.remainingDays <= 7) {
      return <Badge variant="destructive">Expiring Soon</Badge>
    }
    if (position.remainingDays <= 30) {
      return <Badge variant="secondary">Expiring</Badge>
    }
    return <Badge variant="outline">Active</Badge>
  }

  const getActionButton = (position: Position) => {
    if (position.status === 'matured') {
      return (
        <Button size="sm" className="h-8">
          Withdraw
        </Button>
      )
    }
    return (
      <Button variant="outline" size="sm" className="h-8">
        <Eye className="w-4 h-4 mr-1" />
        View
      </Button>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PT Market</TableHead>
            <TableHead>Notional (PT)</TableHead>
            <TableHead>ovflETH Minted</TableHead>
            <TableHead>Accrued Stream</TableHead>
            <TableHead>Remaining Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPositions.map((position) => (
            <TableRow key={position.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{position.market}</div>
                  <div className="text-sm text-muted-foreground">
                    {position.underlying}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono">
                {formatNumber(position.notionalPT)} PT
              </TableCell>
              <TableCell className="font-mono">
                {formatNumber(position.ovflETHMinted)} ovflETH
              </TableCell>
              <TableCell className="font-mono text-success">
                +{formatNumber(position.accruedStream)} ETH
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-mono">{position.remainingDays} days</div>
                  <div className="text-xs text-muted-foreground">
                    {position.maturityDate}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(position)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getActionButton(position)}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}