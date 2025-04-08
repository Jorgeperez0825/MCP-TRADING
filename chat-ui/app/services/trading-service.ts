// This service handles the interaction with the MCP trading server
export class TradingService {
  private static instance: TradingService;
  private baseUrl: string = 'http://localhost:3000/api/trading';
  private API_KEY: string = process.env.ALPHA_VANTAGE_API_KEY || 'A0Y25M1WODQRWJR4'; // Fallback to a demo key
  
  private constructor() {}
  
  public static getInstance(): TradingService {
    if (!TradingService.instance) {
      TradingService.instance = new TradingService();
    }
    return TradingService.instance;
  }
  
  // === API METHODS ===
  
  async searchSymbol(keywords: string): Promise<any> {
    return this.callTradingAPI('search_symbol', { keywords });
  }
  
  async getQuote(symbol: string): Promise<any> {
    console.log(`Getting quote for symbol: ${symbol}`);
    try {
      // Try direct Alpha Vantage API call first
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Direct Alpha Vantage quote data:', data);
        return data;
      }
    } catch (error) {
      console.error('Direct Alpha Vantage quote error:', error);
    }
    
    // Fallback to MCP if direct call fails
    return this.callTradingAPI('get_quote', { symbol });
  }
  
  async getIntradayData(symbol: string, interval: string): Promise<any> {
    return this.callTradingAPI('get_intraday_data', { symbol, interval });
  }
  
  async getDailyData(symbol: string): Promise<any> {
    return this.callTradingAPI('get_daily_data', { symbol });
  }
  
  async getCompanyOverview(symbol: string): Promise<any> {
    return this.callTradingAPI('get_company_overview', { symbol });
  }
  
  async getTopGainersLosers(): Promise<any> {
    console.log('Getting top gainers and losers data directly from Alpha Vantage...');
    try {
      // Direct API call to Alpha Vantage
      const response = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${this.API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Alpha Vantage top gainers/losers data:', data);
        return data;
      } else {
        const errorData = await response.text();
        console.error('Alpha Vantage API error:', errorData);
        return { 
          error: true, 
          message: `Alpha Vantage API error: ${errorData}` 
        };
      }
    } catch (error) {
      console.error('Error getting top gainers/losers:', error);
      
      // Mock data as last resort
      return {
        "top_gainers": [
          {
            "ticker": "AAPL",
            "price": "$192.53",
            "change_amount": "+$4.37",
            "change_percentage": "+2.32%",
            "volume": "67823912"
          },
          {
            "ticker": "MSFT",
            "price": "$415.56",
            "change_amount": "+$3.89",
            "change_percentage": "+0.94%",
            "volume": "23561784"
          }
        ],
        "top_losers": [
          {
            "ticker": "META",
            "price": "$474.08",
            "change_amount": "-$8.63",
            "change_percentage": "-1.79%",
            "volume": "15632147"
          },
          {
            "ticker": "TSLA",
            "price": "$175.96",
            "change_amount": "-$3.22",
            "change_percentage": "-1.8%",
            "volume": "92536841"
          }
        ],
        "most_actively_traded": [
          {
            "ticker": "SPY",
            "price": "$516.78",
            "change_amount": "+$1.36",
            "change_percentage": "+0.26%",
            "volume": "62981756"
          }
        ],
        "_note": "Datos simulados debido a error en la API. Solo para demostración."
      };
    }
  }
  
  async getSMA(symbol: string, timePeriod: number = 20, seriesType: string = 'close'): Promise<any> {
    return this.callTradingAPI('get_sma', { symbol, timePeriod, seriesType });
  }
  
  async getRSI(symbol: string, timePeriod: number = 14, seriesType: string = 'close'): Promise<any> {
    return this.callTradingAPI('get_rsi', { symbol, timePeriod, seriesType });
  }
  
  async getMACD(symbol: string, fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9, seriesType: string = 'close'): Promise<any> {
    return this.callTradingAPI('get_macd', { symbol, fastPeriod, slowPeriod, signalPeriod, seriesType });
  }
  
  async getBBands(symbol: string, timePeriod: number = 20, nbdevup: number = 2, nbdevdn: number = 2, seriesType: string = 'close'): Promise<any> {
    return this.callTradingAPI('get_bbands', { symbol, timePeriod, nbdevup, nbdevdn, seriesType });
  }
  
  async getADX(symbol: string, timePeriod: number = 14): Promise<any> {
    return this.callTradingAPI('get_adx', { symbol, timePeriod });
  }
  
  async getIncomeStatement(symbol: string): Promise<any> {
    return this.callTradingAPI('get_income_statement', { symbol });
  }
  
  async getNewsSentiment(symbol: string): Promise<any> {
    return this.callTradingAPI('get_news_sentiment', { symbol });
  }
  
  private async callTradingAPI(toolName: string, params: any): Promise<any> {
    console.log(`Calling trading API: ${toolName} with params:`, params);
    try {
      // First try with direct access to MCP server API
      try {
        const mcpResponse = await fetch(`http://localhost:3000/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: toolName,
            arguments: params
          }),
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        
        if (mcpResponse.ok) {
          const data = await mcpResponse.json();
          console.log(`MCP response for ${toolName}:`, data);
          return data;
        }
      } catch (directError) {
        console.warn(`Direct MCP server connection error: ${directError}`);
        // Continue to fallback method
      }
      
      // Fallback to our API routes
      const response = await fetch(`${this.baseUrl}/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status}${errorData.error ? ` - ${errorData.error}` : ''}`);
      }
      
      const data = await response.json();
      console.log(`API response for ${toolName}:`, data);
      
      // Check if the response is an API error
      if (data.Information && data.Information.includes('API rate limit') || data.error) {
        const errorMessage = data.error || data.Information || 'Unknown API error';
        console.error(`Alpha Vantage API error: ${errorMessage}`);
        return {
          error: true,
          message: errorMessage
        };
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error calling trading API (${toolName}):`, error);
      
      return {
        error: true,
        message: `Failed to get ${toolName} data: ${error.message || 'Unknown error'}`
      };
    }
  }
}

export default TradingService.getInstance(); 