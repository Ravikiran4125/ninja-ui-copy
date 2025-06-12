'use client';

import { MarkdownRenderer } from './markdown-renderer';
import { User, Bot, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, timestamp, isLoading }: ChatMessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={clsx(
      'flex gap-3 p-4 rounded-lg transition-colors',
      isUser 
        ? 'bg-blue-50 dark:bg-blue-900/20 ml-8' 
        : 'bg-gray-50 dark:bg-gray-800/50 mr-8'
    )}>
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-600 text-white'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx(
            'font-medium text-sm',
            isUser 
              ? 'text-blue-900 dark:text-blue-100' 
              : 'text-gray-900 dark:text-gray-100'
          )}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {timestamp && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              <span>{timestamp.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-gray-800 dark:text-gray-200">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">AI is thinking...</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <MarkdownRenderer content={content} />
          )}
        </div>
      </div>
    </div>
  );
}