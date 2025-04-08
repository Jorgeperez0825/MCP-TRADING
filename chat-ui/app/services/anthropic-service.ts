// Service to handle Anthropic API calls
export class AnthropicService {
  private static instance: AnthropicService;
  private apiKey: string | undefined;

  private constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
  }

  public static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  public async generateResponse(prompt: string, tools?: any[]): Promise<string> {
    console.log("Calling Claude API with prompt:", prompt.substring(0, 100) + "...");
    
    // We'll call the API through our own API endpoint for security
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          tools
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Claude API error:", errorData);
        throw new Error(`Failed to get response from Claude: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw error;
    }
  }
}

export default AnthropicService.getInstance(); 