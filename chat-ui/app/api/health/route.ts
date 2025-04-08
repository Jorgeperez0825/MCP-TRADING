import { NextResponse } from 'next/server';

export async function GET() {
  // In a real implementation, this would check if your MCP server is available
  // For the demo, we'll just return a success response
  
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mcpServer: 'online',
      database: 'online',
    }
  });
} 