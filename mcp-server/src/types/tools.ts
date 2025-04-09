export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface TechnicalIndicator {
  symbol: string;
  value: number;
  signal: string;
  timestamp: string;
}

export interface NewsSentiment {
  symbol: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  articles: Array<{
    title: string;
    url: string;
    sentiment: string;
    timestamp: string;
  }>;
}

export interface ToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ToolConfig {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
} 