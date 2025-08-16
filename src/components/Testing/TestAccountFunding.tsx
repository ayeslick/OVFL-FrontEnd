import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Coins, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ovflTenderly } from "@/config/wagmi";
import { useToast } from "@/hooks/use-toast";

export const TestAccountFunding = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [ethAmount, setEthAmount] = useState("10");
  const [tokenAmount, setTokenAmount] = useState("1000");
  const [selectedToken, setSelectedToken] = useState("USDC");

  const isTestMode = chainId === ovflTenderly.id;

  const testTokens = [
    { symbol: "USDC", name: "USD Coin", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
    { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
    { symbol: "weETH", name: "Wrapped eETH", decimals: 18 },
    { symbol: "ezETH", name: "Renzo Restaked ETH", decimals: 18 },
  ];

  const fundETH = async () => {
    if (!address || !isTestMode) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to Tenderly funding endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "ETH Funded Successfully",
        description: `${ethAmount} ETH has been added to your test account`,
      });
    } catch (error) {
      toast({
        title: "Funding Failed",
        description: "Failed to fund account with ETH",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fundToken = async () => {
    if (!address || !isTestMode) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to mint test tokens
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Tokens Minted Successfully",
        description: `${tokenAmount} ${selectedToken} has been minted to your test account`,
      });
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: `Failed to mint ${selectedToken} tokens`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickFundAll = async () => {
    if (!address || !isTestMode) return;
    
    setIsLoading(true);
    try {
      // Simulate funding with ETH and all major test tokens
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Account Fully Funded",
        description: "Your test account has been funded with ETH and all major test tokens",
      });
    } catch (error) {
      toast({
        title: "Full Funding Failed",
        description: "Failed to fund account with all assets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTestMode) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            Connect to Tenderly Virtual TestNet to access funding tools
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <CardTitle>Test Account Funding</CardTitle>
          <Badge variant="outline" className="border-success text-success">
            Test Mode
          </Badge>
        </div>
        <CardDescription>
          Fund your test account with ETH and various test tokens for realistic testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Fund</TabsTrigger>
            <TabsTrigger value="eth">Fund ETH</TabsTrigger>
            <TabsTrigger value="tokens">Mint Tokens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="quick" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">One-Click Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Fund your account with 10 ETH and 1000 of each major test token
                </p>
              </div>
              <Button 
                onClick={quickFundAll}
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isLoading ? "Funding Account..." : "Fund All Assets"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="eth" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eth-amount">ETH Amount</Label>
                <Input
                  id="eth-amount"
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="10"
                  min="0"
                  step="0.1"
                />
              </div>
              <Button 
                onClick={fundETH}
                disabled={isLoading || !ethAmount}
                className="w-full"
              >
                <Coins className="w-4 h-4 mr-2" />
                {isLoading ? "Funding..." : `Fund ${ethAmount} ETH`}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="tokens" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Token</Label>
                <Select value={selectedToken} onValueChange={setSelectedToken}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {testTokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{token.symbol}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-sm">{token.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="token-amount">Amount</Label>
                <Input
                  id="token-amount"
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="1000"
                  min="0"
                />
              </div>
              <Button 
                onClick={fundToken}
                disabled={isLoading || !tokenAmount}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isLoading ? "Minting..." : `Mint ${tokenAmount} ${selectedToken}`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};