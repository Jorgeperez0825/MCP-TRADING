#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Create the child process
const child = spawn('node', [
    join(__dirname, 'node_modules/mcp-api-connect/build/index.js'),
    'serve',
    'sportsdata-mlb'
], {
    stdio: 'inherit',
    env: {
        ...process.env,
        MCP_API_NAME: 'sportsdata-mlb',
        MCP_API_BASE_URL: 'https://api.sportsdata.io/v3/mlb',
        MCP_API_KEY: '7803d3473cad41fc9170267735a22838',
        MCP_API_KEY_HEADER: 'Ocp-Apim-Subscription-Key'
    }
});

// Handle process events
child.on('error', (err) => {
    console.error('Error starting process:', err);
});

child.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
}); 