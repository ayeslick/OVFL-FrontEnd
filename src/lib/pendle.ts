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

export async function fetchPendleMarket(marketAddress?: string): Promise<MarketData | null> {
  try {
    console.debug('🔍 Fetching Pendle Market Data...');
    
    // Use the provided market address or fall back to default
    const targetMarket = marketAddress || MARKET_ADDRESS;
    
    // Use v2 for data and v1 for metadata (like working Python script)
    const marketDataUrl = `${PENDLE_API_BASE}/v2/${CHAIN_ID}/markets/${targetMarket}/data`;
    const marketInfoUrl = `${PENDLE_API_BASE}/v1/${CHAIN_ID}/markets/${targetMarket}`;
    
    console.debug('📡 API URLs:', { marketDataUrl, marketInfoUrl });
    
    const [marketDataResponse, marketInfoResponse] = await Promise.allSettled([
      fetch(marketDataUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'OVFL-Pendle-Fetcher/1.0' },
      }),
      fetch(marketInfoUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'OVFL-Pendle-Fetcher/1.0' },
      })
    ]);

    let marketData = {};
    let marketInfo = {};

    // Process market data response
    if (marketDataResponse.status === 'fulfilled' && marketDataResponse.value.ok) {
      marketData = await marketDataResponse.value.json();
      console.debug('✅ Market data fetched successfully');
    } else {
      console.debug('⚠️ Market data fetch failed, continuing with market info only');
    }

    // Process market info response  
    if (marketInfoResponse.status === 'fulfilled' && marketInfoResponse.value.ok) {
      marketInfo = await marketInfoResponse.value.json();
      console.debug('✅ Market info fetched successfully');
    } else {
      console.debug('⚠️ Market info fetch failed, continuing with market data only');
    }

    // Combine both data sources (market info first, then market data overrides)
    const combinedData = { ...marketInfo, ...marketData };

    if (Object.keys(combinedData).length === 0) {
      console.error('❌ Both endpoints failed');
      return null;
    }

    console.debug('📊 Combined market data:', {
      hasMarketData: Object.keys(marketData).length > 0,
      hasMarketInfo: Object.keys(marketInfo).length > 0,
      combinedKeys: Object.keys(combinedData)
    });

    return convertToMarketData(combinedData, marketAddress);

  } catch (error) {
    console.error('❌ Error fetching Pendle market data:', error);
    return null;
  }
}

function convertToMarketData(market: any, marketAddress?: string): MarketData | null {
  try {
    // Handle expiry from multiple possible sources (like Python script)
    const expiryTimestamp = market.expiry || market.maturity || market.expiryTimestamp;
    let expiry = new Date('2024-12-26'); // Default fallback
    
    if (expiryTimestamp) {
      // If timestamp, convert to date
      expiry = new Date(typeof expiryTimestamp === 'number' ? expiryTimestamp * 1000 : expiryTimestamp);
    }
    
    const now = new Date();
    const daysToExpiry = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysToExpiry === 0) {
      status = 'expired';
    } else if (daysToExpiry <= 7) {
      status = 'expiring';
    }

    // Derive currentRate from ptPrice and assetPriceUsd (like Python script)
    let currentRate = 0;
    const ptPrice = market.ptPrice;
    const assetPrice = market.assetPriceUsd;
    
    if (ptPrice && assetPrice && assetPrice > 0) {
      currentRate = Math.max(0, Math.min(1, ptPrice / assetPrice));
    } else {
      // Fallback to ptDiscount calculation
      const ptDiscount = market.ptDiscount || 0;
      currentRate = Math.max(0, Math.min(1, 1 - ptDiscount));
    }

    // Get underlying symbol from multiple sources
    const underlying = market.underlyingAsset?.symbol || 
                      market.underlying?.symbol || 
                      market.sy?.symbol || 
                      'weETH';

    // Get name from multiple sources  
    const name = market.name || 
                market.symbol || 
                market.pt?.symbol || 
                'PT weETH 26DEC2024';

    const marketData = {
      id: market.address || marketAddress || MARKET_ADDRESS,
      name,
      underlying,
      expiry,
      currentRate,
      impliedAPY: (market.impliedApy || market.apy || 0) * 100, // Convert to percentage
      tvl: market.liquidity?.usd || market.tvl || 0,
      volume24h: market.tradingVolume?.usd || market.volume?.usd24h || market.volume24h || 0,
      status,
      daysToExpiry,
    };

    // Debug log for verification (like Python script)
    console.debug('📈 Market conversion complete:', {
      name: marketData.name,
      underlying: marketData.underlying,
      currentRate: marketData.currentRate,
      impliedAPY: marketData.impliedAPY,
      tvl: marketData.tvl,
      volume24h: marketData.volume24h,
      daysToExpiry: marketData.daysToExpiry,
      status: marketData.status,
      rawData: {
        ptPrice,
        assetPrice,
        expiryTimestamp,
        ptDiscount: market.ptDiscount
      }
    });

    return marketData;
  } catch (error) {
    console.error('❌ Failed to convert market data:', error);
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