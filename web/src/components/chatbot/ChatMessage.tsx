'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { User, Bot, Clock, ThumbsUp, ThumbsDown, Copy, Check, MoreHorizontal } from 'lucide-react';
import { MarkdownRenderer } from '../ui/markdown-renderer';
import type { ChatMessageData } from './types';

interface ChatMessageProps {
  message: ChatMessageData;
  showTimestamp?: boolean;
  enableReactions?: boolean;
  onReaction?: (messageId: string, reaction: string) => void;
  className?: string;
}

export function ChatMessage({ 
  message, 
  showTimestamp = true, 
  enableReactions = true,
  onReaction,
  className 
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const isUser = message.role === 'user';
  const isLoading = message.content === '' && message.status === 'sending';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(message.id, reaction);
    }
  };

  return (
    <div 
      className={clsx(
        'group relative flex gap-3 p-4 transition-all duration-200',
        'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
        isUser 
          ? 'flex-row-reverse bg-blue-50/30 dark:bg-blue-900/10' 
          : 'bg-transparent',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200',
        'group-hover:scale-105',
        isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
          : 'bg-gradient-to-br from-gray-600 to-gray-700 text-white shadow-lg'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={clsx('flex-1 min-w-0', isUser ? 'text-right' : 'text-left')}>
        {/* Header */}
        <div className={clsx(
          'flex items-center gap-2 mb-2',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <span className={clsx(
            'font-medium text-sm',
            isUser 
              ? 'text-blue-900 dark:text-blue-100' 
              : 'text-gray-900 dark:text-gray-100'
          )}>
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          
          {showTimestamp && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock size={12} />
              <span>{message.timestamp.toLocaleTimeString()}</span>
            </div>
          )}

          {/* Status Indicator */}
          {message.status && (
            <div className={clsx(
              'w-2 h-2 rounded-full',
              message.status === 'sending' && 'bg-yellow-400 animate-pulse',
              message.status === 'sent' && 'bg-green-400',
              message.status === 'error' && 'bg-red-400'
            )} />
          )}
        </div>

        {/* Content */}
        <div className={clsx(
          'relative rounded-2xl px-4 py-3 max-w-[85%] transition-all duration-200',
          isUser ? [
            'bg-gradient-to-br from-blue-500 to-blue-600 text-white ml-auto',
            'shadow-lg hover:shadow-xl'
          ] : [
            'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200',
            'border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
          ]
        )}>
          {isLoading ? (
            <div className="flex items-center gap-2 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-500">AI is thinking...</span>
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownRenderer 
              content={message.content} 
              className={clsx(
                'prose-sm max-w-none',
                'prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
                'prose-p:text-gray-700 dark:prose-p:text-gray-300',
                'prose-code:text-gray-800 dark:prose-code:text-gray-200'
              )}
            />
          )}

          {/* Message tail */}
          <div className={clsx(
            'absolute top-4 w-3 h-3 transform rotate-45',
            isUser ? [
              'right-[-6px] bg-gradient-to-br from-blue-500 to-blue-600'
            ] : [
              'left-[-6px] bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700'
            ]
          )} />
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
              >
                <span className="text-gray-600 dark:text-gray-300">{attachment.name}</span>
                <span className="text-xs text-gray-500">
                  {(attachment.size / 1024).toFixed(1)}KB
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={clsx(
          'flex items-center gap-1 mt-2 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          {!isUser && !isLoading && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}

          {enableReactions && !isLoading && (
            <>
              <button
                onClick={() => handleReaction('👍')}
                className={clsx(
                  'p-1.5 rounded-lg transition-colors',
                  message.reactions?.includes('👍')
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
                title="Like"
              >
                <ThumbsUp size={14} />
              </button>
              
              <button
                onClick={() => handleReaction('👎')}
                className={clsx(
                  'p-1.5 rounded-lg transition-colors',
                  message.reactions?.includes('👎')
                    ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}
                title="Dislike"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}

          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="More actions"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}