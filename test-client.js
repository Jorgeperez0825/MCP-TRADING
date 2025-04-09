import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SERVER_URL = 'http://localhost:3000/tools';

// Test functions
async function testSymbolSearch() {
  console.log('Testing Symbol Search...');
  
  try {
    const response = await axios.post(SERVER_URL, {
      name: 'search_symbol',
      arguments: {
        keywords: 'Microsoft'
      }
    });
    
    console.log('Results:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing symbol search:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function testDailyData() {
  console.log('\nTesting Daily Stock Data...');
  
  try {
    const response = await axios.post(SERVER_URL, {
      name: 'get_daily_data',
      arguments: {
        symbol: 'AAPL',
        outputsize: 'compact'
      }
    });
    
    console.log('Results (first few entries):');
    const timeSeriesEntries = Object.entries(response.data.timeSeries);
    console.log(JSON.stringify(Object.fromEntries(timeSeriesEntries.slice(0, 3)), null, 2));
  } catch (error) {
    console.error('Error testing daily data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function testTechnicalIndicator() {
  console.log('\nTesting RSI Technical Indicator...');
  
  try {
    const response = await axios.post(SERVER_URL, {
      name: 'get_rsi',
      arguments: {
        symbol: 'MSFT',
        interval: 'daily',
        time_period: 14,
        series_type: 'close'
      }
    });
    
    console.log('Results (first few entries):');
    const indicatorEntries = Object.entries(response.data.technicalAnalysis);
    console.log(JSON.stringify(Object.fromEntries(indicatorEntries.slice(0, 3)), null, 2));
  } catch (error) {
    console.error('Error testing RSI indicator:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests
async function runTests() {
  try {
    await testSymbolSearch();
    await testDailyData();
    await testTechnicalIndicator();
    
    console.log('\nAll tests completed.');
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

runTests(); 