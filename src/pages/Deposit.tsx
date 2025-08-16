import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { PiggyBank, ArrowRight, AlertCircle, TrendingUp } from 'lucide-react'
import { fetchPendleMarket, type MarketData } from '@/lib/pendle'


export default function Deposit() {
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [selectedMarket, setSelectedMarket] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [isLoadingMarket, setIsLoadingMarket] = useState(true)

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoadingMarket(true)
        const market = await fetchPendleMarket()
        if (market) {
          setMarketData(market)
          setSelectedMarket(market.id)
        }
      } catch (error) {
        console.error('Failed to load market data:', error)
      } finally {
        setIsLoadingMarket(false)
      }
    }
    loadMarketData()
  }, [])

  const calculatePreview = () => {
    if (!marketData || !depositAmount || isNaN(Number(depositAmount))) {
      return {
        instantLiquidity: 0,
        streamingYield: 0,
        fee: 0
      }
    }

    const amount = Number(depositAmount)
    const rate = marketData.currentRate
    const instantLiquidity = amount * rate * 0.95 // 95% instant liquidity
    const streamingYield = amount * rate * 0.05 // 5% streaming yield
    const fee = amount * 0.005 // 0.5% fee

    return {
      instantLiquidity,
      streamingYield,
      fee
    }
  }

  const handleDeposit = async () => {
    if (!marketData || !depositAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a market and enter an amount',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast({
        title: 'Deposit Successful!',
        description: `Deposited ${depositAmount} ${marketData.underlying} successfully`,
      })
      
      // Reset form
      setDepositAmount('')
      
    } catch (error) {
      toast({
        title: 'Deposit Failed',
        description: 'Transaction failed. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const preview = calculatePreview()


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Deposit Principal Tokens</h1>
          <p className="text-xl text-muted-foreground">
            Convert your PTs into instant liquidity plus streaming yield
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Deposit Form
              </CardTitle>
              <CardDescription>
                Select a market and enter the amount you want to deposit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Market Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Market</label>
                {isLoadingMarket ? (
                  <div className="text-sm text-muted-foreground">Loading market data...</div>
                ) : marketData ? (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium">{marketData.name}</div>
                    <div className="text-sm text-success">{marketData.impliedAPY.toFixed(1)}% APY</div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No market data available</div>
                )}
              </div>

              {/* Market Info */}
              {marketData && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Rate</span>
                    <span className="text-sm font-mono">{marketData.currentRate.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="text-sm font-mono text-success">{marketData.impliedAPY.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expiry</span>
                    <span className="text-sm font-mono">{marketData.expiry.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVL</span>
                    <span className="text-sm font-mono">${(marketData.tvl / 1e6).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Days to Expiry</span>
                    <span className="text-sm font-mono">{marketData.daysToExpiry}</span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  step="0.000001"
                  min="0"
                />
                {marketData && depositAmount && (
                  <div className="text-sm text-muted-foreground">
                    Price: {marketData.currentRate.toFixed(4)} PT/ETH • Discount: {((1 - marketData.currentRate) * 100).toFixed(2)}%
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Balance: -- {marketData?.underlying || 'PT'}</span>
                  <button className="text-primary hover:underline">Max</button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleDeposit}
                disabled={!marketData || !depositAmount || isLoading || isLoadingMarket}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Processing...' : 'Deposit Principal Tokens'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Transaction Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Transaction Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketData && depositAmount ? (
                <>
                  {/* Price Info */}
                  <div className="text-sm text-muted-foreground mb-4">
                    Price: {marketData.currentRate.toFixed(4)} PT/ETH • Discount: {((1 - marketData.currentRate) * 100).toFixed(2)}%
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You deposit</span>
                      <span className="font-mono">{depositAmount} PT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You receive now (ovflETH)</span>
                      <span className="font-mono text-success">{preview.instantLiquidity.toFixed(4)} ovflETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You stream (PT)</span>
                      <span className="font-mono text-success">{preview.streamingYield.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-mono">{preview.fee.toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Stream ends in</span>
                      <span className="font-mono">{marketData.daysToExpiry} days</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {isLoadingMarket ? 'Loading market data...' : 'Enter an amount to see preview'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}