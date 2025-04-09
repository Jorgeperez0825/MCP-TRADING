import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testEndpoint() {
  try {
    console.error('Iniciando cliente MCP...');
    const transport = new StdioClientTransport();
    const client = new Client(transport);
    
    console.error('Conectando al servidor...');
    await client.connect();
    
    console.error('Probando endpoint get_player_season_stats...');
    const result = await client.callTool('get_player_season_stats', {});
    console.error('Resultado:', JSON.stringify(result, null, 2));
    
    await client.disconnect();
  } catch (error) {
    console.error('Error:', error);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testEndpoint(); 