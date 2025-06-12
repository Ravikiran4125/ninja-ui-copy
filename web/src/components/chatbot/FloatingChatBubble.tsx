'use client';

import { MessageSquare, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface FloatingChatBubbleProps {
  onClick: () => void;
  hasUnread?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export function FloatingChatBubble({ 
  onClick, 
  hasUnread = false, 
  theme = 'auto',
  className 
}: FloatingChatBubbleProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl',
        'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
        'text-white transition-all duration-300 ease-out',
        'hover:scale-110 hover:shadow-3xl',
        'focus:outline-none focus:ring-4 focus:ring-blue-500/30',
        'animate-in slide-in-from-bottom-4 slide-in-from-right-4',
        'z-50',
        className
      )}
      title="Open AI Chat"
    >
      <div className="relative flex items-center justify-center w-full h-full">
        <MessageSquare size={24} className="transition-transform duration-200 group-hover:scale-110" />
        
        {/* Unread indicator */}
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
        
        {/* Sparkle animation */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <Sparkles 
            size={12} 
            className="absolute top-2 right-3 text-white/60 animate-pulse" 
            style={{ animationDelay: '0.5s' }}
          />
          <Sparkles 
            size={8} 
            className="absolute bottom-3 left-2 text-white/40 animate-pulse" 
            style={{ animationDelay: '1s' }}
          />
        </div>
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
    </button>
  );
}