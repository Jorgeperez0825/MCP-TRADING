import { NextResponse } from 'next/server';

// This would normally fetch from your MCP server
// For demo purposes, we're hardcoding the tools we saw in the output
const AVAILABLE_TOOLS = [
  {
    id: 'search_symbol',
    name: 'Search Symbol',
    description: 'Search for stock symbols by name or keyword',
    parameters: ['query']
  },
  {
    id: 'get_quote',
    name: 'Get Quote',
    description: 'Get current stock price and basic information',
    parameters: ['symbol']
  },
  {
    id: 'get_intraday_data',
    name: 'Get Intraday Data',
    description: 'Get intraday price data for a symbol',
    parameters: ['symbol', 'interval']
  },
  {
    id: 'get_daily_data',
    name: 'Get Daily Data',
    description: 'Get daily price data for a symbol',
    parameters: ['symbol']
  },
  {
    id: 'get_sma',
    name: 'Get SMA',
    description: 'Get Simple Moving Average for a symbol',
    parameters: ['symbol', 'period']
  },
  {
    id: 'get_rsi',
    name: 'Get RSI',
    description: 'Get Relative Strength Index for a symbol',
    parameters: ['symbol', 'period']
  },
  {
    id: 'get_macd',
    name: 'Get MACD',
    description: 'Get Moving Average Convergence Divergence for a symbol',
    parameters: ['symbol']
  },
  {
    id: 'get_bbands',
    name: 'Get Bollinger Bands',
    description: 'Get Bollinger Bands for a symbol',
    parameters: ['symbol', 'period']
  },
  {
    id: 'get_adx',
    name: 'Get ADX',
    description: 'Get Average Directional Index for a symbol',
    parameters: ['symbol', 'period']
  },
  {
    id: 'get_company_overview',
    name: 'Get Company Overview',
    description: 'Get company information and fundamentals',
    parameters: ['symbol']
  },
  {
    id: 'get_income_statement',
    name: 'Get Income Statement',
    description: 'Get income statement for a company',
    parameters: ['symbol']
  },
  {
    id: 'get_news_sentiment',
    name: 'Get News Sentiment',
    description: 'Get news and sentiment analysis for a symbol',
    parameters: ['symbol']
  },
  {
    id: 'get_top_gainers_losers',
    name: 'Get Top Gainers/Losers',
    description: 'Get top gaining and losing stocks for the day',
    parameters: []
  }
];

export async function GET() {
  return NextResponse.json({
    success: true,
    tools: AVAILABLE_TOOLS
  });
} 