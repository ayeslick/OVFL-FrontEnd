// Transaction simulator component for testing
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Fuel,
  Zap,
  Code
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { ovflTenderly } from "@/config/wagmi";
import { useToast } from "@/hooks/use-toast";

interface SimulationResult {
  success: boolean;
  gasUsed: string;
  gasLimit: string;
  gasPrice: string;
  logs: string[];
  revertReason?: string;
  stateChanges: Array<{
    address: string;
    type: string;
    changes: string[];
  }>;
}

export const TransactionSimulator = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Form state
  const [toAddress, setToAddress] = useState("");
  const [value, setValue] = useState("");
  const [gasLimit, setGasLimit] = useState("21000");
  const [gasPrice, setGasPrice] = useState("20");
  const [data, setData] = useState("");

  const isTestMode = chainId === ovflTenderly.id;

  const simulateTransaction = async () => {
    if (!address || !isTestMode) return;
    
    setIsSimulating(true);
    try {
      // Simulate API call to Tenderly simulation endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock simulation result
      const mockResult: SimulationResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        gasUsed: "21000",
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        logs: [
          "Transfer(address,address,uint256): from=0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d, to=0x8ba1f109551bD432803012645Hac136c34B3c27, value=1000000000000000000",
          "Approval(address,address,uint256): owner=0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d, spender=0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984, value=115792089237316195423570985008687907853269984665640564039457584007913129639935"
        ],
        stateChanges: [
          {
            address: "0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d",
            type: "balance",
            changes: ["-1.0 ETH"]
          },
          {
            address: toAddress || "0x8ba1f109551bD432803012645Hac136c34B3c27",
            type: "balance", 
            changes: ["+1.0 ETH"]
          }
        ],
        revertReason: Math.random() > 0.7 ? "Insufficient balance" : undefined
      };
      
      setSimulationResult(mockResult);
      
      toast({
        title: mockResult.success ? "Simulation Successful" : "Simulation Failed",
        description: mockResult.success 
          ? "Transaction simulation completed successfully"
          : `Transaction would fail: ${mockResult.revertReason}`,
        variant: mockResult.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Simulation Error",
        description: "Failed to run transaction simulation",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isTestMode) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Code className="w-8 h-8 mx-auto mb-2" />
            Connect to Tenderly Virtual TestNet to access transaction simulation
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <CardTitle>Transaction Simulator</CardTitle>
          <Badge variant="outline" className="border-success text-success">
            Test Mode
          </Badge>
        </div>
        <CardDescription>
          Simulate transactions before execution to test gas usage and prevent failures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="simulate" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simulate">Simulate</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulate" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="to-address">To Address</Label>
                <Input
                  id="to-address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (ETH)</Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.1"
                  step="0.001"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gas-limit">Gas Limit</Label>
                <Input
                  id="gas-limit"
                  value={gasLimit}
                  onChange={(e) => setGasLimit(e.target.value)}
                  placeholder="21000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas-price">Gas Price (Gwei)</Label>
                <Input
                  id="gas-price"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  placeholder="20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data">Transaction Data (Optional)</Label>
              <Textarea
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder="0x..."
                rows={3}
              />
            </div>
            
            <Button 
              onClick={simulateTransaction}
              disabled={isSimulating || !toAddress}
              className="w-full"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              {isSimulating ? "Simulating..." : "Simulate Transaction"}
            </Button>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {simulationResult.success ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className="font-semibold">
                    {simulationResult.success ? "Simulation Successful" : "Simulation Failed"}
                  </span>
                </div>
                
                {simulationResult.revertReason && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Revert Reason:</p>
                      <p className="text-sm text-destructive/80">{simulationResult.revertReason}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Fuel className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">Gas Used</p>
                    <p className="text-lg">{simulationResult.gasUsed}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">Gas Price</p>
                    <p className="text-lg">{simulationResult.gasPrice} Gwei</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-medium">Est. Cost</p>
                    <p className="text-lg">
                      {(parseInt(simulationResult.gasUsed) * parseInt(simulationResult.gasPrice) / 1e9).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">State Changes</h4>
                  {simulationResult.stateChanges.map((change, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-mono text-sm text-muted-foreground">{change.address}</p>
                      <p className="text-sm">
                        <span className="font-medium">{change.type}:</span> {change.changes.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Event Logs</h4>
                  {simulationResult.logs.map((log, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <p className="font-mono text-xs text-muted-foreground break-all">{log}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Play className="w-8 h-8 mx-auto mb-2" />
                Run a simulation to see results here
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};