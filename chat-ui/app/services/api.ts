// API service for connecting to the Alpha Vantage Trading MCP Server

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Base URL for the API - should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<ApiResponse> => {
  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: errorText || `API error: ${response.status} ${response.statusText}`
    };
  }
  
  try {
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse response'
    };
  }
};

// Fetch available tools from the API
export const getAvailableTools = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tools`);
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to the server'
    };
  }
};

// Search for a symbol
export const searchSymbol = async (query: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to search for symbol'
    };
  }
};

// Get a quote for a symbol
export const getQuote = async (symbol: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}`);
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get quote'
    };
  }
};

// Process a chat message
export const processChatMessage = async (message: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to process message'
    };
  }
};

// Check if the API is available
export const checkApiStatus = async (): Promise<'online' | 'offline'> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }  
    });
    return response.ok ? 'online' : 'offline';
  } catch (error) {
    return 'offline';
  }
};

// Get intraday data for a symbol
export const getIntradayData = async (symbol: string, interval: string = '5min'): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/intraday?symbol=${encodeURIComponent(symbol)}&interval=${interval}`);
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get intraday data'
    };
  }
};

// Get daily data for a symbol
export const getDailyData = async (symbol: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/daily?symbol=${encodeURIComponent(symbol)}`);
    return handleResponse(response);
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get daily data'
    };
  }
}; 