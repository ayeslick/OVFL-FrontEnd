import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { ChevronDown, Wallet, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

export function WalletConnect() {
  // Simulate connected wallet state for demo
  const mockAddress = "0x742d35Cc6635C0532925a3b8D13b1234567890AB"
  const isConnectedDemo = true
  
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)

  // Use demo state to show connected experience
  const displayAddress = isConnectedDemo ? mockAddress : address
  const displayConnected = isConnectedDemo || isConnected

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (displayConnected && displayAddress) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            {formatAddress(displayAddress)}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
          <DropdownMenuItem className="flex items-center gap-2 p-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-medium">{formatAddress(displayAddress)}</p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="flex items-center gap-2 text-danger hover:text-danger"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isPending} className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="flex items-center gap-2 p-3 cursor-pointer"
          >
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium">{connector.name}</p>
              <p className="text-sm text-muted-foreground">
                {connector.type === 'metaMask' && 'MetaMask Wallet'}
                {connector.type === 'coinbaseWallet' && 'Coinbase Wallet'}
                {connector.type === 'walletConnect' && 'WalletConnect'}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}