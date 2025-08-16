import { createConfig, http } from 'wagmi'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// OVFL Tenderly Virtual Network - the only chain we support
export const ovflTenderly = {
  id: 17777,
  name: 'OVFL Tenderly',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://virtual.mainnet.us-east.rpc.tenderly.co/be0dadf3-31fb-4b53-9d7a-084f93b2021a'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tenderly Explorer',
      url: 'https://dashboard.tenderly.co/explorer/vnet',
    },
  },
  testnet: false, // Treat as mainnet for user experience
} as const

export const wagmiConfig = createConfig({
  chains: [ovflTenderly],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'OVFL Protocol',
      appLogoUrl: 'https://ovfl.xyz/logo.png',
    }),
  ],
  transports: {
    [ovflTenderly.id]: http(),
  },
})