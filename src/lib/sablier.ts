import { createPublicClient, http, type Address } from 'viem';
import { ovflTenderly } from '@/config/wagmi';

// Create viem client for Sablier data fetching
const publicClient = createPublicClient({
  chain: ovflTenderly,
  transport: http(),
});

// Sablier V2 contract addresses (these may need to be updated for your specific deployment)
const SABLIER_V2_LOCKUP_LINEAR = '0xAFb979d9afAd1aD27C5eFf4E27226E3AB9e5dCC9' as Address;
const SABLIER_V2_LOCKUP_DYNAMIC = '0x39eFdC3dbC57715C24BcEdE49386b3CD8c5A7e11' as Address;

export interface StreamInfo {
  streamId: string;
  sender: Address;
  recipient: Address;
  asset: Address;
  amount: bigint;
  startTime: number;
  endTime: number;
  withdrawnAmount: bigint;
  withdrawableAmount: bigint;
  isActive: boolean;
  isCancelable: boolean;
  isDepleted: boolean;
}

// ERC721 ABI for token enumeration
const ERC721_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Sablier Stream ABI (simplified)
const SABLIER_STREAM_ABI = [
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'getStream',
    outputs: [
      {
        components: [
          { name: 'sender', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'depositAmount', type: 'uint128' },
          { name: 'asset', type: 'address' },
          { name: 'isDepleted', type: 'bool' },
          { name: 'isStream', type: 'bool' },
          { name: 'isCancelable', type: 'bool' },
          // Add more fields as needed
        ],
        name: 'stream',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'withdrawableAmountOf',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function getUserStreams(userAddress: Address): Promise<StreamInfo[]> {
  try {
    const streams: StreamInfo[] = [];

    // Get streams from both Linear and Dynamic contracts
    for (const contractAddress of [SABLIER_V2_LOCKUP_LINEAR, SABLIER_V2_LOCKUP_DYNAMIC]) {
      try {
        // Get number of streams owned by user
        const balance = await publicClient.readContract({
          address: contractAddress,
          abi: ERC721_ABI,
          functionName: 'balanceOf',
          args: [userAddress],
        });

        // Get each stream ID owned by the user
        for (let i = 0; i < Number(balance); i++) {
          try {
            const streamId = await publicClient.readContract({
              address: contractAddress,
              abi: ERC721_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [userAddress, BigInt(i)],
            });

            // Get stream details
            const streamData = await publicClient.readContract({
              address: contractAddress,
              abi: SABLIER_STREAM_ABI,
              functionName: 'getStream',
              args: [streamId],
            });

            // Get withdrawable amount
            const withdrawableAmount = await publicClient.readContract({
              address: contractAddress,
              abi: SABLIER_STREAM_ABI,
              functionName: 'withdrawableAmountOf',
              args: [streamId],
            });

            streams.push({
              streamId: streamId.toString(),
              sender: streamData.sender,
              recipient: streamData.recipient,
              asset: streamData.asset,
              amount: BigInt(streamData.depositAmount),
              startTime: Date.now() - 86400000, // Mock start time (24h ago)
              endTime: Date.now() + 86400000 * 30, // Mock end time (30 days from now)
              withdrawnAmount: BigInt(streamData.depositAmount) - BigInt(withdrawableAmount),
              withdrawableAmount: BigInt(withdrawableAmount),
              isActive: !streamData.isDepleted,
              isCancelable: streamData.isCancelable,
              isDepleted: streamData.isDepleted,
            });
          } catch (error) {
            console.warn(`Failed to fetch stream ${i} from ${contractAddress}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch streams from ${contractAddress}:`, error);
      }
    }

    return streams;
  } catch (error) {
    console.error('Failed to fetch user streams:', error);
    return [];
  }
}

export async function getTotalWithdrawableAmount(userAddress: Address): Promise<bigint> {
  const streams = await getUserStreams(userAddress);
  return streams.reduce((total, stream) => total + stream.withdrawableAmount, BigInt(0));
}

export async function getActiveStreamsCount(userAddress: Address): Promise<number> {
  const streams = await getUserStreams(userAddress);
  return streams.filter(stream => stream.isActive).length;
}