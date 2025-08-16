import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Network, 
  Globe, 
  TestTube, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ovflTenderly } from "@/config/wagmi";
import { useToast } from "@/hooks/use-toast";

export const NetworkSwitcher = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const { toast } = useToast();

  const networks = [
    {
      id: ovflTenderly.id,
      name: "OVFL Tenderly",
      shortName: "OVFL",
      icon: Network,
      color: "text-primary",
      isTestnet: false,
    },
  ];

  const currentNetwork = networks.find(network => network.id === chainId);

  const handleNetworkSwitch = async (networkId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (networkId === chainId) return;

    try {
      await switchChain({ chainId: networkId });
      
      const network = networks.find(n => n.id === networkId);
      toast({
        title: "Network Switched",
        description: `Successfully switched to ${network?.name}`,
      });
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch network. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Network className="w-4 h-4 mr-2" />
        No Network
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={isPending}
        >
          {currentNetwork ? (
            <>
              <currentNetwork.icon className={`w-4 h-4 ${currentNetwork.color}`} />
              <span>{currentNetwork.shortName}</span>
              {currentNetwork.isTestnet && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  Test
                </Badge>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span>Unknown</span>
            </>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Select Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {networks.map((network) => {
          const isCurrentNetwork = network.id === chainId;
          const Icon = network.icon;
          
          return (
            <DropdownMenuItem
              key={network.id}
              onClick={() => handleNetworkSwitch(network.id)}
              className="cursor-pointer"
              disabled={isPending}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${network.color}`} />
                  <div>
                    <p className="font-medium">{network.name}</p>
                    {network.isTestnet && (
                      <p className="text-xs text-muted-foreground">
                        Test environment for development
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {network.isTestnet && (
                    <Badge variant="outline" className="text-xs border-warning text-warning">
                      Test
                    </Badge>
                  )}
                  {isCurrentNetwork && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="p-2 text-xs text-muted-foreground">
          <p>💡 Use Tenderly Virtual TestNet for safe testing</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};