declare module '@modelcontextprotocol/sdk' {
  export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    execute: (args: any) => Promise<any>;
  }

  export interface MCPServerOptions {
    port?: number;
    tools?: Record<string, Tool>;
  }

  export class MCPServer {
    constructor(options: MCPServerOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    mount(app: any, path: string): void;
  }

  export class HttpServerTransport {
    constructor(options?: any);
  }
} 