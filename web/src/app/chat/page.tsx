"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { ChatbotContainer } from "@/components/chatbot";
import type { ChatMessageData, FileAttachment } from "@/components/chatbot/types";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = async (content: string, attachments?: FileAttachment[]) => {
    setError(null);
    
    const userMessage: ChatMessageData = {
      id: generateMessageId(),
      role: "user",
      content,
      timestamp: new Date(),
      status: 'sent',
      attachments
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content }] }),
      });

      const data = await res.json();
      
      if (res.ok) {
        const assistantMessage: ChatMessageData = {
          id: generateMessageId(),
          role: "assistant",
          content: data.response || "I apologize, but I couldn't generate a response.",
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(data.error || "An unexpected error occurred");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    // For now, just show a placeholder message
    const voiceMessage: ChatMessageData = {
      id: generateMessageId(),
      role: "user",
      content: "[Voice message - transcription not implemented yet]",
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, voiceMessage]);
    
    // You would typically send the audio blob to a speech-to-text service here
    console.log('Voice message received:', audioBlob);
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleMessageReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const hasReaction = reactions.includes(reaction);
        return {
          ...msg,
          reactions: hasReaction 
            ? reactions.filter(r => r !== reaction)
            : [...reactions, reaction]
        };
      }
      return msg;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Single Shinobi Demo</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI Research Director with Multiple Skills</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                ← Back to Home
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🥷 Single Shinobi Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Experience a single AI agent (Shinobi) that orchestrates multiple specialized skills (Kata) to provide comprehensive analysis. 
            This Research Director has expertise in:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">🔬 Research Analysis</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Comprehensive research and data analysis</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">✍️ Content Creation</h3>
              <p className="text-sm text-green-700 dark:text-green-300">High-quality content and documentation</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">📝 Technical Writing</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Clear technical documentation and guides</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="h-[600px]">
          <ChatbotContainer
            messages={messages}
            onSendMessage={sendMessage}
            onVoiceMessage={handleVoiceMessage}
            isLoading={loading}
            error={error}
            chatTitle="AI Research Director"
            chatSubtitle="Powered by Ninja Agents SDK"
            onClearChat={handleClearChat}
            onMessageReaction={handleMessageReaction}
            settings={{
              theme: 'auto',
              enableVoice: true,
              enableFileUpload: true,
              enableReactions: true,
              enableSearch: true,
              autoScroll: true,
              showTimestamps: true,
              messageLimit: 1000
            }}
          />
        </div>
      </main>
    </div>
  );
}