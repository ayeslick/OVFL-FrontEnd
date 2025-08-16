// Pendle Backend API integration
// API Documentation: https://api-docs-v2.pendle.finance/

const PENDLE_API_BASE = import.meta.env.VITE_PENDLE_API_BASE || 'https://api-v2.pendle.finance/core';
const MARKET_ADDRESS = import.meta.env.VITE_PENDLE_MARKET_ADDRESS || '0xc374f7ec85f8c7de3207a10bb1978ba104bda3b2'; // PT-weETH-26DEC2024
const CHAIN_ID = import.meta.env.VITE_PENDLE_CHAIN_ID || '1';

export interface PendleMarket {
  address: string;
  name: string;
  symbol: string;
  underlyingAsset: {
    symbol: string;
    address: string;
  };
  pt: {
    address: string;
    symbol: string;
    price: number;
  };
  yt: {
    address: string;
    symbol: string;
  };
  expiry: string;
  impliedApy: number;
  liquidity: {
    usd: number;
  };
  volume: {
    usd24h: number;
  };
  isActive: boolean;
}

export interface MarketData {
  id: string;
  name: string;
  underlying: string;
  expiry: Date;
  currentRate: number;
  impliedAPY: number;
  tvl: number;
  volume24h: number;
  status: 'active' | 'expiring' | 'expired';
  daysToExpiry: number;
}

export async function fetchPendleMarket(): Promise<MarketData | null> {
  const endpoints = [
    `${PENDLE_API_BASE}/v2/markets/${MARKET_ADDRESS}?chainId=${CHAIN_ID}`,
    `${PENDLE_API_BASE}/markets/${MARKET_ADDRESS}?chainId=${CHAIN_ID}`,
    `${PENDLE_API_BASE}/v2/markets?chainId=${CHAIN_ID}`,
    `${PENDLE_API_BASE}/markets?chainId=${CHAIN_ID}`
  ];

  for (let i = 0; i < endpoints.length; i++) {
    try {
      const response = await fetch(endpoints[i]);
      
      if (!response.ok) {
        console.debug(`Endpoint ${i + 1} failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      // For list endpoints (3rd and 4th), filter for our market
      if (i >= 2) {
        const markets = Array.isArray(data) ? data : data.results || data.markets || [];
        const market = markets.find((m: any) => 
          m.address?.toLowerCase() === MARKET_ADDRESS.toLowerCase() ||
          m.pt?.address?.toLowerCase() === MARKET_ADDRESS.toLowerCase()
        );
        
        if (!market) {
          console.debug(`Market not found in list from endpoint ${i + 1}`);
          continue;
        }
        
        console.debug('Successfully fetched market data from list endpoint');
        return convertToMarketData(market);
      } else {
        // Direct market endpoint
        console.debug('Successfully fetched market data from direct endpoint');
        return convertToMarketData(data);
      }
    } catch (error) {
      console.debug(`Endpoint ${i + 1} error:`, error);
      continue;
    }
  }

  console.error('All Pendle API endpoints failed');
  return null;
}

function convertToMarketData(market: any): MarketData | null {
  try {
    // Convert to our internal format
    const expiry = new Date(market.expiry);
    const now = new Date();
    const daysToExpiry = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysToExpiry === 0) {
      status = 'expired';
    } else if (daysToExpiry <= 7) {
      status = 'expiring';
    }

    return {
      id: market.address || MARKET_ADDRESS,
      name: market.name || market.symbol || 'PT Market',
      underlying: market.underlyingAsset?.symbol || market.underlying?.symbol || 'ETH',
      expiry,
      currentRate: market.pt?.price || market.price || 0,
      impliedAPY: (market.impliedApy || market.apy || 0) * 100, // Convert to percentage
      tvl: market.liquidity?.usd || market.tvl || 0,
      volume24h: market.volume?.usd24h || market.volume24h || 0,
      status,
      daysToExpiry,
    };
  } catch (error) {
    console.error('Failed to convert market data:', error);
    return null;
  }
}

export async function fetchMarketHistory(days: number = 30): Promise<Array<{ date: string; apy: number; price: number }>> {
  try {
    // This would fetch historical data - for now return empty array
    // The Pendle API may have historical endpoints we can use
    return [];
  } catch (error) {
    console.error('Failed to fetch market history:', error);
    return [];
  }
}