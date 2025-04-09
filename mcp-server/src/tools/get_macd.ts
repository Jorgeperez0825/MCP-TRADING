import axios from 'axios';
import { serverConfig } from '../config/server';
import { logger } from '../utils/logger';

export async function getMACD(args: any) {
  try {
    // Extract parameters
    const symbol = typeof args.symbol === 'object' ? args.symbol.symbol : args.symbol;
    const interval = args.interval || 'daily';
    const series_type = args.series_type || 'close';
    const fastperiod = args.fastperiod || 12;
    const slowperiod = args.slowperiod || 26;
    const signalperiod = args.signalperiod || 9;
    
    logger.info(`Getting MACD for symbol: ${symbol}, interval: ${interval}, series_type: ${series_type}`);
    
    const url = `${serverConfig.alphaVantageBaseUrl}`;
    const params = {
      function: 'MACD',
      symbol,
      interval,
      series_type,
      fastperiod,
      slowperiod,
      signalperiod,
      apikey: serverConfig.alphaVantageApiKey
    };

    const startTime = new Date().toISOString();
    logger.info(`MACD request started at ${startTime}`);
    
    const response = await axios.get(url, { params });
    
    const endTime = new Date().toISOString();
    logger.info(`MACD request completed at ${endTime}`);

    if (response.data['Error Message']) {
      logger.error(`MACD error: ${response.data['Error Message']}`);
      return { error: response.data['Error Message'] };
    }

    // Extract MACD data from response
    const macdData = response.data['Technical Analysis: MACD'];
    if (!macdData || Object.keys(macdData).length === 0) {
      logger.error(`No MACD data found for ${symbol}`);
      return { error: `No MACD data found for ${symbol}` };
    }

    const latestDate = Object.keys(macdData)[0];
    const latestMACD = parseFloat(macdData[latestDate]['MACD']);
    const latestSignal = parseFloat(macdData[latestDate]['MACD_Signal']);
    const latestHistogram = parseFloat(macdData[latestDate]['MACD_Hist']);

    let signal = 'Neutral';
    if (latestMACD > latestSignal) {
      signal = 'Bullish';
    } else if (latestMACD < latestSignal) {
      signal = 'Bearish';
    }

    const result = {
      symbol,
      date: latestDate,
      value: latestMACD,
      signal_line: latestSignal,
      histogram: latestHistogram,
      signal
    };

    logger.info(`MACD result for ${symbol}: ${JSON.stringify(result)}`);
    return { data: result };
  } catch (error) {
    logger.error(`Error in MACD calculation: ${error}`);
    return { error: error instanceof Error ? error.message : 'Unknown error in MACD calculation' };
  }
} 