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
    <div className="h-screen">
      <ChatbotContainer
        messages={messages}
        onSendMessage={sendMessage}
        onVoiceMessage={handleVoiceMessage}
        isLoading={loading}
        error={error}
        chatTitle="AI Crew Orchestration"
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
  );
}