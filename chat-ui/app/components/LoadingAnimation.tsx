import React from 'react';

interface LoadingAnimationProps {
  tools?: string[];
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ tools = [], message }) => {
  return (
    <div 
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb',
        color: 'black',
        border: '2px solid black',
        boxShadow: '3px 3px 0 0 rgba(0,0,0,1)',
        width: '100%',
        maxWidth: '350px'
      }}
    >
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: tools.length > 0 ? '0.75rem' : '0'
      }}>
        {/* Animated dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out 0.3s'
          }}></div>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out 0.6s'
          }}></div>
        </div>
        
        {/* Custom loading message */}
        <span style={{ fontWeight: '500' }}>
          {message || "Analyzing market data..."}
        </span>
      </div>
      
      {/* Show tools being used */}
      {tools.length > 0 && (
        <div style={{
          marginTop: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          {tools.map((tool, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#4b5563'
            }}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{color: '#3182ce'}}
              >
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
              </svg>
              <span>
                {tool === 'get_top_gainers_losers' && 'Fetching top market movers'}
                {tool === 'get_quote' && 'Retrieving stock quotes'}
                {tool === 'get_daily_data' && 'Analyzing price history'}
                {tool === 'get_news_sentiment' && 'Processing news sentiment'}
                {tool === 'get_sma' && 'Calculating moving averages'}
                {tool === 'get_rsi' && 'Computing RSI indicator'}
                {tool === 'get_macd' && 'Analyzing MACD signals'}
                {tool === 'get_bbands' && 'Calculating Bollinger Bands'}
                {tool === 'get_company_overview' && 'Retrieving company data'}
                {tool === 'search_symbol' && 'Searching for tickers'}
                {!['get_top_gainers_losers', 'get_quote', 'get_daily_data', 'get_news_sentiment', 
                  'get_sma', 'get_rsi', 'get_macd', 'get_bbands', 'get_company_overview', 
                  'search_symbol'].includes(tool) && tool}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Add CSS for animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation; 