import axios from 'axios';
import { serverConfig } from '../config/server';
import { logger } from '../utils/logger';

export async function getRSI(args: any) {
  try {
    // Extract parameters
    const symbol = typeof args.symbol === 'object' ? args.symbol.symbol : args.symbol;
    const interval = args.interval || 'daily';
    const time_period = args.time_period || 14;
    const series_type = args.series_type || 'close';
    
    logger.info(`Getting RSI for symbol: ${symbol}, interval: ${interval}, time_period: ${time_period}`);
    
    const url = `${serverConfig.alphaVantageBaseUrl}`;
    const params = {
      function: 'RSI',
      symbol,
      interval,
      time_period,
      series_type,
      apikey: serverConfig.alphaVantageApiKey
    };

    const startTime = new Date().toISOString();
    logger.info(`RSI request started at ${startTime}`);
    
    const response = await axios.get(url, { params });
    
    const endTime = new Date().toISOString();
    logger.info(`RSI request completed at ${endTime}`);

    if (response.data['Error Message']) {
      logger.error(`RSI error: ${response.data['Error Message']}`);
      return { error: response.data['Error Message'] };
    }

    // Extract RSI data from response
    const rsiData = response.data['Technical Analysis: RSI'];
    if (!rsiData || Object.keys(rsiData).length === 0) {
      logger.error(`No RSI data found for ${symbol}`);
      return { error: `No RSI data found for ${symbol}` };
    }

    const latestDate = Object.keys(rsiData)[0];
    const rsiValue = parseFloat(rsiData[latestDate]['RSI']);

    // Determine overbought/oversold condition
    let signal = 'Neutral';
    if (rsiValue >= 70) {
      signal = 'Overbought';
    } else if (rsiValue <= 30) {
      signal = 'Oversold';
    }

    const result = {
      symbol,
      date: latestDate,
      value: rsiValue,
      signal
    };

    logger.info(`RSI result for ${symbol}: ${JSON.stringify(result)}`);
    return { data: result };
  } catch (error) {
    logger.error(`Error in RSI calculation: ${error}`);
    return { error: error instanceof Error ? error.message : 'Unknown error in RSI calculation' };
  }
} 