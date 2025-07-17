import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Database, Table, Eye, MoreHorizontal } from 'lucide-react';

// Data structure for our custom table node
export interface TableNodeData {
  label: string;
  nodeType: 'table' | 'view' | 'dashboard' | 'notebook';
  schema?: string;
  database?: string;
  columns?: Array<{
    name: string;
    type: string;
    description?: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
  }>;
  metadata?: Record<string, any>;
}

// Type for our custom table node
export type TableNode = Node<TableNodeData>;

// Custom Table Node Component
export function TableNodeComponent({ data, selected }: NodeProps<TableNodeData>) {
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'table':
        return <Table className="w-4 h-4 text-blue-600" />;
      case 'view':
        return <Eye className="w-4 h-4 text-emerald-600" />;
      case 'dashboard':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'notebook':
        return <Database className="w-4 h-4 text-amber-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNodeColor = (nodeType: string) => {
    switch (nodeType) {
      case 'table':
        return 'border-blue-500 bg-blue-50';
      case 'view':
        return 'border-emerald-500 bg-emerald-50';
      case 'dashboard':
        return 'border-purple-500 bg-purple-50';
      case 'notebook':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const columnCount = data.columns?.length || 0;
  const displayColumns = data.columns?.slice(0, 5) || []; // Show max 5 columns
  const hasMoreColumns = columnCount > 5;

  return (
    <div
      className={`
        min-w-48 max-w-80 bg-white rounded-lg border-2 shadow-lg
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${getNodeColor(data.nodeType)}
        hover:shadow-xl transition-all duration-200
      `}
    >
      {/* Node header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            {getNodeIcon(data.nodeType)}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {data.label}
              </h3>
              {data.schema && (
                <p className="text-xs text-gray-500 truncate">
                  {data.database ? `${data.database}.${data.schema}` : data.schema}
                </p>
              )}
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Columns list */}
      {displayColumns.length > 0 && (
        <div className="p-2">
          <div className="space-y-1">
            {displayColumns.map((column, index) => (
              <div
                key={`${column.name}-${index}`}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    {column.isPrimaryKey && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Primary Key" />
                    )}
                    {column.isForeignKey && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" title="Foreign Key" />
                    )}
                  </div>
                  <span className="font-medium text-gray-700 truncate">
                    {column.name}
                  </span>
                </div>
                <span className="text-gray-500 text-xs ml-2 flex-shrink-0">
                  {column.type}
                </span>
              </div>
            ))}
            {hasMoreColumns && (
              <div className="text-xs text-gray-500 italic">
                +{columnCount - 5} more columns
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
}

// Default export for React Flow nodeTypes
export default TableNodeComponent;
