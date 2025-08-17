import { createPublicClient, http, type Address } from 'viem';
import { ovflTenderly } from '@/config/wagmi';

// Create viem client for Sablier data fetching
const publicClient = createPublicClient({
  chain: ovflTenderly,
  transport: http(),
});

// Sablier V2 Lockup Linear contract address for OVFL Tenderly
export const SABLIER_ADDRESS = (import.meta.env.VITE_SABLIER_LOCKUP_LINEAR || '0x3962f6585946823440d274ad7c719b02b49de51e') as Address;

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
export const SABLIER_ABI = [
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
  // ERC721 Transfer event for efficient log scanning
  {
    type: 'event',
    name: 'Transfer',
    anonymous: false,
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
  // Sablier stream events
  {
    type: 'event',
    name: 'CreateLockupLinearStream',
    anonymous: false,
    inputs: [
      { name: 'streamId', type: 'uint256', indexed: true },
      { name: 'funder', type: 'address', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amounts', type: 'tuple', components: [
        { name: 'deposited', type: 'uint128' },
        { name: 'withdrawn', type: 'uint128' },
        { name: 'refunded', type: 'uint128' }
      ]},
      { name: 'asset', type: 'address', indexed: false },
      { name: 'cancelable', type: 'bool', indexed: false },
      { name: 'transferable', type: 'bool', indexed: false },
      { name: 'timestamps', type: 'tuple', components: [
        { name: 'start', type: 'uint40' },
        { name: 'cliff', type: 'uint40' },
        { name: 'end', type: 'uint40' }
      ]},
      { name: 'broker', type: 'address', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'WithdrawFromLockupStream',
    anonymous: false,
    inputs: [
      { name: 'streamId', type: 'uint256', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'asset', type: 'address', indexed: true },
      { name: 'withdrawnAmount', type: 'uint128', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'CancelLockupStream',
    anonymous: false,
    inputs: [
      { name: 'streamId', type: 'uint256', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'asset', type: 'address', indexed: true },
      { name: 'senderAmount', type: 'uint128', indexed: false },
      { name: 'recipientAmount', type: 'uint128', indexed: false },
    ],
  },
  // Withdrawal functions
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint128' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'streamId', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'withdrawMax',
    outputs: [{ name: 'withdrawnAmount', type: 'uint128' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export async function getUserStreams(userAddress: Address): Promise<StreamInfo[]> {
  try {
    console.debug('[SABLIER] Fetching streams for user:', userAddress, 'from contract:', SABLIER_ADDRESS);

    // 1) Pull candidate stream IDs via ERC721 Transfer logs (to/from user)
    const [toLogs, fromLogs] = await Promise.all([
      publicClient.getContractEvents({
        address: SABLIER_ADDRESS,
        abi: SABLIER_ABI,
        eventName: 'Transfer',
        args: { to: userAddress } as any,
        fromBlock: 0n,
        toBlock: 'latest',
      }),
      publicClient.getContractEvents({
        address: SABLIER_ADDRESS,
        abi: SABLIER_ABI,
        eventName: 'Transfer',
        args: { from: userAddress } as any,
        fromBlock: 0n,
        toBlock: 'latest',
      }),
    ]);

    const candidateIds = new Set<string>();
    for (const log of [...toLogs, ...fromLogs]) {
      const tokenId = (log as any).args?.tokenId as bigint | undefined;
      if (tokenId !== undefined) candidateIds.add(tokenId.toString());
    }

    if (candidateIds.size === 0) {
      console.debug('[SABLIER] No candidate stream IDs found in logs');
      return [];
    }

    // 2) Verify current ownership & fetch details for owned IDs
    const ownedIds = (
      await Promise.all(
        Array.from(candidateIds).map(async (id) => {
          try {
            const owner = await publicClient.readContract({
              address: SABLIER_ADDRESS,
              abi: SABLIER_ABI,
              functionName: 'ownerOf',
              args: [BigInt(id)],
            });
            return owner?.toLowerCase() === userAddress.toLowerCase() ? id : null;
          } catch (e) {
            // token may be burned/canceled
            return null;
          }
        })
      )
    ).filter((x): x is string => !!x);

    if (ownedIds.length === 0) {
      console.debug('[SABLIER] No streams currently owned by user');
      return [];
    }

    // 3) Fetch stream data & withdrawable amounts in parallel
    const streams = await Promise.all(
      ownedIds.map(async (id) => {
        const [streamData, withdrawableAmount] = await Promise.all([
          publicClient.readContract({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            functionName: 'getStream',
            args: [BigInt(id)],
          }),
          publicClient.readContract({
            address: SABLIER_ADDRESS,
            abi: SABLIER_ABI,
            functionName: 'withdrawableAmountOf',
            args: [BigInt(id)],
          }),
        ]);

        return {
          streamId: id,
          sender: streamData.sender,
          recipient: streamData.recipient,
          asset: streamData.asset,
          amount: BigInt(streamData.amounts.deposited),
          startTime: Number(streamData.startTime) * 1000,
          endTime: Number(streamData.endTime) * 1000,
          withdrawnAmount: BigInt(streamData.amounts.withdrawn),
          withdrawableAmount: BigInt(withdrawableAmount),
          isActive: !streamData.isDepleted && streamData.isStream,
          isCancelable: streamData.isCancelable,
          isDepleted: streamData.isDepleted,
        } as StreamInfo;
      })
    );

    // Sort by newest first (numerically descending)
    return streams.sort((a, b) => Number(b.streamId) - Number(a.streamId));
  } catch (error) {
    console.error('[SABLIER] Failed to fetch user streams:', error);
    return [];
  }
}

export async function getTotalWithdrawableAmount(userAddress: Address): Promise<bigint> {
  const streams = await getUserStreams(userAddress);
  return streams.reduce((total, stream) => total + stream.withdrawableAmount, 0n);
}

export async function getActiveStreamsCount(userAddress: Address): Promise<number> {
  const streams = await getUserStreams(userAddress);
  return streams.filter((s) => s.isActive).length;
}