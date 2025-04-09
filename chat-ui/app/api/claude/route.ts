import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// API endpoint to handle Claude API calls
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Get the API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    console.log("ANTHROPIC_API_KEY exists:", !!apiKey);
    if (apiKey) {
      // Solo mostramos los primeros caracteres por seguridad
      console.log("ANTHROPIC_API_KEY prefix:", apiKey.substring(0, 10) + "...");
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
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
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
    console.error(JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 