import React, { useState } from 'react';
import { ReactFlowLineage, ReactFlowNode, ReactFlowEdge } from './ReactFlowLineage';
import { SchemaTableSelector } from './SchemaTableSelector';
import { useLineageReactFlow } from '../../../hooks/useLineage';
import { mockLineageReactFlowData } from '../../../services/lineageService';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Database, Table, Eye, Settings, RefreshCw, ArrowLeft } from 'lucide-react';
import type { SchemaConnection, LatestSchemaTable } from '../../../lib/types';

interface ReactFlowLineageDemoProps {
  className?: string;
}

// Column type for better type safety
interface ColumnType {
  name: string;
  type: string;
  classification?: string;
}

export function ReactFlowLineageDemo({ className = '' }: ReactFlowLineageDemoProps) {
  const [selectedEntity, setSelectedEntity] = useState("tbl_material_inventory_at_location");
  const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null);
  const [useMockData, setUseMockData] = useState(true); // Toggle for using mock data
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [selectedTable, setSelectedTable] = useState<LatestSchemaTable | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<SchemaConnection | null>(null);
  
  const { 
    data: lineageData, 
    isLoading, 
    error,
    refetch
  } = useLineageReactFlow(selectedEntity, {
    direction: 'both',
    depth: 2,
    enabled: !useMockData  // Only fetch real data when not using mock
  });

  // Use mock data when enabled, otherwise use real data
  const displayData = useMockData ? mockLineageReactFlowData : lineageData;

  const handleTableSelect = (table: LatestSchemaTable, connection: SchemaConnection) => {
    setSelectedTable(table);
    setSelectedConnection(connection);
    setSelectedEntity(`${table.schemaName}.${table.tableName}`);
    setShowTableSelector(false);
  };

  const handleBackFromSelector = () => {
    setShowTableSelector(false);
  };

  const handleNodeClick = (node: ReactFlowNode) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
  };

  const handleEdgeClick = (edge: ReactFlowEdge) => {
    console.log('Edge clicked:', edge);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'table': return <Table className="w-4 h-4 text-blue-600" />;
      case 'view': return <Eye className="w-4 h-4 text-emerald-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">React Flow Lineage Demo</h2>
          <p className="text-gray-600">Interactive data lineage with draggable nodes (RMI0002)</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={useMockData ? "primary" : "ghost"}
            size="sm"
            onClick={() => setUseMockData(!useMockData)}
          >
            {useMockData ? "Mock Data" : "Live Data"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            disabled={isLoading || useMockData}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Settings}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Table Selector */}
      {showTableSelector ? (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Table for Lineage</h3>
              <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={handleBackFromSelector}>
                Back to Demo
              </Button>
            </div>
            <SchemaTableSelector onTableSelect={handleTableSelect} />
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Selected Table:</span>
              {selectedTable && selectedConnection ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <Table className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedTable.schemaName}.{selectedTable.tableName}
                    </span>
                    <Badge variant="info" size="sm">{selectedConnection.name}</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No table selected</div>
              )}
            </div>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowTableSelector(true)}
            >
              {selectedTable ? 'Change Table' : 'Select Table'}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Lineage View */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="h-[600px] bg-gray-50">
              {!useMockData && isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading lineage data...</span>
                  </div>
                </div>
              ) : !useMockData && error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-red-600 text-lg">Error loading lineage</div>
                    <p className="text-gray-600">{error.message}</p>
                    <Button onClick={() => refetch()} variant="primary" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : !displayData || displayData.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-gray-500 text-lg">No lineage data available</div>
                    <p className="text-gray-400">Try selecting a different entity</p>
                  </div>
                </div>
              ) : (
                <ReactFlowLineage
                  nodes={displayData.nodes as ReactFlowNode[]}
                  edges={displayData.edges as ReactFlowEdge[]}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  className="w-full h-full"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Node Details Panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Node Details</h3>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {getNodeIcon(selectedNode.data?.nodeType || 'table')}
                    <span className="font-medium">{selectedNode.data?.label}</span>
                  </div>
                  <Badge variant="default" size="sm">
                    {selectedNode.data?.nodeType || 'table'}
                  </Badge>
                </div>

                {selectedNode.data?.columns && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Columns</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedNode.data.columns.map((column: ColumnType, index: number) => (
                        <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <span className="font-mono text-gray-900">{column.name}</span>
                          <span className="text-gray-500 ml-2">: {column.type}</span>
                          {column.classification && (
                            <Badge 
                              variant={getClassificationBadgeVariant(column.classification)} 
                              size="sm"
                            >
                              {column.classification}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.data?.metadata && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
                    <div className="text-xs space-y-1">
                      {Object.entries(selectedNode.data.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="text-gray-900 font-mono text-right">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Database className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>Click a node to view details</p>
              </div>
            )}
          </Card>

          {/* Statistics */}
          <Card className="p-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Nodes:</span>
                <span className="font-medium">{displayData?.nodes.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Edges:</span>
                <span className="font-medium">{displayData?.edges.length || 0}</span>
              </div>
              {selectedTable && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Columns:</span>
                  <span className="font-medium">{selectedTable.totalColumns}</span>
                </div>
              )}
              {selectedConnection && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium text-xs">{selectedConnection.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Data Source:</span>
                <span className="font-medium text-xs">{useMockData ? 'Mock' : 'Live'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Features Demo */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">React Flow Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600">✓ Draggable Nodes</h4>
            <p className="text-gray-600">Nodes can be dragged and repositioned for better visualization</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-emerald-600">✓ Zoom & Pan</h4>
            <p className="text-gray-600">Interactive zoom and pan controls for large graphs</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-purple-600">✓ Custom Nodes</h4>
            <p className="text-gray-600">Custom table nodes showing columns and metadata</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReactFlowLineageDemo;
