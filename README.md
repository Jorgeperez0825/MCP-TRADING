# Alpha Vantage Trading API

This project provides direct HTTP API access to Alpha Vantage financial market data through a simple HTTP server. It's designed to be used with Claude or any other tool that can make HTTP requests.

## Setup

1. Install dependencies:

```bash
cd mcp-trading-new
npm install
```

2. Start the server:

```bash
node server.js
```

The server will run on port 3001 by default.

3. Configure Claude:

Place the `claude-config.json` file in your Claude configuration directory:
- macOS: `~/Library/Application Support/Claude/claude-config.json`
- Windows: `%APPDATA%\Claude\claude-config.json`

## Available Endpoints

The server provides the following HTTP endpoints:

### POST /api/search
Search for a stock symbol by keywords:
```json
{
  "keywords": "Apple"
}
```

### POST /api/quote
Get a global quote for a stock:
```json
{
  "symbol": "AAPL"
}
```

### POST /api/intraday
Get intraday time series data:
```json
{
  "symbol": "AAPL",
  "interval": "15min"
}
```

### POST /api/daily
Get daily time series data:
```json
{
  "symbol": "MSFT"
}
```

### POST /api/sma
Get Simple Moving Average (SMA) technical indicator:
```json
{
  "symbol": "IBM",
  "interval": "daily",
  "time_period": 20,
  "series_type": "close"
}
```

### POST /api/rsi
Get Relative Strength Index (RSI) technical indicator:
```json
{
  "symbol": "TSLA",
  "interval": "daily",
  "time_period": 14,
  "series_type": "close"
}
```

## Troubleshooting

If Claude still reports "Invalid URL" errors:

1. Make sure the server is running (`node server.js`)
2. Verify the correct claude-config.json is in place
3. Check that Claude has the correct permissions to make HTTP requests
4. Restart Claude after installing the configuration file

## Testing the API

You can test the API endpoints using curl:

```bash
# Test search endpoint
curl -X POST http://localhost:3001/api/search -H "Content-Type: application/json" -d '{"keywords":"Apple"}'

# Test quote endpoint
curl -X POST http://localhost:3001/api/quote -H "Content-Type: application/json" -d '{"symbol":"AAPL"}'
``` 