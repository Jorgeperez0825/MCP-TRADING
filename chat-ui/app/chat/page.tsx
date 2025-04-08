'use client';

import { useState, FormEvent, useEffect, useRef, useMemo } from 'react';
import tradingService from '../services/trading-service';
import mcpClient from '../services/mcp-client';
import anthropicService from '../services/anthropic-service';
import LoadingAnimation from '../components/LoadingAnimation';
import ToolsModal from '../components/ToolsModal';

interface Message {
  text: string;
  isUser: boolean;
}

interface FaqButton {
  label: string;
  command: string;
  icon: React.ReactNode;
}

export default function ChatPage() {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mcpConnected, setMcpConnected] = useState<boolean>(false);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // FAQ buttons configuration instead of command buttons
  const faqButtons = [
    {
      label: "What stocks should I invest in today?",
      command: "investment_advice",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
    },
    {
      label: "How is the market performing today?",
      command: "market_overview",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m17 11-5-5-5 5"></path>
              <path d="m17 18-5-5-5 5"></path>
            </svg>
    },
    {
      label: "What is a good ETF to buy?",
      command: "etf_advice",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
    },
    {
      label: "Tell me about dividend stocks",
      command: "dividend_stocks",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4"></path>
              <path d="M9 12h13"></path>
              <path d="M11 18H9a2 2 0 0 1-2-2v-4"></path>
            </svg>
    },
    {
      label: "How to diversify my portfolio?",
      command: "diversification",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
    }
  ];

  // Add welcome message on initial load
  useEffect(() => {
    // Only add welcome message if there are no messages yet
    if (messages.length === 0) {
      setMessages([
        {
          text: `👋 Welcome to Trading Agent! 

I can help you with financial market data and trading insights. Type your question or use the command chips below.`,
          isUser: false
        }
      ]);
    }
  }, []);

  // Connect to MCP server on component mount
  useEffect(() => {
    const connectToMCP = async () => {
      try {
        setIsConnecting(true);
        setMcpError(null);
        
        const connected = await mcpClient.connect();
        setMcpConnected(connected);
        
        if (connected) {
          console.log('Connected to MCP server successfully');
          const tools = mcpClient.getAvailableTools();
          setAvailableTools(tools);
          console.log('Available tools:', tools);
        } else {
          const error = mcpClient.getConnectionError();
          console.error('Failed to connect to MCP server:', error);
          setMcpError(error || 'Unknown connection error');
        }
      } catch (error) {
        console.error('Error connecting to MCP server:', error);
        setMcpConnected(false);
        setMcpError(error instanceof Error ? error.message : String(error));
      } finally {
        setIsConnecting(false);
      }
    };

    connectToMCP();
  }, []);

  // Function to retry MCP connection
  const retryMcpConnection = async () => {
    mcpClient.resetConnection();
    setMcpError(null);
    setIsConnecting(true);
    
    try {
      const connected = await mcpClient.connect();
      setMcpConnected(connected);
      
      if (connected) {
        console.log('Reconnected to MCP server successfully');
        const tools = mcpClient.getAvailableTools();
        setAvailableTools(tools);
      } else {
        const error = mcpClient.getConnectionError();
        console.error('Failed to reconnect to MCP server:', error);
        setMcpError(error || 'Unknown connection error');
      }
    } catch (error) {
      console.error('Error reconnecting to MCP server:', error);
      setMcpConnected(false);
      setMcpError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsConnecting(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Execute a command
  const executeCommand = async (command: string, params: any = {}) => {
    setIsLoading(true);
    
    try {
      let result;
      
      // Try using MCP client if connected
      if (mcpConnected) {
        try {
          result = await mcpClient.callTool(command, params);
        } catch (mcpError) {
          console.error('MCP tool call error:', mcpError);
          // Fallback to direct service
          result = await executeDirectCommand(command, params);
        }
      } else {
        // Use direct service if MCP is not connected
        result = await executeDirectCommand(command, params);
      }
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      console.error("Error executing command:", error);
      return "I'm sorry, I encountered an error processing your request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };
  
  // Execute command using direct service calls as fallback
  const executeDirectCommand = async (command: string, params: any = {}) => {
    switch (command) {
      case 'get_quote':
        return await tradingService.getQuote(params.symbol);
      case 'get_top_gainers_losers':
        return await tradingService.getTopGainersLosers();
      case 'get_daily_data':
        return await tradingService.getDailyData(params.symbol);
      case 'get_sma':
        return await tradingService.getSMA(
          params.symbol, 
          params.timePeriod || 20, 
          params.seriesType || 'close'
        );
      case 'get_rsi':
        return await tradingService.getRSI(
          params.symbol, 
          params.timePeriod || 14, 
          params.seriesType || 'close'
        );
      case 'get_macd':
        return await tradingService.getMACD(
          params.symbol, 
          params.fastPeriod || 12, 
          params.slowPeriod || 26, 
          params.signalPeriod || 9, 
          params.seriesType || 'close'
        );
      case 'get_bbands':
        return await tradingService.getBBands(
          params.symbol, 
          params.timePeriod || 20, 
          params.nbdevup || 2, 
          params.nbdevdn || 2, 
          params.seriesType || 'close'
        );
      case 'get_adx':
        return await tradingService.getADX(
          params.symbol, 
          params.timePeriod || 14
        );
      case 'get_company_overview':
        return await tradingService.getCompanyOverview(params.symbol);
      case 'get_income_statement':
        return await tradingService.getIncomeStatement(params.symbol);
      case 'get_news_sentiment':
        return await tradingService.getNewsSentiment(params.symbol);
      default:
        throw new Error(`Direct command not implemented: ${command}`);
    }
  };

  // Handle FAQ button click
  const handleFaqClick = (faqText: string) => {
    setInput(faqText);
    handleSubmit(new Event('submit') as unknown as React.FormEvent<HTMLFormElement>);
  };

  // Handle form submission for free-form chat input
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages([...messages, { text: userMessage, isUser: true }]);
      setInput('');
      
      // Process the message and get a response
      setIsLoading(true);

      // Detect language (simple detection) - but always respond in English
      const isSpanish = 
        userMessage.toLowerCase().includes('invertir') || 
        userMessage.toLowerCase().includes('mercado') || 
        userMessage.toLowerCase().includes('recomiendas') || 
        userMessage.toLowerCase().includes('datos') ||
        userMessage.toLowerCase().includes('acciones') ||
        userMessage.toLowerCase().includes('bolsa');
      
      // Simple detection for investment queries (English and Spanish)
      const isInvestmentQuery = 
        userMessage.toLowerCase().includes('invest') || 
        userMessage.toLowerCase().includes('invertir') || 
        userMessage.toLowerCase().includes('investment') ||
        userMessage.toLowerCase().includes('inversion') ||
        userMessage.toLowerCase().includes('recommend') ||
        userMessage.toLowerCase().includes('recomend') ||
        userMessage.toLowerCase().includes('best stock') ||
        userMessage.toLowerCase().includes('mejor stock') ||
        userMessage.toLowerCase().includes('buy shares') ||
        userMessage.toLowerCase().includes('comprar acciones');

      if (isInvestmentQuery) {
        console.log("Investment query detected, getting market data directly");
        try {
          // Get market data directly
          const loadingMessage = "Consulting current market data...";
            
          setMessages(prev => [...prev, { 
            text: loadingMessage, 
            isUser: false 
          }]);
          
          // Get data directly from Alpha Vantage
          const marketData = await fetch(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=A0Y25M1WODQRWJR4`);
          let marketDataJson;
          
          if (marketData.ok) {
            marketDataJson = await marketData.json();
            console.log("Alpha Vantage data received:", marketDataJson);
          } else {
            throw new Error("Couldn't connect to Alpha Vantage");
          }
          
          // Pass the data to Claude for analysis - use appropriate language
          let promptWithData = `Here is the current market data:\n${JSON.stringify(marketDataJson, null, 2)}\n\nBased on this real-time data, ${userMessage}`;
          
          // Call Claude with the data included
          const claudeResponse = await anthropicService.generateResponse(promptWithData);
          
          // Update the loading message with the final response
          setMessages(prev => {
            const withoutLoading = prev.filter(msg => msg.text !== loadingMessage);
            return [...withoutLoading, { text: claudeResponse, isUser: false }];
          });
          
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("Error getting market data:", error);
          
          // If we fail to get data, use simulated data
          const mockData = {
            "top_gainers": [
              {"ticker": "AAPL", "price": "$197.82", "change_amount": "+$5.24", "change_percentage": "+2.72%", "volume": "56723910"},
              {"ticker": "MSFT", "price": "$428.17", "change_amount": "+$3.65", "change_percentage": "+0.86%", "volume": "16284532"}
            ],
            "top_losers": [
              {"ticker": "META", "price": "$471.89", "change_amount": "-$7.32", "change_percentage": "-1.53%", "volume": "12758901"},
              {"ticker": "AMZN", "price": "$182.41", "change_amount": "-$2.86", "change_percentage": "-1.54%", "volume": "34586712"}
            ],
            "most_actively_traded": [
              {"ticker": "SPY", "price": "$518.46", "change_amount": "+$1.24", "change_percentage": "+0.24%", "volume": "58329156"},
              {"ticker": "QQQ", "price": "$438.12", "change_amount": "+$1.67", "change_percentage": "+0.38%", "volume": "32145789"}
            ],
            "_note": "Simulated data due to connection issues with Alpha Vantage"
          };
          
          // Use the mock data with Claude - in English only
          let promptWithMockData = `Here is the market data (note: this is simulated data due to a connection problem):\n${JSON.stringify(mockData, null, 2)}\n\nBased on this data, ${userMessage}`;
          
          try {
            const claudeResponse = await anthropicService.generateResponse(promptWithMockData);
            setMessages(prev => {
              const loadingMessage = "Consulting current market data...";
              const withoutLoading = prev.filter(msg => msg.text !== loadingMessage);
              return [...withoutLoading, { text: claudeResponse, isUser: false }];
            });
          } catch (claudeError) {
            console.error("Error with Claude:", claudeError);
            setMessages(prev => {
              const loadingMessage = "Consulting current market data...";
              const withoutLoading = prev.filter(msg => msg.text !== loadingMessage);
              return [...withoutLoading, { 
                text: "I couldn't get updated market data. As a general recommendation, consider diversifying your portfolio with ETFs like SPY or QQQ.", 
                isUser: false 
              }];
            });
          }
          
          setIsLoading(false);
          return;
        }
      }
      
      // For all other queries, use Claude normally
      try {
        const claudeResponse = await anthropicService.generateResponse(userMessage);
        setMessages(prev => [...prev, { text: claudeResponse, isUser: false }]);
      } catch (error) {
        console.error("Error calling Claude:", error);
        setMessages(prev => [...prev, { 
          text: "Sorry, I encountered a problem processing your request.", 
          isUser: false 
        }]);
      } finally {
        setIsLoading(false);
      }
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
    return messages.slice(1).map((message, index) => (
      <div 
        key={index} 
        style={{ 
          marginBottom: '1.5rem', 
          textAlign: message.isUser ? 'right' : 'left',
          paddingLeft: message.isUser ? (isMobile ? '5%' : '20%') : 0,
          paddingRight: message.isUser ? 0 : (isMobile ? '5%' : '20%'),
        }}
      >
        <div style={{
          display: 'inline-block',
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: message.isUser ? '#f0f9ff' : '#f9fafb',
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
          {message.text}
        </div>
      </div>
    ));
  }, [messages, isMobile]);

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
      {/* Welcome message in upper left corner */}
      {messages.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          maxWidth: isMobile ? '60%' : '300px',
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: '#f9fafb',
          color: 'black',
          fontSize: isMobile ? '0.75rem' : '0.875rem',
          fontWeight: '500',
          border: '2px solid black',
          boxShadow: '3px 3px 0 0 rgba(0,0,0,1)',
          zIndex: 5
        }}>
          👋 Welcome to Trading Agent!
        </div>
      )}

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
              <LoadingAnimation />
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
                  onClick={() => handleFaqClick(button.label)}
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
              placeholder={messages.some(m => 
                m.isUser && (
                  m.text.toLowerCase().includes('invertir') || 
                  m.text.toLowerCase().includes('mercado') || 
                  m.text.toLowerCase().includes('recomiendas') || 
                  m.text.toLowerCase().includes('acciones')
                )) 
                ? "Ask about stocks, markets, or financial data..." 
                : "Ask about stocks, markets, or financial data..."}
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