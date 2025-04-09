import express from 'express';
import { logger } from '../utils/logger';

// Define types
export interface ToolParameter {
  type: string;
  description: string;
  [key: string]: any;
}

export interface ToolParametersSchema {
  type: string;
  properties: Record<string, ToolParameter>;
  required: readonly string[] | string[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParametersSchema;
  execute: (args: any) => Promise<any>;
}

export interface MCPServerOptions {
  port?: number;
  tools: Record<string, Tool>;
}

export class MCPServer {
  private port: number;
  private tools: Record<string, Tool>;
  private app: express.Application | null = null;
  private server: any = null;

  constructor(options: MCPServerOptions) {
    this.port = options.port || 3333;
    this.tools = options.tools || {};
    logger.info(`MCP Server initialized with ${Object.keys(this.tools).length} tools`);
  }

  public async start(): Promise<void> {
    if (!this.app) {
      logger.error('Server not mounted to an Express app');
      throw new Error('Server not mounted to an Express app');
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          logger.info(`MCP Server listening on port ${this.port}`);
          resolve();
        });
      } catch (error) {
        logger.error('Failed to start MCP Server', { error });
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err: Error) => {
          if (err) {
            logger.error('Error closing MCP Server', { error: err });
            reject(err);
          } else {
            logger.info('MCP Server stopped');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  public mount(app: express.Application, path: string = '/mcp'): void {
    this.app = app;
    
    // Register endpoint to list available tools
    app.get(`${path}/tools`, (req, res) => {
      const toolList = Object.keys(this.tools).map(key => ({
        name: this.tools[key].name,
        description: this.tools[key].description,
        parameters: this.tools[key].parameters
      }));
      
      res.json({
        tools: toolList
      });
    });

    // Register endpoint to execute tools
    app.post(`${path}/execute`, async (req, res) => {
      try {
        const { tool, parameters } = req.body;
        
        if (!tool || !this.tools[tool]) {
          return res.status(400).json({
            status: 'error',
            message: `Tool "${tool}" not found`
          });
        }

        const selectedTool = this.tools[tool];
        
        // Validate required parameters
        const missingParams = selectedTool.parameters.required.filter(
          param => !parameters || parameters[param] === undefined
        );
        
        if (missingParams.length > 0) {
          return res.status(400).json({
            status: 'error',
            message: `Missing required parameters: ${missingParams.join(', ')}`
          });
        }

        // Execute the tool
        const result = await selectedTool.execute(parameters);
        
        res.json({
          status: 'success',
          data: result.data || result
        });
      } catch (error) {
        logger.error('Error executing tool', { error });
        res.status(500).json({
          status: 'error',
          message: error instanceof Error ? error.message : 'Internal server error'
        });
      }
    });

    logger.info(`MCP Server mounted at ${path}`);
  }
} 