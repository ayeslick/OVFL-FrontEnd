import { createPublicClient, http, type Address } from 'viem'
import { ovflTenderly } from '@/config/wagmi'
import { OVFL_ADDRESS } from '@/lib/addresses'
import { OVFL_ABI } from '@/lib/abi/ovfl'

const publicClient = createPublicClient({
  chain: ovflTenderly,
  transport: http(),
})

export async function getClaimableOVFL(userAddress: Address): Promise<bigint> {
  try {
    const amount = await publicClient.readContract({
      address: OVFL_ADDRESS,
      abi: OVFL_ABI,
      functionName: 'claimable',
      // Many contracts compute claimable for msg.sender; set account for view context
      account: userAddress,
    })
    return BigInt(amount as unknown as bigint)
  } catch (e) {
    console.error('[OVFL] Failed to fetch claimable amount:', e)
    return 0n
  }
}
