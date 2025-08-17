import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { createPublicClient, http, formatEther, Address } from 'viem'
import { SABLIER_ADDRESS, SABLIER_ABI } from '@/lib/sablier'
import { ovflTenderly } from '@/config/wagmi'
import { History, ExternalLink } from 'lucide-react'

interface HistoryEvent {
  type: 'create' | 'withdraw' | 'cancel' | 'transfer'
  streamId: string
  timestamp: number
  blockNumber: bigint
  txHash: string
  amount?: bigint
  from?: string
  to?: string
}

const client = createPublicClient({
  chain: ovflTenderly,
  transport: http(),
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
        console.debug('Fetching transaction history for:', address)
        
        // Get create events where user is recipient
        const createEvents = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'CreateLockupLinearStream',
            inputs: [
              { name: 'streamId', type: 'uint256', indexed: true },
              { name: 'funder', type: 'address', indexed: false },
              { name: 'sender', type: 'address', indexed: true },
              { name: 'recipient', type: 'address', indexed: true },
              { name: 'amounts', type: 'tuple', indexed: false },
              { name: 'asset', type: 'address', indexed: false },
              { name: 'cancelable', type: 'bool', indexed: false },
              { name: 'transferable', type: 'bool', indexed: false },
              { name: 'timestamps', type: 'tuple', indexed: false },
              { name: 'broker', type: 'address', indexed: false },
            ],
          },
          args: {
            recipient: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        // Get withdraw events
        const withdrawEvents = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'WithdrawFromLockupStream',
            inputs: [
              { name: 'streamId', type: 'uint256', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'amount', type: 'uint128', indexed: false },
            ],
          },
          args: {
            to: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        // Get cancel events where user is recipient or sender
        const cancelEventsRecipient = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'CancelLockupStream',
            inputs: [
              { name: 'streamId', type: 'uint256', indexed: true },
              { name: 'sender', type: 'address', indexed: true },
              { name: 'recipient', type: 'address', indexed: true },
              { name: 'senderAmount', type: 'uint128', indexed: false },
              { name: 'recipientAmount', type: 'uint128', indexed: false },
            ],
          },
          args: {
            recipient: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        const cancelEventsSender = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'CancelLockupStream',
            inputs: [
              { name: 'streamId', type: 'uint256', indexed: true },
              { name: 'sender', type: 'address', indexed: true },
              { name: 'recipient', type: 'address', indexed: true },
              { name: 'senderAmount', type: 'uint128', indexed: false },
              { name: 'recipientAmount', type: 'uint128', indexed: false },
            ],
          },
          args: {
            sender: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        // Get transfer events (NFT transfers) - both sent and received
        const transferEventsReceived = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true },
            ],
          },
          args: {
            to: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        const transferEventsSent = await client.getLogs({
          address: SABLIER_ADDRESS,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { name: 'from', type: 'address', indexed: true },
              { name: 'to', type: 'address', indexed: true },
              { name: 'tokenId', type: 'uint256', indexed: true },
            ],
          },
          args: {
            from: address,
          },
          fromBlock: 0n,
          toBlock: 'latest',
        })

        console.debug('Events found:', {
          create: createEvents.length,
          withdraw: withdrawEvents.length,
          cancel: cancelEventsRecipient.length + cancelEventsSender.length,
          transfer: transferEventsReceived.length + transferEventsSent.length
        })

        const allEvents: HistoryEvent[] = []

        // Process create events
        for (const event of createEvents) {
          const block = await client.getBlock({ blockNumber: event.blockNumber })
          allEvents.push({
            type: 'create',
            streamId: event.args.streamId?.toString() || '',
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            from: event.args.sender,
          })
        }

        // Process withdraw events
        for (const event of withdrawEvents) {
          const block = await client.getBlock({ blockNumber: event.blockNumber })
          allEvents.push({
            type: 'withdraw',
            streamId: event.args.streamId?.toString() || '',
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            amount: event.args.amount,
          })
        }

        // Process cancel events
        for (const event of [...cancelEventsRecipient, ...cancelEventsSender]) {
          const block = await client.getBlock({ blockNumber: event.blockNumber })
          allEvents.push({
            type: 'cancel',
            streamId: event.args.streamId?.toString() || '',
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            from: event.args.sender,
            to: event.args.recipient,
          })
        }

        // Process transfer events
        for (const event of [...transferEventsReceived, ...transferEventsSent]) {
          const block = await client.getBlock({ blockNumber: event.blockNumber })
          allEvents.push({
            type: 'transfer',
            streamId: event.args.tokenId?.toString() || '',
            timestamp: Number(block.timestamp),
            blockNumber: event.blockNumber,
            txHash: event.transactionHash,
            from: event.args.from,
            to: event.args.to,
          })
        }

        // Sort by timestamp descending
        allEvents.sort((a, b) => b.timestamp - a.timestamp)
        console.debug('Total events processed:', allEvents.length)
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
      case 'create':
        return <Badge variant="default">Created</Badge>
      case 'withdraw':
        return <Badge variant="secondary">Withdrawal</Badge>
      case 'cancel':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'transfer':
        return <Badge variant="outline">Transfer</Badge>
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
                {ovflTenderly.blockExplorers?.default?.url ? (
                  <a
                    href={`${ovflTenderly.blockExplorers.default.url}/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">
                    {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}