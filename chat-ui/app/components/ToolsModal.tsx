import React, { useEffect, useState } from 'react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTools: any[];
  mcpConnected: boolean;
  mcpError: string | null;
}

// Define a list of hardcoded tools to show what should be available
const EXPECTED_TOOLS = [
  {
    name: "get_top_gainers_losers",
    description: "Get top gainers, losers, and most actively traded US stocks",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_quote",
    description: "Get global quote for a security",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_daily_data",
    description: "Get daily time series stock data (OHLCV)",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_intraday_data",
    description: "Get intraday time series stock data (OHLCV)",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_sma",
    description: "Get Simple Moving Average (SMA) technical indicator",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_rsi",
    description: "Get Relative Strength Index (RSI) technical indicator",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_macd",
    description: "Get Moving Average Convergence/Divergence (MACD) values",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_bbands",
    description: "Get Bollinger Bands (BBANDS) values",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_adx",
    description: "Get Average Directional Movement Index (ADX) values",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_company_overview",
    description: "Get company overview with fundamental data",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_income_statement",
    description: "Get company income statement",
    server: "alpha-vantage-trading"
  },
  {
    name: "get_news_sentiment",
    description: "Get news sentiment for a specific ticker or tickers",
    server: "alpha-vantage-trading"
  },
  {
    name: "search_symbol",
    description: "Search for a symbol by keywords",
    server: "alpha-vantage-trading"
  }
];

const ToolsModal: React.FC<ToolsModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isOpen) return null;
  
  // Use the expected tools list for simplicity
  const toolsToShow = EXPECTED_TOOLS;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white overflow-hidden z-50 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        style={{
          borderRadius: '6px',
          width: isMobile ? '85%' : '240px', 
          maxWidth: '280px',
          maxHeight: isMobile ? '50vh' : '55vh'
        }}
      >
        {/* Header */}
        <div className="relative bg-[#7FFFD4] border-b border-black px-2 py-1.5">
          <h2 className="text-[10px] font-bold text-center">Tools</h2>
          
          {/* Close button inside the header */}
          <button 
            onClick={onClose}
            className="absolute top-0 right-0 text-black hover:text-gray-700 bg-[#fd94e6] border-l border-b border-black flex items-center justify-center"
            style={{
              width: isMobile ? '16px' : '20px',
              height: isMobile ? '16px' : '20px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "8" : "10"} height={isMobile ? "8" : "10"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Content with scroll */}
        <div className="p-2 overflow-y-auto" style={{ maxHeight: isMobile ? '45vh' : '50vh' }}>
          <div className="space-y-[3px]">
            {toolsToShow.map((tool, index) => (
              <div 
                key={index} 
                className="py-[2px] px-1 group hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-[9px] text-blue-600">{tool.name}</div>
                <div className="text-[8px] text-gray-600">{tool.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal; 