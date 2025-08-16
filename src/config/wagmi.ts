import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet],
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
  },
})