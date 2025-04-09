import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Configuración básica
const SERVER_URL = 'http://localhost:3001/tools';

// Crear servidor MCP
const server = new Server(
  { name: "alpha-vantage-trading-proxy", version: "1.0.0" },
  { capabilities: { tools: { descriptions: {} } } }
);

// Obtener herramientas directamente del servidor de Alpha Vantage
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    console.error("Proxy: Obteniendo lista de herramientas");
    
    // Las herramientas están definidas directamente aquí para evitar una solicitud HTTP adicional
    return {
      tools: [
        // Stock Data APIs
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
        }
      ]
    };
  } catch (error) {
    console.error("Error al obtener lista de herramientas:", error);
    return { tools: [] };
  }
});

// Gestionar las llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    console.error("Proxy recibió solicitud:", JSON.stringify(request));
    
    const { name, arguments: args } = request.params;
    console.error(`Proxy: Llamando a ${name} con argumentos:`, JSON.stringify(args));
    
    // Procesar los argumentos para asegurar que sean un objeto válido
    let processedArgs;
    
    if (typeof args === 'string') {
      try {
        // Intentar analizar los argumentos si son una cadena
        processedArgs = JSON.parse(args);
      } catch (e) {
        // Manejar el caso de backticks (`keywords`: `value`)
        if (args.includes('`')) {
          try {
            const argsStr = args.replace(/`/g, '"');
            processedArgs = JSON.parse(argsStr);
          } catch (e2) {
            console.error("Error procesando argumentos con backticks:", e2);
            processedArgs = {}; // Objeto vacío por defecto
          }
        } else {
          // Si no podemos analizar la cadena, usar un objeto con el valor como clave principal
          processedArgs = {};
        }
      }
    } else if (args && typeof args === 'object') {
      // Usar los argumentos tal cual si ya son un objeto
      processedArgs = args;
    } else {
      // Objeto vacío por defecto
      processedArgs = {};
    }
    
    // Para search_symbol y get_quote, intentar extraer argumentos de manera especial
    if (name === "search_symbol") {
      if (typeof args === 'string' && args.includes('keywords')) {
        const match = args.match(/`keywords`\s*:\s*`([^`]+)`/);
        if (match && match[1]) {
          console.error("Extrayendo keywords manualmente:", match[1]);
          processedArgs = { keywords: match[1] };
        }
      }
    } else if (name === "get_quote" || name === "get_daily_data" || name === "get_intraday_data") {
      if (typeof args === 'string' && args.includes('symbol')) {
        const match = args.match(/`symbol`\s*:\s*`([^`]+)`/);
        if (match && match[1]) {
          console.error("Extrayendo symbol manualmente:", match[1]);
          processedArgs = { 
            symbol: match[1],
            ...(name === "get_intraday_data" && args.includes('interval') ? 
              { interval: args.match(/`interval`\s*:\s*`([^`]+)`/)?.[1] || "5min" } : {})
          };
        }
      }
    }
    
    console.error("Argumentos procesados:", JSON.stringify(processedArgs));
    
    // Enviar la solicitud al servidor HTTP
    const response = await axios.post(SERVER_URL, {
      name,
      arguments: processedArgs
    });
    
    console.error(`Proxy: Respuesta recibida para ${name}`);
    return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
  } catch (error) {
    console.error("Error en el proxy:", error);
    return { 
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          error: "Error in proxy", 
          message: error.message,
          details: error.response?.data || "No additional details available"
        }, null, 2) 
      }] 
    };
  }
});

// Iniciar el servidor
console.error("Alpha Vantage Trading MCP Proxy iniciado");
const transport = new StdioServerTransport();
server.connect(transport).catch(e => console.error("Error de conexión:", e)); 