import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SERVER_URL = 'http://localhost:3001/tools';

// Function to test an endpoint
async function testEndpoint(name, args) {
  console.log(`\n----- Testing ${name} -----`);
  
  try {
    const response = await axios.post(SERVER_URL, {
      name,
      arguments: args
    });
    
    console.log('Status: SUCCESS');
    
    // For brevity, show limited data for larger responses
    if (response.data.timeSeries) {
      const entries = Object.entries(response.data.timeSeries);
      console.log(`Data sample (${entries.length} entries total):`);
      console.log(JSON.stringify(Object.fromEntries(entries.slice(0, 2)), null, 2));
    } else if (response.data.technicalAnalysis) {
      const entries = Object.entries(response.data.technicalAnalysis);
      console.log(`Data sample (${entries.length} entries total):`);
      console.log(JSON.stringify(Object.fromEntries(entries.slice(0, 2)), null, 2));
    } else if (Array.isArray(response.data)) {
      console.log(`Data sample (${response.data.length} entries total):`);
      console.log(JSON.stringify(response.data.slice(0, 2), null, 2));
    } else {
      console.log('Data sample:');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
    return true;
  } catch (error) {
    console.error('Status: FAILED');
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

// Run tests for all endpoints
async function runAllTests() {
  console.log('====== TESTING ALPHA VANTAGE API ENDPOINTS ======\n');
  
  const results = {};
  
  // Stock Data APIs
  results.intraday = await testEndpoint('get_intraday_data', {
    symbol: 'MSFT',
    interval: '5min'
  });
  
  results.daily = await testEndpoint('get_daily_data', {
    symbol: 'AAPL',
    outputsize: 'compact'
  });
  
  results.weekly = await testEndpoint('get_weekly_data', {
    symbol: 'GOOGL'
  });
  
  results.monthly = await testEndpoint('get_monthly_data', {
    symbol: 'AMZN'
  });
  
  results.quote = await testEndpoint('get_quote', {
    symbol: 'TSLA'
  });
  
  results.search = await testEndpoint('search_symbol', {
    keywords: 'Apple'
  });
  
  // Technical Indicators
  results.sma = await testEndpoint('get_sma', {
    symbol: 'IBM',
    interval: 'daily',
    time_period: 20,
    series_type: 'close'
  });
  
  results.ema = await testEndpoint('get_ema', {
    symbol: 'NFLX',
    interval: 'daily',
    time_period: 20,
    series_type: 'close'
  });
  
  results.macd = await testEndpoint('get_macd', {
    symbol: 'FB',
    interval: 'daily',
    series_type: 'close'
  });
  
  results.rsi = await testEndpoint('get_rsi', {
    symbol: 'MSFT',
    interval: 'daily',
    time_period: 14,
    series_type: 'close'
  });
  
  results.bbands = await testEndpoint('get_bbands', {
    symbol: 'AMZN',
    interval: 'daily',
    time_period: 20,
    series_type: 'close'
  });
  
  // Summary of results
  console.log('\n====== TEST RESULTS SUMMARY ======');
  for (const [endpoint, success] of Object.entries(results)) {
    console.log(`${endpoint}: ${success ? 'SUCCESS ✅' : 'FAILED ❌'}`);
  }
  
  const successCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.values(results).length;
  
  console.log(`\nTotal: ${successCount}/${totalCount} endpoints working correctly`);
}

runAllTests(); 