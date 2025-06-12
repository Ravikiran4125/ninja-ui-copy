'use client';

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { Search, X, Hash, FileText, Code, Type } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'section' | 'method' | 'property' | 'example' | 'guide';
  content: string;
  url?: string;
  category?: string;
  relevance: number;
}

interface SearchableContentProps {
  content: SearchResult[];
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableContent({ 
  content, 
  onResultClick,
  placeholder = "Search documentation...",
  className 
}: SearchableContentProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search and filter results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results = content
      .map(item => {
        let relevance = 0;
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const contentMatch = item.content.toLowerCase().includes(searchTerm);
        
        if (titleMatch) relevance += 10;
        if (contentMatch) relevance += 5;
        if (item.category?.toLowerCase().includes(searchTerm)) relevance += 3;
        
        // Boost relevance for exact matches
        if (item.title.toLowerCase() === searchTerm) relevance += 20;
        
        return { ...item, relevance };
      })
      .filter(item => item.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    return results;
  }, [query, content]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (onResultClick) {
      onResultClick(result);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'method': return <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'property': return <Type className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'section': return <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'guide': return <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-gray-100">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={clsx(
                    'w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    index === selectedIndex && 'bg-blue-50 dark:bg-blue-900/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {highlightMatch(result.title, query)}
                        </h4>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium">
                          {result.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {highlightMatch(result.content.slice(0, 150) + '...', query)}
                      </p>
                      {result.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No results found for "{query}"
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Helper function to create searchable content from documentation - now server-compatible
export function createSearchableContent(docs: any[]): SearchResult[] {
  const results: SearchResult[] = [];

  docs.forEach(doc => {
    // Add main sections
    if (doc.sections) {
      doc.sections.forEach((section: any) => {
        results.push({
          id: `${doc.id}-${section.id}`,
          title: section.title,
          type: 'section',
          content: section.content,
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add methods
    if (doc.methods) {
      doc.methods.forEach((method: any) => {
        results.push({
          id: `${doc.id}-method-${method.name}`,
          title: method.name,
          type: 'method',
          content: method.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add properties
    if (doc.properties) {
      doc.properties.forEach((prop: any) => {
        results.push({
          id: `${doc.id}-prop-${prop.name}`,
          title: prop.name,
          type: 'property',
          content: prop.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }

    // Add examples
    if (doc.examples) {
      doc.examples.forEach((example: any, index: number) => {
        results.push({
          id: `${doc.id}-example-${index}`,
          title: example.title || `Example ${index + 1}`,
          type: 'example',
          content: example.code || example.description || '',
          category: doc.title,
          relevance: 0
        });
      });
    }
  });

  return results;
}