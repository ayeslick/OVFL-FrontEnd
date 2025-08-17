import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { createPublicClient, http, formatEther, Address } from 'viem'
import { SABLIER_ADDRESS, SABLIER_ABI } from '@/lib/sablier'
import { History, ExternalLink } from 'lucide-react'

interface HistoryEvent {
  type: 'CreateLockupLinearStream' | 'WithdrawFromLockupStream' | 'CancelLockupStream' | 'Transfer'
  streamId: string
  timestamp: number
  blockNumber: bigint
  txHash: string
  amount?: bigint
  from?: string
  to?: string
}

const client = createPublicClient({
  transport: http('https://rpc.tenderly.co/fork/61abc493-8c5f-4a3b-8b23-1b40d9cc2a83'),
  chain: {
    id: 1,
    name: 'OVFL Tenderly',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.tenderly.co/fork/61abc493-8c5f-4a3b-8b23-1b40d9cc2a83'] } }
  }
})

export function HistoryList() {
  const { isConnected, address } = useAccount()
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) {
      setIsLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        
        // Get recent blocks for event fetching
        const latestBlock = await client.getBlockNumber()
        const fromBlock = latestBlock - 10000n // Last ~10k blocks
        
        // Fetch all relevant events
        const [createEvents, withdrawEvents, cancelEvents, transferEvents] = await Promise.all([
          // CreateLockupLinearStream events
          client.getContractEvents({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            eventName: 'CreateLockupLinearStream',
            fromBlock,
            toBlock: latestBlock,
          }),
          // WithdrawFromLockupStream events  
          client.getContractEvents({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            eventName: 'WithdrawFromLockupStream',
            fromBlock,
            toBlock: latestBlock,
            args: { to: address }
          }),
          // CancelLockupStream events
          client.getContractEvents({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            eventName: 'CancelLockupStream',
            fromBlock,
            toBlock: latestBlock,
          }),
          // Transfer events (ERC721)
          client.getContractEvents({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            eventName: 'Transfer',
            fromBlock,
            toBlock: latestBlock,
            args: { to: address }
          })
        ])

        // Process and combine events
        const allEvents: HistoryEvent[] = []

        // Add withdraw events
        withdrawEvents.forEach(event => {
          allEvents.push({
            type: 'WithdrawFromLockupStream',
            streamId: event.args.streamId?.toString() || '',
            timestamp: 0, // Will be filled from block
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            amount: event.args.withdrawnAmount
          })
        })

        // Add transfer events (stream ownership)
        transferEvents.forEach(event => {
          allEvents.push({
            type: 'Transfer',
            streamId: event.args.tokenId?.toString() || '',
            timestamp: 0,
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            from: event.args.from,
            to: event.args.to
          })
        })

        // Get timestamps for all events
        const uniqueBlocks = [...new Set(allEvents.map(e => e.blockNumber))]
        const blockPromises = uniqueBlocks.map(blockNumber => 
          client.getBlock({ blockNumber })
        )
        const blocks = await Promise.all(blockPromises)
        const blockTimestamps = new Map(
          blocks.map(block => [block.number, Number(block.timestamp)])
        )

        // Add timestamps and sort
        allEvents.forEach(event => {
          event.timestamp = blockTimestamps.get(event.blockNumber) || 0
        })

        allEvents.sort((a, b) => b.timestamp - a.timestamp)
        setEvents(allEvents)
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [isConnected, address])

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'WithdrawFromLockupStream':
        return <Badge variant="default">Withdraw</Badge>
      case 'Transfer':
        return <Badge variant="secondary">Received</Badge>
      case 'CreateLockupLinearStream':
        return <Badge variant="outline">Created</Badge>
      case 'CancelLockupStream':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp * 1000).toLocaleString()
  }

  if (!isConnected) {
    return null
  }

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Loading transaction history...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No transaction history found</p>
        <p className="text-sm">Your Sablier transactions will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <Card key={`${event.txHash}-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getEventBadge(event.type)}
                  <span className="font-mono text-sm">Stream #{event.streamId}</span>
                </div>
                {event.amount && (
                  <p className="text-sm text-muted-foreground">
                    Amount: {formatEther(event.amount)} ETH
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(event.timestamp)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://etherscan.io/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}