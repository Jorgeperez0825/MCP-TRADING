import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'A0Y25M1WODQRWJR4';
const API_BASE_URL = 'https://www.alphavantage.co/query';

// Create MCP Server
const server = new Server(
  { name: "alpha-vantage-trading", version: "1.0.0" },
  { capabilities: { tools: { descriptions: {} } } }
);

// Define the available tools
const tools = [
  {
    name: "search_symbol",
    description: "Search for a symbol by keywords",
    inputSchema: {
      type: "object",
      properties: {
        keywords: {
          type: "string",
          description: "Keywords to search for (e.g., Microsoft, Tesla)"
        }
      },
      required: ["keywords"]
    }
  },
  {
    name: "get_quote",
    description: "Get global quote for a security",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_intraday_data",
    description: "Get intraday time series stock data (OHLCV)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval between data points (1min, 5min, 15min, 30min, 60min)"
        }
      },
      required: ["symbol", "interval"]
    }
  },
  {
    name: "get_daily_data",
    description: "Get daily time series stock data (OHLCV)",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_sma",
    description: "Get Simple Moving Average (SMA) technical indicator",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)"
        },
        time_period: {
          type: "integer",
          description: "Number of data points to calculate SMA (e.g., 20)"
        },
        series_type: {
          type: "string",
          description: "Price type to use (close, open, high, low)"
        }
      },
      required: ["symbol", "interval", "time_period", "series_type"]
    }
  },
  {
    name: "get_rsi",
    description: "Get Relative Strength Index (RSI) technical indicator",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval (daily, weekly, monthly)"
        },
        time_period: {
          type: "integer",
          description: "Number of data points to calculate RSI (e.g., 14)"
        },
        series_type: {
          type: "string",
          description: "Price type to use (close, open, high, low)"
        }
      },
      required: ["symbol", "interval", "time_period", "series_type"]
    }
  },
  {
    name: "get_macd",
    description: "Get Moving Average Convergence/Divergence (MACD) values",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)"
        },
        series_type: {
          type: "string",
          description: "Price type to use (close, open, high, low)"
        },
        fastperiod: {
          type: "integer",
          description: "Fast period"
        },
        slowperiod: {
          type: "integer",
          description: "Slow period"
        },
        signalperiod: {
          type: "integer",
          description: "Signal period"
        }
      },
      required: ["symbol", "interval", "series_type"]
    }
  },
  {
    name: "get_bbands",
    description: "Get Bollinger Bands (BBANDS) values",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)"
        },
        time_period: {
          type: "integer",
          description: "Number of data points to calculate Bollinger Bands (e.g., 20)"
        },
        series_type: {
          type: "string",
          description: "Price type to use (close, open, high, low)"
        },
        nbdevup: {
          type: "integer",
          description: "Standard deviation multiplier for upper band"
        },
        nbdevdn: {
          type: "integer",
          description: "Standard deviation multiplier for lower band"
        }
      },
      required: ["symbol", "interval", "time_period", "series_type"]
    }
  },
  {
    name: "get_adx",
    description: "Get Average Directional Movement Index (ADX) values",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        },
        interval: {
          type: "string",
          description: "Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)"
        },
        time_period: {
          type: "integer",
          description: "Number of data points to calculate ADX (e.g., 14)"
        }
      },
      required: ["symbol", "interval", "time_period"]
    }
  },
  {
    name: "get_company_overview",
    description: "Get company overview with fundamental data",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_income_statement",
    description: "Get company income statement",
    inputSchema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "The symbol of the stock (e.g., IBM, AAPL)"
        }
      },
      required: ["symbol"]
    }
  },
  {
    name: "get_news_sentiment",
    description: "Get news sentiment for a specific ticker or tickers",
    inputSchema: {
      type: "object",
      properties: {
        tickers: {
          type: "string",
          description: "Stock symbols separated by commas (e.g., IBM,AAPL,MSFT)"
        },
        topics: {
          type: "string",
          description: "Optional topics to filter news by"
        },
        time_from: {
          type: "string",
          description: "Optional start time (YYYYMMDDTHHMM format)"
        },
        time_to: {
          type: "string",
          description: "Optional end time (YYYYMMDDTHHMM format)"
        },
        sort: {
          type: "string",
          description: "Optional sort order (LATEST, EARLIEST, RELEVANCE)"
        },
        limit: {
          type: "integer",
          description: "Optional limit on number of results (1-1000)"
        }
      },
      required: ["tickers"]
    }
  },
  {
    name: "get_top_gainers_losers",
    description: "Get top gainers, losers, and most actively traded US stocks",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Listing tools");
  return { tools };
});

// Helper function to parse arguments with backticks
function parseBacktickArguments(args) {
  console.error(`Raw arguments: ${JSON.stringify(args)}`);
  
  // If args is already an object, return it
  if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
    return args;
  }
  
  // If args is a string, try to parse it
  if (typeof args === 'string') {
    // Try to handle the backtick format: `key`: `value`
    try {
      // Replace backticks with double quotes for JSON parsing
      const normalizedArgs = args.replace(/`([^`]+)`\s*:\s*`([^`]+)`/g, '"$1":"$2"');
      console.error(`Normalized arguments: ${normalizedArgs}`);
      return JSON.parse(normalizedArgs);
    } catch (e) {
      console.error(`Error parsing arguments: ${e.message}`);
      
      // Try to extract values using regex patterns for specific tools
      const keywordsMatch = args.match(/`keywords`\s*:\s*`([^`]+)`/);
      if (keywordsMatch) {
        console.error(`Extracted keywords: ${keywordsMatch[1]}`);
        return { keywords: keywordsMatch[1] };
      }
      
      const tickersMatch = args.match(/`tickers`\s*:\s*`([^`]+)`/);
      if (tickersMatch) {
        const result = { tickers: tickersMatch[1] };
        
        // Try to extract optional news_sentiment parameters
        const topicsMatch = args.match(/`topics`\s*:\s*`([^`]+)`/);
        if (topicsMatch) {
          result.topics = topicsMatch[1];
        }
        
        const timeFromMatch = args.match(/`time_from`\s*:\s*`([^`]+)`/);
        if (timeFromMatch) {
          result.time_from = timeFromMatch[1];
        }
        
        const timeToMatch = args.match(/`time_to`\s*:\s*`([^`]+)`/);
        if (timeToMatch) {
          result.time_to = timeToMatch[1];
        }
        
        const sortMatch = args.match(/`sort`\s*:\s*`([^`]+)`/);
        if (sortMatch) {
          result.sort = sortMatch[1];
        }
        
        const limitMatch = args.match(/`limit`\s*:\s*`([^`]+)`/);
        if (limitMatch) {
          result.limit = parseInt(limitMatch[1], 10);
        }
        
        console.error(`Extracted news parameters: ${JSON.stringify(result)}`);
        return result;
      }
      
      const symbolMatch = args.match(/`symbol`\s*:\s*`([^`]+)`/);
      if (symbolMatch) {
        const result = { symbol: symbolMatch[1] };
        
        // Try to extract interval if present
        const intervalMatch = args.match(/`interval`\s*:\s*`([^`]+)`/);
        if (intervalMatch) {
          result.interval = intervalMatch[1];
        }
        
        // Try to extract time_period if present
        const timePeriodMatch = args.match(/`time_period`\s*:\s*`([^`]+)`/);
        if (timePeriodMatch) {
          result.time_period = parseInt(timePeriodMatch[1], 10);
        }
        
        // Try to extract series_type if present
        const seriesTypeMatch = args.match(/`series_type`\s*:\s*`([^`]+)`/);
        if (seriesTypeMatch) {
          result.series_type = seriesTypeMatch[1];
        }
        
        // Extract MACD specific parameters
        const fastPeriodMatch = args.match(/`fastperiod`\s*:\s*`([^`]+)`/);
        if (fastPeriodMatch) {
          result.fastperiod = parseInt(fastPeriodMatch[1], 10);
        }
        
        const slowPeriodMatch = args.match(/`slowperiod`\s*:\s*`([^`]+)`/);
        if (slowPeriodMatch) {
          result.slowperiod = parseInt(slowPeriodMatch[1], 10);
        }
        
        const signalPeriodMatch = args.match(/`signalperiod`\s*:\s*`([^`]+)`/);
        if (signalPeriodMatch) {
          result.signalperiod = parseInt(signalPeriodMatch[1], 10);
        }
        
        // Extract Bollinger Bands specific parameters
        const nbdevupMatch = args.match(/`nbdevup`\s*:\s*`([^`]+)`/);
        if (nbdevupMatch) {
          result.nbdevup = parseInt(nbdevupMatch[1], 10);
        }
        
        const nbdevdnMatch = args.match(/`nbdevdn`\s*:\s*`([^`]+)`/);
        if (nbdevdnMatch) {
          result.nbdevdn = parseInt(nbdevdnMatch[1], 10);
        }
        
        console.error(`Extracted parameters: ${JSON.stringify(result)}`);
        return result;
      }
    }
  }
  
  console.error("Could not parse arguments, returning empty object");
  return {};
}

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    console.error(`Received tool call: ${request.params.name}`);
    console.error(`Raw arguments: ${JSON.stringify(request.params.arguments)}`);
    
    const { name } = request.params;
    const parsedArgs = parseBacktickArguments(request.params.arguments);
    
    console.error(`Parsed arguments: ${JSON.stringify(parsedArgs)}`);
    
    let apiParams = {};
    let response;
    
    switch (name) {
      case 'search_symbol':
        apiParams = {
          function: 'SYMBOL_SEARCH',
          keywords: parsedArgs.keywords,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_intraday_data':
        apiParams = {
          function: 'TIME_SERIES_INTRADAY',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval || '5min',
          adjusted: 'true',
          outputsize: 'compact',
          datatype: 'json',
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_daily_data':
        apiParams = {
          function: 'TIME_SERIES_DAILY',
          symbol: parsedArgs.symbol,
          outputsize: 'compact',
          datatype: 'json',
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_quote':
        apiParams = {
          function: 'GLOBAL_QUOTE',
          symbol: parsedArgs.symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_sma':
        apiParams = {
          function: 'SMA',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval,
          time_period: parsedArgs.time_period,
          series_type: parsedArgs.series_type,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_rsi':
        apiParams = {
          function: 'RSI',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval,
          time_period: parsedArgs.time_period,
          series_type: parsedArgs.series_type,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_macd':
        apiParams = {
          function: 'MACD',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval,
          series_type: parsedArgs.series_type,
          fastperiod: parsedArgs.fastperiod,
          slowperiod: parsedArgs.slowperiod,
          signalperiod: parsedArgs.signalperiod,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_bbands':
        apiParams = {
          function: 'BBANDS',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval,
          time_period: parsedArgs.time_period,
          series_type: parsedArgs.series_type,
          nbdevup: parsedArgs.nbdevup,
          nbdevdn: parsedArgs.nbdevdn,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_adx':
        apiParams = {
          function: 'ADX',
          symbol: parsedArgs.symbol,
          interval: parsedArgs.interval,
          time_period: parsedArgs.time_period,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_company_overview':
        apiParams = {
          function: 'OVERVIEW',
          symbol: parsedArgs.symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_income_statement':
        apiParams = {
          function: 'INCOME_STATEMENT',
          symbol: parsedArgs.symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_news_sentiment':
        apiParams = {
          function: 'NEWS_SENTIMENT',
          tickers: parsedArgs.tickers,
          topics: parsedArgs.topics,
          time_from: parsedArgs.time_from,
          time_to: parsedArgs.time_to,
          sort: parsedArgs.sort,
          limit: parsedArgs.limit,
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      case 'get_top_gainers_losers':
        apiParams = {
          function: 'TOP_GAINERS_LOSERS',
          apikey: ALPHA_VANTAGE_API_KEY
        };
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    // Construct the full URL for debugging
    const queryParams = new URLSearchParams(apiParams);
    const fullUrl = `${API_BASE_URL}?${queryParams.toString()}`;
    console.error(`Full API URL: ${fullUrl}`);
    
    try {
      console.error(`Making API request to: ${fullUrl}`);
      response = await axios.get(API_BASE_URL, { params: apiParams });
      console.error(`API Response status: ${response.status}`);
      
      // Return the response data as text
      return { 
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2) 
        }] 
      };
    } catch (apiError) {
      console.error(`API error: ${apiError.message}`);
      
      // Check if the error is related to URL construction
      if (apiError.code === 'ERR_INVALID_URL') {
        console.error(`Invalid URL error detected: ${fullUrl}`);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Invalid URL error for ${name}`,
              url: fullUrl,
              message: apiError.message,
              hint: "Check the API base URL and parameters"
            }, null, 2)
          }]
        };
      }
      
      // Handle other API errors
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Error in ${name} API call`,
            details: {
              message: apiError.message,
              response: apiError.response?.data,
              status: apiError.response?.status
            }
          }, null, 2)
        }]
      };
    }
  } catch (error) {
    console.error(`Error handling tool call: ${error.message}`);
    console.error(error.stack);
    
    // Provide detailed error information
    const errorDetails = {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null,
      request: error.request ? "Request was made but no response was received" : null,
      stack: error.stack
    };
    
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify({
          error: "Failed to execute tool",
          details: errorDetails
        }, null, 2)
      }] 
    };
  }
});

// Start the server
console.error("Alpha Vantage Trading MCP Server starting...");
console.error(`API Base URL: ${API_BASE_URL}`);
console.error(`API Key provided: ${ALPHA_VANTAGE_API_KEY ? 'Yes' : 'No'}`);
console.error(`API Key length: ${ALPHA_VANTAGE_API_KEY?.length || 0}`);
console.error(`Available tools: ${tools.map(t => t.name).join(', ')}`);
console.error("Connecting to MCP transport...");

const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => console.error("MCP Server connected successfully"))
  .catch(e => console.error(`Connection error: ${e.message}`)); 