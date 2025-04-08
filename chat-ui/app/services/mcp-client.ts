// This class manages the connection to the MCP trading server
export class MCPClient {
  private static instance: MCPClient;
  private isConnected: boolean = false;
  private availableTools: any[] = [];
  private connectionError: string | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  public async connect(): Promise<boolean> {
    try {
      if (this.isConnected) {
        return true;
      }

      // Reset connection error
      this.connectionError = null;
      
      // Try to connect, with retries
      while (this.retryCount < this.maxRetries) {
        try {
          console.log(`Connecting to MCP trading server (attempt ${this.retryCount + 1}/${this.maxRetries})...`);
          
          // We'll use the fetch API to call our own API endpoint that connects to the MCP server
          const response = await fetch('/api/mcp/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Process the response
          const data = await response.json();
          
          if (!response.ok || !data.connected) {
            // If there was an error in the response
            const errorMsg = data.error || 'Failed to connect to MCP server';
            const details = data.details || '';
            this.connectionError = `${errorMsg}${details ? ': ' + details : ''}`;
            throw new Error(this.connectionError);
          }
          
          // Connection successful
          this.availableTools = data.tools || [];
          this.isConnected = true;
          this.retryCount = 0; // Reset retry count on success
          
          console.log('Connected to MCP server. Available tools:', this.availableTools);
          return true;
        } catch (error) {
          console.error(`Connection attempt ${this.retryCount + 1} failed:`, error);
          this.retryCount++;
          
          if (this.retryCount < this.maxRetries) {
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, this.retryCount), 10000);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
      
      // If we get here, all retries failed
      this.isConnected = false;
      if (!this.connectionError) {
        this.connectionError = `Failed to connect to MCP server after ${this.maxRetries} attempts`;
      }
      
      console.error(this.connectionError);
      return false;
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      this.isConnected = false;
      this.connectionError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  public async callTool(toolName: string, parameters: any): Promise<any> {
    try {
      // Try to connect if not already connected
      if (!this.isConnected) {
        const connected = await this.connect();
        if (!connected) {
          throw new Error(this.connectionError || 'Not connected to MCP server');
        }
      }

      // Call the tool through our API endpoint
      console.log(`Calling MCP tool: ${toolName} with parameters:`, parameters);
      
      const response = await fetch(`/api/mcp/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Failed to call tool: ${toolName}`;
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log(`MCP tool ${toolName} response:`, result);
      return result;
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName}:`, error);
      throw error;
    }
  }

  public getAvailableTools(): any[] {
    return this.availableTools;
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
  
  public getConnectionError(): string | null {
    return this.connectionError;
  }
  
  public resetConnection(): void {
    this.isConnected = false;
    this.connectionError = null;
    this.retryCount = 0;
  }
}

export default MCPClient.getInstance(); 