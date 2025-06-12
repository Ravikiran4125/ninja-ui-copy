'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Package, Star, Download, ExternalLink, Copy, Check, GitBranch, Calendar, Users } from 'lucide-react';

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  repository?: string;
  homepage?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  lastUpdated?: string;
  downloads?: number;
  stars?: number;
}

interface PackageOverviewProps {
  packageInfo: PackageInfo;
  className?: string;
}

export function PackageOverview({ packageInfo, className }: PackageOverviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText(`npm install ${packageInfo.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {packageInfo.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                {packageInfo.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              v{packageInfo.version}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {packageInfo.downloads?.toLocaleString() || 'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Stars</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {packageInfo.stars?.toLocaleString() || 'N/A'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Version</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {packageInfo.version}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {packageInfo.lastUpdated || 'Recent'}
          </p>
        </div>
      </div>

      {/* Installation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Installation</h2>
        </div>
        <div className="p-4">
          <div className="bg-gray-900 rounded-lg p-4 relative group">
            <code className="text-green-400 font-mono">npm install {packageInfo.name}</code>
            <button
              onClick={handleCopyInstall}
              className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              title="Copy command"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          
          {packageInfo.peerDependencies && Object.keys(packageInfo.peerDependencies).length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Peer Dependencies</h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <code className="text-blue-400 font-mono text-sm">
                  npm install {Object.keys(packageInfo.peerDependencies).join(' ')}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Package Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Package Info</h2>
          </div>
          <div className="p-4 space-y-3">
            {packageInfo.author && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Author:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{packageInfo.author}</span>
              </div>
            )}
            
            {packageInfo.license && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">License:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{packageInfo.license}</span>
              </div>
            )}

            {packageInfo.repository && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Repository:</span>
                <a 
                  href={packageInfo.repository} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  GitHub
                </a>
              </div>
            )}

            {packageInfo.homepage && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Homepage:</span>
                <a 
                  href={packageInfo.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Visit
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Keywords */}
        {packageInfo.keywords && packageInfo.keywords.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Keywords</h2>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {packageInfo.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dependencies */}
      {packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Dependencies</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(packageInfo.dependencies).map(([name, version]) => (
                <div key={name} className="flex justify-between items-center py-1">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{version}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}