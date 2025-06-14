'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { FileText, Search, BookOpen, ExternalLink } from 'lucide-react';
import { MarkdownRenderer } from '../ui/markdown-renderer';

interface LegacyDoc {
  id: string;
  title: string;
  content: string;
  category?: string;
  lastModified?: Date;
  tags?: string[];
}

interface LegacyDocsRendererProps {
  docs: LegacyDoc[];
  className?: string;
}

export function LegacyDocsRenderer({ docs, className }: LegacyDocsRendererProps) {
  const [selectedDoc, setSelectedDoc] = useState<LegacyDoc | null>(docs[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(docs.map(doc => doc.category).filter(Boolean))];

  // Filter docs
  const filteredDocs = docs.filter(doc => {
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return doc.title.toLowerCase().includes(query) || 
             doc.content.toLowerCase().includes(query) ||
             doc.tags?.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Legacy Documentation
              </h3>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.length === 0 ? (
              <div className="p-4 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No documents found
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={clsx(
                      'w-full text-left p-3 rounded-lg transition-colors',
                      selectedDoc?.id === doc.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {doc.title}
                        </h4>
                        {doc.category && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {doc.category}
                          </span>
                        )}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{doc.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {selectedDoc ? (
            <>
              {/* Document Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {selectedDoc.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      {selectedDoc.category && (
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {selectedDoc.category}
                        </span>
                      )}
                      {selectedDoc.lastModified && (
                        <span>
                          Updated {selectedDoc.lastModified.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                    <ExternalLink size={16} />
                  </button>
                </div>

                {/* Tags */}
                {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedDoc.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <MarkdownRenderer 
                  content={selectedDoc.content}
                  className="max-w-none"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a document
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a document from the sidebar to view its content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to convert markdown files to LegacyDoc format - now server-compatible
export function createLegacyDocsFromMarkdown(markdownFiles: Array<{
  filename: string;
  content: string;
  frontmatter?: Record<string, any>;
}>): LegacyDoc[] {
  return markdownFiles.map((file, index) => ({
    id: `doc-${index}`,
    title: file.frontmatter?.title || file.filename.replace('.md', ''),
    content: file.content,
    category: file.frontmatter?.category || 'General',
    lastModified: file.frontmatter?.lastModified ? new Date(file.frontmatter.lastModified) : new Date(),
    tags: file.frontmatter?.tags || []
  }));
}