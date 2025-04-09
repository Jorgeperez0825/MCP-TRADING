import axios from 'axios';
import { MarketData, ToolResponse } from '../types/tools';
import { logger } from '../utils/logger';

export async function getQuote(args: { symbol: string }): Promise<ToolResponse<MarketData>> {
  try {
    logger.info(`Getting quote for symbol: ${args.symbol}`);
    
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: args.symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    logger.info('Alpha Vantage response:', response.data);

    const data = response.data['Global Quote'];
    
    if (!data || Object.keys(data).length === 0) {
      logger.error(`No data found for symbol ${args.symbol}`);
      return {
        success: false,
        error: `No data available for symbol ${args.symbol}`,
        timestamp: new Date().toISOString()
      };
    }

    const marketData: MarketData = {
      symbol: data['01. symbol'],
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      volume: parseInt(data['06. volume']),
      timestamp: new Date().toISOString()
    };

    logger.info(`Successfully retrieved quote for ${args.symbol}:`, marketData);

    return {
      success: true,
      data: marketData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error getting quote for ${args.symbol}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
} 