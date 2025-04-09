#!/bin/bash

# Start the MCP server
cd mcp-trading-new
npm run dev &

# Wait for the server to start
sleep 5

# Start the client
cd ../chat-ui
npm run dev 