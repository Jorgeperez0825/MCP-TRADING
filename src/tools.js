export const tools = [
  // Core Data Tools
  {
    name: "get_current_season",
    description: "Obtener información de la temporada actual",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_active_players",
    description: "Obtener detalles de jugadores activos",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_free_agents",
    description: "Obtener detalles de jugadores free agents",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_standings",
    description: "Obtener posiciones de la liga",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_active_teams",
    description: "Obtener información de equipos activos",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  // Fantasy Tools
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
    name: "get_player_game_stats",
    description: "Obtener estadísticas de juego por fecha",
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
    name: "get_player_season_stats",
    description: "Obtener estadísticas de temporada de jugadores",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_player_projections",
    description: "Obtener proyecciones de jugadores con lesiones",
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
    name: "get_season_projections_adp",
    description: "Obtener proyecciones de temporada con ADP",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  // Odds Tools
  {
    name: "get_games_by_date",
    description: "Obtener juegos por fecha",
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
    name: "get_pregame_odds",
    description: "Obtener cuotas pre-juego por fecha",
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
    name: "get_odds_line_movement",
    description: "Obtener movimiento de líneas pre-juego",
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
    name: "get_schedules",
    description: "Obtener calendario de juegos",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_stadiums",
    description: "Obtener información de estadios",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_team_game_stats",
    description: "Obtener estadísticas de equipo por fecha",
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
]; 
]; 