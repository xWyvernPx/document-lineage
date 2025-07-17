import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Table, 
  Eye, 
  Database, 
  Cloud, 
  Server, 
  HardDrive, 
  Layers,
  Calendar,
  Hash,
  Type,
  Key,
  Info,
  Shield
} from 'lucide-react';
import { Badge } from '../../../components/Badge';

interface TableNodeData {
  label: string;
  nodeType: 'table' | 'view' | 'dashboard' | 'notebook';
  columns?: Array<{
    name: string;
    type: string;
    classification?: string;
  }>;
  metadata?: {
    businessOwner?: string;
    description?: string;
    system?: string;
    tableType?: string;
    databaseType?: string;
  };
}

interface TableNodeProps {
  data: TableNodeData;
  selected?: boolean;
}

// Database icon and color mapping
const getDatabaseIconConfig = (databaseType?: string) => {
  const configs = {
    postgresql: {
      icon: Database,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      label: 'PostgreSQL'
    },
    mysql: {
      icon: Database,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      label: 'MySQL'
    },
    snowflake: {
      icon: Cloud,
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      borderColor: 'border-cyan-200',
      label: 'Snowflake'
    },
    bigquery: {
      icon: Layers,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200',
      label: 'BigQuery'
    },
    redshift: {
      icon: Server,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200',
      label: 'Redshift'
    },
    oracle: {
      icon: HardDrive,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      label: 'Oracle'
    }
  };
  
  const defaultType = databaseType?.toLowerCase() as keyof typeof configs;
  return configs[defaultType] || {
    icon: Database,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    label: 'Database'
  };
};

// Get node type icon and colors
const getNodeTypeConfig = (nodeType: string) => {
  switch (nodeType) {
    case 'table':
      return {
        icon: Table,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      };
    case 'view':
      return {
        icon: Eye,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200'
      };
    default:
      return {
        icon: Database,
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      };
  }
};

// Get data type icon
const getDataTypeIcon = (dataType: string) => {
  if (dataType.includes('int') || dataType.includes('decimal') || dataType.includes('numeric') || dataType.includes('bigint')) {
    return <Hash className="w-3 h-3 text-blue-500" />;
  }
  if (dataType.includes('string') || dataType.includes('varchar') || dataType.includes('text') || dataType.includes('char')) {
    return <Type className="w-3 h-3 text-green-500" />;
  }
  if (dataType.includes('date') || dataType.includes('time') || dataType.includes('timestamp')) {
    return <Calendar className="w-3 h-3 text-purple-500" />;
  }
  if (dataType.includes('boolean')) {
    return <Shield className="w-3 h-3 text-amber-500" />;
  }
  return <Info className="w-3 h-3 text-gray-500" />;
};

// Get classification badge variant
const getClassificationBadgeVariant = (classification: string) => {
  switch (classification) {
    case 'PII': return 'error';
    case 'IDENTIFIER': return 'warning'; 
    case 'AUDIT_TIMESTAMP':
    case 'AUDIT_USER': return 'info';
    case 'STATUS_FLAG': return 'success';
    default: return 'default';
  }
};

export function TableNodeComponent({ data, selected }: TableNodeProps) {
  const nodeTypeConfig = getNodeTypeConfig(data.nodeType);
  const dbConfig = getDatabaseIconConfig(data.metadata?.system?.toLowerCase());
  const NodeTypeIcon = nodeTypeConfig.icon;
  const DatabaseIcon = dbConfig.icon;

  // Show max 5 columns in the node
  const visibleColumns = data.columns?.slice(0, 5) || [];
  const hasMoreColumns = (data.columns?.length || 0) > 5;

  return (
    <div 
      className={`
        bg-white border-2 rounded-lg shadow-lg min-w-[280px] max-w-[320px]
        ${selected ? 'border-blue-500 shadow-blue-200' : nodeTypeConfig.borderColor}
        hover:shadow-xl transition-all duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      
      {/* Header */}
      <div className={`${nodeTypeConfig.bgColor} ${nodeTypeConfig.borderColor} border-b px-4 py-3 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <NodeTypeIcon className={`w-4 h-4 ${nodeTypeConfig.iconColor}`} />
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {data.label}
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            {data.metadata?.system && (
              <div 
                className={`p-1 rounded ${dbConfig.bgColor}`}
                title={dbConfig.label}
              >
                <DatabaseIcon className={`w-3 h-3 ${dbConfig.iconColor}`} />
              </div>
            )}
            <Badge variant="default" size="sm">
              {data.nodeType}
            </Badge>
          </div>
        </div>
        
        {/* System Information */}
        {data.metadata?.system && (
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">{dbConfig.label}</span>
            {data.metadata.businessOwner && (
              <span className="ml-2">• {data.metadata.businessOwner}</span>
            )}
          </div>
        )}
      </div>

      {/* Columns */}
      {visibleColumns.length > 0 && (
        <div className="px-4 py-3">
          <div className="space-y-1.5">
            {visibleColumns.map((column, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getDataTypeIcon(column.type)}
                  <span className="font-mono text-gray-900 truncate">
                    {column.name}
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {column.type}
                  </span>
                </div>
                {column.classification && (
                  <Badge 
                    variant={getClassificationBadgeVariant(column.classification)} 
                    size="sm"
                  >
                    {column.classification.substring(0, 3)}
                  </Badge>
                )}
              </div>
            ))}
            
            {hasMoreColumns && (
              <div className="text-xs text-gray-500 text-center pt-1 border-t border-gray-100">
                +{(data.columns?.length || 0) - 5} more columns
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      {data.metadata?.description && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <p className="text-xs text-gray-600 truncate" title={data.metadata.description}>
            {data.metadata.description}
          </p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </div>
  );
}

export default TableNodeComponent;
