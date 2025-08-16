import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TestModeBanner } from "@/components/Testing/TestModeBanner";
import { TestAccountFunding } from "@/components/Testing/TestAccountFunding";
import { TransactionSimulator } from "@/components/Testing/TransactionSimulator";
import { DebugPanel } from "@/components/Testing/DebugPanel";
import { NetworkSwitcher } from "@/components/Testing/NetworkSwitcher";
import { 
  TestTube, 
  Zap, 
  Wallet, 
  Activity, 
  Settings,
  ExternalLink,
  RotateCcw,
  Play
} from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { tenderlyTestnet } from "@/config/wagmi";
import { useToast } from "@/hooks/use-toast";

const Testing = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  const isTestMode = chainId === tenderlyTestnet.id;

  const handleResetFork = async () => {
    toast({
      title: "Fork Reset Initiated",
      description: "Resetting Tenderly virtual network fork...",
    });
    
    // Simulate fork reset
    setTimeout(() => {
      toast({
        title: "Fork Reset Complete",
        description: "Virtual network has been reset to a clean state",
      });
    }, 2000);
  };

  const openTenderlyDashboard = () => {
    window.open("https://dashboard.tenderly.co", "_blank");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <TestTube className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Testing Environment</h1>
              {isTestMode && (
                <Badge className="bg-success text-success-foreground">
                  Test Mode Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Comprehensive testing tools powered by Tenderly Virtual TestNet
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <NetworkSwitcher />
            <Button
              variant="outline"
              onClick={openTenderlyDashboard}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Tenderly Dashboard
            </Button>
          </div>
        </div>

        {/* Test Mode Banner */}
        <TestModeBanner 
          onResetFork={handleResetFork}
          onOpenDebugPanel={() => setDebugPanelOpen(true)}
        />

        {/* Main Content */}
        {!isConnected ? (
          <Card className="text-center py-12">
            <CardContent>
              <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access testing tools and switch to Tenderly Virtual TestNet
              </p>
            </CardContent>
          </Card>
        ) : !isTestMode ? (
          <Card className="text-center py-12">
            <CardContent>
              <TestTube className="w-12 h-12 mx-auto mb-4 text-warning" />
              <h2 className="text-2xl font-semibold mb-2">Switch to Test Mode</h2>
              <p className="text-muted-foreground mb-6">
                Switch to Tenderly Virtual TestNet to access all testing features
              </p>
              <div className="flex justify-center">
                <NetworkSwitcher />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="funding" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="funding" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Funding
              </TabsTrigger>
              <TabsTrigger value="simulation" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Simulation
              </TabsTrigger>
              <TabsTrigger value="debugging" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Debugging
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Config
              </TabsTrigger>
            </TabsList>

            <TabsContent value="funding" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <TestAccountFunding />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common testing scenarios and quick setup options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <TestTube className="w-4 h-4 mr-2" />
                      Setup DeFi Testing Environment
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Wallet className="w-4 h-4 mr-2" />
                      Create Multiple Test Accounts
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Deploy Test Contracts
                    </Button>
                    <Separator />
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={handleResetFork}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Virtual Network
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="simulation" className="space-y-6">
              <TransactionSimulator />
            </TabsContent>

            <TabsContent value="debugging" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Real-time Monitoring
                    </CardTitle>
                    <CardDescription>
                      Monitor contract states, transactions, and network activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-success">12</p>
                        <p className="text-sm text-muted-foreground">Active Contracts</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">453</p>
                        <p className="text-sm text-muted-foreground">Total Transactions</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => setDebugPanelOpen(true)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Open Debug Panel
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Debug Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      View Call Traces
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Export State Diff
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Gas Profiler
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Event Log Viewer
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Virtual Network ID</p>
                        <p className="font-mono text-sm text-muted-foreground">88888</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">RPC Endpoint</p>
                        <p className="font-mono text-sm text-muted-foreground break-all">
                          https://virtual.mainnet.rpc.tenderly.co/YOUR_ACCESS_KEY
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fork Block</p>
                        <p className="font-mono text-sm text-muted-foreground">19234567</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Environment Variables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Tenderly Access Key</p>
                        <p className="text-sm text-muted-foreground">Configured via Supabase Secrets</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Virtual Network ID</p>
                        <p className="text-sm text-muted-foreground">Configured via Supabase Secrets</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Contract Addresses</p>
                        <p className="text-sm text-muted-foreground">Dynamically managed</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Configuration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Debug Panel */}
        <DebugPanel 
          open={debugPanelOpen} 
          onOpenChange={setDebugPanelOpen} 
        />
      </div>
    </div>
  );
};

export default Testing;