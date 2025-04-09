import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getStochastic(
  symbol: string,
  interval: string = 'daily',
  fastk_period: number = 5,
  slowk_period: number = 3,
  slowd_period: number = 3
) {
  try {
    const url = `${SERVER_CONFIG.alphaVantageBaseUrl}`;
    const params = {
      function: 'STOCH',
      symbol: symbol,
      interval: interval,
      fastk_period: fastk_period,
      slowk_period: slowk_period,
      slowd_period: slowd_period,
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_stoch`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval, fastk_period, slowk_period, slowd_period })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_stoch`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_stoch`);
      return { error: response.data['Error Message'] };
    }

    // Extract Stochastic data from response
    const stochData = response.data['Technical Analysis: STOCH'];
    const latestDate = Object.keys(stochData)[0];
    const latestStoch = stochData[latestDate];

    const result = {
      symbol: symbol,
      date: latestDate,
      slowk: parseFloat(latestStoch['SlowK']),
      slowd: parseFloat(latestStoch['SlowD']),
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_stoch`);
    return { data: result };
  } catch (error) {
    console.error('Error in getStochastic:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in Stochastic calculation' };
  }
} 