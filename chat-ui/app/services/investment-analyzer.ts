import { MCPClientService } from '../../services/mcp-client';
import { AnthropicService } from './anthropic-service';

// Define interface for investment score result
interface InvestmentScore {
  symbol: string;
  score: number;
  analysis: {
    price: number;
    change: number;
    changePercent: number;
    sma: {
      value: number;
      signal: string;
    };
    macd: {
      value: number;
      signal: string;
    };
    rsi: {
      value: number;
      signal: string;
    };
    reasons: string[];
  };
}

/**
 * Service for analyzing investment opportunities and generating recommendations
 */
export class InvestmentAnalyzer {
  private mcpClient: MCPClientService;
  
  constructor(mcpClient: MCPClientService) {
    this.mcpClient = mcpClient;
  }
  
  /**
   * Evaluates the overall investment opportunity for a stock
   */
  private evaluateInvestmentOpportunity(
    quote: any, 
    sma: any, 
    macd: any, 
    rsi: any
  ): InvestmentScore {
    let score = 0;
    const reasons: string[] = [];
    const symbol = quote?.symbol || 'Unknown';
    
    // Price check
    const price = quote?.price || 0;
    const change = quote?.change || 0;
    const changePercent = quote?.changePercent || 0;

    // Check if all data is available
    if (!price || !sma?.value || !macd?.value || !rsi?.value) {
      return {
        symbol,
        score: 0,
        analysis: {
          price,
          change,
          changePercent,
          sma: { value: sma?.value || 0, signal: 'Unknown' },
          macd: { value: macd?.value || 0, signal: 'Unknown' },
          rsi: { value: rsi?.value || 0, signal: 'Unknown' },
          reasons: ['Insufficient data for analysis']
        }
      };
    }

    // Evaluate recent price change
    if (change > 0) {
      score += 5;
      reasons.push('Price in upward trend');
    } else if (change < 0) {
      score += 3; // Could be a buying opportunity
      reasons.push('Potential buying opportunity due to recent drop');
    }
    
    // Evaluate SMA (Simple Moving Average) - trend indicator
    if (price > sma.value) {
      score += 15;
      reasons.push('Price above moving average (upward trend)');
    } else if (price < sma.value) {
      // Potential buying opportunity if other indicators are positive
      if (price * 1.10 >= sma.value) {
        score += 10;
        reasons.push('Price close to crossing moving average from below (potential buy signal)');
      }
    }
    
    // Evaluate MACD (Moving Average Convergence Divergence) - momentum indicator
    if (macd.signal === 'Bullish') {
      score += 25;
      reasons.push('MACD shows bullish momentum');
    } else if (macd.signal === 'Bearish') {
      // In bearish trend, but other indicators might show reversal potential
    }
    
    // Evaluate RSI (Relative Strength Index) - overbought/oversold indicator
    if (rsi.value <= 30) {
      score += 30;
      reasons.push('RSI indicates oversold condition (good buying opportunity)');
    } else if (rsi.value <= 40) {
      score += 15;
      reasons.push('RSI approaching oversold zone');
    } else if (rsi.value >= 70) {
      score -= 10; // Overbought - not good for buying
      reasons.push('RSI indicates overbought condition (risk of correction)');
    }
    
    return {
      symbol,
      score,
      analysis: {
        price,
        change,
        changePercent,
        sma: { value: sma.value, signal: sma.signal },
        macd: { value: macd.value, signal: macd.signal },
        rsi: { value: rsi.value, signal: rsi.signal },
        reasons
      }
    };
  }
  
  /**
   * Generate investment recommendations by analyzing multiple symbols
   */
  async generateRecommendations(symbols: string[] = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'SPY']): Promise<string> {
    try {
      const results: InvestmentScore[] = [];
      const progress: {[key: string]: string} = {};
      
      console.log(`Analyzing ${symbols.length} symbols for investment recommendations...`);
      
      // Analyze each symbol
      for (const symbol of symbols) {
        try {
          progress[symbol] = 'Analyzing...';
          console.log(`Analyzing ${symbol}...`);
          
          // Get data from MCP server
          const quote = await this.mcpClient.getQuote(symbol);
          const sma = await this.mcpClient.getSMA(symbol, 'daily', 20);
          const macd = await this.mcpClient.getMACD(symbol, 'daily', 'close');
          const rsi = await this.mcpClient.getRSI(symbol, 'daily', 14);
          
          // Evaluate investment opportunity
          const analysis = this.evaluateInvestmentOpportunity(quote, sma, macd, rsi);
          results.push(analysis);
          
          progress[symbol] = 'Completed';
          console.log(`Analysis for ${symbol} completed. Score: ${analysis.score}`);
        } catch (error) {
          console.error(`Error analyzing ${symbol}:`, error);
          progress[symbol] = 'Error';
        }
      }
      
      // Sort results by score (descending)
      const sortedResults = results.sort((a, b) => b.score - a.score);
      const topRecommendations = sortedResults.slice(0, 3);
      
      // Generate detailed analysis context for the LLM
      const analysisContext = `
Act as a professional financial advisor with expertise in technical and fundamental analysis. Based on the following real-time technical analysis of stocks, generate a comprehensive and data-driven investment recommendation:

CURRENT MARKET ANALYSIS: ${new Date().toLocaleDateString()}

${topRecommendations.map(rec => `
SYMBOL: ${rec.symbol}
TECHNICAL INDICATORS:
- Current price: $${rec.analysis.price.toFixed(2)}
- Recent change: ${rec.analysis.change >= 0 ? '+' : ''}${rec.analysis.change.toFixed(2)} (${rec.analysis.changePercent.toFixed(2)}%)
- 20-day SMA: $${rec.analysis.sma.value.toFixed(2)} - Signal: ${rec.analysis.sma.signal}
- MACD: ${rec.analysis.macd.value.toFixed(2)} - Signal: ${rec.analysis.macd.signal}
- RSI (14): ${rec.analysis.rsi.value.toFixed(2)} - Signal: ${rec.analysis.rsi.signal}
- Technical score: ${rec.score}/100
- Key factors: ${rec.analysis.reasons.join('; ')}
`).join('\n')}

Based on this real-time technical analysis, develop a detailed investment recommendation with the following structure:

1. MARKET OVERVIEW: Start with a concise assessment of the current market conditions based on the analyzed stocks.

2. STOCK ANALYSIS: For each recommended stock:
   - Company overview and sector position
   - Technical indicator interpretation (price vs SMA, MACD trends, RSI conditions)
   - Potential catalysts or risks
   - Clear buy/hold/sell recommendation

3. ENTRY STRATEGY:
   - Specific entry price points
   - Stop-loss recommendations (specific price levels)
   - Price targets (short and medium term)
   - Position sizing suggestions

4. RISK ASSESSMENT:
   - Market-specific risks
   - Stock-specific risks
   - Appropriate investment timeframe
   - Portfolio allocation considerations

5. CONCLUSION:
   - Summary of top recommendations
   - Prioritization of opportunities
   - Final investment advice

Your analysis should be data-driven, professionally formatted, and actionable. Use bullet points where appropriate for clarity. Include specific numbers and percentages rather than vague statements.
`;

      console.log('Generating recommendations with LLM...');
      // Use the LLM to generate a detailed recommendation
      const anthropicResponse = await AnthropicService.getInstance().generateResponse(analysisContext);
      const recommendation = anthropicResponse.response;
      console.log('Recommendation generated successfully');
      
      return recommendation;
    } catch (error) {
      console.error('Error generating investment recommendations:', error);
      return 'Sorry, I could not generate investment recommendations at this time. Please try again later.';
    }
  }
}

export default function createInvestmentAnalyzer(mcpClient: MCPClientService): InvestmentAnalyzer {
  return new InvestmentAnalyzer(mcpClient);
} 