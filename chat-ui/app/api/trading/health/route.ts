import { NextResponse } from 'next/server';

// Health check endpoint for the trading API
export async function GET() {
  try {
    // We could add actual health check logic here if needed,
    // like checking connection to MCP server
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Health check failed'
      },
      { status: 500 }
    );
  }
} 