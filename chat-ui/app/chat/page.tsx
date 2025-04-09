'use client';

import { useState, FormEvent, useEffect, useRef, useMemo } from 'react';
import { MCPClientService, ToolProgress, Tool } from '../../services/mcp-client';
import LoadingAnimation from '../components/LoadingAnimation';
import ToolsModal from '../components/ToolsModal';
import AnalysisStepper from '../components/AnalysisStepper';
import createInvestmentAnalyzer from '../services/investment-analyzer';
import { AnthropicService } from '../services/anthropic-service';

interface ToolCall {
  id: string;
  name: string;
  input: any;
}

// Interfaces para los mensajes de la API de Claude
interface ClaudeContentBlock {
  type: string;
  text?: string;
  tool_use_id?: string;
  content?: string | ClaudeContentBlock[];
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'thinking';
  content: string;
  timestamp: string;
  isUser?: boolean;
  text?: string;
  toolCall?: {
    name: string;
    parameters: any;
  };
  toolResult?: any;
  isProgress?: boolean;
}

interface FaqButton {
  label: string;
  command: string;
  icon: React.ReactNode;
}

interface MarketIndex {
  symbol: string;
  name: string;
  price: string;
  change: string;
  volume: string;
}

interface AnalysisStep {
  id?: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error' | 'failed';
  toolName: string;
  description?: string;
  result?: any;
  startTime?: string;
  endTime?: string;
  data?: any;
  error?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const [mcpConnected, setMcpConnected] = useState<boolean>(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const progressListenerRef = useRef<((data: any) => void) | null>(null);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState<number>(0);
  const [latestUpdate, setLatestUpdate] = useState<string>('Initializing market analysis...');
  const mcpClient = useRef<MCPClientService>(new MCPClientService());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ClaudeMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);

  // FAQ buttons configuration instead of command buttons
  const faqButtons = [
    {
      label: "Which stocks are worth buying today?",
      command: "investment_advice",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
    },
    {
      label: "What's today's market overview?",
      command: "market_overview",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m17 11-5-5-5 5"></path>
              <path d="m17 18-5-5-5 5"></path>
            </svg>
    },
    {
      label: "Recommend top ETFs to invest in",
      command: "etf_advice",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
    },
    {
      label: "Best dividend stocks to consider",
      command: "dividend_stocks",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4"></path>
              <path d="M9 12h13"></path>
              <path d="M11 18H9a2 2 0 0 1-2-2v-4"></path>
            </svg>
    },
    {
      label: "Portfolio diversification strategies",
      command: "diversification",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
    },
    {
      label: "Analyze AAPL (Apple) stock",
      command: "full_analysis",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m8 12 3 3 5-5"></path>
            </svg>
    }
  ];

  // Add welcome message on initial load
  useEffect(() => {
    // Only add welcome message if there are no messages yet
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `👋 Welcome to Trading Agent! 

I can help you with financial market data and trading insights. Type your question or use the command chips below.`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Connect to MCP server on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
        setIsConnecting(true);
        setMcpError(null);
      console.log('Checking MCP server health...');
      
      try {
        await mcpClient.current.healthCheck();
        console.log('MCP server health check passed');
        
        // Get available tools
        const tools = await mcpClient.current.getAvailableTools();
        setAvailableTools(tools.map(tool => tool.name));
        console.log('Available MCP tools:', tools);
        
        // Set connected state
        setMcpConnected(true);
        setMcpError(null);
      } catch (err) {
        console.error('MCP server health check failed:', err);
        setMcpConnected(false);
        setMcpError('Failed to connect to MCP server. Please ensure the server is running at http://localhost:3333');
        
        // Retry after 5 seconds
        setTimeout(() => {
          if (!mcpConnected) {
            console.log('Retrying MCP server connection...');
            checkServerHealth();
          }
        }, 5000);
      } finally {
        setIsConnecting(false);
      }
    };

    checkServerHealth();
    
    // Set up interval to periodically check server health
    const healthCheckInterval = setInterval(() => {
      if (!mcpConnected && !isConnecting) {
        checkServerHealth();
      }
    }, 30000); // Check every 30 seconds if not connected
    
    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [mcpConnected, isConnecting]);

  // Function to retry MCP connection
  const retryMcpConnection = async () => {
    mcpClient.current.resetConnection();
    setError(null);
    setIsConnecting(true);
    
    try {
      const connected = await mcpClient.current.connect();
      
      if (connected) {
        console.log('Reconnected to MCP server successfully');
        const tools = await mcpClient.current.getAvailableTools();
        setAvailableTools(tools.map(tool => tool.name));
      } else {
        const error = mcpClient.current.getConnectionError();
        console.error('Failed to reconnect to MCP server:', error);
        setError(error || 'Unknown connection error');
      }
    } catch (error) {
      console.error('Error reconnecting to MCP server:', error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsConnecting(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Execute a command with improved error handling and logging
  const executeCommand = async (command: string, params: any = {}) => {
    setIsLoading(true);
    console.log(`Executing command: ${command} with params:`, params);
    
    try {
      let result;
      
      // Extract or use default symbol
      const symbol = params.symbol || 'SPY';
      
      switch (command) {
        case 'full_analysis':
          // Reset analysis steps
          setAnalysisSteps([
            {
              id: 'market_quote',
              name: 'Market Quote',
              status: 'pending',
              description: `Getting current market quote for ${symbol}`,
              toolName: 'get_quote'
            },
            {
              id: 'sma',
              name: 'Simple Moving Average',
              status: 'pending',
              description: `Calculating SMA for ${symbol}`,
              toolName: 'get_sma'
            },
            {
              id: 'macd',
              name: 'MACD Analysis',
              status: 'pending',
              description: `Calculating MACD for ${symbol}`,
              toolName: 'get_macd'
            },
            {
              id: 'rsi',
              name: 'RSI Analysis',
              status: 'pending',
              description: `Calculating RSI for ${symbol}`,
              toolName: 'get_rsi'
            }
          ]);

          try {
            // Check if MCP client is connected
            if (!mcpConnected) {
              throw new Error('MCP server is not connected. Please check connection and try again.');
            }

            // Log the start of analysis
            console.log(`Starting full analysis for ${symbol}`);
            
            // Execute quote analysis
            setAnalysisSteps(prev => prev.map(step => 
              step.id === 'market_quote' ? { ...step, status: 'active' } : step
            ));
            console.log(`Fetching quote for ${symbol}...`);
            const quoteResult = await mcpClient.current.getQuote(symbol);
            console.log('Quote result:', quoteResult);
            
            if (!quoteResult || Object.keys(quoteResult).length === 0) {
              throw new Error(`No quote data available for ${symbol}. Please check if the symbol is valid.`);
            }
            
            // Execute SMA analysis
            setAnalysisSteps(prev => prev.map(step => 
              step.id === 'sma' ? { ...step, status: 'active' } : 
              step.id === 'market_quote' ? { ...step, status: 'completed', result: quoteResult } : step
            ));
            console.log(`Calculating SMA for ${symbol}...`);
            const smaResult = await mcpClient.current.getSMA(symbol, 'daily', 20);
            console.log('SMA result:', smaResult);
            
            // Execute MACD analysis
            setAnalysisSteps(prev => prev.map(step => 
              step.id === 'macd' ? { ...step, status: 'active' } : 
              step.id === 'sma' ? { ...step, status: 'completed', result: smaResult } : step
            ));
            console.log(`Calculating MACD for ${symbol}...`);
            const macdResult = await mcpClient.current.getMACD(symbol, 'daily', 'close');
            console.log('MACD result:', macdResult);
            
            // Execute RSI analysis
            setAnalysisSteps(prev => prev.map(step => 
              step.id === 'rsi' ? { ...step, status: 'active' } : 
              step.id === 'macd' ? { ...step, status: 'completed', result: macdResult } : step
            ));
            console.log(`Calculating RSI for ${symbol}...`);
            const rsiResult = await mcpClient.current.getRSI(symbol, 'daily', 14);
            console.log('RSI result:', rsiResult);
            
            // Mark all steps as completed
            setAnalysisSteps(prev => prev.map(step => 
              step.id === 'rsi' ? { ...step, status: 'completed', result: rsiResult } : step
            ));
            
            // Format comprehensive analysis result
            let analysisMessage = `📊 Comprehensive Market Analysis for ${symbol}\n\n`;
            
            if (quoteResult) {
              analysisMessage += `💰 Current Price: $${quoteResult.price?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `📈 Change: ${quoteResult.change >= 0 ? '+' : ''}${quoteResult.change?.toFixed(2) || 'N/A'} (${quoteResult.changePercent?.toFixed(2) || 'N/A'}%)\n\n`;
            }
            
            if (smaResult) {
              analysisMessage += `📉 SMA (20-day): $${smaResult.value?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `Signal: ${smaResult.signal || 'N/A'}\n\n`;
            }
            
            if (macdResult) {
              analysisMessage += `🔄 MACD Analysis:\n`;
              analysisMessage += `MACD Line: ${macdResult.value?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `Signal Line: ${macdResult.signal_line?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `Histogram: ${macdResult.histogram?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `Signal: ${macdResult.signal || 'N/A'}\n\n`;
            }
            
            if (rsiResult) {
              analysisMessage += `📊 RSI (14-day): ${rsiResult.value?.toFixed(2) || 'N/A'}\n`;
              analysisMessage += `Signal: ${rsiResult.signal || 'N/A'}\n\n`;
            }
            
            // Add market recommendation
            analysisMessage += `🧠 Market Analysis:\n`;
            const signals = [];
            
            if (smaResult?.signal) signals.push(smaResult.signal);
            if (macdResult?.signal) signals.push(macdResult.signal);
            if (rsiResult?.signal) signals.push(rsiResult.signal);
            
            const bullCount = signals.filter(s => s?.toLowerCase().includes('bull')).length;
            const bearCount = signals.filter(s => s?.toLowerCase().includes('bear')).length;
            
            if (bullCount > bearCount) {
              analysisMessage += `Overall Trend: 🟢 Bullish (${bullCount}/${signals.length} indicators)\n`;
            } else if (bearCount > bullCount) {
              analysisMessage += `Overall Trend: 🔴 Bearish (${bearCount}/${signals.length} indicators)\n`;
      } else {
              analysisMessage += `Overall Trend: 🟡 Neutral (mixed signals)\n`;
      }
      
            result = analysisMessage;
            
    } catch (error) {
            console.error('Analysis error:', error);
            // Mark failed step and throw error
            setAnalysisSteps(prev => prev.map(step => 
              step.status === 'active' ? { ...step, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' } : step
            ));
            throw error;
          }
          break;
        
      case 'get_quote':
          console.log(`Fetching quote for ${params.symbol}...`);
          result = await mcpClient.current.getQuote(params.symbol);
          break;
        
      case 'get_sma':
          console.log(`Calculating SMA for ${params.symbol}...`);
          result = await mcpClient.current.getSMA(
          params.symbol, 
            params.interval || 'daily', 
            params.time_period || 20
          );
          break;
        
      case 'get_macd':
          console.log(`Calculating MACD for ${params.symbol}...`);
          result = await mcpClient.current.getMACD(
          params.symbol, 
            params.interval || 'daily', 
            params.series_type || 'close'
          );
          break;
        
        case 'get_rsi':
          console.log(`Calculating RSI for ${params.symbol}...`);
          result = await mcpClient.current.getRSI(
          params.symbol, 
            params.interval || 'daily', 
            params.time_period || 14
          );
          break;
        
      default:
          throw new Error(`Unknown command: ${command}`);
      }
      
      console.log(`Command ${command} completed successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format result for display
  const formatResult = (result: any): string => {
    if (!result) return "No data available";

    if (result.success === false) {
      return `Error: ${result.error}`;
    }

    if (result.data) {
      if ('price' in result.data) {
        // Quote data
        const { symbol, price, change, changePercent } = result.data;
        return `${symbol}: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)} / ${changePercent.toFixed(2)}%)`;
      }
      
      if ('value' in result.data) {
        // Technical indicator
        const { symbol, value, signal } = result.data;
        return `${symbol} - Value: ${value.toFixed(2)}, Signal: ${signal}`;
      }
    }

    // Full analysis result
    if (result.quote && result.sma && result.macd && result.rsi) {
      const quote = result.quote.data;
      const sma = result.sma.data;
      const macd = result.macd.data;
      const rsi = result.rsi.data;

      return `Market Analysis for ${quote.symbol}:
1. Current Price: $${quote.price.toFixed(2)} (${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}%)
2. SMA: ${sma.value.toFixed(2)} - ${sma.signal}
3. MACD: ${macd.value.toFixed(2)} - ${macd.signal}
4. RSI: ${rsi.value.toFixed(2)} - ${rsi.signal}`;
    }

    return JSON.stringify(result, null, 2);
  };

  // Handle FAQ button click
  const handleFaqClick = async (faqText: string, command?: string) => {
    setInput(faqText);
    
    // If command is provided, execute it directly instead of submitting form
    if (command) {
      try {
        setIsLoading(true);
        
        // Add user message to the chat
        const userMessage: Message = {
          id: Date.now().toString(),
          content: faqText,
          role: "user",
          isUser: true,
          text: faqText,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        
        // Handle investment_advice command
        if (command === 'investment_advice' || command === 'etf_advice' || command === 'dividend_stocks') {
          // Add thinking message
          setMessages(prev => [...prev, {
            id: 'thinking',
            role: 'thinking',
            content: '🔍 Analyzing current market conditions for investment opportunities...',
            timestamp: new Date().toISOString()
          }]);
          
          try {
            // Get symbols based on the type of advice requested
            let symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']; // Default tech stocks
            
            if (command === 'etf_advice') {
              symbols = ['SPY', 'QQQ', 'VTI', 'VOO', 'VGT']; // Popular ETFs
            } else if (command === 'dividend_stocks') {
              symbols = ['KO', 'JNJ', 'PG', 'XOM', 'VZ']; // Dividend stocks
            }
            
            // Get quotes for all symbols
            const analysisPromises = symbols.map(symbol => mcpClient.current.getQuote(symbol));
            const results = await Promise.all(analysisPromises);
            
            // Create investment analyzer and generate recommendations
            const investmentAnalyzer = createInvestmentAnalyzer(mcpClient.current);
            const recommendations = await investmentAnalyzer.generateRecommendations(symbols);
            
            // Remove thinking message and add result
            setMessages(prev => 
              prev.filter(msg => msg.id !== 'thinking').concat({
                id: Date.now().toString(),
                content: recommendations,
                role: "assistant",
                isUser: false,
                text: recommendations,
                timestamp: new Date().toISOString()
              })
            );
          } catch (error) {
            console.error('Error generating investment advice:', error);
            setMessages(prev => 
              prev.filter(msg => msg.id !== 'thinking').concat({
                id: Date.now().toString(),
                content: `Sorry, I couldn't generate investment recommendations at this time due to an error: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to analyze a specific stock symbol instead?`,
                role: "assistant",
                isUser: false,
                text: `Sorry, I couldn't generate investment recommendations at this time due to an error: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to analyze a specific stock symbol instead?`,
                timestamp: new Date().toISOString()
              })
            );
          }
        // Handle full_analysis command
        } else if (command === 'full_analysis') {
          // Extract symbol from text or default to AAPL
          let symbol = 'AAPL';
          const symbolMatch = faqText.match(/\b[A-Z]{2,5}\b/);
          if (symbolMatch) {
            symbol = symbolMatch[0];
          }
          
          // Add thinking message
          setMessages(prev => [...prev, {
            id: 'thinking',
            role: 'thinking',
            content: `🔍 Starting comprehensive analysis of ${symbol}...`,
            timestamp: new Date().toISOString()
          }]);
          
          try {
            const result = await executeCommand('full_analysis', { symbol });
            
            // Remove thinking message and add result
            setMessages(prev => 
              prev.filter(msg => msg.id !== 'thinking').concat({
                id: Date.now().toString(),
                content: result,
                role: "assistant",
                isUser: false,
                text: result,
                timestamp: new Date().toISOString()
              })
            );
          } catch (error) {
            console.error('Error during analysis:', error);
            setMessages(prev => 
              prev.filter(msg => msg.id !== 'thinking').concat({
                id: Date.now().toString(),
                content: `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                role: "assistant",
                isUser: false,
                text: `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date().toISOString()
              })
            );
          }
        } else {
          // Execute other commands
          const result = await executeCommand(command);
          
          // Add result to messages
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            role: "assistant",
            isUser: false,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        }
      } catch (error) {
        console.error('Error executing command from FAQ:', error);
        
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          role: "assistant",
          isUser: false,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setTimeout(() => scrollToBottom(), 100);
      }
    } else {
      // Otherwise, submit the form as usual
      handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  // Add a new function to handle tool updates around line 300, before handleSubmit
  const handleProgress = (progress: ToolProgress) => {
    setAnalysisSteps(prev => {
      const newSteps = [...prev];
      const stepIndex = newSteps.findIndex(step => step.id === progress.toolName);
      
      if (stepIndex >= 0) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status: progress.status === 'completed' ? 'completed' : 
                 progress.status === 'error' ? 'failed' : 'active',
          result: progress.result,
          endTime: progress.status === 'completed' ? new Date().toISOString() : undefined
        };
      }
      
      return newSteps;
    });
  };

  // Función para depurar errores de Claude API
  const debugClaudeAPIError = (error: any, apiRequest?: any) => {
    console.error('Error with Claude API call:', error);
    
    if (apiRequest) {
      console.log('API Request that caused the error:', {
        ...apiRequest,
        messages: apiRequest.messages?.map((msg: any) => ({
          role: msg.role,
          contentType: Array.isArray(msg.content) 
            ? msg.content.map((item: any) => item.type) 
            : typeof msg.content
        }))
      });
    }
    
    setError(`Error with Claude API: ${error.message || 'Unknown error'}`);
  };

  // Add the scrollToBottom function
  const scrollToBottom = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  // Updated handleSubmit function for proper MCP integration
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
      
    setIsLoading(true);

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      isUser: true,
      text: input,
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Only scroll after a small delay to ensure the DOM has updated
    setTimeout(() => scrollToBottom(), 100);

    try {
      // Check for stock analysis command
      const lowerInput = input.toLowerCase();

      // Check for investment advice queries
      if (lowerInput.includes('stock') && (
          lowerInput.includes('buy') || 
          lowerInput.includes('worth') || 
          lowerInput.includes('invest') || 
          lowerInput.includes('recommendation') ||
          lowerInput.includes('should i') ||
          lowerInput.includes('best') ||
          lowerInput.includes('top'))) {
        
        // Add a thinking message
        setMessages([...newMessages, { 
          id: 'thinking', 
          role: 'thinking', 
          content: `🔍 Analyzing current market conditions for investment opportunities...`, 
          timestamp: new Date().toISOString()
        }]);
        
        try {
          // Get stock symbols for popular tech stocks
          const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];
          const analysisPromises = symbols.map(symbol => mcpClient.current.getQuote(symbol));
          
          // Wait for all analyses to complete
          const results = await Promise.all(analysisPromises);
          
          // Create investment analyzer
          const investmentAnalyzer = createInvestmentAnalyzer(mcpClient.current);
          const recommendations = await investmentAnalyzer.generateRecommendations(symbols);
          
          // Remove thinking message and add result
          setMessages(prev => 
            prev.filter(msg => msg.id !== 'thinking').concat({
              id: Date.now().toString(),
              content: recommendations,
              role: "assistant",
              isUser: false,
              text: recommendations,
              timestamp: new Date().toISOString()
            })
          );
        } catch (error) {
          console.error('Error generating investment advice:', error);
          setMessages(prev => 
            prev.filter(msg => msg.id !== 'thinking').concat({
              id: Date.now().toString(),
              content: `Sorry, I couldn't generate investment recommendations at this time due to an error: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to analyze a specific stock symbol instead?`,
              role: "assistant",
              isUser: false,
              text: `Sorry, I couldn't generate investment recommendations at this time due to an error: ${error instanceof Error ? error.message : 'Unknown error'}. Would you like me to analyze a specific stock symbol instead?`,
              timestamp: new Date().toISOString()
            })
          );
        }
        setIsLoading(false);
        return;
      // Check for full analysis command
      } else if (lowerInput.includes('analyze') && lowerInput.includes('aapl') || 
          lowerInput.includes('apple') && lowerInput.includes('stock') ||
          lowerInput.includes('full_analysis')) {
        
        // Extract symbol from input or default to AAPL
        let symbol = 'AAPL';
        const symbolMatch = input.match(/\b[A-Z]{2,5}\b/);
        if (symbolMatch) {
          symbol = symbolMatch[0];
        }
        
        // Add a thinking message
        setMessages([...newMessages, { 
          id: 'thinking', 
          role: 'thinking', 
          content: `🔍 Starting comprehensive analysis of ${symbol}...`, 
          timestamp: new Date().toISOString()
        }]);
        
        try {
          const result = await executeCommand('full_analysis', { symbol });
          
          // Remove thinking message and add result
          setMessages(prev => 
            prev.filter(msg => msg.id !== 'thinking').concat({
              id: Date.now().toString(),
              content: result,
              role: "assistant",
              isUser: false,
              text: result,
              timestamp: new Date().toISOString()
            })
          );
        } catch (error) {
          console.error('Error during analysis:', error);
          setMessages(prev => 
            prev.filter(msg => msg.id !== 'thinking').concat({
              id: Date.now().toString(),
              content: `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              role: "assistant",
              isUser: false,
              text: `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              timestamp: new Date().toISOString()
            })
          );
        }
        setIsLoading(false);
        return;
      }

      // Add a loading message for non-analysis queries
      setMessages([...newMessages, { 
        id: 'loading', 
        role: 'assistant', 
        content: '...', 
        timestamp: new Date().toISOString(),
        isUser: false,
        text: '...'
      }]);
      
      // Use the AnthropicService to generate a response
      const response = await AnthropicService.getInstance().generateResponse(input);
      
      // Remove the loading message and add the actual response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.response,
        role: "assistant",
        isUser: false,
        text: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error in chat submission:', error);
      
      // Remove loading message and add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        role: "assistant",
        isUser: false,
        text: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // Function to process tool calls sequentially using MCP client
  const processToolCalls = async (toolCalls: ToolCall[], initialMessages: any[]) => {
    if (!toolCalls || toolCalls.length === 0) return;
    
    // Start with initial messages
    let currentMessages = [...initialMessages];
    
    // Process each tool call sequentially
    for (const toolCall of toolCalls) {
      try {
        setCurrentToolCall(toolCall);
        
        // Add tool call message to UI
        const toolCallMessage: Message = {
          id: Date.now().toString(),
          role: 'thinking',
          content: `📊 Getting data: ${toolCall.name} for ${toolCall.input.symbol || 'market'}...`,
          timestamp: new Date().toISOString(),
          toolCall: {
            name: toolCall.name,
            parameters: toolCall.input
          }
        };
        
        setMessages(prev => [...prev, toolCallMessage]);
        
        // Execute tool using MCP client
        let result;
        switch (toolCall.name) {
          case 'get_quote':
            result = await mcpClient.current.getQuote(toolCall.input.symbol);
            break;
          case 'get_sma':
            result = await mcpClient.current.getSMA(
              toolCall.input.symbol,
              toolCall.input.interval || 'daily',
              toolCall.input.time_period || 20
            );
            break;
          case 'get_macd':
            result = await mcpClient.current.getMACD(
              toolCall.input.symbol,
              toolCall.input.interval || 'daily',
              toolCall.input.series_type || 'close'
            );
            break;
          case 'get_rsi':
            result = await mcpClient.current.getRSI(
              toolCall.input.symbol,
              toolCall.input.interval || 'daily',
              toolCall.input.time_period || 14
            );
            break;
          default:
            throw new Error(`Unknown tool: ${toolCall.name}`);
        }
        
        // Show result in UI
        const resultMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Result for ${toolCall.name} (${toolCall.input.symbol}): ${formatToolResult(result)}`,
            timestamp: new Date().toISOString(),
          toolResult: result
        };
        
        setMessages(prev => [...prev, resultMessage]);
        
        // Convert result to string
        const stringifiedResult = typeof result === 'object' ? JSON.stringify(result) : String(result);
        
        // Get available tools
        const tools = await mcpClient.current.getAvailableTools();
        
        // Update current messages with the tool result
        const toolResultMessage = {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolCall.id,
            content: stringifiedResult
          }]
        };
        
        currentMessages = [...currentMessages, toolResultMessage];
        
        // Get next response from Claude
        const { response, toolCalls: nextToolCalls } = await AnthropicService.getInstance().generateResponse(
          '' // No new user input, just process the tool result
        );
        
        // Update conversation messages
        currentMessages = [...currentMessages, {
          role: 'assistant',
          content: response
        }];
        
        setConversationMessages(currentMessages);
        
        // If Claude is done with this round of processing
        if (!nextToolCalls || nextToolCalls.length === 0) {
          const finalResponseMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, finalResponseMessage]);
          setCurrentToolCall(null);
          return;
        }
        
        // If Claude needs more tools, continue processing
        if (nextToolCalls.length > 0) {
          // Show thinking message
          const thinkingMessage: Message = {
            id: Date.now().toString(),
            role: 'thinking',
            content: `Analyzing data and determining next steps...`,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, thinkingMessage]);
          
          // Continue with the next set of tools
          await processToolCalls(nextToolCalls, currentMessages);
          return;
        }
      } catch (error) {
        console.error('Error processing tool call:', error);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Error retrieving data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
        setCurrentToolCall(null);
      }
    }
  };

  // Format tool result for display
  const formatToolResult = (result: any): string => {
    if (!result) return 'No data available';
    
    try {
      if (typeof result === 'string') {
        try {
          // Try to parse if it's a JSON string
          result = JSON.parse(result);
        } catch {
          // If not JSON, return as is
          return result;
        }
      }
      
      // Handle quote data
      if (result.price || result.value) {
        const price = result.price || result.value;
        const change = result.change || '';
        const changePercent = result.changePercent || '';
        const signal = result.signal || '';
        
        let formatted = `Price: $${price}`;
        
        if (change) {
          formatted += `, Change: ${change}`;
          if (changePercent) {
            formatted += ` (${changePercent}%)`;
          }
        }
        
        if (signal) {
          formatted += `, Signal: ${signal}`;
        }
        
        return formatted;
      }
      
      // Default JSON stringification
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error('Error formatting tool result:', error);
      return String(result);
    }
  };

  // Updated handleSubmit function for simplicity and reliability
  const handleSubmitSimple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setIsThinking(true);
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      // Show thinking message
      const thinkingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'thinking',
        content: 'Analyzing your question...',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, thinkingMessage]);
      
      // Simplificar el manejo de mensajes previos, dejar que el servidor maneje la deduplicación
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          // Enviamos el ID de conversación para uso interno de la app 
          // pero la API de Claude lo ignorará
          conversationId,
          previousMessages: conversationMessages
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        debugClaudeAPIError(errorData, {
          prompt: input,
          conversationId,
          previousMessages: conversationMessages
        });
        throw new Error(`Error in response: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update conversation state
      setConversationId(data.conversationId);
      setConversationMessages(data.messages);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
      
      // If Claude wants to use tools, process them
      if (data.toolCalls && data.toolCalls.length > 0) {
        // Show initial reasoning
        if (data.response) {
          const initialThoughtMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, initialThoughtMessage]);
        }
        
        // Process tool calls sequentially
        await processToolCalls(data.toolCalls, data.messages);
      } else {
        // If no tools needed, just show the response
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, an error occurred while processing your message. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      setIsThinking(false);
      setCurrentToolCall(null);
    }
  };
  
  // Format financial responses to display data more clearly
  const formatFinancialResponse = (response: string): string => {
    // Replace JSON data with formatted tables
    let formattedResponse = response;
    
    // Replace stock price data formatting with bold numbers and colors
    formattedResponse = formattedResponse.replace(/(\$\d+\.\d+|\d+\.\d+%|\+\d+\.\d+%|\-\d+\.\d+%)/g, '**$1**');
    
    // Format stock symbols in all caps with bold
    formattedResponse = formattedResponse.replace(/\b([A-Z]{2,5})\b(?!\:)/g, '**$1**');
    
    // Format section headers with bold
    formattedResponse = formattedResponse.replace(/^(.*?\:)$/gm, '**$1**');
    
    return formattedResponse;
  };

  // Detect mobile device on the client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimize message rendering
  const renderMessages = useMemo(() => {
    return messages.map((message, index) => {
      // Render AnalysisStepper for progress messages
      if (message.isProgress) {
        return (
          <div key={index} style={{
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <AnalysisStepper
              steps={analysisSteps}
              currentStep={currentAnalysisStep}
              latestUpdate={latestUpdate}
            />
          </div>
        );
      }
      
      // Regular message rendering...
      return (
      <div 
        key={index} 
        style={{ 
          marginBottom: '1.5rem', 
            textAlign: message.role === 'user' ? 'right' : 'left',
            paddingLeft: message.role === 'user' ? (isMobile ? '5%' : '20%') : 0,
            paddingRight: message.role === 'user' ? 0 : (isMobile ? '5%' : '20%'),
        }}
      >
        <div style={{
          display: 'inline-block',
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          borderRadius: '0.5rem',
            backgroundColor: message.role === 'user' ? '#f0f9ff' : '#f9fafb',
          color: 'black',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxWidth: '100%',
          overflowWrap: 'break-word',
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          fontWeight: '500',
          border: '2px solid black',
          boxShadow: '3px 3px 0 0 rgba(0,0,0,1)'
        }}>
                {message.content}
        </div>
      </div>
      );
    });
  }, [messages, analysisSteps, currentAnalysisStep, latestUpdate, isMobile]);

  const initializeAnalysisSteps = () => {
    const steps: AnalysisStep[] = [
      {
        id: 'market_quote',
        name: 'Market Quote',
        status: 'pending',
        description: 'Analyzing overall market conditions',
        result: undefined,
        toolName: 'get_quote'
      },
      {
        id: 'sma',
        name: 'Simple Moving Average',
        status: 'pending',
        description: 'Getting current market price',
        result: undefined,
        toolName: 'get_sma'
      },
      {
        id: 'macd',
        name: 'MACD Analysis',
        status: 'pending',
        description: 'Analyzing historical price movements',
        result: undefined,
        toolName: 'get_macd'
      },
      {
        id: 'rsi',
        name: 'RSI Analysis',
        status: 'pending',
        description: 'Calculating technical indicators',
        result: undefined,
        toolName: 'get_rsi'
      },
      {
        id: 'market_sentiment',
        name: 'Market Sentiment',
        status: 'pending',
        description: 'Analyzing market sentiment',
        result: undefined,
        toolName: 'get_news_sentiment'
      }
    ];
    setAnalysisSteps(steps);
  };

  const setCurrentStep = (step: AnalysisStep) => {
    setAnalysisSteps(prevSteps => 
      prevSteps.map(s => ({
        ...s,
        status: s.name === step.name ? 'active' : s.status,
        toolName: s.name === step.name ? step.toolName : s.toolName,
        description: s.name === step.name ? step.description : s.description
      }))
    );
  };

  const updateAnalysisProgress = (toolName: string, status: string, result?: any): void => {
    setAnalysisSteps(prev => {
      const newSteps = [...prev];
      const stepIndex = newSteps.findIndex(step => step.toolName === toolName);
      
      if (stepIndex >= 0) {
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          status: status as AnalysisStep['status'],
          result,
          endTime: status === 'completed' ? new Date().toISOString() : undefined
        };
      }
      
      return newSteps;
    });
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      maxWidth: '100vw',
      overflow: 'hidden',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      position: 'relative',
      paddingBottom: '15vh'
    }}>
      {/* Tools Modal */}
      <ToolsModal 
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        availableTools={availableTools}
        mcpConnected={mcpConnected}
        mcpError={mcpError}
      />
      
      <div style={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: isMobile ? '0.5rem' : '1rem',
        overflowY: 'auto',
        paddingTop: isMobile ? '10vh' : '15vh'
      }}>
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          {/* Chat messages */}
          {renderMessages}
          
          {/* Loading indicator in chat flow */}
          {isLoading && (
            <div style={{ 
              marginBottom: '1.5rem',
              textAlign: 'left',
              paddingRight: isMobile ? '5%' : '20%',
            }}>
              <LoadingAnimation 
                tools={activeTools} 
                message={
                  activeTools.includes('get_rsi') || activeTools.includes('get_macd') 
                    ? "Analyzing technical indicators..." 
                    : activeTools.includes('get_news_sentiment')
                    ? "Processing market news and sentiment..."
                    : activeTools.includes('get_top_gainers_losers')
                    ? "Collecting market movers data..."
                    : "Analyzing market data..."
                }
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Add padding div to ensure space for fixed input box */}
        <div style={{ height: isMobile ? '130px' : '160px' }}></div>
        
        {/* Chat input area */}
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '1rem' : '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '800px',
          width: 'calc(100% - 1.5rem)',
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: '1rem',
          border: '2px solid black',
          backgroundColor: 'white',
          boxShadow: isMobile ? '4px 4px 0 0 rgba(0,0,0,1)' : '6px 6px 0 0 rgba(0,0,0,1)',
          zIndex: 10
        }}>
          {/* Quick FAQ chips - moved above the input */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4B5563' }}>
              {isMobile ? 'FAQs:' : 'Frequently Asked Questions:'}
            </div>
            <div style={{
              display: 'flex', 
              flexWrap: 'wrap',
              gap: isMobile ? '0.35rem' : '0.5rem',
            }}>
              {faqButtons.map((button, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleFaqClick(button.label, button.command)}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.25rem' : '0.5rem',
                    padding: isMobile ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: '500',
                    color: 'black',
                    backgroundColor: '#7FFFD4',
                    borderRadius: '1rem',
                    border: '1px solid black',
                    boxShadow: isMobile ? '1px 1px 0 0 rgba(0,0,0,1)' : '2px 2px 0 0 rgba(0,0,0,1)',
                    transition: 'all 0.2s ease',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseOver={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '3px 3px 0 0 rgba(0,0,0,1)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '2px 2px 0 0 rgba(0,0,0,1)';
                    }
                  }}
                >
                  {isMobile ? null : button.icon}
                  <span>{button.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, markets, or financial data..."
              style={{
                width: '100%',
                outline: 'none',
                fontSize: '0.875rem',
                color: 'black',
                padding: '0.5rem 0',
                border: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
                fontWeight: '500'
              }}
              disabled={isLoading}
            />
            
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem'
            }}>
              {/* Connection status and tools button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {mcpConnected ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    color: '#10B981',
                    fontWeight: '500'
                  }}>
                    <span style={{
                      height: isMobile ? '0.4rem' : '0.5rem',
                      width: isMobile ? '0.4rem' : '0.5rem',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}></span>
                    {isMobile ? 'Connected' : 'MCP Connected'}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                    color: '#B91C1C',
                    fontWeight: '500'
                  }}>
                    <span style={{
                      height: isMobile ? '0.4rem' : '0.5rem',
                      width: isMobile ? '0.4rem' : '0.5rem',
                      backgroundColor: '#B91C1C',
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}></span>
                    {mcpError ? (
                      <button 
                        onClick={retryMcpConnection}
                        disabled={isConnecting}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#B91C1C',
                          fontSize: isMobile ? '0.65rem' : '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        {isConnecting ? 'Connecting...' : (isMobile ? 'Disconnected - Retry' : 'MCP Disconnected - Retry')}
                      </button>
                    ) : (
                      isMobile ? 'Disconnected' : 'MCP Disconnected'
                    )}
                  </div>
                )}
                
                {/* Tools button - moved here */}
                <button
                  onClick={() => setIsToolsModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '0.2rem' : '0.25rem',
                    backgroundColor: '#7FFFD4',
                    borderRadius: '0.375rem',
                    border: '1px solid black',
                    boxShadow: isMobile ? '1px 1px 0 0 rgba(0,0,0,1)' : '2px 2px 0 0 rgba(0,0,0,1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '3px 3px 0 0 rgba(0,0,0,1)';
                      e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.boxShadow = '2px 2px 0 0 rgba(0,0,0,1)';
                      e.currentTarget.style.transform = 'translate(0, 0)';
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </button>
              </div>
              
              {/* Send button */}
              <button 
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: isMobile ? '0.25rem 0.75rem' : '0.375rem 1rem',
                  fontSize: isMobile ? '12px' : '13px',
                  fontWeight: '600',
                  color: 'black',
                  backgroundColor: '#7FFFD4',
                  borderRadius: '0.375rem',
                  border: '2px solid black',
                  boxShadow: isMobile ? '3px 3px 0 0 rgba(0,0,0,1)' : '4px 4px 0 0 rgba(0,0,0,1)',
                  transition: 'all 0.2s ease',
                  cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer'
                }}
                onMouseOver={(e) => {
                  if (!isMobile && !isLoading && input.trim()) {
                    e.currentTarget.style.boxShadow = '6px 6px 0 0 rgba(0,0,0,1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.boxShadow = '4px 4px 0 0 rgba(0,0,0,1)';
                  }
                }}
                disabled={isLoading || !input.trim()}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width={isMobile ? "14" : "16"}
                  height={isMobile ? "14" : "16"}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  style={{ width: isMobile ? "14px" : "16px", height: isMobile ? "14px" : "16px" }}
                >
                  <path d="m5 12 7-7 7 7"></path>
                  <path d="M12 19V5"></path>
                </svg>
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

// Styles for icon buttons
const newIconButtonStyle = {
  padding: '0.25rem',
  backgroundColor: '#7FFFD4',
  border: '2px solid black',
  borderRadius: '0.375rem',
  boxShadow: '2px 2px 0 0 rgba(0,0,0,1)',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'black',
  cursor: 'pointer'
}; 