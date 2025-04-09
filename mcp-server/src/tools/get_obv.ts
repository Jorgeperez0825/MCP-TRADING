import axios from 'axios';
import { SERVER_CONFIG } from '../config/server';

export async function getOBV(
  symbol: string,
  interval: string = 'daily'
) {
  try {
    const url = `${SERVER_CONFIG.alphaVantageBaseUrl}`;
    const params = {
      function: 'OBV',
      symbol: symbol,
      interval: interval,
      apikey: SERVER_CONFIG.alphaVantageApiKey
    };

    console.log(`🔧 TOOL CALL: get_obv`);
    console.log(`📝 Arguments: ${JSON.stringify({ symbol, interval })}`);
    const startTime = new Date().toISOString();
    console.log(`⏱️  Start time: ${startTime}`);

    const response = await axios.get(url, { params });
    const endTime = new Date().toISOString();
    console.log(`✅ Tool execution completed: get_obv`);
    console.log(`⏱️  End time: ${endTime}`);

    if (response.data['Error Message']) {
      console.log(`📊 Result summary: ${JSON.stringify(response.data)}`);
      console.log(`🔍 Tool call complete: get_obv`);
      return { error: response.data['Error Message'] };
    }

    // Extract OBV data from response
    const obvData = response.data['Technical Analysis: OBV'];
    const latestDate = Object.keys(obvData)[0];
    const latestOBV = obvData[latestDate];

    const result = {
      symbol: symbol,
      date: latestDate,
      obv: parseFloat(latestOBV['OBV']),
      raw: response.data
    };

    console.log(`📊 Result summary: ${JSON.stringify(result)}`);
    console.log(`🔍 Tool call complete: get_obv`);
    return { data: result };
  } catch (error) {
    console.error('Error in getOBV:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error in OBV calculation' };
  }
} 