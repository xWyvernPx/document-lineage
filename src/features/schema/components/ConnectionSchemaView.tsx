import { useState } from 'react';
import { 
  ArrowLeft,
  Table,
  Columns,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Database,
  Calendar,
  Hash,
  Type,
  Info,
  Key,
  ExternalLink,
  Download
} from 'lucide-react';

import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { useLatestSchema } from '../../../hooks/useLatestSchema';
import type { SchemaConnection, LatestSchemaTable } from '../../../lib/types';

interface ConnectionSchemaViewProps {
  connection: SchemaConnection;
  onBack: () => void;
}

export function ConnectionSchemaView({ connection, onBack }: ConnectionSchemaViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<LatestSchemaTable | null>(null);
  const [schemaFilter, setSchemaFilter] = useState<string>('all');
  const [tableTypeFilter, setTableTypeFilter] = useState<string>('all');

  // Fetch latest schema for the connection
  const {
    data: latestSchema,
    isLoading,
    error,
    refetch
  } = useLatestSchema(
    connection.connectionId,
    { includeColumns: true }
  );

  // Filter tables based on search and filters
  const filteredTables = latestSchema?.schemas.filter(table => {
    const matchesSearch = 
      table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.schemaName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSchema = schemaFilter === 'all' || table.schemaName === schemaFilter;
    const matchesType = tableTypeFilter === 'all' || table.tableType === tableTypeFilter;
    
    return matchesSearch && matchesSchema && matchesType;
  }) || [];

  // Get unique schema names for filter
  const schemaNames = [...new Set(latestSchema?.schemas.map(t => t.schemaName) || [])];

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get data type icon
  const getDataTypeIcon = (dataType: string) => {
    if (dataType.includes('INT') || dataType.includes('DECIMAL') || dataType.includes('NUMERIC')) {
      return <Hash className="w-4 h-4 text-blue-500" />;
    }
    if (dataType.includes('VARCHAR') || dataType.includes('TEXT') || dataType.includes('CHAR')) {
      return <Type className="w-4 h-4 text-green-500" />;
    }
    if (dataType.includes('DATE') || dataType.includes('TIME')) {
      return <Calendar className="w-4 h-4 text-purple-500" />;
    }
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  // Handle table selection for detailed view
  const handleViewTableDetails = (table: LatestSchemaTable) => {
    setSelectedTable(table);
  };

  // Handle back to table list
  const handleBackToTableList = () => {
    setSelectedTable(null);
  };

  if (error) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back to Connections
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Schema for {connection.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Error State */}
        <Card>
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <ExternalLink className="w-8 h-8 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Schema</h3>
            <p className="text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Unable to fetch schema information'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedTable) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={handleBackToTableList}>
              Back to Tables
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTable.schemaName}.{selectedTable.tableName}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedTable.tableType} • {selectedTable.totalColumns} columns
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={Download}>
              Export
            </Button>
          </div>
        </div>

        {/* Table Details */}
        <Card>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{selectedTable.totalColumns}</div>
                <div className="text-sm text-gray-600">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{selectedTable.tableType}</div>
                <div className="text-sm text-gray-600">Type</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {selectedTable.latest ? 'Latest' : 'Historical'}
                </div>
                <div className="text-sm text-gray-600">Version</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(selectedTable.extractionTimestamp)}
                </div>
                <div className="text-sm text-gray-600">Extracted</div>
              </div>
            </div>

            {/* Columns Table */}
            {selectedTable.columns && selectedTable.columns.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Column Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Column</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Data Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Constraints</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Default</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.columns.map((column, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getDataTypeIcon(column.dataType)}
                              <div>
                                <div className="font-medium text-gray-900">{column.columnName}</div>
                                <div className="text-sm text-gray-500">Position {column.columnPosition}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm text-gray-900">
                              {column.dataType}
                              {column.maxLength && `(${column.maxLength})`}
                              {column.precision && column.scale && `(${column.precision},${column.scale})`}
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {column.isPrimaryKey && <Badge variant="warning" size="sm">PK</Badge>}
                              {column.isForeignKey && <Badge variant="info" size="sm">FK</Badge>}
                              {!column.isNullable && <Badge variant="default" size="sm">NOT NULL</Badge>}
                            </div>
                          </td>
                          
                          <td className="py-4 px-4">
                            {column.defaultValue ? (
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {column.defaultValue}
                              </code>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          
                          <td className="py-4 px-4">
                            {column.description ? (
                              <span className="text-sm text-gray-600">{column.description}</span>
                            ) : (
                              <span className="text-gray-400">No description</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Connections
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Schema for {connection.name}
            </h2>
            {latestSchema && (
              <p className="text-sm text-gray-600">
                {latestSchema.statistics.totalTables} tables • {latestSchema.statistics.totalColumns} columns • 
                Last extracted: {formatDate(latestSchema.extractionTimestamp)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetch()}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" icon={Download}>
            Export Schema
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {latestSchema && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{latestSchema.statistics.totalTables}</div>
                <div className="text-sm text-gray-600">Tables</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{latestSchema.statistics.totalColumns}</div>
                <div className="text-sm text-gray-600">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{latestSchema.statistics.schemaNames.length}</div>
                <div className="text-sm text-gray-600">Schemas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{latestSchema.statistics.tableTypes.length}</div>
                <div className="text-sm text-gray-600">Table Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{latestSchema.statistics.databaseGroups}</div>
                <div className="text-sm text-gray-600">Databases</div>
              </div>
            </div>
          </div>
        </Card>
      )}

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
              
              <select
                value={tableTypeFilter}
                onChange={(e) => setTableTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="TABLE">Tables</option>
                <option value="VIEW">Views</option>
                <option value="MATERIALIZED_VIEW">Materialized Views</option>
              </select>
              
              <Button variant="ghost" size="sm" icon={Filter}>
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <div className="p-6 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading schema...</p>
          </div>
        </Card>
      )}

      {/* Tables List */}
      {!isLoading && latestSchema && (
        <div className="space-y-4">
          {filteredTables.length > 0 ? (
            filteredTables.map((table) => (
              <Card key={table.systemId} hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Table className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {table.schemaName}.{table.tableName}
                          </h3>
                          <Badge variant={table.tableType === 'TABLE' ? 'default' : 'info'} size="sm">
                            {table.tableType}
                          </Badge>
                          {table.latest && (
                            <Badge variant="success" size="sm">Latest</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Columns:</span>
                            <p className="font-medium text-gray-900">{table.totalColumns}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Database:</span>
                            <p className="font-medium text-gray-900">{table.databaseName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Version:</span>
                            <p className="font-medium text-gray-900">{table.version.split('T')[0]}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Extracted:</span>
                            <p className="font-medium text-gray-900">{formatDate(table.extractionTimestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewTableDetails(table)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Columns}
                        onClick={() => handleViewTableDetails(table)}
                      >
                        View Columns
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="p-6 text-center">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tables found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || schemaFilter !== 'all' || tableTypeFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'This connection has no schema tables available.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
