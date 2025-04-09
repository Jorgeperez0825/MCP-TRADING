import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { logger } from './utils/logger';
import { getQuote } from './tools/get_quote';
import { getSMA } from './tools/get_sma';
import { getMACD } from './tools/get_macd';
import { getRSI } from './tools/get_rsi';
import express from 'express';
import cors from 'cors';
import { MCPServer } from './lib/mcp-server';

// Log environment check
logger.info('Environment check:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  API_KEY_SET: !!process.env.ALPHA_VANTAGE_API_KEY
});

// Create MCP server for the SDK
const server = new McpServer({
  name: 'Financial Data Server',
  version: '1.0.0',
  description: 'Provides stock market data and technical indicators'
});

// Create express app and HTTP-based MCP server
const app = express();
const port = parseInt(process.env.PORT || '3333');

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server tools
const httpTools = {
  get_quote: {
    name: 'get_quote',
    description: 'Get real-time quote for a stock symbol',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, MSFT)'
        }
      },
      required: ['symbol']
    },
    execute: async (args) => {
      return await getQuote(args);
    }
  },
  get_sma: {
    name: 'get_sma',
    description: 'Get SMA technical indicator for a stock',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL)'
        },
        interval: {
          type: 'string',
          description: 'Time interval (daily, weekly, monthly)'
        },
        time_period: {
          type: 'number',
          description: 'Number of time periods'
        }
      },
      required: ['symbol']
    },
    execute: async (args) => {
      return await getSMA(args);
    }
  },
  get_macd: {
    name: 'get_macd',
    description: 'Get MACD technical indicator for a stock',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL)'
        },
        interval: {
          type: 'string',
          description: 'Time interval (daily, weekly, monthly)'
        },
        series_type: {
          type: 'string',
          description: 'Price type to use (close, open, high, low)'
        }
      },
      required: ['symbol']
    },
    execute: async (args) => {
      return await getMACD(args);
    }
  },
  get_rsi: {
    name: 'get_rsi',
    description: 'Get RSI technical indicator for a stock',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL)'
        },
        interval: {
          type: 'string',
          description: 'Time interval (daily, weekly, monthly)'
        },
        time_period: {
          type: 'number',
          description: 'Number of time periods'
        }
      },
      required: ['symbol']
    },
    execute: async (args) => {
      return await getRSI(args);
    }
  },
  health_check: {
    name: 'health_check',
    description: 'Check if the server is healthy',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    execute: async () => {
      return {
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};

// Mount HTTP endpoints
const httpServer = new MCPServer({ tools: httpTools });
httpServer.mount(app);

// Add health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Register SDK tools
server.tool(
  'get_quote',
  {
    symbol: z.string().describe('Stock symbol to get quote for (e.g., AAPL, MSFT)')
  },
  async ({ symbol }) => {
    try {
      logger.info(`Getting quote for ${symbol}`);
      const result = await getQuote({ symbol });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      logger.error(`Error in get_quote: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error}`
          }
        ],
        isError: true
      };
    }
  }
);

server.tool(
  'get_sma',
  {
    symbol: z.string().describe('Stock symbol to get SMA for'),
    interval: z.string().default('daily').describe('Time interval (daily, weekly, monthly)'),
    time_period: z.number().default(20).describe('Number of time periods to calculate SMA over')
  },
  async ({ symbol, interval, time_period }) => {
    try {
      logger.info(`Getting SMA for ${symbol}`);
      const result = await getSMA({ symbol, interval, time_period });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      logger.error(`Error in get_sma: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error}`
          }
        ],
        isError: true
      };
    }
  }
);

server.tool(
  'get_macd',
  {
    symbol: z.string().describe('Stock symbol to get MACD for'),
    interval: z.string().default('daily').describe('Time interval (daily, weekly, monthly)'),
    series_type: z.string().default('close').describe('Price type to use (close, open, high, low)')
  },
  async ({ symbol, interval, series_type }) => {
    try {
      logger.info(`Getting MACD for ${symbol}`);
      const result = await getMACD({ symbol, interval, series_type });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      logger.error(`Error in get_macd: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error}`
          }
        ],
        isError: true
      };
    }
  }
);

server.tool(
  'get_rsi',
  {
    symbol: z.string().describe('Stock symbol to get RSI for'),
    interval: z.string().default('daily').describe('Time interval (daily, weekly, monthly)'),
    time_period: z.number().default(14).describe('Number of time periods to calculate RSI over')
  },
  async ({ symbol, interval, time_period }) => {
    try {
      logger.info(`Getting RSI for ${symbol}`);
      const result = await getRSI({ symbol, interval, time_period });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      logger.error(`Error in get_rsi: ${error}`);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error}`
          }
        ],
        isError: true
      };
    }
  }
);

// Add a health check tool
server.tool(
  'health_check',
  {},
  async () => {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString()
          })
        }
      ]
    };
  }
);

// Start the server based on environment
async function startServer() {
  try {
    // Start HTTP server
    app.listen(port, () => {
      logger.info(`HTTP server listening on port ${port}`);
    });
    
    // For CLI usage use StdioServerTransport
    const transport = new StdioServerTransport();
    logger.info('Starting MCP server with stdio transport');
    await server.connect(transport);
  } catch (error) {
    logger.error('Error starting MCP server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 