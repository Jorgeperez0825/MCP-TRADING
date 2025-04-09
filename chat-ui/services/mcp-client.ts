import axios from 'axios';

export interface ToolProgress {
  toolName: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
  result?: any;
}

export interface Tool {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export class MCPClientService {
  private baseUrl: string;
  private connected: boolean = false;
  private connectionError: string | null = null;
  private listeners: ((progress: ToolProgress) => void)[] = [];

  constructor(baseUrl: string = 'http://localhost:3333') {
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<boolean> {
    try {
      await this.healthCheck();
      this.connected = true;
      this.connectionError = null;
      return true;
    } catch (error) {
      this.connected = false;
      this.connectionError = error instanceof Error ? error.message : 'Unknown connection error';
      return false;
    }
  }

  async healthCheck(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/mcp/execute`, {
        tool: 'health_check',
        parameters: {}
      });
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Server health check failed');
      }
      console.log('Health check response:', response.data);
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Server health check failed');
    }
  }

  getConnectionError(): string | null {
    return this.connectionError;
  }

  resetConnection(): void {
    this.connected = false;
    this.connectionError = null;
  }

  addListener(listener: (progress: ToolProgress) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (progress: ToolProgress) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyProgress(progress: ToolProgress): void {
    this.listeners.forEach(listener => listener(progress));
  }

  async getAvailableTools(): Promise<Tool[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/mcp/tools`);
      return response.data.tools || [];
    } catch (error) {
      console.error('Failed to fetch available tools:', error);
      throw new Error('Failed to fetch available tools');
    }
  }

  async getQuote(symbol: string): Promise<any> {
    try {
      console.log(`Getting quote for symbol: ${symbol}`);
      const response = await axios.post(`${this.baseUrl}/mcp/execute`, {
        tool: 'get_quote',
        parameters: { symbol }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw new Error('Failed to get quote');
    }
  }

  async getSMA(symbol: string, interval: string = 'daily', time_period: number = 20): Promise<any> {
    try {
      console.log(`Getting SMA for symbol: ${symbol}, interval: ${interval}, period: ${time_period}`);
      const response = await axios.post(`${this.baseUrl}/mcp/execute`, {
        tool: 'get_sma',
        parameters: { symbol, interval, time_period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get SMA:', error);
      throw new Error('Failed to get SMA');
    }
  }

  async getMACD(symbol: string, interval: string = 'daily', series_type: string = 'close'): Promise<any> {
    try {
      console.log(`Getting MACD for symbol: ${symbol}, interval: ${interval}, series_type: ${series_type}`);
      const response = await axios.post(`${this.baseUrl}/mcp/execute`, {
        tool: 'get_macd',
        parameters: { symbol, interval, series_type }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get MACD:', error);
      throw new Error('Failed to get MACD');
    }
  }

  async getRSI(symbol: string, interval: string = 'daily', time_period: number = 14): Promise<any> {
    try {
      console.log(`Getting RSI for symbol: ${symbol}, interval: ${interval}, period: ${time_period}`);
      const response = await axios.post(`${this.baseUrl}/mcp/execute`, {
        tool: 'get_rsi',
        parameters: { symbol, interval, time_period }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get RSI:', error);
      throw new Error('Failed to get RSI');
    }
  }
}

export default new MCPClientService(); 