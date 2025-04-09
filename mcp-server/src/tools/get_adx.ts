import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getADX(
  symbol: string,
  interval: string = 'daily',
  time_period: number = 14
) {
  try {
    const url = `${SERVER_CONFIG.alphaVantageBaseUrl}`;
    const params = {
      function: 'ADX',
      symbol: symbol,
      interval: interval,
      time_period: time_period,
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_adx`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval, time_period })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_adx`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_adx`);
      return { error: response.data['Error Message'] };
    }

    // Extract ADX data from response
    const adxData = response.data['Technical Analysis: ADX'];
    const latestDate = Object.keys(adxData)[0];
    const latestADX = adxData[latestDate];

    const result = {
      symbol: symbol,
      date: latestDate,
      adx: parseFloat(latestADX['ADX']),
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_adx`);
    return { data: result };
  } catch (error) {
    console.error('Error in getADX:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in ADX calculation' };
  }
} 