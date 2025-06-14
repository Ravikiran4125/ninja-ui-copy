"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { ChatbotContainer } from "@/components/chatbot";
import type { ChatMessageData, FileAttachment } from "@/components/chatbot/types";

export default function ClanDemoPage() {
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
      const res = await fetch("/api/clan-orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content }] }),
      });

      const data = await res.json();
      
      if (res.ok) {
        const assistantMessage: ChatMessageData = {
          id: generateMessageId(),
          role: "assistant",
          content: data.response || "I apologize, but I couldn't generate a response from the clan.",
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
    const voiceMessage: ChatMessageData = {
      id: generateMessageId(),
      role: "user",
      content: "[Voice message - transcription not implemented yet]",
      timestamp: new Date(),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, voiceMessage]);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clan Demo</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Multi-Agent Collaborative Analysis</p>
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
            🏛️ Clan Orchestration Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Experience multi-agent collaboration where different AI specialists work together to provide comprehensive analysis. 
            This demo showcases a clan of three experts:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">🔬 Research Director</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Leads comprehensive research and analysis</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100">⚙️ Technical Analyst</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Evaluates technical feasibility and architecture</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">📊 Business Analyst</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Provides strategic business insights</p>
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
            chatTitle="Clan Analysis Team"
            chatSubtitle="Collaborative Multi-Agent Intelligence"
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