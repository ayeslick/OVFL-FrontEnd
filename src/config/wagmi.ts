import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

// Tenderly Virtual TestNet configuration
export const tenderlyTestnet = {
  id: 88888,
  name: 'Tenderly Virtual TestNet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://virtual.mainnet.rpc.tenderly.co/YOUR_TENDERLY_ACCESS_KEY'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tenderly Explorer',
      url: 'https://dashboard.tenderly.co/explorer/vnet/YOUR_VNET_ID',
    },
  },
  testnet: true,
} as const

export const wagmiConfig = createConfig({
  chains: [mainnet, tenderlyTestnet],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'OVFL Protocol',
      appLogoUrl: 'https://ovfl.xyz/logo.png',
    }),
    walletConnect({
      projectId: 'your-project-id', // Replace with actual project ID
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [tenderlyTestnet.id]: http(),
  },
})