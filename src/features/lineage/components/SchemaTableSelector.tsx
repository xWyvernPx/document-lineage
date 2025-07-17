import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ChevronDown,
  Eye,
  Table,
  Cloud,
  Server,
  HardDrive,
  Layers,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { useConnections } from '../../../hooks/useConnections';
import { useLatestSchema } from '../../../hooks/useLatestSchema';
import { useConnectionStore } from '../../../stores/connectionStore';
import type { SchemaConnection, LatestSchemaTable } from '../../../lib/types';

interface SchemaTableSelectorProps {
  onTableSelect: (table: LatestSchemaTable, connection: SchemaConnection) => void;
  className?: string;
}

// Database icon and color mapping
const getDatabaseIconConfig = (databaseType: string) => {
  const configs = {
    postgresql: {
      icon: Database,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'PostgreSQL'
    },
    mysql: {
      icon: Database,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      label: 'MySQL'
    },
    snowflake: {
      icon: Cloud,
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      label: 'Snowflake'
    },
    bigquery: {
      icon: Layers,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      label: 'BigQuery'
    },
    redshift: {
      icon: Server,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      label: 'Redshift'
    },
    oracle: {
      icon: HardDrive,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      label: 'Oracle'
    }
  };
  
  return configs[databaseType as keyof typeof configs] || {
    icon: Database,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    label: databaseType?.charAt(0).toUpperCase() + databaseType?.slice(1) || 'Unknown'
  };
};

export function SchemaTableSelector({ onTableSelect, className = '' }: SchemaTableSelectorProps) {
  const [selectedConnection, setSelectedConnection] = useState<SchemaConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [schemaFilter, setSchemaFilter] = useState<string>('all');

  // Use connection store and hooks
  const { filters, setFilters } = useConnectionStore();
  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } = useConnections(filters);

  // Fetch schema data for selected connection
  const {
    data: latestSchema,
    isLoading: schemaLoading,
    error: schemaError,
    refetch: refetchSchema
  } = useLatestSchema(
    selectedConnection?.connectionId || '',
    { 
      includeColumns: true,
      enabled: !!selectedConnection 
    }
  );

  // Filter tables based on search and filters
  const filteredTables = latestSchema?.schemas.filter(table => {
    const matchesSearch = 
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.schemaName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSchema = schemaFilter === 'all' || table.schemaName === schemaFilter;
    
    return matchesSearch && matchesSchema;
  }) || [];

  // Get unique schema names for filter
  const schemaNames = [...new Set(latestSchema?.schemas.map(t => t.schemaName) || [])];

  const handleConnectionSelect = (connection: SchemaConnection) => {
    setSelectedConnection(connection);
    setSearchQuery('');
    setSchemaFilter('all');
  };

  const handleBackToConnections = () => {
    setSelectedConnection(null);
    setSearchQuery('');
    setSchemaFilter('all');
  };

  const handleTableSelect = (table: LatestSchemaTable) => {
    if (selectedConnection) {
      onTableSelect(table, selectedConnection);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedConnection) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={handleBackToConnections}>
              Back to Connections
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tables in {selectedConnection.name}
              </h3>
              {latestSchema && (
                <p className="text-sm text-gray-600">
                  {latestSchema.statistics.totalTables} tables • {latestSchema.statistics.totalColumns} columns
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetchSchema()}>
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={schemaFilter}
                  onChange={(e) => setSchemaFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Schemas</option>
                  {schemaNames.map(schema => (
                    <option key={schema} value={schema}>{schema}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {schemaLoading && (
          <Card>
            <div className="p-6 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-2 text-gray-600">Loading tables...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {schemaError && (
          <Card>
            <div className="p-6 text-center">
              <div className="text-red-500 mb-2">
                <Database className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Tables</h3>
              <p className="text-gray-600 mb-4">
                {schemaError instanceof Error ? schemaError.message : 'Unable to fetch table information'}
              </p>
              <Button variant="primary" onClick={() => refetchSchema()}>
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Tables List */}
        {!schemaLoading && !schemaError && latestSchema && (
          <div className="space-y-3">
            {filteredTables.length > 0 ? (
              filteredTables.map((table) => (
                <Card key={table.systemId} hover className="cursor-pointer" onClick={() => handleTableSelect(table)}>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Table className="w-4 h-4 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {table.schemaName}.{table.tableName}
                            </h4>
                            <Badge variant={table.tableType === 'TABLE' ? 'default' : 'info'} size="sm">
                              {table.tableType}
                            </Badge>
                            {table.latest && (
                              <Badge variant="success" size="sm">Latest</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{table.totalColumns} columns</span>
                            <span>•</span>
                            <span>{formatDate(table.extractionTimestamp)}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTableSelect(table);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <div className="p-6 text-center">
                  <Table className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || schemaFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'This connection has no tables available.'}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // Connection Selection View
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Select Database Connection</h3>
          <p className="text-sm text-gray-600">Choose a connection to view its tables for lineage analysis</p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetchConnections()}>
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search connections..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {connectionsLoading && (
        <Card>
          <div className="p-6 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading connections...</p>
          </div>
        </Card>
      )}

      {/* Connections List */}
      {!connectionsLoading && connections?.connections && (
        <div className="space-y-3">
          {connections.connections.length > 0 ? (
            connections.connections.map(connection => {
              const dbConfig = getDatabaseIconConfig(connection.databaseType);
              const IconComponent = dbConfig.icon;
              
              return (
                <Card 
                  key={connection.connectionId} 
                  hover 
                  className="cursor-pointer" 
                  onClick={() => handleConnectionSelect(connection)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${dbConfig.bgColor}`}>
                          <IconComponent className={`w-5 h-5 ${dbConfig.iconColor}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{connection.name}</h4>
                            <Badge variant="success" size="sm">{connection.status}</Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{dbConfig.label}</span>
                            <span>•</span>
                            <span>{connection.databaseName}</span>
                            {connection.description && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-xs">{connection.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectionSelect(connection);
                        }}
                      >
                        View Tables
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card>
              <div className="p-6 text-center">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.search
                    ? 'Try adjusting your search query.'
                    : 'No database connections are configured.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 