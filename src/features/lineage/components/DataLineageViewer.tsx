import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRight,
  Table,
  Grid,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Download,
  Share2,
  ExternalLink,
  Settings,
  Layers,
  Edit3
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import * as d3 from 'd3';

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
  const [showFilters, setShowFilters] = useState(false);
  const [nodeTypeFilters, setNodeTypeFilters] = useState<string[]>([
    'document', 'term', 'schema', 'database', 'service'
  ]);
  const [viewMode, setViewMode] = useState<'graph' | 'flow'>('graph');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter nodes based on search and type filters
  const filteredNodes = simpleMockData.nodes.filter(node => {
    const matchesSearch = !searchQuery || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = nodeTypeFilters.includes(node.type);
    
    return matchesSearch && matchesType;
  });

  // Effect to highlight connected nodes when a node is selected
  useEffect(() => {
    if (selectedNode) {
      // Find all edges connected to this node
      const connectedEdges = simpleMockData.edges.filter(
        edge => edge.source === selectedNode.id || edge.target === selectedNode.id
      );
      
      // Get all connected node IDs
      const connectedNodeIds = connectedEdges.flatMap(edge => [edge.source, edge.target]);
      
      // Set highlighted nodes and edges
      setHighlightedNodes([selectedNode.id, ...connectedNodeIds]);
      setHighlightedEdges(connectedEdges.map(edge => edge.id));
    } else {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
    }
  }, [selectedNode]);

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
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
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
        return <Table className="w-4 h-4" />;
      case 'service':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  // Get color for node type
  const getNodeColor = (type: SimpleNode['type'], isHighlighted: boolean = false) => {
    const baseColors = {
      document: isHighlighted ? '#2563EB' : '#3B82F6', // blue-600 : blue-500
      term: isHighlighted ? '#059669' : '#10B981', // emerald-600 : emerald-500
      schema: isHighlighted ? '#7C3AED' : '#8B5CF6', // purple-600 : purple-500
      database: isHighlighted ? '#4F46E5' : '#6366F1', // indigo-600 : indigo-500
      service: isHighlighted ? '#D97706' : '#F59E0B', // amber-600 : amber-500
    };
    
    return baseColors[type] || '#6B7280'; // gray-500 as fallback
  };

  // Get edge color
  const getEdgeColor = (type: SimpleEdge['type'], isHighlighted: boolean = false) => {
    const baseColors = {
      'extracts-to': isHighlighted ? '#2563EB' : '#93C5FD', // blue-600 : blue-300
      'maps-to': isHighlighted ? '#059669' : '#6EE7B7', // emerald-600 : emerald-300
      'depends-on': isHighlighted ? '#D97706' : '#FCD34D', // amber-600 : amber-300
      'contains': isHighlighted ? '#7C3AED' : '#C4B5FD', // purple-600 : purple-300
    };
    
    return baseColors[type] || '#D1D5DB'; // gray-300 as fallback
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

  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render a node in graph view
  const renderNode = (node: SimpleNode) => {
    const isSelected = selectedNode?.id === node.id;
    const isHighlighted = highlightedNodes.includes(node.id);
    const isConnected = isHighlighted && !isSelected;
    const isNormal = !isHighlighted && !isSelected;
    const opacity = isNormal ? 0.6 : 1;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'z-10' : isConnected ? 'z-5' : 'z-0'
        }`}
        style={{
          left: node.position.x * zoomLevel + panOffset.x,
          top: node.position.y * zoomLevel + panOffset.y,
          transform: `scale(${zoomLevel})`,
          opacity
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node);
        }}
      >
        <div className={`
          p-4 rounded-lg shadow-md border-2 bg-white
          ${isSelected ? 'ring-4 ring-blue-300 border-blue-500' : 
            isConnected ? 'ring-2 ring-blue-200 border-blue-300' : 'border-gray-200'}
          hover:shadow-lg transition-all duration-200
          ${node.type === 'document' ? 'rounded-md' : 
            node.type === 'term' ? 'rounded-full' : 
            node.type === 'schema' ? 'rounded-lg' : 
            node.type === 'database' ? 'rounded-md' : 'rounded-lg'}
        `}>
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full`} style={{ backgroundColor: getNodeColor(node.type, isHighlighted) }}>
              {getNodeIcon(node.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm whitespace-nowrap">{node.name}</h3>
              <p className="text-xs text-gray-500">{node.system}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render an edge in graph view
  const renderEdge = (edge: SimpleEdge) => {
    const sourceNode = getNodeById(edge.source);
    const targetNode = getNodeById(edge.target);
    
    if (!sourceNode || !targetNode) return null;

    const isHighlighted = highlightedEdges.includes(edge.id);
    const opacity = isHighlighted ? 1 : 0.3;
    const strokeWidth = isHighlighted ? 2 : 1;

    const sourceX = (sourceNode.position.x + 96) * zoomLevel + panOffset.x;
    const sourceY = (sourceNode.position.y + 40) * zoomLevel + panOffset.y;
    const targetX = (targetNode.position.x + 96) * zoomLevel + panOffset.x;
    const targetY = (targetNode.position.y + 40) * zoomLevel + panOffset.y;

    // Calculate control points for a curved path
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2 - Math.abs(dx) * 0.15; // Curve upward

    return (
      <g key={edge.id} style={{ opacity }}>
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
              fill={getEdgeColor(edge.type, isHighlighted)}
            />
          </marker>
        </defs>
        <path
          d={`M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`}
          fill="none"
          stroke={getEdgeColor(edge.type, isHighlighted)}
          strokeWidth={strokeWidth}
          markerEnd={`url(#arrowhead-${edge.id})`}
          className="transition-all duration-200"
        />
        {isHighlighted && (
          <text
            x={midX}
            y={midY - 10}
            className="text-xs fill-gray-700 font-medium"
            textAnchor="middle"
            style={{ pointerEvents: 'none' }}
          >
            {edge.type.replace('-', ' ')}
          </text>
        )}
      </g>
    );
  };

  // Render flow view
  const renderFlowView = () => {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col space-y-16">
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
                  Schema containing DPG middleware configuration and state
                </p>
              </div>
            </Card>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-gray-600 mt-1">Contains</span>
            </div>
            
            <Card className="w-64 hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor('database') }}>
                    <Table className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">message_routing</h3>
                    <p className="text-xs text-gray-500">Database Table</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  Table storing message routing configuration and rules
                </p>
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
                  Service that implements the message routing functionality
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Data Lineage Explorer</h1>
              <p className="text-sm text-gray-600">Trace data flow from documents to services</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
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
              {Math.round(zoomLevel * 100)}%
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
          
          <Button variant="ghost" size="sm" icon={Download}>
            Export
          </Button>
          
          <Button variant="ghost" size="sm" icon={Share2}>
            Share
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Filter Nodes</h3>
              <Button variant="ghost" size="sm" icon={X} onClick={() => setShowFilters(false)} />
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">Node Types</h4>
                <div className="flex flex-wrap gap-2">
                  {['document', 'term', 'schema', 'database', 'service'].map(type => (
                    <label key={type} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
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
              
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['active', 'deprecated', 'pending', 'review'].map(status => (
                    <label key={status} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        checked={true}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
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
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedNode(null)}
                style={{ 
                  background: 'radial-gradient(circle, #f3f4f6 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}
              >
                {/* SVG for edges */}
                <svg 
                  ref={svgRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ overflow: 'visible' }}
                >
                  {simpleMockData.edges.map(renderEdge)}
                </svg>
                
                {/* Nodes */}
                {filteredNodes.map(renderNode)}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Legend
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('document') }}></div>
                    <span className="text-sm text-gray-700">Document</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor('term') }}></div>
                    <span className="text-sm text-gray-700">Business Term</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('schema') }}></div>
                    <span className="text-sm text-gray-700">Database Schema</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('database') }}></div>
                    <span className="text-sm text-gray-700">Database Table</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getNodeColor('service') }}></div>
                    <span className="text-sm text-gray-700">Service</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
              {selectedNode ? (
                <>
                  {/* Panel Header */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: getNodeColor(selectedNode.type, true) }}>
                          {getNodeIcon(selectedNode.type)}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 mb-1">
                            {selectedNode.name}
                          </h2>
                          <div className="flex items-center space-x-2">
                            <Badge variant="info" size="sm">{selectedNode.type}</Badge>
                            <Badge 
                              variant={selectedNode.status === 'active' ? 'success' : 'warning'} 
                              size="sm"
                            >
                              {selectedNode.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={X} 
                        onClick={() => setSelectedNode(null)} 
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedNode.description}
                    </p>
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
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Details
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Type:</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{selectedNode.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">System:</span>
                                <span className="text-sm font-medium text-gray-900">{selectedNode.system}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{selectedNode.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confidence Score
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Confidence Level</span>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.round(selectedNode.confidence * 100)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  selectedNode.confidence >= 0.9 ? 'bg-emerald-500' :
                                  selectedNode.confidence >= 0.7 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${selectedNode.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Network className="w-4 h-4 mr-2" />
                            Connections Summary
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                  {getConnectedEdges(selectedNode.id).filter(edge => edge.target === selectedNode.id).length}
                                </div>
                                <div className="text-xs text-gray-600">Incoming</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-emerald-600">
                                  {getConnectedEdges(selectedNode.id).filter(edge => edge.source === selectedNode.id).length}
                                </div>
                                <div className="text-xs text-gray-600">Outgoing</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'lineage' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                            Upstream Dependencies
                          </h3>
                          <div className="space-y-2">
                            {getConnectedEdges(selectedNode.id)
                              .filter(edge => edge.target === selectedNode.id)
                              .map(edge => {
                                const sourceNode = getNodeById(edge.source);
                                return sourceNode ? (
                                  <div key={edge.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 rounded-full" style={{ backgroundColor: getNodeColor(sourceNode.type, true) }}>
                                        {getNodeIcon(sourceNode.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-gray-900 text-sm truncate">{sourceNode.name}</h4>
                                          <Badge variant="info" size="sm">{sourceNode.type}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">{edge.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            {getConnectedEdges(selectedNode.id).filter(edge => edge.target === selectedNode.id).length === 0 && (
                              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500">No upstream dependencies</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Downstream Dependencies
                          </h3>
                          <div className="space-y-2">
                            {getConnectedEdges(selectedNode.id)
                              .filter(edge => edge.source === selectedNode.id)
                              .map(edge => {
                                const targetNode = getNodeById(edge.target);
                                return targetNode ? (
                                  <div key={edge.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-1.5 rounded-full" style={{ backgroundColor: getNodeColor(targetNode.type, true) }}>
                                        {getNodeIcon(targetNode.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium text-gray-900 text-sm truncate">{targetNode.name}</h4>
                                          <Badge variant="success" size="sm">{targetNode.type}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">{edge.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            {getConnectedEdges(selectedNode.id).filter(edge => edge.source === selectedNode.id).length === 0 && (
                              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500">No downstream dependencies</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'metadata' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            System Information
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">System:</span>
                                <span className="text-sm font-medium text-gray-900">{selectedNode.system}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Type:</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{selectedNode.type}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(selectedNode.status)}
                                  <span className="text-sm font-medium text-gray-900 capitalize">{selectedNode.status}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Additional Properties
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500">Additional metadata would be displayed here</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Panel */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
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
                      <Eye className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Node</h3>
                    <p className="text-gray-600 max-w-xs leading-relaxed">
                      Click on any node in the graph to view its details and explore its relationships.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Flow View
          renderFlowView()
        )}
      </div>
    </div>
  );
}