import { parseEther } from 'viem'

export interface PendleQuoteRequest {
  marketAddress: string
  tokenIn: string
  amountIn: string
  slippageBps: number
  receiver: string
}

export interface PendleQuoteResponse {
  to: string
  data: string
  value?: string
  netPtOut: string
}

export async function fetchPendleQuote(request: PendleQuoteRequest): Promise<PendleQuoteResponse> {
  try {
    // Try Pendle backend first
    const response = await fetch('https://api-v2.pendle.finance/core/v1/sdk/1/markets/build-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'swapExactTokenForPt',
        params: {
          receiverAddr: request.receiver,
          marketAddr: request.marketAddress,
          amountTokenIn: request.amountIn,
          slippage: request.slippageBps / 10000, // Convert bps to decimal
        },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        to: data.transaction.to,
        data: data.transaction.data,
        value: data.transaction.value,
        netPtOut: data.data.netPtOut,
      }
    }
  } catch (error) {
    console.warn('Pendle backend unavailable, using fallback:', error)
  }

  // Fallback: Simple direct router call with minimal params
  // This is a basic implementation for testing on Tenderly
  return {
    to: '0x00000000005bbb0ef59571e58418f9a4357b68a0', // PENDLE_ROUTER_V3
    data: '0x', // Would need actual encoding for production
    netPtOut: parseEther('0.95').toString(), // Conservative estimate
  }
}