import React, { useState } from 'react';
import { ReactFlowLineage } from './ReactFlowLineage';
import { useLineageReactFlow } from '../../../hooks/useLineage';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Database, Table, Eye, Settings, RefreshCw } from 'lucide-react';

interface ReactFlowLineageDemoProps {
  className?: string;
}

export function ReactFlowLineageDemo({ className = '' }: ReactFlowLineageDemoProps) {
  const [selectedEntity, setSelectedEntity] = useState("tbl_account");
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  const { 
    data: lineageData, 
    isLoading, 
    error,
    refetch
  } = useLineageReactFlow(selectedEntity, {
    direction: 'both',
    depth: 2
  });

  const entities = [
    { id: "tbl_account", name: "Account Table", type: "table" },
    { id: "tbl_payment", name: "Payment Table", type: "table" },
    { id: "view_customer_summary", name: "Customer Summary", type: "view" },
  ];

  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node);
    setSelectedNode(node);
  };

  const handleEdgeClick = (edge: any) => {
    console.log('Edge clicked:', edge);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'table': return <Table className="w-4 h-4 text-blue-600" />;
      case 'view': return <Eye className="w-4 h-4 text-emerald-600" />;
      default: return <Database className="w-4 h-4 text-gray-600" />;
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
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={() => refetch()}
            disabled={isLoading}
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

      {/* Entity Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Select Entity:</span>
          <div className="flex space-x-2">
            {entities.map(entity => (
              <Button
                key={entity.id}
                variant={selectedEntity === entity.id ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedEntity(entity.id)}
                className="flex items-center space-x-2"
              >
                {getNodeIcon(entity.type)}
                <span>{entity.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Lineage View */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            <div className="h-[600px] bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading lineage data...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-red-600 text-lg">Error loading lineage</div>
                    <p className="text-gray-600">{error.message}</p>
                    <Button onClick={() => refetch()} variant="primary" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : !lineageData || lineageData.nodes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-gray-500 text-lg">No lineage data available</div>
                    <p className="text-gray-400">Try selecting a different entity</p>
                  </div>
                </div>
              ) : (
                <ReactFlowLineage
                  nodes={lineageData.nodes}
                  edges={lineageData.edges}
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
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.data?.nodeType || 'table'}
                  </Badge>
                </div>

                {selectedNode.data?.columns && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Columns</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedNode.data.columns.map((column: any, index: number) => (
                        <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <span className="font-mono text-gray-900">{column.name}</span>
                          <span className="text-gray-500 ml-2">: {column.type}</span>
                          {column.classification && (
                            <Badge variant="outline" className="ml-2 text-xs">
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
                <span className="font-medium">{lineageData?.nodes.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Edges:</span>
                <span className="font-medium">{lineageData?.edges.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Entity:</span>
                <span className="font-medium text-xs">{selectedEntity}</span>
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
