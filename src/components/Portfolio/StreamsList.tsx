import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { formatUnits, parseUnits } from 'viem'
import { Clock, TrendingUp, Zap, AlertTriangle } from 'lucide-react'

// Mock data for demonstration - replace with actual Sablier integration
const mockStreams = [
  {
    id: '1',
    totalAmount: '1000000000000000000', // 1 ETH in wei
    withdrawnAmount: '200000000000000000', // 0.2 ETH in wei
    startTime: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
    endTime: Math.floor(Date.now() / 1000) + 86400 * 60, // 60 days from now
    asset: {
      decimals: 18,
      symbol: 'pETH',
      address: '0x...'
    }
  },
  {
    id: '2',
    totalAmount: '2500000000000000000', // 2.5 ETH in wei
    withdrawnAmount: '500000000000000000', // 0.5 ETH in wei
    startTime: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
    endTime: Math.floor(Date.now() / 1000) + 86400 * 45, // 45 days from now
    asset: {
      decimals: 18,
      symbol: 'pETH',
      address: '0x...'
    }
  }
]

export function StreamsList() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [streams, setStreams] = useState(mockStreams)
  const [loading, setLoading] = useState(false)
  const [withdrawInputs, setWithdrawInputs] = useState<Record<string, string>>({})
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatNumber = (value: number, decimals = 6) => {
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: decimals,
      minimumFractionDigits: 2 
    }).format(value)
  }

  const calculateProgress = (stream: any) => {
    const elapsed = now - stream.startTime
    const duration = stream.endTime - stream.startTime
    return Math.min(Math.max(elapsed / duration * 100, 0), 100)
  }

  const calculateAvailable = (stream: any) => {
    const total = Number(formatUnits(BigInt(stream.totalAmount), stream.asset.decimals))
    const withdrawn = Number(formatUnits(BigInt(stream.withdrawnAmount), stream.asset.decimals))
    const progress = calculateProgress(stream)
    const accrued = total * (progress / 100)
    return Math.max(accrued - withdrawn, 0)
  }

  const formatCountdown = (endTime: number) => {
    const diff = Math.max(endTime - now, 0)
    if (diff === 0) return 'Stream Ended'
    
    const days = Math.floor(diff / 86400)
    const hours = Math.floor((diff % 86400) / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    const seconds = Math.floor(diff % 60)
    
    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getCountdownStatus = (endTime: number) => {
    const diff = endTime - now
    if (diff <= 0) return 'ended'
    if (diff <= 86400) return 'critical' // Less than 1 day
    if (diff <= 172800) return 'warning' // Less than 2 days
    return 'active'
  }

  const handleWithdraw = async (stream: any, withdrawAll = false) => {
    try {
      setLoading(true)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const available = calculateAvailable(stream)
      const amount = withdrawAll ? available : Number(withdrawInputs[stream.id] || '0')
      
      if (amount <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid withdrawal amount',
          variant: 'destructive'
        })
        return
      }

      if (amount > available) {
        toast({
          title: 'Insufficient Balance',
          description: 'Amount exceeds available balance',
          variant: 'destructive'
        })
        return
      }

      // Update mock data
      setStreams(prev => prev.map(s => {
        if (s.id === stream.id) {
          const newWithdrawn = Number(formatUnits(BigInt(s.withdrawnAmount), s.asset.decimals)) + amount
          return {
            ...s,
            withdrawnAmount: parseUnits(newWithdrawn.toString(), s.asset.decimals).toString()
          }
        }
        return s
      }))

      // Clear input
      setWithdrawInputs(prev => ({ ...prev, [stream.id]: '' }))

      toast({
        title: 'Withdrawal Successful',
        description: `Successfully withdrew ${formatNumber(amount)} ${stream.asset.symbol}`,
      })
    } catch (error) {
      toast({
        title: 'Withdrawal Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return null
  }

  if (streams.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">No Active Streams</CardTitle>
          <p className="text-muted-foreground">
            You don't have any active streams yet. Start by depositing Principal Tokens.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {streams.map((stream) => {
        const total = Number(formatUnits(BigInt(stream.totalAmount), stream.asset.decimals))
        const withdrawn = Number(formatUnits(BigInt(stream.withdrawnAmount), stream.asset.decimals))
        const progress = calculateProgress(stream)
        const available = calculateAvailable(stream)
        const countdownStatus = getCountdownStatus(stream.endTime)

        return (
          <Card key={stream.id} className="ovfl-shadow hover:ovfl-shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Stream #{stream.id}</CardTitle>
                <Badge variant={countdownStatus === 'active' ? 'default' : countdownStatus === 'warning' ? 'secondary' : 'outline'}>
                  {stream.asset.symbol}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  <span className="text-sm font-bold text-primary">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 ovfl-gradient rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stream Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="font-semibold">{formatNumber(total)} {stream.asset.symbol}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Withdrawn</p>
                  <p className="font-semibold">{formatNumber(withdrawn)} {stream.asset.symbol}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Available Now</p>
                  <p className="font-semibold text-success">{formatNumber(available)} {stream.asset.symbol}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="font-semibold">{formatNumber(total - withdrawn)} {stream.asset.symbol}</p>
                </div>
              </div>

              {/* Countdown */}
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                countdownStatus === 'critical' ? 'bg-danger-light text-danger' :
                countdownStatus === 'warning' ? 'bg-warning-light text-warning' :
                'bg-success-light text-success'
              }`}>
                {countdownStatus === 'critical' && <AlertTriangle className="w-4 h-4" />}
                {countdownStatus === 'warning' && <Clock className="w-4 h-4" />}
                {countdownStatus === 'active' && <Zap className="w-4 h-4" />}
                <span className="font-medium">
                  {countdownStatus === 'ended' ? 'Stream Ended' : `${formatCountdown(stream.endTime)} remaining`}
                </span>
              </div>

              {/* Withdrawal Actions */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount to withdraw"
                    value={withdrawInputs[stream.id] || ''}
                    onChange={(e) => setWithdrawInputs(prev => ({ ...prev, [stream.id]: e.target.value }))}
                    step="0.000001"
                    min="0"
                    max={available}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleWithdraw(stream)}
                    disabled={loading || !withdrawInputs[stream.id] || Number(withdrawInputs[stream.id]) <= 0}
                  >
                    Withdraw
                  </Button>
                </div>
                <Button
                  variant="default"
                  onClick={() => handleWithdraw(stream, true)}
                  disabled={loading || available <= 0}
                  className="w-full"
                >
                  {loading ? 'Processing...' : `Withdraw All Available (${formatNumber(available)} ${stream.asset.symbol})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}