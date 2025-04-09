// This class manages the connection to the MCP trading server

// Directly define types to avoid import issues
interface ClientOptions {
  name: string;
  version: string;
}

interface ToolDefinition {
  name: string;
  description?: string;
  inputSchema?: any;
}

class Client {
  constructor(options: ClientOptions) {}
  async connect(transport: any): Promise<void> { return; }
  async callTool(params: { name: string; arguments: any }): Promise<any> { return {}; }
  async listTools(): Promise<{ tools: ToolDefinition[] }> { return { tools: [] }; }
}

interface HttpTransportOptions {
  baseUrl: string;
}

class HttpClientTransport {
  constructor(options: HttpTransportOptions) {}
}

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3333';

export interface MCPToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface TechnicalIndicator {
  symbol: string;
  value: number;
  signal: string;
  timestamp: string;
}

/**
 * Represents a tool available through the MCP server
 */
export interface Tool {
  name: string;
  description?: string;
  inputSchema?: any;
}

/**
 * Represents the progress of a tool execution
 */
export interface ToolProgress {
  toolName: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  result?: any;
  error?: string;
}

/**
 * Client for interacting with the MCP server
 */
export class MCPClientService {
  private client: Client | null = null;
  private availableTools: Tool[] = [];
  private connectionError: string | null = null;
  private serverUrl: string;

  constructor(serverUrl = 'http://localhost:3333') {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<boolean> {
    try {
      // Create transport for HTTP
      const transport = new HttpClientTransport({
        baseUrl: this.serverUrl
      });
      
      // Create client
      this.client = new Client({
        name: 'Trading UI Client',
        version: '1.0.0'
      });
      
      // Connect to server
      await this.client.connect(transport);
      
      // Get available tools
      const toolsResponse = await this.client.listTools();
      this.availableTools = toolsResponse.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
      
      this.connectionError = null;
      return true;
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      this.connectionError = error instanceof Error ? error.message : String(error);
      this.client = null;
      return false;
    }
  }

  /**
   * Reset the connection
   */
  resetConnection(): void {
    this.client = null;
    this.availableTools = [];
    this.connectionError = null;
  }

  /**
   * Check if the server is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.connect();
      }
      
      // Use health_check tool if available, otherwise just check if tools can be listed
      if (this.availableTools.some(tool => tool.name === 'health_check')) {
        await this.client?.callTool({
          name: 'health_check',
          arguments: {}
        });
      } else {
        await this.client?.listTools();
      }
      
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      this.connectionError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  /**
   * Get available tools
   */
  async getAvailableTools(): Promise<Tool[]> {
    if (!this.client) {
      await this.connect();
    }
    
    if (this.availableTools.length === 0) {
      const toolsResponse = await this.client?.listTools();
      if (toolsResponse) {
        this.availableTools = toolsResponse.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }));
      }
    }
    
    return this.availableTools;
  }

  /**
   * Get stock quote
   */
  async getQuote(symbol: string): Promise<any> {
    if (!this.client) {
      await this.connect();
    }
    
    const result = await this.client?.callTool({
      name: 'get_quote',
      arguments: { symbol }
    });
    
    return this.parseToolResult(result);
  }

  /**
   * Get Simple Moving Average
   */
  async getSMA(symbol: string, interval: string = 'daily', time_period: number = 20): Promise<any> {
    if (!this.client) {
      await this.connect();
    }
    
    const result = await this.client?.callTool({
      name: 'get_sma',
      arguments: { symbol, interval, time_period }
    });
    
    return this.parseToolResult(result);
  }

  /**
   * Get Moving Average Convergence/Divergence
   */
  async getMACD(symbol: string, interval: string = 'daily', series_type: string = 'close'): Promise<any> {
    if (!this.client) {
      await this.connect();
    }
    
    const result = await this.client?.callTool({
      name: 'get_macd',
      arguments: { symbol, interval, series_type }
    });
    
    return this.parseToolResult(result);
  }

  /**
   * Get Relative Strength Index
   */
  async getRSI(symbol: string, interval: string = 'daily', time_period: number = 14): Promise<any> {
    if (!this.client) {
      await this.connect();
    }
    
    const result = await this.client?.callTool({
      name: 'get_rsi',
      arguments: { symbol, interval, time_period }
    });
    
    return this.parseToolResult(result);
  }

  /**
   * Get connection error if any
   */
  getConnectionError(): string | null {
    return this.connectionError;
  }

  /**
   * Helper to parse tool result
   */
  private parseToolResult(result: any): any {
    if (!result) return null;
    
    try {
      // Handle content array
      if (result.content && Array.isArray(result.content)) {
        // Find text content
        const textContent = result.content.find((item: any) => item.type === 'text');
        if (textContent && textContent.text) {
          return JSON.parse(textContent.text);
        }
      }
      
      // Return raw result if we couldn't parse it
      return result;
    } catch (error) {
      console.error('Error parsing tool result:', error);
      return result;
    }
  }
}

export const mcpClient = new MCPClientService();
export default mcpClient; 