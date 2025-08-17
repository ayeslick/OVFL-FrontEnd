import { useAccount } from 'wagmi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ExternalLink, Eye, Wallet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserStreams, StreamInfo } from '@/lib/sablier'
import { formatEther } from 'viem'


export function PositionsTable() {
  const { isConnected, address } = useAccount()
  const [streams, setStreams] = useState<StreamInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStream, setSelectedStream] = useState<StreamInfo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    const now = Date.now()
    const endTime = Number(stream.endTime)
    
    if (now >= endTime) {
      return <Badge variant="secondary">Ended</Badge>
    }
    
    const daysRemaining = (endTime - now) / (24 * 60 * 60 * 1000)
    if (daysRemaining <= 7) {
      return <Badge variant="destructive">Ending Soon</Badge>
    }
    if (daysRemaining <= 30) {
      return <Badge variant="secondary">Ending</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getDaysRemaining = (endTime: bigint) => {
    const now = Date.now()
    const end = Number(endTime)
    const daysRemaining = Math.max(0, (end - now) / (24 * 60 * 60 * 1000))
    return Math.floor(daysRemaining)
  }

  const getActionButton = (stream: StreamInfo) => {
    const now = Date.now()
    const endTime = Number(stream.endTime)
    
    if (now >= endTime) {
      return (
        <Button size="sm" className="h-8">
          Withdraw All
        </Button>
      )
    }
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8"
        onClick={() => {
          setSelectedStream(stream)
          setIsDialogOpen(true)
        }}
      >
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
    <>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stream Details</DialogTitle>
          </DialogHeader>
          {selectedStream && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Stream ID</p>
                  <p className="font-mono">#{selectedStream.streamId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asset</p>
                  <p>ETH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p>{formatEther(selectedStream.amount)} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawn</p>
                  <p>{formatEther(selectedStream.withdrawnAmount)} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-medium">{formatEther(selectedStream.withdrawableAmount)} ETH</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p>{getDaysRemaining(BigInt(selectedStream.endTime))} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(selectedStream)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ends At</p>
                  <p>{new Date(Number(selectedStream.endTime)).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button size="sm" disabled>
                  Withdraw Available
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}