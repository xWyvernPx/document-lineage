import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  FileText,
  BookOpen,
  Database,
  Table,
  GitBranch,
  Network,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Edit3,
  Tag,
  TrendingUp,
  Activity,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Lightbulb,
  Zap,
  X,
  ArrowRight,
  Grid3X3
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

// Simplified data structures for lineage
interface LineageNode {
  id: string;
  name: string;
  type: 'document' | 'term' | 'schema' | 'table' | 'service';
  description: string;
  confidence: number;
  status: 'active' | 'deprecated' | 'pending';
  owner: string;
  lastModified: string;
  tags: string[];
  position: { x: number; y: number };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-from' | 'maps-to' | 'depends-on' | 'contains';
  label: string;
  confidence: number;
}

// Simplified mock data
const simpleMockData = {
  nodes: [
    // Document
    {
      id: 'doc-1',
      name: 'DPG Middleware Specification',
      type: 'document',
      description: 'Technical specification for DPG middleware integration with NAPAS',
      confidence: 94,
      status: 'active',
      owner: 'Technical Architecture Team',
      lastModified: '2024-01-15T09:30:00Z',
      tags: ['technical', 'middleware', 'napas'],
      position: { x: 100, y: 200 }
    },
    
    // Business Term
    {
      id: 'term-1',
      name: 'Message Routing Engine',
      type: 'term',
      description: 'Core component responsible for directing ACH messages between services',
      confidence: 96,
      status: 'active',
      owner: 'Data Governance Team',
      lastModified: '2024-01-15T15:30:00Z',
      tags: ['routing', 'ach', 'middleware', 'preferred'],
      position: { x: 400, y: 200 }
    },
    
    // Database Schema
    {
      id: 'schema-1',
      name: 'dpg_middleware',
      type: 'schema',
      description: 'Database schema for DPG middleware configuration and routing',
      confidence: 95,
      status: 'active',
      owner: 'Database Team',
      lastModified: '2024-01-15T12:00:00Z',
      tags: ['database', 'schema', 'middleware'],
      position: { x: 700, y: 200 }
    },
    
    // Database Table
    {
      id: 'table-1',
      name: 'message_routing',
      type: 'table',
      description: 'Configuration table for ACH message routing rules',
      confidence: 95,
      status: 'active',
      owner: 'Database Team',
      lastModified: '2024-01-15T12:00:00Z',
      tags: ['table', 'routing', 'configuration'],
      position: { x: 1000, y: 200 }
    },
    
    // Service
    {
      id: 'service-1',
      name: 'DPG Service',
      type: 'service',
      description: 'Digital Payment Gateway service for NAPAS ACH integration',
      confidence: 96,
      status: 'active',
      owner: 'Development Team',
      lastModified: '2024-01-15T10:00:00Z',
      tags: ['service', 'payment', 'gateway', 'napas'],
      position: { x: 1300, y: 200 }
    }
  ] as LineageNode[],

  edges: [
    // Document to Term
    {
      id: 'edge-1',
      source: 'doc-1',
      target: 'term-1',
      type: 'extracts-from',
      label: 'Extracted from',
      confidence: 96
    },
    
    // Term to Schema
    {
      id: 'edge-2',
      source: 'term-1',
      target: 'schema-1',
      type: 'maps-to',
      label: 'Maps to',
      confidence: 94
    },
    
    // Schema to Table
    {
      id: 'edge-3',
      source: 'schema-1',
      target: 'table-1',
      type: 'contains',
      label: 'Contains',
      confidence: 95
    },
    
    // Table to Service
    {
      id: 'edge-4',
      source: 'table-1',
      target: 'service-1',
      type: 'depends-on',
      label: 'Used by',
      confidence: 96
    }
  ] as LineageEdge[]
};

export function NAPASLineageViewer() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nodeTypeFilters, setNodeTypeFilters] = useState<string[]>([
    'document', 'term', 'schema', 'table', 'service'
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'graph' | 'flow'>('graph');

  // Filter nodes based on search and type filters
  const filteredNodes = simpleMockData.nodes.filter(node => {
    const matchesSearch = !searchQuery || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = nodeTypeFilters.includes(node.type);
    
    return matchesSearch && matchesType;
  });

  // Get selected node data
  const selectedNodeData = selectedNode ? 
    simpleMockData.nodes.find(node => node.id === selectedNode) : null;

  // Get connected nodes for a node
  const getConnectedNodes = (nodeId: string) => {
    const incoming = simpleMockData.edges
      .filter(edge => edge.target === nodeId)
      .map(edge => {
        const sourceNode = simpleMockData.nodes.find(node => node.id === edge.source);
        return { edge, node: sourceNode, direction: 'incoming' as const };
      })
      .filter(item => item.node !== undefined);
    
    const outgoing = simpleMockData.edges
      .filter(edge => edge.source === nodeId)
      .map(edge => {
        const targetNode = simpleMockData.nodes.find(node => node.id === edge.target);
        return { edge, node: targetNode, direction: 'outgoing' as const };
      })
      .filter(item => item.node !== undefined);
    
    return { incoming, outgoing };
  };

  // Event handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper functions
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'term': return BookOpen;
      case 'schema': return Database;
      case 'table': return Table;
      case 'service': return GitBranch;
      default: return Network;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'document': return '#3B82F6'; // blue-500
      case 'term': return '#10B981'; // emerald-500
      case 'schema': return '#8B5CF6'; // purple-500
      case 'table': return '#6366F1'; // indigo-500
      case 'service': return '#F59E0B'; // amber-500
      default: return '#6B7280'; // gray-500
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'deprecated': return AlertTriangle;
      case 'pending': return Info;
      default: return Info;
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

  // Render node in graph view
  const renderNode = (node: LineageNode) => {
    const isSelected = selectedNode === node.id;
    const scale = zoom;
    const x = node.position.x * scale + pan.x;
    const y = node.position.y * scale + pan.y;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
        }`}
        style={{
          left: x,
          top: y,
          transform: `scale(${scale})`
        }}
        onClick={() => setSelectedNode(node.id)}
      >
        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor(node.type) }}>
              {React.createElement(getNodeIcon(node.type), { className: "w-4 h-4 text-white" })}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{node.name}</h3>
              <p className="text-xs text-gray-500">{node.type}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confidence:</span>
            <span className="font-medium text-gray-700">{node.confidence}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Render edge in graph view
  const renderEdge = (edge: LineageEdge) => {
    const sourceNode = simpleMockData.nodes.find(n => n.id === edge.source);
    const targetNode = simpleMockData.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const scale = zoom;
    const sourceX = sourceNode.position.x * scale + pan.x + 80;
    const sourceY = sourceNode.position.y * scale + pan.y + 40;
    const targetX = targetNode.position.x * scale + pan.x + 80;
    const targetY = targetNode.position.y * scale + pan.y + 40;
    
    // Calculate control points for curved edge
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2 - 50;
    
    return (
      <g key={edge.id}>
        <defs>
          <marker
            id={`arrow-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={getNodeColor(targetNode.type)} />
          </marker>
        </defs>
        <path
          d={`M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`}
          fill="none"
          stroke={getNodeColor(sourceNode.type)}
          strokeWidth="2"
          markerEnd={`url(#arrow-${edge.id})`}
        />
        <text
          x={midX}
          y={midY - 10}
          className="text-xs fill-gray-600"
          textAnchor="middle"
        >
          {edge.label}
        </text>
      </g>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">NAPAS ACH Data Lineage</h1>
              <p className="text-sm text-gray-600">Trace data flow from documents to services</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mr-4">
              <Button
                variant={viewMode === 'graph' ? 'primary' : 'ghost'}
                size="sm"
                icon={Network}
                onClick={() => setViewMode('graph')}
              >
                Graph
              </Button>
              <Button
                variant={viewMode === 'flow' ? 'primary' : 'ghost'}
                size="sm"
                icon={ArrowRight}
                onClick={() => setViewMode('flow')}
              >
                Flow
              </Button>
            </div>
            
            {/* Zoom Controls */}
            <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
            <Button variant="ghost" size="sm" icon={Maximize2} />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <Button
            variant={showFilters ? 'primary' : 'ghost'}
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {/* Simple Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Node Types</h3>
              <div className="flex flex-wrap gap-2">
                {['document', 'term', 'schema', 'table', 'service'].map(type => (
                  <label key={type} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={nodeTypeFilters.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNodeTypeFilters(prev => [...prev, type]);
                        } else {
                          setNodeTypeFilters(prev => prev.filter(t => t !== type));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'graph' ? (
          <div className="flex-1 flex">
            {/* Graph Canvas */}
            <div className="flex-1 relative">
              <div
                className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <svg
                  className="w-full h-full"
                  style={{ background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  {/* Render edges */}
                  {simpleMockData.edges.map(renderEdge)}
                </svg>
                
                {/* Render nodes */}
                {filteredNodes.map(renderNode)}
              </div>

              {/* Legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
                <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('document') }}></div>
                    <span className="text-sm text-gray-700">Documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor('term') }}></div>
                    <span className="text-sm text-gray-700">Terms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('schema') }}></div>
                    <span className="text-sm text-gray-700">Schemas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('table') }}></div>
                    <span className="text-sm text-gray-700">Tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('service') }}></div>
                    <span className="text-sm text-gray-700">Services</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
              {selectedNodeData ? (
                <>
                  {/* Node Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor(selectedNodeData.type) }}>
                          {React.createElement(getNodeIcon(selectedNodeData.type), { 
                            className: "w-5 h-5 text-white" 
                          })}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-bold text-gray-900 mb-1">
                            {selectedNodeData.name}
                          </h2>
                          <div className="flex items-center space-x-2">
                            <Badge variant="info" size="sm">{selectedNodeData.type}</Badge>
                            <Badge variant={selectedNodeData.status === 'active' ? 'success' : 'warning'} size="sm">
                              {selectedNodeData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedNode(null)} />
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {selectedNodeData.description}
                    </p>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Confidence Score */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Confidence Score
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <span className="font-semibold text-gray-900">{selectedNodeData.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              selectedNodeData.confidence >= 90 ? 'bg-emerald-500' :
                              selectedNodeData.confidence >= 80 ? 'bg-blue-500' :
                              selectedNodeData.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedNodeData.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Metadata
                      </h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Owner</span>
                            <p className="font-medium text-gray-900">{selectedNodeData.owner}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Last Modified</span>
                            <p className="font-medium text-gray-900">{formatDate(selectedNodeData.lastModified)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNodeData.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant={tag === 'preferred' ? 'warning' : 'default'} 
                            size="sm"
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSearchQuery(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Connections */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Network className="w-4 h-4 mr-2" />
                        Connections
                      </h3>
                      <div className="space-y-3">
                        {/* Incoming connections */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Incoming</h4>
                          <div className="space-y-2">
                            {getConnectedNodes(selectedNodeData.id).incoming.map(({ edge, node }) => (
                              <div key={edge.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: getNodeColor(node!.type) }}>
                                  {React.createElement(getNodeIcon(node!.type), { 
                                    className: "w-3 h-3 text-white" 
                                  })}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{node!.name}</div>
                                  <div className="text-xs text-gray-500">{edge.label}</div>
                                </div>
                                <Badge variant="info" size="sm">{edge.confidence}%</Badge>
                              </div>
                            ))}
                            {getConnectedNodes(selectedNodeData.id).incoming.length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-2">No incoming connections</p>
                            )}
                          </div>
                        </div>

                        {/* Outgoing connections */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Outgoing</h4>
                          <div className="space-y-2">
                            {getConnectedNodes(selectedNodeData.id).outgoing.map(({ edge, node }) => (
                              <div key={edge.id} className="flex items-center space-x-2 p-2 bg-emerald-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: getNodeColor(node!.type) }}>
                                  {React.createElement(getNodeIcon(node!.type), { 
                                    className: "w-3 h-3 text-white" 
                                  })}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{node!.name}</div>
                                  <div className="text-xs text-gray-500">{edge.label}</div>
                                </div>
                                <Badge variant="success" size="sm">{edge.confidence}%</Badge>
                              </div>
                            ))}
                            {getConnectedNodes(selectedNodeData.id).outgoing.length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-2">No outgoing connections</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" icon={ExternalLink}>
                        View Details
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" icon={Edit3}>
                          Edit
                        </Button>
                        <Button variant="primary" size="sm" icon={Eye}>
                          Focus
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Data Lineage</h3>
                    <p className="text-gray-600 max-w-xs leading-relaxed">
                      Click on any node to view detailed information and explore relationships between documents, terms, and database objects.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Flow View
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">NAPAS ACH Data Flow</h3>
              
              <div className="flex flex-col items-center space-y-12">
                {/* Document to Term */}
                <div className="flex items-center justify-center space-x-8">
                  <Card className="w-64 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('document') }}>
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">DPG Middleware Specification</h3>
                          <p className="text-xs text-gray-500">Document</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        Technical specification for DPG middleware integration with NAPAS
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <Badge variant="success" size="sm">94%</Badge>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 text-blue-500" />
                    <span className="text-sm text-gray-600 mt-1">Extracts term</span>
                  </div>
                  
                  <Card className="w-64 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('term') }}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Message Routing Engine</h3>
                          <p className="text-xs text-gray-500">Business Term</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        Core component responsible for directing ACH messages between services
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <Badge variant="success" size="sm">96%</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Term to Schema */}
                <div className="flex items-center justify-center space-x-8">
                  <Card className="w-64 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('schema') }}>
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">dpg_middleware</h3>
                          <p className="text-xs text-gray-500">Database Schema</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        Database schema for DPG middleware configuration and routing
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <Badge variant="success" size="sm">95%</Badge>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 text-purple-500" />
                    <span className="text-sm text-gray-600 mt-1">Contains</span>
                  </div>
                  
                  <Card className="w-64 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('table') }}>
                          <Table className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">message_routing</h3>
                          <p className="text-xs text-gray-500">Database Table</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        Configuration table for ACH message routing rules
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <Badge variant="success" size="sm">95%</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Table to Service */}
                <div className="flex items-center justify-center space-x-8">
                  <Card className="w-64 hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('service') }}>
                          <GitBranch className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">DPG Service</h3>
                          <p className="text-xs text-gray-500">Microservice</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        Digital Payment Gateway service for NAPAS ACH integration
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Confidence:</span>
                        <Badge variant="success" size="sm">96%</Badge>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 text-amber-500" />
                    <span className="text-sm text-gray-600 mt-1">Powers</span>
                  </div>
                  
                  <div className="p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-300 w-64">
                    <div className="text-center">
                      <Zap className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h4 className="font-semibold text-green-800 mb-2">NAPAS ACH Processing</h4>
                      <p className="text-sm text-green-700">Live production system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}