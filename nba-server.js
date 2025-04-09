import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const API_KEY = '67716258bb5740d5a7f4544e0712e1fd';
const BASE_URL = 'https://api.sportsdata.io/v3/nba';
const API_KEY_HEADER = 'Ocp-Apim-Subscription-Key';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

// Log de configuración
console.error('Configuración de API NBA:', {
  baseURL: BASE_URL,
  apiKeyHeader: API_KEY_HEADER,
  hasApiKey: !!API_KEY,
  apiKeyLength: API_KEY ? API_KEY.length : 0
});

// Sistema de caché simple
const cache = new Map();

function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Configurar cliente axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    [API_KEY_HEADER]: API_KEY
  }
});

// Log de configuración del cliente
console.error('Configuración del cliente NBA:', {
  baseURL: apiClient.defaults.baseURL,
  headers: apiClient.defaults.headers
});

// Función para manejar errores de la API
function handleApiError(error) {
  console.error('Error de API:', error);
  
  if (error.response) {
    switch (error.response.status) {
      case 401:
        return "Error de autenticación: API key inválida o expirada";
      case 429:
        return "Límite de tasa excedido. Por favor, espera un momento antes de intentar de nuevo";
      case 404:
        return "Recurso no encontrado";
      default:
        return `Error de API (${error.response.status}): ${error.response.statusText}`;
    }
  } else if (error.request) {
    return "No se recibió respuesta del servidor. Por favor, verifica tu conexión";
  } else {
    return `Error al configurar la solicitud: ${error.message}`;
  }
}

// Servidor MCP
const server = new Server(
  { name: "sportsdata-nba", version: "1.0.0" },
  { capabilities: { tools: { descriptions: {} } } }
);

// Definir herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_player_projections",
        description: "Obtener proyecciones de jugadores para una fecha específica",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Fecha en formato YYYY-MMM-DD (ej: 2025-MAR-15)"
            }
          },
          required: ["date"]
        }
      },
      {
        name: "get_player_season_projections",
        description: "Obtener proyecciones de temporada para todos los jugadores",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_team_season_projections",
        description: "Obtener proyecciones de temporada para jugadores de un equipo específico",
        inputSchema: {
          type: "object",
          properties: {
            team: {
              type: "string",
              description: "Código del equipo (ej: 'LAL', 'BOS')"
            }
          },
          required: ["team"]
        }
      },
      {
        name: "get_player_salaries",
        description: "Obtener salarios de jugadores para DFS",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_fantasy_points",
        description: "Obtener puntos de fantasy por fecha",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Fecha en formato YYYY-MMM-DD (ej: 2025-MAR-15)"
            }
          },
          required: ["date"]
        }
      },
      {
        name: "get_dfs_slates",
        description: "Obtener slates de DFS disponibles para una fecha específica",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Fecha en formato YYYY-MMM-DD (ej: 2025-MAR-15)"
            }
          },
          required: ["date"]
        }
      },
      {
        name: "get_player_news",
        description: "Obtener noticias y notas sobre jugadores específicos",
        inputSchema: {
          type: "object",
          properties: {
            playerId: {
              type: "string",
              description: "ID del jugador"
            }
          },
          required: ["playerId"]
        }
      },
      {
        name: "get_news_by_date",
        description: "Obtener noticias de la NBA para una fecha específica",
        inputSchema: {
          type: "object",
          properties: {
            date: {
              type: "string",
              description: "Fecha en formato YYYY-MMM-DD (ej: 2025-MAR-15)"
            }
          },
          required: ["date"]
        }
      }
    ]
  };
});

// Manejar llamadas a las herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_player_projections": {
        const cacheKey = `projections_${args.date}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo proyecciones para: ${args.date}`);
        const response = await apiClient.get(`/stats/json/ProjectedPlayerGameStats/${args.date}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_player_season_projections": {
        const cacheKey = 'season_projections';
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error('Obteniendo proyecciones de temporada');
        const response = await apiClient.get('/stats/json/ProjectedPlayerSeasonStats');
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_team_season_projections": {
        const cacheKey = `team_projections_${args.team}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo proyecciones de temporada para equipo: ${args.team}`);
        const response = await apiClient.get(`/stats/json/ProjectedPlayerSeasonStatsByTeam/${args.team}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_player_salaries": {
        const cacheKey = 'player_salaries';
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error('Obteniendo salarios de jugadores');
        const response = await apiClient.get('/stats/json/DfsSalaries');
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_fantasy_points": {
        const cacheKey = `fantasy_points_${args.date}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo puntos de fantasy para: ${args.date}`);
        const response = await apiClient.get(`/stats/json/FantasyPointsByDate/${args.date}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_dfs_slates": {
        const cacheKey = `dfs_slates_${args.date}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo slates de DFS para: ${args.date}`);
        const response = await apiClient.get(`/stats/json/DfsSlatesByDate/${args.date}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_player_news": {
        const cacheKey = `player_news_${args.playerId}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo noticias para jugador ID: ${args.playerId}`);
        const response = await apiClient.get(`/stats/json/NewsByPlayerID/${args.playerId}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      case "get_news_by_date": {
        const cacheKey = `news_${args.date}`;
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          return { content: [{ type: "text", text: JSON.stringify(cachedData, null, 2) }] };
        }

        console.error(`Obteniendo noticias para: ${args.date}`);
        const response = await apiClient.get(`/stats/json/NewsByDate/${args.date}`);
        setCachedData(cacheKey, response.data);
        return { content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    return { content: [{ type: "text", text: `Error: ${errorMessage}` }] };
  }
});

// Iniciar el servidor
console.error("Servidor MCP de SportsData.io NBA iniciado");
const transport = new StdioServerTransport();
server.connect(transport).catch(e => console.error("Error de conexión:", e)); 