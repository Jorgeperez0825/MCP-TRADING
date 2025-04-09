import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the MCP server
const serverPath = path.join(__dirname, 'mcp-server.js');

// Spawn the MCP server process
const serverProcess = spawn('node', [serverPath], {
  env: {
    ...process.env,
    ALPHA_VANTAGE_API_KEY: 'A0Y25M1WODQRWJR4'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// Create client transport connected to the server
const transport = new StdioClientTransport(
  serverProcess.stdin,
  serverProcess.stdout
);

// Create MCP client
const client = new Client(transport);

// Log server stderr for debugging
serverProcess.stderr.on('data', (data) => {
  console.log(`Server log: ${data.toString()}`);
});

// Mock the backtick format that Claude is sending
const mockBacktickFormat = (toolName, args) => {
  const argsString = Object.entries(args)
    .map(([key, value]) => `\`${key}\`: \`${value}\``)
    .join(', ');
  
  return { name: toolName, arguments: `{${argsString}}` };
};

// Test function
async function runTest() {
  try {
    console.log('Connecting to MCP server...');
    await client.connect();
    console.log('Connected to MCP server');
    
    // List available tools
    console.log('\nListing tools:');
    const { tools } = await client.listTools();
    console.log(`Found ${tools.length} tools: ${tools.map(t => t.name).join(', ')}`);
    
    // Test search_symbol with backtick format
    console.log('\n--- Testing search_symbol with backticks ---');
    const searchRequest = mockBacktickFormat('search_symbol', { keywords: 'Apple' });
    console.log(`Sending request: ${JSON.stringify(searchRequest)}`);
    
    const searchResult = await client.request('call_tool', searchRequest);
    console.log('Search result:', searchResult);
    
    // Test get_quote with backtick format
    console.log('\n--- Testing get_quote with backticks ---');
    const quoteRequest = mockBacktickFormat('get_quote', { symbol: 'AAPL' });
    console.log(`Sending request: ${JSON.stringify(quoteRequest)}`);
    
    const quoteResult = await client.request('call_tool', quoteRequest);
    console.log('Quote result:', quoteResult);
    
    // Test get_intraday_data with backtick format
    console.log('\n--- Testing get_intraday_data with backticks ---');
    const intradayRequest = mockBacktickFormat('get_intraday_data', { 
      symbol: 'AAPL', 
      interval: '15min' 
    });
    console.log(`Sending request: ${JSON.stringify(intradayRequest)}`);
    
    const intradayResult = await client.request('call_tool', intradayRequest);
    console.log('Intraday result:', intradayResult);
    
    // Test get_sma with backtick format
    console.log('\n--- Testing get_sma with backticks ---');
    const smaRequest = mockBacktickFormat('get_sma', { 
      symbol: 'MSFT', 
      interval: 'daily',
      time_period: '20',
      series_type: 'close'
    });
    console.log(`Sending request: ${JSON.stringify(smaRequest)}`);
    
    const smaResult = await client.request('call_tool', smaRequest);
    console.log('SMA result:', smaResult);
    
    console.log('\nTests completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Terminate the server process
    serverProcess.kill();
    process.exit(0);
  }
}

// Run the test
runTest(); 