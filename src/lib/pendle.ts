// Pendle Backend API integration
// API Documentation: https://api-v2.pendle.finance/core/docs
// Hosted SDK: https://docs.pendle.finance/Developers/Backend/BackendAndHostedSDK

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
  // Updated endpoints based on official Pendle API documentation
  // Using correct v1 and v2 paths with chainId parameter
  const endpoints = [
    `${PENDLE_API_BASE}/v2/${CHAIN_ID}/markets/${MARKET_ADDRESS}/data`, // Latest market data endpoint
    `${PENDLE_API_BASE}/v1/${CHAIN_ID}/markets/active`, // Active markets list
    `${PENDLE_API_BASE}/v1/${CHAIN_ID}/markets/inactive`, // Inactive markets list (fallback)
  ];

  for (let i = 0; i < endpoints.length; i++) {
    try {
      const response = await fetch(endpoints[i], {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.debug(`Pendle API endpoint ${i + 1} failed with status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      // For direct market data endpoint (1st)
      if (i === 0) {
        console.debug('Successfully fetched market data from direct endpoint:', data);
        return convertToMarketData(data);
      } else {
        // For list endpoints, filter for our market
        const markets = Array.isArray(data) ? data : data.results || data.markets || [];
        const market = markets.find((m: any) => 
          m.address?.toLowerCase() === MARKET_ADDRESS.toLowerCase() ||
          m.pt?.address?.toLowerCase() === MARKET_ADDRESS.toLowerCase()
        );
        
        if (!market) {
          console.debug(`Market ${MARKET_ADDRESS} not found in list from endpoint ${i + 1}`);
          continue;
        }
        
        console.debug('Successfully fetched market data from list endpoint:', market);
        return convertToMarketData(market);
      }
    } catch (error) {
      console.debug(`Pendle API endpoint ${i + 1} error:`, error);
      continue;
    }
  }

  console.error('All Pendle API endpoints failed');
  return null;
}

function convertToMarketData(market: any): MarketData | null {
  try {
    // The API response doesn't include expiry, so we'll use a default future date
    // In a real app, you'd need to get this from the market contract or another endpoint
    const expiry = new Date('2024-12-26'); // Default to PT-weETH-26DEC2024 expiry
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
      name: market.name || market.symbol || 'PT weETH 26DEC2024',
      underlying: market.underlyingAsset?.symbol || market.underlying?.symbol || 'weETH',
      expiry,
      currentRate: market.assetPriceUsd || market.pt?.price || market.price || 0,
      impliedAPY: (market.impliedApy || market.apy || 0) * 100, // Convert to percentage
      tvl: market.liquidity?.usd || market.tvl || 0,
      volume24h: market.tradingVolume?.usd || market.volume?.usd24h || market.volume24h || 0,
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