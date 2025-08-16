import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WalletConnect } from '@/components/Wallet/WalletConnect'
import { useToast } from '@/hooks/use-toast'
import { PiggyBank, ArrowRight, AlertCircle, TrendingUp } from 'lucide-react'

const mockMarkets = [
  {
    id: '1',
    name: 'PT-weETH-26DEC2024',
    token: 'PT-weETH',
    expiry: '2024-12-26',
    currentRate: '0.9234',
    apy: '8.7%',
    tvl: '$2.4M'
  },
  {
    id: '2', 
    name: 'PT-ezETH-27MAR2025',
    token: 'PT-ezETH',
    expiry: '2025-03-27',
    currentRate: '0.9156',
    apy: '9.2%',
    tvl: '$1.8M'
  },
  {
    id: '3',
    name: 'PT-rETH-28JUN2025',
    token: 'PT-rETH', 
    expiry: '2025-06-28',
    currentRate: '0.9078',
    apy: '10.1%',
    tvl: '$3.1M'
  }
]

export default function Deposit() {
  const { isConnected } = useAccount()
  const isConnectedDemo = true
  const displayConnected = isConnectedDemo || isConnected
  const { toast } = useToast()
  const [selectedMarket, setSelectedMarket] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectedMarketData = mockMarkets.find(m => m.id === selectedMarket)

  const calculatePreview = () => {
    if (!selectedMarketData || !depositAmount || isNaN(Number(depositAmount))) {
      return {
        instantLiquidity: 0,
        streamingYield: 0,
        fee: 0
      }
    }

    const amount = Number(depositAmount)
    const rate = Number(selectedMarketData.currentRate)
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
    if (!selectedMarketData || !depositAmount) {
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
        description: `Deposited ${depositAmount} ${selectedMarketData.token} successfully`,
      })
      
      // Reset form
      setDepositAmount('')
      setSelectedMarket('')
      
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

  if (!displayConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="max-w-md w-full text-center ovfl-shadow-lg">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <PiggyBank className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription className="text-base">
                Connect your wallet to start depositing Principal Tokens and earning yield
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WalletConnect />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
                <label className="text-sm font-medium">Select Market</label>
                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                  <SelectTrigger className="z-50">
                    <SelectValue placeholder="Choose a Principal Token market" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-card border border-border shadow-lg">
                    {mockMarkets.map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{market.name}</span>
                          <span className="text-success ml-2">{market.apy}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Market Info */}
              {selectedMarketData && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Rate</span>
                    <span className="text-sm font-mono">{selectedMarketData.currentRate} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">APY</span>
                    <span className="text-sm font-mono text-success">{selectedMarketData.apy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expiry</span>
                    <span className="text-sm font-mono">{selectedMarketData.expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TVL</span>
                    <span className="text-sm font-mono">{selectedMarketData.tvl}</span>
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
                {selectedMarketData && depositAmount && (
                  <div className="text-sm text-muted-foreground">
                    Price: {selectedMarketData.currentRate} PT/ETH • Discount: {((1 - Number(selectedMarketData.currentRate)) * 100).toFixed(2)}%
                  </div>
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Balance: 10.5 {selectedMarketData?.token || 'PT'}</span>
                  <button className="text-primary hover:underline">Max</button>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleDeposit}
                disabled={!selectedMarket || !depositAmount || isLoading}
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
              {selectedMarketData && depositAmount ? (
                <>
                  {/* Price Info */}
                  <div className="text-sm text-muted-foreground mb-4">
                    Price: {selectedMarketData.currentRate} PT/ETH • Discount: {((1 - Number(selectedMarketData.currentRate)) * 100).toFixed(2)}%
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
                      <span className="font-mono">{Math.floor((new Date(selectedMarketData.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a market and enter an amount to see preview
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}