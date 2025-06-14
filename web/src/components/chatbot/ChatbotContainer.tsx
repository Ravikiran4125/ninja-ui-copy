'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  MessageSquare, 
  X, 
  Settings, 
  Download, 
  Trash2, 
  Search,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ChatInput } from './ChatInput';
import { ChatSettings } from './ChatSettings';
import { ChatSearch } from './ChatSearch';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { EmptyState } from './EmptyState';
import { FloatingChatBubble } from './FloatingChatBubble';
import { useTheme } from './hooks/useTheme';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useMessageSearch } from './hooks/useMessageSearch';
import type { ChatbotContainerProps, ChatbotSettings, FileAttachment } from './types';

const defaultSettings: ChatbotSettings = {
  theme: 'auto',
  enableVoice: true,
  enableFileUpload: true,
  enableReactions: true,
  enableSearch: true,
  autoScroll: true,
  showTimestamps: true,
  messageLimit: 1000,
};

export function ChatbotContainer({
  messages,
  onSendMessage,
  onVoiceMessage,
  isLoading = false,
  error = null,
  inputPlaceholder = "Type your message...",
  chatTitle = "AI Assistant",
  chatSubtitle,
  emptyStateComponent,
  renderMessage,
  renderInput,
  settings: userSettings = {},
  customTheme,
  onClearChat,
  onExportChat,
  onMessageReaction,
  className,
  floating = false,
  minimized = false,
  onToggleMinimize,
}: ChatbotContainerProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!floating);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const settings = useMemo(() => ({ ...defaultSettings, ...userSettings }), [userSettings]);
  const { theme } = useTheme(settings.theme);
  const { searchQuery, filteredMessages, setSearchQuery } = useMessageSearch(messages);
  const voiceRecorder = useVoiceRecorder(onVoiceMessage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, settings.autoScroll]);

  // Handle voice message
  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (onVoiceMessage) {
      await onVoiceMessage(audioBlob);
    }
  };

  // Handle send message with attachments
  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    await onSendMessage(content, attachments);
  };

  // Export chat functionality
  const handleExportChat = () => {
    if (onExportChat) {
      onExportChat();
    } else {
      // Default export as JSON
      const chatData = {
        title: chatTitle,
        exportDate: new Date().toISOString(),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      };
      
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Floating chat bubble
  if (floating && !isExpanded) {
    return (
      <FloatingChatBubble
        onClick={() => setIsExpanded(true)}
        hasUnread={messages.length > 0}
        theme={theme}
        className={className}
      />
    );
  }

  const displayMessages = showSearch && searchQuery ? filteredMessages : messages;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out',
        floating ? [
          'fixed bottom-4 right-4 w-96 h-[600px] rounded-xl shadow-2xl z-50',
          'animate-in slide-in-from-bottom-4 slide-in-from-right-4'
        ] : 'h-full',
        minimized && 'h-16',
        className
      )}
      style={customTheme ? {
        '--chat-primary': customTheme.primary,
        '--chat-secondary': customTheme.secondary,
        '--chat-background': customTheme.background,
        '--chat-surface': customTheme.surface,
        '--chat-text': customTheme.text,
        '--chat-text-secondary': customTheme.textSecondary,
        '--chat-border': customTheme.border,
        '--chat-accent': customTheme.accent,
      } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {chatTitle}
            </h3>
            {chatSubtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {chatSubtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {settings.enableSearch && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showSearch 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              )}
              title="Search messages"
            >
              <Search size={16} />
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          
          {onExportChat && (
            <button
              onClick={handleExportChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Export chat"
            >
              <Download size={16} />
            </button>
          )}
          
          {onClearChat && (
            <button
              onClick={onClearChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}
          
          {floating && (
            <>
              {onToggleMinimize && (
                <button
                  onClick={onToggleMinimize}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  title={minimized ? "Expand" : "Minimize"}
                >
                  {minimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
              
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {!minimized && (
        <>
          {/* Search Bar */}
          {showSearch && (
            <ChatSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              resultCount={filteredMessages.length}
            />
          )}

          {/* Settings Panel */}
          {showSettings && (
            <ChatSettings
              settings={settings}
              onSettingsChange={(newSettings) => {
                // Handle settings change
                console.log('Settings changed:', newSettings);
              }}
              onClose={() => setShowSettings(false)}
            />
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            {displayMessages.length === 0 ? (
              emptyStateComponent || <EmptyState onSendMessage={handleSendMessage} />
            ) : (
              <VirtualizedMessageList
                messages={displayMessages}
                renderMessage={renderMessage}
                onMessageReaction={onMessageReaction}
                settings={settings}
                isLoading={isLoading}
              />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-800 dark:text-red-200 font-medium text-sm">Error</span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Input Area */}
          {renderInput ? (
            renderInput({
              onSend: handleSendMessage,
              disabled: isLoading,
              placeholder: inputPlaceholder,
              onVoiceStart: voiceRecorder.startRecording,
              onVoiceEnd: voiceRecorder.stopRecording,
            })
          ) : (
            <ChatInput
              onSend={handleSendMessage}
              onVoiceMessage={handleVoiceMessage}
              disabled={isLoading}
              placeholder={inputPlaceholder}
              enableVoice={settings.enableVoice}
              enableFileUpload={settings.enableFileUpload}
              voiceRecorder={voiceRecorder}
            />
          )}
        </>
      )}
    </div>
  );
}