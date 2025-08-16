import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Database,
  Network,
  Settings,
  RefreshCw,
  Download,
  ExternalLink,
  Eye,
  Code2
} from "lucide-react";
import { useAccount, useChainId, useBlockNumber } from "wagmi";
import { ovflTenderly } from "@/config/wagmi";

interface DebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DebugPanel = ({ open, onOpenChange }: DebugPanelProps) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isTestMode = chainId === ovflTenderly.id;

  // Mock contract state data
  const contractStates = [
    {
      address: "0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d",
      name: "OVFL Protocol",
      variables: [
        { name: "totalSupply", value: "1000000000000000000000000", type: "uint256" },
        { name: "owner", value: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", type: "address" },
        { name: "paused", value: "false", type: "bool" },
        { name: "feeRate", value: "300", type: "uint16" }
      ]
    },
    {
      address: "0x8ba1f109551bD432803012645Hac136c34B3c27",
      name: "PT-weETH",
      variables: [
        { name: "balanceOf[user]", value: "5250000000000000000", type: "uint256" },
        { name: "totalSupply", value: "100000000000000000000000", type: "uint256" },
        { name: "maturity", value: "1735689600", type: "uint256" }
      ]
    }
  ];

  // Mock network information
  const networkInfo = {
    latestBlock: blockNumber?.toString() || "19234567",
    gasPrice: "20 Gwei",
    difficulty: "58750003716598352816469",
    totalTransactions: "12,453",
    pendingTransactions: "3"
  };

  // Mock recent transactions
  const recentTransactions = [
    {
      hash: "0x1234567890abcdef1234567890abcdef12345678",
      from: address || "0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d",
      to: "0x8ba1f109551bD432803012645Hac136c34B3c27",
      value: "1.0 ETH",
      gas: "21000",
      status: "success",
      timestamp: "2 minutes ago"
    },
    {
      hash: "0xabcdef1234567890abcdef1234567890abcdef12",
      from: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      to: address || "0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d",
      value: "0 ETH",
      gas: "65000",
      status: "success",
      timestamp: "5 minutes ago"
    }
  ];

  const refreshData = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const exportLogs = () => {
    const logs = {
      timestamp: new Date().toISOString(),
      network: isTestMode ? "Tenderly Virtual TestNet" : "Mainnet",
      account: address,
      contractStates,
      networkInfo,
      recentTransactions
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <DialogTitle>Debug Panel</DialogTitle>
            {isTestMode && (
              <Badge variant="outline" className="border-success text-success">
                Test Mode
              </Badge>
            )}
          </div>
          <DialogDescription>
            Real-time debugging information for contract states and network activity
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
          >
            <Download className="w-4 h-4 mr-1" />
            Export Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href="https://dashboard.tenderly.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Tenderly Dashboard
            </a>
          </Button>
        </div>

        <Tabs defaultValue="contracts" className="h-[600px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="h-full">
            <ScrollArea className="h-[520px] pr-4">
              <div className="space-y-4">
                {contractStates.map((contract, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{contract.name}</CardTitle>
                          <CardDescription className="font-mono text-xs">
                            {contract.address}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {contract.variables.map((variable, varIndex) => (
                          <div key={varIndex} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {variable.type}
                              </Badge>
                              <span className="font-mono text-sm">{variable.name}</span>
                            </div>
                            <span className="font-mono text-sm text-muted-foreground break-all max-w-[200px]">
                              {variable.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="network" className="h-full">
            <ScrollArea className="h-[520px] pr-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" />
                      <CardTitle>Network Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Latest Block</p>
                          <p className="font-mono text-lg">{networkInfo.latestBlock}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gas Price</p>
                          <p className="font-mono text-lg">{networkInfo.gasPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Transactions</p>
                          <p className="font-mono text-lg">{networkInfo.totalTransactions}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Difficulty</p>
                          <p className="font-mono text-sm break-all">{networkInfo.difficulty}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pending Transactions</p>
                          <p className="font-mono text-lg">{networkInfo.pendingTransactions}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Network Status</p>
                          <Badge className="bg-success text-success-foreground">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transactions" className="h-full">
            <ScrollArea className="h-[520px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recent Transactions</h3>
                  <Badge variant="outline">{recentTransactions.length} transactions</Badge>
                </div>
                
                {recentTransactions.map((tx, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-muted-foreground">
                            {tx.hash}
                          </span>
                          <Badge variant={tx.status === 'success' ? 'default' : 'destructive'}>
                            {tx.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">From</p>
                            <p className="font-mono break-all">{tx.from}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">To</p>
                            <p className="font-mono break-all">{tx.to}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-mono">{tx.value}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gas</p>
                            <p className="font-mono">{tx.gas}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p>{tx.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="h-full">
            <ScrollArea className="h-[520px] pr-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <CardTitle>Debug Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Tenderly Configuration</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Virtual Network ID</p>
                          <p className="font-mono">88888</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fork ID</p>
                          <p className="font-mono">your-fork-id</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Contract Addresses</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">OVFL Protocol</p>
                          <p className="font-mono">0x742d35Cc123C2C10B5FB8E5d52ac0Ee9BB8E79d</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">PT-weETH</p>
                          <p className="font-mono">0x8ba1f109551bD432803012645Hac136c34B3c27</p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Debug Options</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Code2 className="w-4 h-4 mr-2" />
                          View Contract Source
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="w-4 h-4 mr-2" />
                          Enable Call Trace
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Database className="w-4 h-4 mr-2" />
                          Export State Diff
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};