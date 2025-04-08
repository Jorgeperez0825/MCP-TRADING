# Trading Assistant Chat UI

A simple, secure, and modern chat interface for interacting with the Alpha Vantage trading API through the MCP server.

## Features

- Clean and intuitive user interface
- Integration with the Alpha Vantage trading API
- Support for stock quotes, company information, and market data
- Secure API access without exposing sensitive information

## Setup

1. Make sure the MCP server is running:
   ```
   cd /Users/jorgeperez/mcp-trading/mcp-trading-new && node mcp-server.js
   ```

2. Install dependencies:
   ```
   cd chat-ui
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

- Type your questions about stocks, market data, or trading information
- Ask for specific stock quotes by mentioning stock symbols (e.g., "What's the current price of AAPL?")
- Request market information (e.g., "Show me today's top gainers and losers")

## Security Considerations

- API keys are never exposed to the client side
- All API requests are processed through secure server routes
- Input is validated and sanitized to prevent injection attacks

## Development

- Built with Next.js 15 and TypeScript
- Uses clean, modern UI design with responsive layout
- Follows secure coding practices and maintains English UI throughout

## License

MIT
