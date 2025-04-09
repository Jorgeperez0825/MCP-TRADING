import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Servidor simple
const server = new Server(
  { name: "test-server", version: "1.0.0" },
  { capabilities: { tools: { descriptions: {} } } }
);

// Log para depuración
console.error("Servidor MCP de prueba iniciado");

// Conectar transporte
const transport = new StdioServerTransport();
server.connect(transport).catch(e => console.error("Error de conexión:", e)); 