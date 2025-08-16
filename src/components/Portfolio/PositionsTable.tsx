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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">PT Market</TableHead>
            <TableHead className="font-semibold">Notional (PT)</TableHead>
            <TableHead className="font-semibold">ovflETH Minted</TableHead>
            <TableHead className="font-semibold">Accrued Stream</TableHead>
            <TableHead className="font-semibold">Remaining Days</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
              <div className="space-y-2">
                <p>No positions found</p>
                <p className="text-sm">Your OVFL positions will appear here after depositing</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}