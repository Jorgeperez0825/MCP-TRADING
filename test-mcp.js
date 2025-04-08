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

// Test function
async function runTest() {
  try {
    console.log('Connecting to MCP server...');
    await client.connect();
    console.log('Connected to MCP server');
    
    // List available tools
    console.log('\nListing tools:');
    const { tools } = await client.listTools();
    console.log(`Found ${tools.length} tools`);
    
    // Test search_symbol tool
    console.log('\nTesting search_symbol:');
    const searchResult = await client.callTool('search_symbol', { keywords: 'Apple' });
    console.log('Search result:', searchResult);
    
    // Test get_intraday_data tool
    console.log('\nTesting get_intraday_data:');
    const intradayResult = await client.callTool('get_intraday_data', { symbol: 'AAPL', interval: '15min' });
    console.log('Intraday data result:', intradayResult);
    
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