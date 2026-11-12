export type AssetClass = 'stocks' | 'crypto' | 'forex' | 'indices' | 'commodities' | 'bonds';

export type Timeframe = '1D' | '5D' | '1M' | '3M' | '1Y' | '5Y' | 'ALL';

export type TechnicalSignal = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketItem {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high24h: number;
  low24h: number;
  volume: number;
  volumeFormatted: string;
  marketCap?: number;
  marketCapFormatted?: string;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  week52High: number;
  week52Low: number;
  sector?: string;
  country: string;
  exchange: string;
  currency: string;
  sparkline: number[];
  signal: TechnicalSignal;
  oscillators: {
    buy: number;
    neutral: number;
    sell: number;
    rsi: number;
    macd: string;
  };
  movingAverages: {
    buy: number;
    neutral: number;
    sell: number;
    sma20: number;
    sma50: number;
    sma200: number;
  };
  description: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  country: string;
  countryCode: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual: string;
  forecast: string;
  previous: string;
  unit?: string;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  timeAgo: string;
  symbols: string[];
  category: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
  url?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered?: boolean;
}

export interface PaperPosition {
  symbol: string;
  shares: number;
  avgPrice: number;
  type: 'buy' | 'sell';
}
