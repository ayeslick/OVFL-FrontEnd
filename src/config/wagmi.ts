import { createConfig, http } from 'wagmi'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// OVFL Tenderly Virtual Network - the only chain we support
export const ovflTenderly = {
  id: 73571,
  name: 'OVFL Tenderly',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://virtual.mainnet.us-east.rpc.tenderly.co/db666ddf-0cbc-413c-9f73-fcb2d925db62'],
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
    [ovflTenderly.id]: http('https://virtual.mainnet.us-east.rpc.tenderly.co/db666ddf-0cbc-413c-9f73-fcb2d925db62'),
  },
})