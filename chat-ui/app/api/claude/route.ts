import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Método GET para comprobar que la ruta está accesible
export async function GET() {
  return NextResponse.json({ status: 'Claude API route is working' });
}

// API endpoint to handle Claude API calls
export async function POST(request: NextRequest) {
  console.log('Claude API route: POST request received');
  
  try {
    const { prompt } = await request.json();
    
    console.log('Claude API route: Received prompt:', prompt?.substring(0, 50) + '...');
    
    // Get the API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log("ANTHROPIC_API_KEY exists:", !!apiKey);
    if (apiKey) {
      // Solo mostramos los primeros caracteres por seguridad
      console.log("ANTHROPIC_API_KEY prefix:", apiKey.substring(0, 5) + "...");
    }
    
    if (!apiKey) {
      console.error('API key not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey
    });
    
    // Simplificamos al máximo - una sola llamada básica sin herramientas
    const systemPrompt = `You are an expert financial advisor who helps users analyze stocks and market data. 
Always respond briefly and clearly. If asked about specific stocks, mention that you need data to provide a complete analysis.`;

    try {
      console.log("Sending basic message to Claude without tools");
      
      // Crear la solicitud más simple posible
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20240620',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt || "How's the market doing today?"
          }
        ]
      });
      
      console.log('Claude API response received successfully');
      
      // Extraer el contenido del texto
      let textContent = '';
      
      if (response.content) {
        response.content.forEach(contentBlock => {
          if (contentBlock.type === 'text') {
            textContent += contentBlock.text;
          }
        });
      }
      
      // Devolver respuesta simplificada
      return NextResponse.json({
        response: textContent,
        toolCalls: [],
        messages: []
      });
    } catch (anthropicError) {
      console.error('Direct Anthropic API error:', anthropicError);
      
      // Mostrar el error completo para depuración
      console.error(JSON.stringify(anthropicError, null, 2));
      
      let errorMessage = 'Unknown error with Claude API';
      let statusCode = 500;
      
      if (anthropicError instanceof Error) {
        errorMessage = anthropicError.message;
        
        // Si hay detalles adicionales del error
        if ('status' in anthropicError && typeof (anthropicError as any).status === 'number') {
          statusCode = (anthropicError as any).status;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Error in Claude API route:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 