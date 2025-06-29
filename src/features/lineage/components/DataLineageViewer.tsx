import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  FileText,
  Database,
  GitBranch,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Flag,
  Star,
  BookOpen,
  Brain,
  Network,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

// Simplified data structure
interface SimpleNode {
  id: string;
  name: string;
  type: 'document' | 'term' | 'schema' | 'database' | 'service';
  system: string;
  description: string;
  confidence: number;
  status: 'active' | 'deprecated' | 'pending' | 'review';
  position: { x: number; y: number };
}

interface SimpleEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-to' | 'maps-to' | 'depends-on' | 'contains';
  description: string;
}

// Simplified mock data
const simpleMockData = {
  nodes: [
    // Document
    {
      id: 'doc-1',
      name: 'DPG Middleware Specification',
      type: 'document',
      system: 'Document Repository',
      description: 'Technical specification for DPG middleware integration with NAPAS',
      confidence: 0.94,
      status: 'active',
      position: { x: 100, y: 200 }
    },
    // Term
    {
      id: 'term-1',
      name: 'Message Routing Engine',
      type: 'term',
      system: 'Business Glossary',
      description: 'Core component responsible for directing ACH messages between services',
      confidence: 0.96,
      status: 'active',
      position: { x: 400, y: 200 }
    },
    // Schema
    {
      id: 'schema-1',
      name: 'dpg_middleware',
      type: 'schema',
      system: 'Database',
      description: 'Schema containing DPG middleware configuration and state',
      confidence: 0.95,
      status: 'active',
      position: { x: 700, y: 200 }
    },
    // Database table
    {
      id: 'table-1',
      name: 'message_routing',
      type: 'database',
      system: 'Database',
      description: 'Table storing message routing configuration and rules',
      confidence: 0.95,
      status: 'active',
      position: { x: 1000, y: 200 }
    },
    // Service
    {
      id: 'service-1',
      name: 'DPG Service',
      type: 'service',
      system: 'Microservices',
      description: 'Service that implements the message routing functionality',
      confidence: 0.96,
      status: 'active',
      position: { x: 1300, y: 200 }
    }
  ] as SimpleNode[],
  
  edges: [
    // Document to Term
    {
      id: 'edge-1',
      source: 'doc-1',
      target: 'term-1',
      type: 'extracts-to',
      description: 'Term extracted from document'
    },
    // Term to Schema
    {
      id: 'edge-2',
      source: 'term-1',
      target: 'schema-1',
      type: 'maps-to',
      description: 'Term maps to database schema'
    },
    // Schema to Table
    {
      id: 'edge-3',
      source: 'schema-1',
      target: 'table-1',
      type: 'contains',
      description: 'Schema contains table'
    },
    // Table to Service
    {
      id: 'edge-4',
      source: 'table-1',
      target: 'service-1',
      type: 'depends-on',
      description: 'Service depends on table'
    }
  ] as SimpleEdge[]
};

export function DataLineageViewer() {
  const [selectedNode, setSelectedNode] = useState<SimpleNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'lineage' | 'metadata'>('overview');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Filter nodes based on search
  const filteredNodes = simpleMockData.nodes.filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get connected edges for a node
  const getConnectedEdges = (nodeId: string) => {
    return simpleMockData.edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  };

  // Get node by ID
  const getNodeById = (id: string) => {
    return simpleMockData.nodes.find(node => node.id === id);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get icon for node type
  const getNodeIcon = (type: SimpleNode['type']) => {
    switch (type) {
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'term':
        return <BookOpen className="w-4 h-4" />;
      case 'schema':
        return <Database className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'service':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  // Get color for node type
  const getNodeColor = (type: SimpleNode['type']) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'term':
        return 'bg-emerald-500 border-emerald-600 text-white';
      case 'schema':
        return 'bg-purple-500 border-purple-600 text-white';
      case 'database':
        return 'bg-indigo-500 border-indigo-600 text-white';
      case 'service':
        return 'bg-amber-500 border-amber-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  // Get edge color
  const getEdgeColor = (type: SimpleEdge['type']) => {
    switch (type) {
      case 'extracts-to':
        return 'stroke-blue-500';
      case 'maps-to':
        return 'stroke-emerald-500';
      case 'depends-on':
        return 'stroke-amber-500';
      case 'contains':
        return 'stroke-purple-500';
      default:
        return 'stroke-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: SimpleNode['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deprecated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  // Render a node
  const renderNode = (node: SimpleNode) => {
    const isSelected = selectedNode?.id === node.id;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
        }`}
        style={{
          left: node.position.x * zoomLevel + panOffset.x,
          top: node.position.y * zoomLevel + panOffset.y,
          transform: `scale(${zoomLevel})`
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div className={`
          min-w-48 p-4 rounded-lg border-2 shadow-lg bg-white
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          hover:shadow-xl transition-shadow
        `}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1.5 rounded ${getNodeColor(node.type)}`}>
              {getNodeIcon(node.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {node.name}
              </h3>
              <p className="text-xs text-gray-500">{node.system}</p>
            </div>
            {getStatusIcon(node.status)}
          </div>
          
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {node.description}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confidence:</span>
            <span className="font-medium text-gray-700">
              {Math.round(node.confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render an edge
  const renderEdge = (edge: SimpleEdge) => {
    const sourceNode = getNodeById(edge.source);
    const targetNode = getNodeById(edge.target);
    
    if (!sourceNode || !targetNode) return null;

    const sourceX = (sourceNode.position.x + 96) * zoomLevel + panOffset.x;
    const sourceY = (sourceNode.position.y + 40) * zoomLevel + panOffset.y;
    const targetX = (targetNode.position.x + 96) * zoomLevel + panOffset.x;
    const targetY = (targetNode.position.y + 40) * zoomLevel + panOffset.y;

    return (
      <g key={edge.id}>
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className={getEdgeColor(edge.type)}
              fill="currentColor"
            />
          </marker>
        </defs>
        <path
          d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY - 50} ${targetX} ${targetY}`}
          fill="none"
          className={`${getEdgeColor(edge.type)} stroke-2`}
          markerEnd={`url(#arrowhead-${edge.id})`}
        />
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 25}
          className="text-xs fill-gray-600"
          textAnchor="middle"
        >
          {edge.type.replace('-', ' ')}
        </text>
      </g>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Data Lineage Viewer</h1>
            <p className="text-sm text-gray-600">Explore connections between documents, terms, and database objects</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
            <Button variant="ghost" size="sm" icon={Maximize2} />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search nodes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Graph Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {simpleMockData.edges.map(renderEdge)}
            </svg>
            
            {/* Nodes */}
            {filteredNodes.map(renderNode)}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {selectedNode ? (
            <>
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedNode.name}
                  </h2>
                  <Button variant="ghost" size="sm" icon={Eye} />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{selectedNode.system}</Badge>
                  <Badge variant="default">{selectedNode.type}</Badge>
                  <Badge variant={selectedNode.status === 'active' ? 'success' : 'warning'}>
                    {selectedNode.status}
                  </Badge>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'lineage', label: 'Lineage' },
                    { id: 'metadata', label: 'Metadata' }
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

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm">
                        {selectedNode.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Confidence Score</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${selectedNode.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(selectedNode.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lineage' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Upstream Dependencies</h3>
                      <div className="space-y-2">
                        {getConnectedEdges(selectedNode.id)
                          .filter(edge => edge.target === selectedNode.id)
                          .map(edge => {
                            const sourceNode = getNodeById(edge.source);
                            return sourceNode ? (
                              <div key={edge.id} className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{sourceNode.name}</span>
                                  <Badge variant="info" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                              </div>
                            ) : null;
                          })}
                        {getConnectedEdges(selectedNode.id).filter(edge => edge.target === selectedNode.id).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No upstream dependencies found</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Downstream Dependencies</h3>
                      <div className="space-y-2">
                        {getConnectedEdges(selectedNode.id)
                          .filter(edge => edge.source === selectedNode.id)
                          .map(edge => {
                            const targetNode = getNodeById(edge.target);
                            return targetNode ? (
                              <div key={edge.id} className="p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{targetNode.name}</span>
                                  <Badge variant="success" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                              </div>
                            ) : null;
                          })}
                        {getConnectedEdges(selectedNode.id).filter(edge => edge.source === selectedNode.id).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No downstream dependencies found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'metadata' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">System Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">System:</span>
                          <span className="text-gray-900">{selectedNode.system}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="text-gray-900">{selectedNode.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-gray-900">{selectedNode.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Node</h3>
                <p className="text-gray-500 max-w-sm">
                  Click on any document, term, schema, or service in the lineage graph to view its details and relationships.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">Document</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-sm">Term</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">Schema</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-indigo-500 rounded"></div>
            <span className="text-sm">Table</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm">Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}