# Adapting the MCP Server to Different APIs

This guide provides specific instructions for adapting this MCP server to work with different popular APIs.

## General Adaptation Process

1. **Understand the Target API**:
   - Read the API documentation thoroughly
   - Identify the key endpoints you want to expose as tools
   - Understand authentication requirements
   - Note response formats and data structures

2. **Fork or Clone This Repository**:
   ```bash
   git clone https://github.com/Jorgeperez0825/mcp-mlb.git your-new-api-project
   cd your-new-api-project
   ```

3. **Create Your Configuration**:
   - Copy `template.env` to `.env`
   - Update with your API's credentials and endpoints

## Common API Adaptations

### Weather API (Example: OpenWeatherMap)

```javascript
// Tool definitions
const tools = [
  {
    name: "get_current_weather",
    description: "Get current weather for a location",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name",
        },
      },
      required: ["city"],
    },
  },
  // Add more tools...
];

// Handler example
case "get_current_weather": {
  const response = await apiClient.get(`/weather?q=${args.city}&units=metric`);
  return {
    location: response.data.name,
    temperature: response.data.main.temp,
    conditions: response.data.weather[0].description,
    humidity: response.data.main.humidity,
    windSpeed: response.data.wind.speed,
  };
}
```

### Stock Market API (Example: Alpha Vantage)

```javascript
// Tool definitions
const tools = [
  {
    name: "get_stock_quote",
    description: "Get current stock quote",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Stock symbol (e.g., AAPL)",
        },
      },
      required: ["symbol"],
    },
  },
  // Add more tools...
];

// Handler example
case "get_stock_quote": {
  const response = await apiClient.get(`/query?function=GLOBAL_QUOTE&symbol=${args.symbol}`);
  return {
    symbol: response.data['Global Quote']['01. symbol'],
    price: parseFloat(response.data['Global Quote']['05. price']),
    change: parseFloat(response.data['Global Quote']['09. change']),
    changePercent: response.data['Global Quote']['10. change percent'],
    volume: parseInt(response.data['Global Quote']['06. volume']),
  };
}
```

### News API (Example: NewsAPI)

```javascript
// Tool definitions
const tools = [
  {
    name: "get_top_headlines",
    description: "Get top news headlines",
    parameters: {
      type: "object",
      properties: {
        country: {
          type: "string",
          description: "Country code (e.g., us, gb)",
        },
        category: {
          type: "string",
          description: "News category",
          enum: ["business", "entertainment", "health", "science", "sports", "technology"],
        },
      },
      required: ["country"],
    },
  },
  // Add more tools...
];

// Handler example
case "get_top_headlines": {
  const params = new URLSearchParams();
  params.append('country', args.country);
  if (args.category) params.append('category', args.category);
  
  const response = await apiClient.get(`/top-headlines?${params.toString()}`);
  return response.data.articles.map(article => ({
    title: article.title,
    source: article.source.name,
    author: article.author,
    description: article.description,
    url: article.url,
    publishedAt: article.publishedAt,
  }));
}
```

## Authentication Types

### API Key in Header (Most Common)

In `.env`:
```
MCP_API_KEY=your_api_key
MCP_API_KEY_HEADER=X-Api-Key
```

### API Key in Query Parameter

In `server.js`, modify the axios instance:
```javascript
const apiClient = axios.create({
  baseURL: process.env.MCP_API_BASE_URL,
  params: {
    apikey: process.env.MCP_API_KEY,
  },
});
```

### OAuth 2.0

Create a separate authentication module:
```javascript
// auth.js
const axios = require('axios');

let token = null;
let tokenExpiry = null;

async function getToken() {
  if (token && tokenExpiry > Date.now()) {
    return token;
  }
  
  const response = await axios.post('https://auth.example.com/oauth/token', {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'client_credentials',
  });
  
  token = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000);
  return token;
}

module.exports = { getToken };
```

Then in your request handler:
```javascript
const auth = require('./auth');

// Before making API requests
const token = await auth.getToken();
apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## Testing Your Integration

1. Start your server:
   ```bash
   node server.js
   ```

2. Test a tool directly:
   ```bash
   curl -X POST http://localhost:3000/tools -d '{"name":"your_tool_name","arguments":{"param1":"value1"}}'
   ```

3. Update your Claude configuration:
   ```json
   {
     "mcpServers": {
       "your-api-name": {
         "command": "node",
         "args": ["/path/to/your/server.js"],
         "env": {
           "MCP_API_KEY": "your_api_key",
           "MCP_API_BASE_URL": "https://api.example.com",
           "MCP_API_KEY_HEADER": "Authorization"
         },
         "cwd": "/path/to/your/project"
       }
     }
   }
   ```

4. Restart Claude and test the integration by asking Claude to use one of your tools.

## Helpful Tips

1. Start small with just 1-2 tools to verify your integration works
2. Add descriptive error messages for debugging
3. Implement caching for API responses to avoid hitting rate limits
4. Consider adding validation for user inputs
5. Keep the Claude tool descriptions clear and concise
6. Document your tools thoroughly 