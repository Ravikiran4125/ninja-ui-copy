'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, Code, Type, FunctionSquare as Function, Hash, Eye, EyeOff } from 'lucide-react';
import { MarkdownRenderer } from '../ui/markdown-renderer';

interface TypeDefinition {
  name: string;
  type: 'interface' | 'type' | 'class' | 'function' | 'enum';
  description?: string;
  properties?: PropertyDefinition[];
  methods?: MethodDefinition[];
  parameters?: ParameterDefinition[];
  returnType?: string;
  examples?: string[];
  deprecated?: boolean;
  since?: string;
}

interface PropertyDefinition {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  readonly?: boolean;
  deprecated?: boolean;
}

interface MethodDefinition {
  name: string;
  description?: string;
  parameters?: ParameterDefinition[];
  returnType?: string;
  examples?: string[];
  deprecated?: boolean;
  static?: boolean;
}

interface ParameterDefinition {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  defaultValue?: string;
}

interface APIReferenceProps {
  definitions: TypeDefinition[];
  className?: string;
}

export function APIReference({ definitions, className }: APIReferenceProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeprecated, setShowDeprecated] = useState(false);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const categories = ['all', 'interface', 'type', 'class', 'function', 'enum'];
  
  const filteredDefinitions = definitions.filter(def => {
    if (selectedCategory !== 'all' && def.type !== selectedCategory) return false;
    if (!showDeprecated && def.deprecated) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interface': return <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'type': return <Hash className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'class': return <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'function': return <Function className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'enum': return <Hash className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default: return <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">API Reference</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete TypeScript API documentation with types, interfaces, and examples.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeprecated(!showDeprecated)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              showDeprecated
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {showDeprecated ? <Eye size={16} /> : <EyeOff size={16} />}
            {showDeprecated ? 'Hide' : 'Show'} Deprecated
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* API Items */}
      <div className="space-y-4">
        {filteredDefinitions.map((definition) => (
          <APIItem
            key={definition.name}
            definition={definition}
            expanded={expandedItems.has(definition.name)}
            onToggle={() => toggleExpanded(definition.name)}
            getTypeIcon={getTypeIcon}
          />
        ))}
      </div>

      {filteredDefinitions.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No API definitions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
}

interface APIItemProps {
  definition: TypeDefinition;
  expanded: boolean;
  onToggle: () => void;
  getTypeIcon: (type: string) => React.ReactNode;
}

function APIItem({ definition, expanded, onToggle, getTypeIcon }: APIItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(definition.type)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {definition.name}
                </h3>
                {definition.deprecated && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs font-medium">
                    Deprecated
                  </span>
                )}
                {definition.since && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                    Since {definition.since}
                  </span>
                )}
              </div>
              {definition.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {definition.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-mono">
              {definition.type}
            </span>
            {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Properties */}
          {definition.properties && definition.properties.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Properties</h4>
              <div className="space-y-3">
                {definition.properties.map((prop) => (
                  <PropertyItem key={prop.name} property={prop} />
                ))}
              </div>
            </div>
          )}

          {/* Methods */}
          {definition.methods && definition.methods.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Methods</h4>
              <div className="space-y-4">
                {definition.methods.map((method) => (
                  <MethodItem key={method.name} method={method} />
                ))}
              </div>
            </div>
          )}

          {/* Parameters (for functions) */}
          {definition.parameters && definition.parameters.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Parameters</h4>
              <div className="space-y-3">
                {definition.parameters.map((param) => (
                  <ParameterItem key={param.name} parameter={param} />
                ))}
              </div>
            </div>
          )}

          {/* Return Type */}
          {definition.returnType && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Returns</h4>
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {definition.returnType}
              </code>
            </div>
          )}

          {/* Examples */}
          {definition.examples && definition.examples.length > 0 && (
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Examples</h4>
              <div className="space-y-4">
                {definition.examples.map((example, index) => (
                  <MarkdownRenderer
                    key={index}
                    content={`\`\`\`typescript\n${example}\n\`\`\``}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PropertyItem({ property }: { property: PropertyDefinition }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {property.name}
          </code>
          {property.optional && (
            <span className="text-xs text-gray-500 dark:text-gray-400">optional</span>
          )}
          {property.readonly && (
            <span className="text-xs text-blue-600 dark:text-blue-400">readonly</span>
          )}
          {property.deprecated && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">deprecated</span>
          )}
        </div>
        <code className="text-sm text-blue-600 dark:text-blue-400 mt-1 block">
          {property.type}
        </code>
        {property.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {property.description}
          </p>
        )}
      </div>
    </div>
  );
}

function MethodItem({ method }: { method: MethodDefinition }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {method.name}()
        </code>
        {method.static && (
          <span className="text-xs text-purple-600 dark:text-purple-400">static</span>
        )}
        {method.deprecated && (
          <span className="text-xs text-yellow-600 dark:text-yellow-400">deprecated</span>
        )}
      </div>
      
      {method.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {method.description}
        </p>
      )}

      {method.parameters && method.parameters.length > 0 && (
        <div className="ml-4 space-y-1">
          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">Parameters:</h5>
          {method.parameters.map((param) => (
            <ParameterItem key={param.name} parameter={param} />
          ))}
        </div>
      )}

      {method.returnType && (
        <div className="ml-4">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Returns: </span>
          <code className="text-xs text-blue-600 dark:text-blue-400">{method.returnType}</code>
        </div>
      )}
    </div>
  );
}

function ParameterItem({ parameter }: { parameter: ParameterDefinition }) {
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2">
        <code className="font-medium text-gray-900 dark:text-gray-100">
          {parameter.name}
        </code>
        {parameter.optional && (
          <span className="text-xs text-gray-500 dark:text-gray-400">optional</span>
        )}
        <code className="text-blue-600 dark:text-blue-400">{parameter.type}</code>
        {parameter.defaultValue && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            = {parameter.defaultValue}
          </span>
        )}
      </div>
      {parameter.description && (
        <p className="text-gray-600 dark:text-gray-400 mt-1 ml-2">
          {parameter.description}
        </p>
      )}
    </div>
  );
}