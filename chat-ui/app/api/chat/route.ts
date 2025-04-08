import { NextResponse } from 'next/server';

// Placeholder for actual API integration with Alpha Vantage Trading MCP Server
async function callMcpServer(message: string) {
  try {
    // In a real implementation, this would connect to your MCP server
    // For now, we'll just echo the message with some basic functionality
    
    // Simple response generation for demo purposes
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        success: true,
        response: "Hello! I'm your trading assistant. How can I help you today?"
      };
    }
    
    if (lowerMessage.includes('quote') || lowerMessage.includes('price')) {
      const symbols = ['AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA'];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randomPrice = (100 + Math.random() * 900).toFixed(2);
      
      return {
        success: true,
        response: `The current price of ${randomSymbol} is $${randomPrice}.`
      };
    }
    
    if (lowerMessage.includes('tools') || lowerMessage.includes('help')) {
      return {
        success: true,
        response: "I can help you with: stock quotes, technical analysis, company information, market news, and more. Try asking for a specific stock's price."
      };
    }
    
    // Default response
    return {
      success: true,
      response: `I received your message: "${message}". This is a demo response. In a real implementation, this would come from the Alpha Vantage Trading MCP Server.`
    };
    
  } catch (error) {
    console.error('Error calling MCP server:', error);
    return {
      success: false,
      error: 'Failed to process your request. Please try again later.'
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const result = await callMcpServer(message);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.response 
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Unknown error' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
} 