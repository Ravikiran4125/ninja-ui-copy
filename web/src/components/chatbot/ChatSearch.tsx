'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
  onClose?: () => void;
}

export function ChatSearch({ 
  query, 
  onQueryChange, 
  resultCount, 
  totalCount,
  onClose 
}: ChatSearchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [query, resultCount]);

  const handleNext = () => {
    if (resultCount > 0) {
      setCurrentIndex((prev) => (prev + 1) % resultCount);
    }
  };

  const handlePrevious = () => {
    if (resultCount > 0) {
      setCurrentIndex((prev) => (prev - 1 + resultCount) % resultCount);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
      <div className="flex items-center gap-3 p-3">
        <div className="flex items-center gap-2 flex-1">
          <Search size={16} className="text-gray-500 dark:text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search messages..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {query && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resultCount > 0 ? `${currentIndex + 1} of ${resultCount}` : 'No results'}
            </span>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                disabled={resultCount === 0}
                className={clsx(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  resultCount === 0 
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                title="Previous result (Shift+Enter)"
              >
                <ChevronUp size={16} />
              </button>
              
              <button
                onClick={handleNext}
                disabled={resultCount === 0}
                className={clsx(
                  'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
                  resultCount === 0 
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400'
                )}
                title="Next result (Enter)"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Close search (Esc)"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}