import { useAccount, useChainId } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ovflTenderly } from "@/config/wagmi";
import { AlertTriangle, Wallet } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  // If wallet not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="text-2xl">Wallet Required</CardTitle>
            <CardDescription>
              Please use the "Connect Wallet" button in the top-right corner to access OVFL Protocol
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If connected but wrong network, show network info
  if (chainId !== ovflTenderly.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <CardTitle className="text-2xl">Wrong Network</CardTitle>
            <CardDescription>
              Please switch to OVFL Tenderly (Chain ID: 73571) in your wallet to continue
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Wallet connected and on correct network
  return <>{children}</>;
};