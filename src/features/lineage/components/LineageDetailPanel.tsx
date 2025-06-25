import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronRight, Database, BarChart3, Code, Activity } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface LineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'dashboard' | 'notebook';
  system: string;
  schema?: string;
  columns?: Array<{
    name: string;
    type: string;
    description?: string;
  }>;
  metadata?: {
    description?: string;
    owner?: string;
    lastModified?: string;
    tags?: string[];
  };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'join' | 'transformation' | 'reference';
  description?: string;
  transformationLogic?: string;
}

interface LineageDetailPanelProps {
  selectedNode: LineageNode | null;
  edges: LineageEdge[];
  nodes: LineageNode[];
  onClose?: () => void;
}

export function LineageDetailPanel({
  selectedNode,
  edges,
  nodes,
  onClose
}: LineageDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'columns' | 'lineage'>('data');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    notebooks: false,
    dashboards: false,
    transformations: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!selectedNode) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Node</h3>
          <p className="text-gray-500 max-w-sm">
            Click on any table, view, or dashboard in the lineage graph to view its details.
          </p>
        </div>
      </Card>
    );
  }

  const upstreamEdges = edges.filter(edge => edge.target === selectedNode.id);
  const downstreamEdges = edges.filter(edge => edge.source === selectedNode.id);

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedNode.schema ? `${selectedNode.schema}.${selectedNode.name}` : selectedNode.name}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={ExternalLink} />
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">{selectedNode.system}</Badge>
          <Badge variant="default">{selectedNode.type}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'data', label: 'Data' },
            { id: 'columns', label: 'Columns' },
            { id: 'lineage', label: 'Lineage' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">
                {selectedNode.metadata?.description || 'No description available'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="text-gray-900">{selectedNode.metadata?.owner || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Modified:</span>
                  <span className="text-gray-900">{selectedNode.metadata?.lastModified || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">System:</span>
                  <span className="text-gray-900">{selectedNode.system}</span>
                </div>
              </div>
            </div>

            {selectedNode.metadata?.tags && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.metadata.tags.map(tag => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'columns' && (
          <div className="space-y-4">
            {selectedNode.columns && selectedNode.columns.length > 0 ? (
              <div className="space-y-3">
                {selectedNode.columns.map(column => (
                  <div key={column.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{column.name}</span>
                      <Badge variant="default" size="sm">{column.type}</Badge>
                    </div>
                    {column.description && (
                      <p className="text-sm text-gray-600">{column.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No column information available</p>
            )}

            {/* Usage Sections */}
            <div className="space-y-2 mt-6">
              {[
                { key: 'notebooks', label: 'Notebooks', icon: Code, count: 2 },
                { key: 'dashboards', label: 'Dashboards', icon: BarChart3, count: 2 },
                { key: 'transformations', label: 'Transformations', icon: Activity, count: 1 }
              ].map(section => (
                <div key={section.key}>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex items-center justify-between w-full py-2 text-left hover:bg-gray-50 rounded px-2"
                  >
                    <div className="flex items-center space-x-2">
                      <section.icon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{section.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{section.count}</span>
                      {expandedSections[section.key] ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedSections[section.key] && (
                    <div className="pl-6 space-y-2 mt-2">
                      {/* Mock usage items */}
                      <div className="text-sm text-gray-600">
                        Sample {section.label.toLowerCase()} items would be listed here
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Upstream Dependencies</h3>
              {upstreamEdges.length > 0 ? (
                <div className="space-y-3">
                  {upstreamEdges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    return (
                      <div key={edge.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{sourceNode?.name}</span>
                          <Badge variant="info" size="sm">{edge.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{edge.description}</p>
                        {edge.transformationLogic && (
                          <code className="text-xs text-gray-700 bg-white p-2 rounded block">
                            {edge.transformationLogic}
                          </code>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No upstream dependencies</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Downstream Dependencies</h3>
              {downstreamEdges.length > 0 ? (
                <div className="space-y-3">
                  {downstreamEdges.map(edge => {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    return (
                      <div key={edge.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{targetNode?.name}</span>
                          <Badge variant="success" size="sm">{edge.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{edge.description}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No downstream dependencies</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}