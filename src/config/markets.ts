// Pendle Markets supported by OVFL
export const PENDLE_MARKETS = [
  '0xc374f7ec85f8c7de3207a10bb1978ba104bda3b2', // Original market
  '0x34280882267ffa6383b363e278b027be083bbe3b'  // New market
] as const

export type PendleMarketAddress = typeof PENDLE_MARKETS[number]