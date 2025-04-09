import axios from 'axios';
import { serverConfig } from '../config/server';
import { logger } from '../utils/logger';

export async function getSMA(args: any) {
  try {
    // Extract parameters
    const symbol = typeof args.symbol === 'object' ? args.symbol.symbol : args.symbol;
    const interval = args.interval || 'daily';
    const time_period = args.time_period || 20;
    
    logger.info(`Getting SMA for symbol: ${symbol}, interval: ${interval}, time_period: ${time_period}`);
    
    const url = `${serverConfig.alphaVantageBaseUrl}`;
    const params = {
      function: 'SMA',
      symbol,
      interval,
      time_period,
      series_type: 'close',
      apikey: serverConfig.alphaVantageApiKey
    };

    const startTime = new Date().toISOString();
    logger.info(`SMA request started at ${startTime}`);
    
    const response = await axios.get(url, { params });
    
    const endTime = new Date().toISOString();
    logger.info(`SMA request completed at ${endTime}`);

    if (response.data['Error Message']) {
      logger.error(`SMA error: ${response.data['Error Message']}`);
      return { error: response.data['Error Message'] };
    }

    // Extract SMA data from response
    const smaData = response.data['Technical Analysis: SMA'];
    if (!smaData || Object.keys(smaData).length === 0) {
      logger.error(`No SMA data found for ${symbol}`);
      return { error: `No SMA data found for ${symbol}` };
    }

    const latestDate = Object.keys(smaData)[0];
    const latestSMA = parseFloat(smaData[latestDate]['SMA']);

    // Get current price for comparison
    const quoteResponse = await axios.get(url, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: serverConfig.alphaVantageApiKey
      }
    });

    let signal = 'Neutral';
    if (quoteResponse.data['Global Quote'] && quoteResponse.data['Global Quote']['05. price']) {
      const currentPrice = parseFloat(quoteResponse.data['Global Quote']['05. price']);
      if (currentPrice > latestSMA) {
        signal = 'Bullish';
      } else if (currentPrice < latestSMA) {
        signal = 'Bearish';
      }
    }

    const result = {
      symbol,
      date: latestDate,
      value: latestSMA,
      signal
    };

    logger.info(`SMA result for ${symbol}: ${JSON.stringify(result)}`);
    return { data: result };
  } catch (error) {
    logger.error(`Error in SMA calculation: ${error}`);
    return { error: error instanceof Error ? error.message : 'Unknown error in SMA calculation' };
  }
} 