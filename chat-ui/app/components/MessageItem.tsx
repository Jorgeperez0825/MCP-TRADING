import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isThinking = message.role === 'thinking';
  
  return (
    <div className={cn(
      'flex gap-3 p-4',
      isUser ? 'flex-row-reverse pl-10' : 'pr-10',
      isThinking ? 'opacity-70 italic' : ''
    )}>
      <Avatar className={cn(
        'rounded-md h-8 w-8',
        isUser || isThinking ? 'bg-blue-500' : 'bg-green-500'
      )}>
        {!isUser && !isThinking && (
          <AvatarImage src="/claude-avatar.png" alt="Claude" />
        )}
        <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}>
          {isUser ? 'U' : isThinking ? 'T' : 'C'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        'rounded-lg px-4 py-3 max-w-[85%]',
        isUser ? 'bg-blue-500 text-white' : 
        isThinking ? 'bg-gray-300 text-gray-700 border border-gray-400' : 
        'bg-gray-100 text-gray-800'
      )}>
        {message.content.includes('```') ? (
          <ReactMarkdown 
            components={{
              code({ node, inline, className, children, ...props }) {
                if (inline) {
                  return <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded" {...props}>{children}</code>
                }
                return (
                  <pre className="p-4 my-2 bg-gray-900 dark:bg-gray-800 rounded-md overflow-x-auto">
                    <code className="text-sm text-gray-200" {...props}>{children}</code>
                  </pre>
                )
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto">
                    <table className="border-collapse border border-gray-300 my-4 w-full">{children}</table>
                  </div>
                )
              },
              th({ children }) {
                return <th className="border border-gray-300 px-4 py-2 bg-gray-100">{children}</th>
              },
              td({ children }) {
                return <td className="border border-gray-300 px-4 py-2">{children}</td>
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
};

export default MessageItem; 