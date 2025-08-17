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
          tokenInAddr: request.tokenIn,
          slippage: request.slippageBps / 10000, // Convert bps to decimal
        },
      }),
    })

    if (response.ok) {
      const data = await response.json()
      
      // Validate response has required data
      if (!data.transaction?.to || !data.transaction?.data || data.transaction.data === '0x') {
        throw new Error('Invalid quote response: missing transaction data')
      }
      
      return {
        to: data.transaction.to,
        data: data.transaction.data,
        value: data.transaction.value,
        netPtOut: data.data.netPtOut,
      }
    } else {
      throw new Error(`Pendle backend error: ${response.status}`)
    }
  } catch (error) {
    console.error('Pendle quote failed:', error)
    throw new Error(`Unable to get Pendle quote: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}