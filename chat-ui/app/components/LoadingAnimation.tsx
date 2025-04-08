import React from 'react';

interface LoadingAnimationProps {
  language?: 'en' | 'es'; // Still keep this for backward compatibility
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ language = 'en' }) => {
  // Always use English text 
  const loadingText = "Analyzing markets...";
  
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <div className="text-sm font-semibold mb-2">{loadingText}</div>
      
      {/* Candlestick chart animation */}
      <div className="flex items-end space-x-2 h-12 mb-2">
        {[...Array(8)].map((_, i) => {
          const isUp = i % 2 === 0;
          const height = 50 + Math.random() * 50; // Random height between 50-100%
          const wickHeight = height + (Math.random() * 15); // Wick extends above/below
          const animationDelay = `${i * 0.15}s`;
          const color = isUp ? 'bg-green-500' : 'bg-red-500';
          
          return (
            <div key={i} className="relative flex flex-col items-center" style={{animationDelay}}>
              {/* Wick */}
              <div 
                className={`w-0.5 bg-black absolute ${isUp ? 'bottom-full' : 'top-full'}`} 
                style={{
                  height: `${wickHeight - height}%`,
                  animation: `wickPulse 1.5s infinite ${animationDelay}`
                }}
              />
              
              {/* Candle body */}
              <div 
                className={`w-4 ${color} rounded-sm`}
                style={{
                  height: `${height}%`,
                  animation: `candlePulse 1.5s infinite ${animationDelay}`
                }}
              />
              
              {/* Wick */}
              <div 
                className={`w-0.5 bg-black absolute ${isUp ? 'top-full' : 'bottom-full'}`} 
                style={{
                  height: `${wickHeight - height}%`,
                  animation: `wickPulse 1.5s infinite ${animationDelay}`
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Axis line */}
      <div className="w-full h-0.5 bg-black mb-1"></div>
      
      {/* Market trend line with stock animation */}
      <div className="w-full h-6 relative">
        <div className="absolute top-0 left-0 w-full overflow-hidden">
          <div className="market-line w-full h-3 absolute" />
        </div>
        
        {/* Stock ticker symbols moving across */}
        <div className="ticker-tape">
          <div className="ticker-content">
            <span className="ticker-symbol">AAPL</span>
            <span className="ticker-symbol up">MSFT</span>
            <span className="ticker-symbol down">TSLA</span>
            <span className="ticker-symbol">AMZN</span>
            <span className="ticker-symbol up">GOOGL</span>
            <span className="ticker-symbol down">META</span>
            <span className="ticker-symbol">NVDA</span>
            <span className="ticker-symbol up">SPY</span>
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes candlePulse {
          0% { transform: scaleY(0.8); opacity: 0.7; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0.8); opacity: 0.7; }
        }
        
        @keyframes wickPulse {
          0% { transform: scaleY(0.7); opacity: 0.6; }
          50% { transform: scaleY(1.2); opacity: 0.9; }
          100% { transform: scaleY(0.7); opacity: 0.6; }
        }
        
        .market-line {
          background: linear-gradient(90deg, 
            rgba(0,0,0,0) 0%, 
            rgba(0,200,0,0.5) 25%, 
            rgba(200,0,0,0.5) 50%, 
            rgba(0,200,0,0.5) 75%, 
            rgba(0,0,0,0) 100%);
          animation: moveLine 3s linear infinite;
        }
        
        @keyframes moveLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .ticker-tape {
          overflow: hidden;
          width: 100%;
          height: 20px;
          position: absolute;
          bottom: 0;
        }
        
        .ticker-content {
          white-space: nowrap;
          animation: ticker 20s linear infinite;
        }
        
        .ticker-symbol {
          display: inline-block;
          padding: 0 10px;
          font-weight: bold;
          font-size: 12px;
        }
        
        .ticker-symbol.up {
          color: #10b981;
        }
        
        .ticker-symbol.down {
          color: #ef4444;
        }
        
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation; 