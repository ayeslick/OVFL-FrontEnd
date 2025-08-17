import { createPublicClient, http, type Address } from 'viem';
import { ovflTenderly } from '@/config/wagmi';

// Create viem client for Sablier data fetching
const publicClient = createPublicClient({
  chain: ovflTenderly,
  transport: http(),
});

// Sablier V2 Lockup Linear contract address for OVFL Tenderly
const SABLIER_V2_LOCKUP_LINEAR = (import.meta.env.VITE_SABLIER_LOCKUP_LINEAR || '0x3962f6585946823440d274ad7c719b02b49de51e') as Address;

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

// Sablier Contract ABI (matching the provided contract)
const SABLIER_ABI = [
  {
    inputs: [{ name: 'streamId', type: 'uint256' }],
    name: 'getStream',
    outputs: [
      {
        components: [
          { name: 'sender', type: 'address' },
          { name: 'recipient', type: 'address' },
          { name: 'startTime', type: 'uint40' },
          { name: 'isCancelable', type: 'bool' },
          { name: 'wasCanceled', type: 'bool' },
          { name: 'asset', type: 'address' },
          { name: 'endTime', type: 'uint40' },
          { name: 'isDepleted', type: 'bool' },
          { name: 'isStream', type: 'bool' },
          { name: 'isTransferable', type: 'bool' },
          {
            components: [
              { name: 'deposited', type: 'uint128' },
              { name: 'withdrawn', type: 'uint128' },
              { name: 'refunded', type: 'uint128' }
            ],
            name: 'amounts',
            type: 'tuple'
          },
          { name: 'cliffTime', type: 'uint40' }
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
    outputs: [{ name: 'withdrawableAmount', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextStreamId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export async function getUserStreams(userAddress: Address): Promise<StreamInfo[]> {
  try {
    console.debug('[SABLIER] Fetching streams for user:', userAddress, 'from contract:', SABLIER_V2_LOCKUP_LINEAR);
    
    const streams: StreamInfo[] = [];

    // Get the next stream ID to know the range of existing streams
    const nextStreamId = await publicClient.readContract({
      address: SABLIER_V2_LOCKUP_LINEAR,
      abi: SABLIER_ABI,
      functionName: 'nextStreamId',
    });

    console.debug('[SABLIER] Next stream ID:', nextStreamId.toString());

    // Iterate through stream IDs from newest to oldest (up to nextStreamId - 1)
    for (let streamId = Number(nextStreamId) - 1; streamId >= 1; streamId--) {
      try {
        // Check if this stream belongs to the user
        const streamOwner = await publicClient.readContract({
          address: SABLIER_V2_LOCKUP_LINEAR,
          abi: SABLIER_ABI,
          functionName: 'ownerOf',
          args: [BigInt(streamId)],
        });

        if (streamOwner.toLowerCase() !== userAddress.toLowerCase()) {
          continue; // Skip streams not owned by the user
        }

        // Get stream details
        const streamData = await publicClient.readContract({
          address: SABLIER_V2_LOCKUP_LINEAR,
          abi: SABLIER_ABI,
          functionName: 'getStream',
          args: [BigInt(streamId)],
        });

        // Get withdrawable amount
        const withdrawableAmount = await publicClient.readContract({
          address: SABLIER_V2_LOCKUP_LINEAR,
          abi: SABLIER_ABI,
          functionName: 'withdrawableAmountOf',
          args: [BigInt(streamId)],
        });

        // Convert timestamps to milliseconds for JavaScript Date compatibility
        const startTimeMs = Number(streamData.startTime) * 1000;
        const endTimeMs = Number(streamData.endTime) * 1000;

        streams.push({
          streamId: streamId.toString(),
          sender: streamData.sender,
          recipient: streamData.recipient,
          asset: streamData.asset,
          amount: BigInt(streamData.amounts.deposited),
          startTime: startTimeMs,
          endTime: endTimeMs,
          withdrawnAmount: BigInt(streamData.amounts.withdrawn),
          withdrawableAmount: BigInt(withdrawableAmount),
          isActive: !streamData.isDepleted && streamData.isStream,
          isCancelable: streamData.isCancelable,
          isDepleted: streamData.isDepleted,
        });
      } catch (error) {
        // Stream might not exist or be accessible, continue to next
        console.debug(`[SABLIER] Stream ${streamId} not accessible:`, error);
      }
    }

    console.debug('[SABLIER] Found', streams.length, 'streams for user');
    
    // Sort by stream ID descending (newest first)
    return streams.sort((a, b) => Number(b.streamId) - Number(a.streamId));
  } catch (error) {
    console.error('[SABLIER] Failed to fetch user streams:', error);
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