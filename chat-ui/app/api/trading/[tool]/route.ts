import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// This API route handles trading requests to the MCP server
export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string } }
) {
  try {
    const { tool } = params;
    const body = await request.json();

    // Validate that the tool is legitimate
    const validTools = [
      'search_symbol',
      'get_quote',
      'get_intraday_data',
      'get_daily_data',
      'get_sma',
      'get_rsi',
      'get_macd',
      'get_bbands',
      'get_adx',
      'get_company_overview',
      'get_income_statement',
      'get_news_sentiment',
      'get_top_gainers_losers'
    ];

    if (!validTools.includes(tool)) {
      return NextResponse.json(
        { error: 'Invalid tool requested' },
        { status: 400 }
      );
    }

    // Prepare args string based on the body parameters
    let argsString = '';
    for (const [key, value] of Object.entries(body)) {
      argsString += `\`${key}\`: \`${value}\`, `;
    }
    argsString = argsString.slice(0, -2); // Remove trailing comma and space
    
    // If argsString is empty (for tools with no parameters)
    if (!argsString) {
      argsString = '{}';
    }

    // Create a command to execute the trading MCP client
    const command = `cd /Users/jorgeperez/mcp-trading && node test-client.js ${tool} '${argsString}'`;
    
    // Execute the command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('Listing tools')) {
      console.error(`Error from MCP server: ${stderr}`);
      return NextResponse.json(
        { error: 'Error executing MCP command' },
        { status: 500 }
      );
    }

    try {
      // Parse the output as JSON
      const result = JSON.parse(stdout);
      return NextResponse.json(result);
    } catch (parseError) {
      // If parsing fails, return the raw output
      return NextResponse.json({ data: stdout });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 