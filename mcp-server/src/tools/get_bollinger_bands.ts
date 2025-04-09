import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getBollingerBands(
  symbol: string,
  interval: string = 'daily',
  time_period: number = 20,
  nbdevup: number = 2,
  nbdevdn: number = 2,
  matype: number = 0
) {
  try {
    const url = `${SERVER_CONFIG.alphaVantageBaseUrl}`;
    const params = {
      function: 'BBANDS',
      symbol: symbol,
      interval: interval,
      time_period: time_period,
      nbdevup: nbdevup,
      nbdevdn: nbdevdn,
      matype: matype,
      series_type: 'close',
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_bollinger_bands`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval, time_period, nbdevup, nbdevdn, matype })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_bollinger_bands`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_bollinger_bands`);
      return { error: response.data['Error Message'] };
    }

    // Extract Bollinger Bands data from response
    const bbData = response.data['Technical Analysis: BBANDS'];
    const latestDate = Object.keys(bbData)[0];
    const latestBB = bbData[latestDate];

    const upperBand = parseFloat(latestBB['Real Upper Band']);
    const middleBand = parseFloat(latestBB['Real Middle Band']);
    const lowerBand = parseFloat(latestBB['Real Lower Band']);

    // Calculate bandwidth and %B
    const bandwidth = ((upperBand - lowerBand) / middleBand) * 100;
    const percentB = ((parseFloat(latestBB['Real Middle Band']) - lowerBand) / (upperBand - lowerBand)) * 100;

    // Determine signal based on price position relative to bands
    let signal = 'Neutral';
    if (percentB > 100) {
      signal = 'Overbought';
    } else if (percentB < 0) {
      signal = 'Oversold';
    }

    const result = {
      symbol: symbol,
      date: latestDate,
      upper_band: upperBand,
      middle_band: middleBand,
      lower_band: lowerBand,
      bandwidth: bandwidth,
      percent_b: percentB,
      signal_type: signal,
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_bollinger_bands`);
    return { data: result };
  } catch (error) {
    console.error('Error in getBollingerBands:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in Bollinger Bands calculation' };
  }
} 