import React from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

// Simple utility for conditional class names
const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  // Check if the message contains tool results or financial data
  const hasFinancialData = !isUser && (
    message.includes('$') || 
    message.includes('%') || 
    message.includes('NASDAQ') ||
    message.includes('NYSE') ||
    message.includes('gainers') ||
    message.includes('losers') ||
    message.includes('ticker') ||
    message.includes('volume')
  );
  
  // Format the message to highlight data
  let formattedMessage = message;
  
  if (!isUser) {
    // Add JSON pretty-printing for data blocks
    if (formattedMessage.includes('{') && formattedMessage.includes('}')) {
      // Try to find and format JSON sections
      formattedMessage = formattedMessage.replace(/({[\s\S]*?})/g, (match) => {
        try {
          // Try to parse and re-stringify for pretty format
          const jsonObj = JSON.parse(match);
          return `<pre class="bg-gray-100 p-2 rounded overflow-auto max-h-80 text-xs my-2">${JSON.stringify(jsonObj, null, 2)}</pre>`;
        } catch (e) {
          // If parsing fails, return original
          return match;
        }
      });
    }
    
    // Highlight stock symbols (2-5 uppercase letters)
    formattedMessage = formattedMessage.replace(/\b([A-Z]{2,5})\b(?!:)/g, '<span class="font-bold text-blue-600">$1</span>');
    
    // Highlight positive prices and percentages
    formattedMessage = formattedMessage.replace(/(\$\d+\.\d+|\+\d+\.\d+%|\+\$\d+\.\d+|\d+\.\d+%(?!\s*decrease))/g, '<span class="font-bold text-green-600">$1</span>');
    
    // Highlight negative percentages and prices
    formattedMessage = formattedMessage.replace(/(-\$\d+\.\d+|-\d+\.\d+%)/g, '<span class="font-bold text-red-600">$1</span>');
    
    // Format headings
    formattedMessage = formattedMessage.replace(/^(##?\s+.*)/gm, '<h3 class="font-bold text-lg my-2">$1</h3>');
    
    // Format sections with colons
    formattedMessage = formattedMessage.replace(/^([^:\n<]+:)/gm, '<span class="font-semibold">$1</span>');
    
    // Add spacing after paragraphs
    formattedMessage = formattedMessage.replace(/\n\n/g, '<br><br>');
    
    // Format ticker lists or data tables
    if (formattedMessage.includes('ticker') || formattedMessage.includes('symbol')) {
      formattedMessage = formattedMessage.replace(/(\w+):\s+([^,\n]+)(?=(,|\n|$))/g, '<span class="font-semibold">$1</span>: <span class="text-blue-600">$2</span>');
    }
  }

  return (
    <div className={`mb-4`}>
      {!isUser && (
        <div className="flex items-center space-x-2 mb-1.5">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#fd94e6] border-2 border-black">
            <span className="text-[9px] text-black font-bold">AV</span>
          </div>
          <div className="text-sm font-medium text-black">Alpha Vantage</div>
        </div>
      )}
      
      <div className={cn(
        "pl-8",
        isUser && "text-right"
      )}>
        <div className={cn(
          "inline-block max-w-[85%] rounded-lg border-2 border-black px-4 py-2",
          isUser
            ? "bg-[#FF7F50] text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
            : "bg-white text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]",
          hasFinancialData && "financial-data"
        )}>
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: formattedMessage }}></div>
        </div>
        {timestamp && (
          <div className="text-xs text-gray-500 mt-1">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 