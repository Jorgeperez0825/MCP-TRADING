import { Tool } from '@modelcontextprotocol/sdk';

export const serverConfig = {
  port: process.env.PORT || 3333,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  alphaVantageBaseUrl: 'https://www.alphavantage.co/query',
  tools: {
    get_quote: {
      name: 'get_quote',
      description: 'Get real-time quote for a stock symbol',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock symbol (e.g., AAPL)'
          }
        },
        required: ['symbol']
      }
    },
    get_macd: {
      name: 'get_macd',
      description: 'Get MACD technical indicator for a stock',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Stock symbol (e.g., AAPL)'
          },
          interval: {
            type: 'string',
            description: 'Time interval between data points',
            enum: ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly']
          },
          series_type: {
            type: 'string',
            description: 'The type of price data to use',
            enum: ['close', 'open', 'high', 'low']
          }
        },
        required: ['symbol', 'interval', 'series_type']
      }
    }
  }
} as const;

export const TOOL_CONFIGS: Record<string, Tool> = {
  get_quote: {
    name: 'get_quote',
    description: 'Get real-time stock quote',
    parameters: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Stock symbol' }
      },
      required: ['symbol']
    },
    execute: async () => { throw new Error('Not implemented'); }
  },
  get_macd: {
    name: 'get_macd',
    description: 'Get MACD technical indicator',
    parameters: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Stock symbol' },
        interval: { type: 'string', description: 'Time interval' },
        series_type: { type: 'string', description: 'Price type to use' }
      },
      required: ['symbol', 'interval', 'series_type']
    },
    execute: async () => { throw new Error('Not implemented'); }
  }
}; 