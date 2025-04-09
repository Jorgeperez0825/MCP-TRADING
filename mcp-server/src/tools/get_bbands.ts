import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getBBands(
  symbol: string,
  interval: string = 'daily',
  time_period: number = 20,
  series_type: string = 'close',
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
      series_type: series_type,
      nbdevup: nbdevup,
      nbdevdn: nbdevdn,
      matype: matype,
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_bbands`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval, time_period, series_type, nbdevup, nbdevdn, matype })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_bbands`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_bbands`);
      return { error: response.data['Error Message'] };
    }

    // Extract Bollinger Bands data from response
    const bbData = response.data['Technical Analysis: BBANDS'];
    const latestDate = Object.keys(bbData)[0];
    const latestBB = bbData[latestDate];

    const result = {
      symbol: symbol,
      date: latestDate,
      upper_band: parseFloat(latestBB['Real Upper Band']),
      middle_band: parseFloat(latestBB['Real Middle Band']),
      lower_band: parseFloat(latestBB['Real Lower Band']),
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_bbands`);
    return { data: result };
  } catch (error) {
    console.error('Error in getBBands:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in Bollinger Bands calculation' };
  }
} 