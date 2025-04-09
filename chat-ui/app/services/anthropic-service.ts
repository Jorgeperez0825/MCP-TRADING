import axios from 'axios';

export class AnthropicService {
  private static instance: AnthropicService;
  private baseUrl: string;
  private model: string;

  private constructor() {
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-sonnet-20240229';
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  /**
   * Generate a response from Claude using given prompt
   */
  async generateResponse(prompt: string): Promise<{
    response: string;
    toolCalls: any[];
  }> {
    console.log("Calling Claude API with prompt:", prompt.substring(0, 100) + "...");
    
    try {
      // Call our API endpoint that interfaces with Claude
      const response = await axios.post('/api/claude', {
        prompt
      });
      
      if (!response.data) {
        throw new Error('No response data');
      }
      
      return {
        response: response.data.response || '',
        toolCalls: []
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Return mock response for testing purposes or in case of error
      if (process.env.NODE_ENV === 'development') {
        return this.getMockResponse(prompt);
      }
      
      throw error;
    }
  }

  /**
   * Generate a mock response for testing
   */
  private getMockResponse(prompt: string): { response: string; toolCalls: any[] } {
    // Check if prompt is about stocks
    if (prompt.toLowerCase().includes('stock') || prompt.toLowerCase().includes('market')) {
      return {
        response: "I'd be happy to help with market analysis. To provide specific information about stocks, I would need data from financial APIs. For now, I can offer general information and answer questions about financial concepts.",
        toolCalls: []
      };
    }
    
    // Default response
    return {
      response: "I'm a financial advisor that can help you analyze stocks and markets. What would you like to know?",
      toolCalls: []
    };
  }
} 