import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execPromise = promisify(exec);

// MCP server is running on port 3000
const MCP_SERVER_URL = 'http://localhost:3000/tools';

// This API route handles calls to specific MCP tools
export async function POST(
  request: NextRequest,
  { params }: { params: { toolName: string } }
) {
  try {
    // Ensure we have the toolName
    const toolName = params.toolName;
    if (!toolName) {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log(`Tool called: ${toolName} with params:`, body);

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

    if (!validTools.includes(toolName)) {
      return NextResponse.json(
        { error: 'Invalid tool requested' },
        { status: 400 }
      );
    }

    // Map parameters from Claude format to MCP server format
    let mappedParams = { ...body };
    
    // Snake case to camel case conversions for all known parameters
    const paramMappings: Record<string, string> = {
      'time_period': 'timePeriod',
      'series_type': 'seriesType',
      'fast_period': 'fastPeriod',
      'slow_period': 'slowPeriod',
      'signal_period': 'signalPeriod',
      'interval': 'interval',
      'output_size': 'outputSize'
    };
    
    // Convert all parameters that need mapping
    Object.entries(paramMappings).forEach(([snakeCase, camelCase]) => {
      if (body[snakeCase] !== undefined && body[camelCase] === undefined) {
        mappedParams[camelCase] = body[snakeCase];
        delete mappedParams[snakeCase];
      }
    });

    // Try direct HTTP request to MCP server first
    try {
      console.log(`Calling MCP server directly via HTTP to execute tool: ${toolName}`);
      
      const response = await axios.post(MCP_SERVER_URL, {
        name: toolName,
        arguments: mappedParams
      }, {
        timeout: 7000 // 7 second timeout
      });
      
      console.log(`MCP server response for ${toolName}:`, response.data);
      return NextResponse.json(response.data);
    } catch (error: any) {
      console.error(`Error calling MCP server via HTTP:`, error.message);
      
      // If cannot connect to server via HTTP, try Node.js child process execution
      console.log('Trying command line execution as backup...');
      
      try {
        // Create a command to execute the trading CLI
        const command = `cd /Users/jorgeperez/mcp-trading/mcp-trading-new && node -e "
          const axios = require('axios');
          
          (async () => {
            try {
              const response = await axios.post('http://localhost:3000/tools', {
                name: '${toolName}',
                arguments: ${JSON.stringify(mappedParams)}
              });
              
              console.log(JSON.stringify(response.data));
            } catch (error) {
              console.error(error.message);
              process.exit(1);
            }
          })();
        "`;
        
        // Execute the command with a 10-second timeout
        const { stdout, stderr } = await execPromise(command, { timeout: 10000 });
        
        if (stderr) {
          console.error(`Command execution error: ${stderr}`);
          return NextResponse.json(
            { error: `Failed to execute tool ${toolName}. Error: ${stderr}` },
            { status: 500 }
          );
        }
        
        // Try to parse the output as JSON
        try {
          const outputStart = stdout.indexOf('{');
          if (outputStart >= 0) {
            const jsonPart = stdout.substring(outputStart);
            const result = JSON.parse(jsonPart);
            return NextResponse.json(result);
          } else {
            throw new Error("No JSON found in output");
          }
        } catch (parseError) {
          console.error('Error parsing server response:', parseError);
          
          // If we can't parse the JSON, return the raw output
          return NextResponse.json(
            { 
              error: `Failed to parse server response for ${toolName}`,
              data: stdout 
            },
            { status: 500 }
          );
        }
      } catch (execError: any) {
        console.error('Error executing command:', execError);
        return NextResponse.json(
          { 
            error: `Command execution failed: ${execError.message}`,
            details: "Please ensure the MCP server is running correctly."
          },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 