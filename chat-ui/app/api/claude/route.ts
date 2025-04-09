import { NextRequest, NextResponse } from 'next/server';

// API endpoint to handle Claude API calls
export async function POST(request: NextRequest) {
  try {
    const { prompt, tools } = await request.json();
    
    // Get the API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }
    
    // Check if this is a financial query with market data
    const hasMarketData = 
      prompt.includes('current market data') || 
      prompt.includes('real-time data') ||
      prompt.includes('datos actuales del mercado') ||
      prompt.includes('datos reales') ||
      prompt.includes('top_gainers') || 
      prompt.includes('top_losers');
    
    // Detect the language of the user query (simple detection)
    const isSpanish = 
      prompt.includes('invertir') || 
      prompt.includes('mercado') || 
      prompt.includes('recomiendas') || 
      prompt.includes('datos') ||
      prompt.includes('acciones') ||
      prompt.includes('bolsa');
    
    // Create system prompt based on query type and language
    let systemPrompt;
    
    if (hasMarketData) {
      // System for analyzing provided market data
      systemPrompt = `You are an expert financial advisor analyzing current market data.

INSTRUCTIONS:
- Market data is already included in the user's message
- Analyze this data thoroughly to make recommendations
- Identify patterns in the top gainers and losers
- Point out opportunities based on the provided data
- Be specific about which stocks look promising and why

RESPONSE FORMAT:
1. First, briefly summarize the main market movements today
2. Next, provide 2-3 concrete recommendations based on the data
3. For each recommendation, briefly explain the reason (trend, volume, etc.)
4. Conclude with an observation about the sector or overall market

IMPORTANT: 
- ALWAYS respond in English, regardless of the language used in the question
- Be concise and direct - focus on specific data points
- ALWAYS include specific stock symbols and their exact percentages from the provided data
- If multiple data types are provided, analyze and synthesize all of them for a comprehensive response`;
    } else {
      // System for general financial queries
      systemPrompt = `You are a financial advisor specializing in markets and trading.

Provide clear, concise, and helpful responses on financial and investment topics.

When responding:
- Explain concepts simply and directly
- Avoid excessive financial jargon
- Mention risks associated with any suggestions
- Emphasize the importance of diversification
- Don't make specific stock recommendations without current data
- Be extremely concise - use bullet points when appropriate

IMPORTANT: 
- ALWAYS respond in English, regardless of the language used in the question
- If asked for specific investment recommendations for today, suggest that the user use the platform's special commands to get updated market data`;
    }

    // Construct the messages for Claude
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    // Add tool information if provided
    const apiOptions: any = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.5,
      system: systemPrompt,
      messages
    };

    if (tools && tools.length > 0) {
      apiOptions.tools = tools;
    }

    // Call the Anthropic API
    console.log('Calling Claude API with options:', {
      ...apiOptions,
      prompt: prompt.substring(0, 100) + "..."
    });
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(apiOptions)
    });

    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json(
        { error: 'Error from Claude API' },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    console.log('Claude API response received');
    
    return NextResponse.json({
      response: data.content[0].text,
      usage: data.usage
    });
  } catch (error: any) {
    console.error('Error in Claude API route:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 