'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessageData, ChatbotSettings } from './types';

interface VirtualizedMessageListProps {
  messages: ChatMessageData[];
  renderMessage?: (message: ChatMessageData, index: number) => React.ReactNode;
  onMessageReaction?: (messageId: string, reaction: string) => void;
  settings: ChatbotSettings;
  isLoading?: boolean;
}

export function VirtualizedMessageList({
  messages,
  renderMessage,
  onMessageReaction,
  settings,
  isLoading
}: VirtualizedMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  const ITEM_HEIGHT = 120; // Approximate height per message
  const BUFFER_SIZE = 10; // Number of items to render outside visible area

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
      const end = Math.min(
        messages.length,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
      );
      
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  const topSpacer = visibleRange.start * ITEM_HEIGHT;
  const bottomSpacer = (messages.length - visibleRange.end) * ITEM_HEIGHT;

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth"
      style={{ height: '100%' }}
    >
      {/* Top spacer for virtualization */}
      {topSpacer > 0 && <div style={{ height: topSpacer }} />}
      
      {/* Visible messages */}
      <div className="space-y-1">
        {visibleMessages.map((message, index) => {
          const actualIndex = visibleRange.start + index;
          
          if (renderMessage) {
            return (
              <div key={message.id}>
                {renderMessage(message, actualIndex)}
              </div>
            );
          }
          
          return (
            <ChatMessage
              key={message.id}
              message={message}
              showTimestamp={settings.showTimestamps}
              enableReactions={settings.enableReactions}
              onReaction={onMessageReaction}
            />
          );
        })}
        
        {/* Loading indicator */}
        {isLoading && (
          <ChatMessage
            message={{
              id: 'loading',
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              status: 'sending'
            }}
            showTimestamp={settings.showTimestamps}
            enableReactions={false}
          />
        )}
      </div>
      
      {/* Bottom spacer for virtualization */}
      {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}
    </div>
  );
}