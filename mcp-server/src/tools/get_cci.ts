import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getCCI(
  symbol: string,
  interval: string = 'daily',
  time_period: number = 20
) {
  try {
    const url = `${SERVER_CONFIG.alphaVantageBaseUrl}`;
    const params = {
      function: 'CCI',
      symbol: symbol,
      interval: interval,
      time_period: time_period,
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_cci`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval, time_period })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_cci`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_cci`);
      return { error: response.data['Error Message'] };
    }

    // Extract CCI data from response
    const cciData = response.data['Technical Analysis: CCI'];
    const latestDate = Object.keys(cciData)[0];
    const latestCCI = cciData[latestDate];

    const result = {
      symbol: symbol,
      date: latestDate,
      cci: parseFloat(latestCCI['CCI']),
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_cci`);
    return { data: result };
  } catch (error) {
    console.error('Error in getCCI:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in CCI calculation' };
  }
} 