'use client';

import { useState, useMemo } from 'react';
import type { ChatMessageData } from '../types';

export function useMessageSearch(messages: ChatMessageData[]) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) {
      return messages;
    }

    const query = searchQuery.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(query) ||
      message.role.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredMessages
  };
}