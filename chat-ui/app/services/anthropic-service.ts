import axios from 'axios';

export class AnthropicService {
  private static instance: AnthropicService;
  private baseUrl: string;
  private model: string;
  private apiBasePath: string;

  private constructor() {
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-7-sonnet-latest';
    this.apiBasePath = '/api';
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  /**
   * Test API connectivity
   */
  async testApiConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiBasePath}/test`);
      console.log('API test response:', response.data);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  }

  /**
   * Generate a response from Claude using given prompt
   */
  async generateResponse(prompt: string): Promise<{
    response: string;
    toolCalls: any[];
  }> {
    console.log("Calling Claude API with prompt:", prompt.substring(0, 100) + "...");
    
    // Add formatting instructions to ensure plain text responses
    const promptWithFormatting = prompt + `\n\nIMPORTANT: Your response should be in plain text. Do not use markdown formatting like *, **, #, ##, or any other special characters for formatting. Use simple line breaks, dashes (-), and plain text formatting only.`;
    
    try {
      // First test if the API is reachable
      const isApiConnected = await this.testApiConnection();
      if (!isApiConnected) {
        console.warn('API connection test failed, falling back to mock response');
        return this.getMockResponse(prompt);
      }
      
      // Call our API endpoint that interfaces with Claude
      const response = await axios.post(`${this.apiBasePath}/claude`, {
        prompt: promptWithFormatting
      });
      
      console.log('API response status:', response.status);
      
      if (!response.data) {
        throw new Error('No response data');
      }
      
      return {
        response: response.data.response || '',
        toolCalls: response.data.toolCalls || []
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios error status:', error.response?.status);
        console.error('Axios error data:', error.response?.data);
      }
      
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