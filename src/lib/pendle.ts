// Pendle Backend API integration
// API Documentation: https://api-docs-v2.pendle.finance/

const PENDLE_API_BASE = 'https://api-v2.pendle.finance';
const MARKET_ADDRESS = '0xc374f7ec85f8c7de3207a10bb1978ba104bda3b2'; // PT-weETH-26DEC2024

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
  try {
    // Fetch market data from Pendle API
    const response = await fetch(`${PENDLE_API_BASE}/v2/markets/${MARKET_ADDRESS}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market data: ${response.status}`);
    }

    const market: PendleMarket = await response.json();
    
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
      id: market.address,
      name: market.name,
      underlying: market.underlyingAsset.symbol,
      expiry,
      currentRate: market.pt.price,
      impliedAPY: market.impliedApy * 100, // Convert to percentage
      tvl: market.liquidity.usd,
      volume24h: market.volume.usd24h,
      status,
      daysToExpiry,
    };
  } catch (error) {
    console.error('Failed to fetch Pendle market data:', error);
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