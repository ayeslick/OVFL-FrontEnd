import { useAccount, useChainId } from "wagmi";
import { WalletConnect } from "@/components/Wallet/WalletConnect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSwitchChain } from "wagmi";
import { ovflTenderly } from "@/config/wagmi";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const handleSwitchToOVFL = async () => {
    try {
      await switchChain({ chainId: ovflTenderly.id });
      toast({
        title: "Network Switched",
        description: "Successfully connected to OVFL Tenderly",
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: "Please manually switch to OVFL Tenderly in your wallet",
        variant: "destructive",
      });
    }
  };

  // If wallet not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access OVFL Protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnect />
          </CardContent>
        </Card>
      </div>
    );
  }

  // If connected but wrong network, show network switch
  if (chainId !== ovflTenderly.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <CardTitle className="text-2xl">Wrong Network</CardTitle>
            <CardDescription>
              Please switch to OVFL Tenderly (Chain ID: {ovflTenderly.id}) to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSwitchToOVFL}
              className="w-full"
            >
              Switch to OVFL Tenderly
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              If the automatic switch fails, please manually switch in your wallet
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wallet connected and on correct network
  return <>{children}</>;
};