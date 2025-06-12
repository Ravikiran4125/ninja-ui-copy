'use client';

import { MessageSquare, Sparkles, Zap, Brain } from 'lucide-react';
import type { FileAttachment } from './types';

interface EmptyStateProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
}

const quickActions = [
  {
    icon: Brain,
    title: "AI Research",
    description: "Get comprehensive research on any topic",
    prompt: "Research the latest developments in artificial intelligence and their impact on business"
  },
  {
    icon: Zap,
    title: "Quick Analysis",
    description: "Analyze data or concepts quickly",
    prompt: "Help me understand the key differences between machine learning and deep learning"
  },
  {
    icon: Sparkles,
    title: "Creative Writing",
    description: "Generate creative content and ideas",
    prompt: "Write a creative story about a robot learning to paint"
  },
  {
    icon: MessageSquare,
    title: "General Chat",
    description: "Have a conversation about anything",
    prompt: "Tell me something interesting about space exploration"
  }
];

export function EmptyState({ onSendMessage }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full mb-6">
        <MessageSquare className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        Welcome to AI Assistant
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Start a conversation with our AI research director. Ask questions, get analysis, 
        or explore any topic you're curious about.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onSendMessage(action.prompt)}
            className="group p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <action.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        💡 Tip: You can also use voice recording, file uploads, and search through your chat history
      </div>
    </div>
  );
}