import { useAccount } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Eye, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserStreams, StreamInfo } from '@/lib/sablier'
import { formatEther } from 'viem'


export function PositionsTable() {
  const { isConnected, address } = useAccount()
  const [streams, setStreams] = useState<StreamInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    const fetchStreams = async () => {
      try {
        setIsLoading(true)
        const userStreams = await getUserStreams(address)
        setStreams(userStreams)
      } catch (error) {
        console.error('Failed to fetch streams:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreams()
  }, [isConnected, address])

  const getStatusBadge = (stream: StreamInfo) => {
    const now = Date.now() / 1000
    const endTime = Number(stream.endTime)
    
    if (now >= endTime) {
      return <Badge variant="secondary">Ended</Badge>
    }
    
    const daysRemaining = (endTime - now) / (24 * 60 * 60)
    if (daysRemaining <= 7) {
      return <Badge variant="destructive">Ending Soon</Badge>
    }
    if (daysRemaining <= 30) {
      return <Badge variant="secondary">Ending</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getDaysRemaining = (endTime: bigint) => {
    const now = Date.now() / 1000
    const end = Number(endTime)
    const daysRemaining = Math.max(0, (end - now) / (24 * 60 * 60))
    return Math.floor(daysRemaining)
  }

  const getActionButton = (stream: StreamInfo) => {
    const now = Date.now() / 1000
    const endTime = Number(stream.endTime)
    
    if (now >= endTime) {
      return (
        <Button size="sm" className="h-8">
          Withdraw All
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

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Loading positions...</p>
      </div>
    )
  }

  if (streams.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No positions found</p>
        <p className="text-sm">Your OVFL positions will appear here after depositing</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Stream ID</TableHead>
            <TableHead className="font-semibold">Asset</TableHead>
            <TableHead className="font-semibold">Total Amount</TableHead>
            <TableHead className="font-semibold">Withdrawn</TableHead>
            <TableHead className="font-semibold">Available</TableHead>
            <TableHead className="font-semibold">Days Left</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {streams.map((stream) => (
            <TableRow key={stream.streamId}>
              <TableCell className="font-mono">#{stream.streamId}</TableCell>
              <TableCell>ETH</TableCell>
              <TableCell>{formatEther(stream.amount)} ETH</TableCell>
              <TableCell>{formatEther(stream.withdrawnAmount)} ETH</TableCell>
              <TableCell className="font-medium">{formatEther(stream.withdrawableAmount)} ETH</TableCell>
              <TableCell>{getDaysRemaining(BigInt(stream.endTime))} days</TableCell>
              <TableCell>{getStatusBadge(stream)}</TableCell>
              <TableCell>{getActionButton(stream)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}