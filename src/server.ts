import { Server } from '@modelcontextprotocol/sdk';
import { StdioServerTransport } from '@modelcontextprotocol/server-memory';
import axios from 'axios';
import dotenv from 'dotenv';

// Obtener API key del archivo .env
dotenv.config();
const API_KEY = process.env.SPORTSDATA_API_KEY;

// Validar que tenemos la API key
if (!API_KEY) {
  console.error("Error: SPORTSDATA_API_KEY no está definida en el archivo .env");
  process.exit(1);
}

// Configurar cliente Axios para SportsData.io
const sportsDataClient = axios.create({
  baseURL: 'https://api.sportsdata.io/v3/mlb',
  headers: {
    'Ocp-Apim-Subscription-Key': API_KEY
  }
});

// Crear servidor MCP
const server = new Server({
  name: "sportsdata-mlb-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {
      descriptions: {
        get_teams: {
          description: "Get all MLB teams",
          parameters: {
            type: "object",
            properties: {}
          }
        },
        get_games_by_date: {
          description: "Get MLB games by date (format: YYYY-MMM-DD, e.g. 2025-MAR-15)",
          parameters: {
            type: "object",
            properties: {
              date: {
                type: "string",
                description: "The date to get games for in YYYY-MMM-DD format"
              }
            },
            required: ["date"]
          }
        },
        get_player_stats: {
          description: "Get MLB player stats by season and player ID",
          parameters: {
            type: "object",
            properties: {
              season: {
                type: "string",
                description: "The season year (e.g., 2025)"
              },
              playerId: {
                type: "string",
                description: "The ID of the player to get stats for"
              }
            },
            required: ["season", "playerId"]
          }
        }
      }
    }
  }
});

// Manejar solicitudes de herramientas
server.setRequestHandler({
  method: "tools/call",
  params: {
    type: "object",
    properties: {
      name: { type: "string" },
      parameters: { type: "object" }
    },
    required: ["name"]
  }
}, async (request) => {
  const { name, parameters } = request.params;
  
  console.log(`Ejecutando herramienta: ${name} con parámetros:`, parameters);
  
  try {
    switch (name) {
      case "get_teams": {
        const response = await sportsDataClient.get('/scores/json/teams');
        console.log(`Respuesta recibida: ${response.status}`);
        return { 
          toolResult: {
            teams: response.data
          }
        };
      }
      case "get_games_by_date": {
        const response = await sportsDataClient.get(`/scores/json/GamesByDate/${parameters.date}`);
        console.log(`Respuesta recibida: ${response.status}`);
        return { 
          toolResult: {
            games: response.data
          }
        };
      }
      case "get_player_stats": {
        const response = await sportsDataClient.get(`/stats/json/PlayerSeasonStatsByPlayer/${parameters.season}/${parameters.playerId}`);
        console.log(`Respuesta recibida: ${response.status}`);
        return { 
          toolResult: {
            playerStats: response.data
          }
        };
      }
      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    console.error(`Error llamando a herramienta ${name}:`, error);
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${error.message || "Error desconocido"}` 
      }],
      isError: true
    };
  }
});

// Conectar transporte
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);

console.log("SportsData MLB MCP Server ejecutándose..."); 