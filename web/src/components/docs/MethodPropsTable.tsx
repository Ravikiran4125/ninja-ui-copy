'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Search, Filter, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

interface TableRow {
  [key: string]: any;
  id: string;
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  deprecated?: boolean;
  since?: string;
  examples?: string[];
}

interface MethodPropsTableProps {
  title: string;
  description?: string;
  columns: TableColumn[];
  data: TableRow[];
  searchable?: boolean;
  filterable?: boolean;
  expandable?: boolean;
  className?: string;
}

export function MethodPropsTable({
  title,
  description,
  columns,
  data,
  searchable = true,
  filterable = true,
  expandable = true,
  className
}: MethodPropsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Filter and search data
  const filteredData = data.filter(row => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Column filters
    for (const [column, filterValue] of Object.entries(filters)) {
      if (filterValue && String(row[column]) !== filterValue) {
        return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const getUniqueValues = (column: string) => {
    return [...new Set(data.map(row => String(row[column])))].filter(Boolean);
  };

  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Controls */}
      {(searchable || filterable) && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {filterable && (
              <div className="flex gap-2">
                <select
                  value={filters.type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {getUniqueValues('type').map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>

                <select
                  value={filters.required || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, required: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Required</option>
                  <option value="false">Optional</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {expandable && <th className="w-8"></th>}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                    column.width && `w-${column.width}`
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((row) => (
              <TableRowComponent
                key={row.id}
                row={row}
                columns={columns}
                expandable={expandable}
                expanded={expandedRows.has(row.id)}
                onToggleExpansion={() => toggleRowExpansion(row.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="p-8 text-center">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {sortedData.length} of {data.length} items
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface TableRowComponentProps {
  row: TableRow;
  columns: TableColumn[];
  expandable: boolean;
  expanded: boolean;
  onToggleExpansion: () => void;
}

function TableRowComponent({ 
  row, 
  columns, 
  expandable, 
  expanded, 
  onToggleExpansion 
}: TableRowComponentProps) {
  const hasExpandableContent = row.examples && row.examples.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        {expandable && (
          <td className="px-6 py-4">
            {hasExpandableContent && (
              <button
                onClick={onToggleExpansion}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </td>
        )}
        
        {columns.map((column) => (
          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
            <TableCell row={row} column={column} />
          </td>
        ))}
      </tr>
      
      {/* Expanded Content */}
      {expanded && hasExpandableContent && (
        <tr>
          <td colSpan={columns.length + (expandable ? 1 : 0)} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-3">
              {row.examples && row.examples.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Examples</h4>
                  <div className="space-y-2">
                    {row.examples.map((example, index) => (
                      <pre key={index} className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                        <code>{example}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function TableCell({ row, column }: { row: TableRow; column: TableColumn }) {
  const value = row[column.key];

  switch (column.key) {
    case 'name':
      return (
        <div className="flex items-center gap-2">
          <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </code>
          {row.deprecated && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs">
              Deprecated
            </span>
          )}
          {row.since && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
              {row.since}
            </span>
          )}
        </div>
      );

    case 'type':
      return (
        <code className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
          {value}
        </code>
      );

    case 'required':
      return (
        <span className={clsx(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          value
            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        )}>
          {value ? 'Required' : 'Optional'}
        </span>
      );

    case 'defaultValue':
      return value !== undefined ? (
        <code className="text-sm text-gray-600 dark:text-gray-400">
          {typeof value === 'string' ? `"${value}"` : String(value)}
        </code>
      ) : (
        <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
      );

    case 'description':
      return (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {value}
          </p>
          {value && value.length > 100 && (
            <button className="text-blue-600 dark:text-blue-400 text-xs hover:underline mt-1">
              Read more
            </button>
          )}
        </div>
      );

    default:
      return (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {String(value)}
        </span>
      );
  }
}