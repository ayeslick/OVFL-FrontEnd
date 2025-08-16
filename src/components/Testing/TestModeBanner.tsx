import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, ExternalLink, RotateCcw } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { tenderlyTestnet } from "@/config/wagmi";

interface TestModeBannerProps {
  onResetFork?: () => void;
  onOpenDebugPanel?: () => void;
}

export const TestModeBanner = ({ onResetFork, onOpenDebugPanel }: TestModeBannerProps) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  
  const isTestMode = chainId === tenderlyTestnet.id;
  
  if (!isTestMode || !isConnected) return null;

  return (
    <Alert className="border-warning bg-warning/10 mb-6">
      <TestTube className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-warning font-medium">
            Test Mode Active - Connected to Tenderly Virtual TestNet
          </span>
          <Badge variant="outline" className="border-warning text-warning">
            Testnet
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDebugPanel}
            className="border-warning text-warning hover:bg-warning/20"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Debug Panel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFork}
            className="border-warning text-warning hover:bg-warning/20"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset Fork
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};