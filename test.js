import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    name: process.env.MCP_API_NAME,
    baseUrl: process.env.MCP_API_BASE_URL,
    apiKey: process.env.MCP_API_KEY,
    apiKeyHeader: process.env.MCP_API_KEY_HEADER
};

async function testConnection() {
    try {
        const response = await fetch(`${config.baseUrl}/scores/json/teams`, {
            headers: {
                [config.apiKeyHeader]: config.apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Connection successful! Teams found:', data.length);
    } catch (error) {
        console.error('Error testing connection:', error);
    }
}

testConnection(); 