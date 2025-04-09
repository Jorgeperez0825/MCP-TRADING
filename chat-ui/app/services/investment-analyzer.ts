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
Act as a professional financial advisor. Based on the following technical analysis of stocks, generate a detailed and well-founded investment recommendation for buying tomorrow:

${topRecommendations.map(rec => `
SYMBOL: ${rec.symbol}
- Current price: $${rec.analysis.price.toFixed(2)}
- Recent change: ${rec.analysis.change >= 0 ? '+' : ''}${rec.analysis.change.toFixed(2)} (${rec.analysis.changePercent.toFixed(2)}%)
- SMA (20 days): ${rec.analysis.sma.value.toFixed(2)} - Interpretation: ${rec.analysis.sma.signal}
- MACD: ${rec.analysis.macd.value.toFixed(2)} - Interpretation: ${rec.analysis.macd.signal}
- RSI (14 days): ${rec.analysis.rsi.value.toFixed(2)} - Interpretation: ${rec.analysis.rsi.signal}
- Key factors: ${rec.analysis.reasons.join(', ')}
- Total score: ${rec.score}/100
`).join('\n')}

Based on this technical analysis, develop a detailed investment recommendation explaining why these symbols might be good opportunities to buy tomorrow.

Include:
1. An introductory paragraph explaining the current market situation
2. For each symbol: analysis of why it's a good opportunity, considering all technical indicators
3. Recommended entry levels, price targets, and stop losses
4. Risk considerations and recommended investment timeframe (short, medium, or long term)
5. A concluding paragraph with your final recommendation

Format the response in a professional and easy-to-understand manner.
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