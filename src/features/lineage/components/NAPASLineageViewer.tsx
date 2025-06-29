import React, { useState, useRef, useCallback } from 'react';
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
  category: string;
  position: { x: number; y: number };
  metadata: {
    description: string;
    owner: string;
    createdAt: string;
    modifiedAt: string;
    businessUnit: string;
    tags: string[];
    status: 'active' | 'deprecated' | 'pending';
    confidence: number;
    usageCount: number;
    businessValue: 'critical' | 'high' | 'medium' | 'low';
  };
  visual: {
    color: string;
    shape: 'rectangle' | 'circle' | 'hexagon' | 'diamond';
    size: number;
  };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-from' | 'maps-to' | 'depends-on' | 'contains';
  label: string;
  metadata: {
    confidence: number;
    createdAt: string;
  };
  visual: {
    color: string;
    style: 'solid' | 'dashed';
    width: number;
  };
}

// Simplified mock data
const mockLineageData = {
  nodes: [
    // Document
    {
      id: 'doc-dpg-spec',
      name: 'DPG Middleware Specification',
      type: 'document' as const,
      category: 'Technical Specification',
      position: { x: 100, y: 200 },
      metadata: {
        description: 'Technical specification for DPG middleware integration with NAPAS',
        owner: 'Technical Architecture Team',
        createdAt: '2024-01-10T09:00:00Z',
        modifiedAt: '2024-01-15T09:30:00Z',
        businessUnit: 'Technology',
        tags: ['technical', 'middleware', 'napas'],
        status: 'active' as const,
        confidence: 94,
        usageCount: 47,
        businessValue: 'critical' as const
      },
      visual: {
        color: '#3B82F6',
        shape: 'rectangle' as const,
        size: 120
      }
    },
    
    // Business Term
    {
      id: 'term-msg-routing',
      name: 'Message Routing Engine',
      type: 'term' as const,
      category: 'System Component',
      position: { x: 450, y: 200 },
      metadata: {
        description: 'Core component responsible for directing ACH messages between services and NAPAS',
        owner: 'Data Governance Team',
        createdAt: '2024-01-15T14:00:00Z',
        modifiedAt: '2024-01-15T15:30:00Z',
        businessUnit: 'Technology',
        tags: ['routing', 'ach', 'middleware', 'preferred'],
        status: 'active' as const,
        confidence: 96,
        usageCount: 156,
        businessValue: 'critical' as const
      },
      visual: {
        color: '#10B981',
        shape: 'circle' as const,
        size: 80
      }
    },
    
    // Database Schema
    {
      id: 'schema-dpg-middleware',
      name: 'dpg_middleware',
      type: 'schema' as const,
      category: 'Database Schema',
      position: { x: 800, y: 200 },
      metadata: {
        description: 'Database schema for DPG middleware configuration and routing',
        owner: 'Database Team',
        createdAt: '2024-01-10T08:00:00Z',
        modifiedAt: '2024-01-15T12:00:00Z',
        businessUnit: 'Technology',
        tags: ['database', 'schema', 'middleware'],
        status: 'active' as const,
        confidence: 95,
        usageCount: 89,
        businessValue: 'critical' as const
      },
      visual: {
        color: '#8B5CF6',
        shape: 'hexagon' as const,
        size: 100
      }
    },
    
    // Database Table
    {
      id: 'table-message-routing',
      name: 'message_routing',
      type: 'table' as const,
      category: 'Database Table',
      position: { x: 1150, y: 200 },
      metadata: {
        description: 'Configuration table for ACH message routing rules',
        owner: 'Database Team',
        createdAt: '2024-01-10T08:30:00Z',
        modifiedAt: '2024-01-15T12:00:00Z',
        businessUnit: 'Technology',
        tags: ['table', 'routing', 'configuration'],
        status: 'active' as const,
        confidence: 95,
        usageCount: 245,
        businessValue: 'critical' as const
      },
      visual: {
        color: '#6366F1',
        shape: 'rectangle' as const,
        size: 90
      }
    },
    
    // Service
    {
      id: 'service-dpg',
      name: 'DPG Service',
      type: 'service' as const,
      category: 'Microservice',
      position: { x: 1500, y: 200 },
      metadata: {
        description: 'Digital Payment Gateway service for NAPAS ACH integration',
        owner: 'Development Team',
        createdAt: '2024-01-05T08:00:00Z',
        modifiedAt: '2024-01-15T10:00:00Z',
        businessUnit: 'Technology',
        tags: ['service', 'payment', 'gateway', 'napas'],
        status: 'active' as const,
        confidence: 96,
        usageCount: 1247,
        businessValue: 'critical' as const
      },
      visual: {
        color: '#F59E0B',
        shape: 'diamond' as const,
        size: 110
      }
    }
  ] as LineageNode[],

  edges: [
    // Document to Term
    {
      id: 'edge-doc1-term1',
      source: 'doc-dpg-spec',
      target: 'term-msg-routing',
      type: 'extracts-from' as const,
      label: 'Extracted from',
      metadata: {
        confidence: 96,
        createdAt: '2024-01-15T14:30:00Z'
      },
      visual: {
        color: '#3B82F6',
        style: 'solid' as const,
        width: 2
      }
    },
    
    // Term to Schema
    {
      id: 'edge-term1-schema1',
      source: 'term-msg-routing',
      target: 'schema-dpg-middleware',
      type: 'maps-to' as const,
      label: 'Maps to',
      metadata: {
        confidence: 94,
        createdAt: '2024-01-15T15:00:00Z'
      },
      visual: {
        color: '#10B981',
        style: 'solid' as const,
        width: 2
      }
    },
    
    // Schema to Table
    {
      id: 'edge-schema1-table1',
      source: 'schema-dpg-middleware',
      target: 'table-message-routing',
      type: 'contains' as const,
      label: 'Contains',
      metadata: {
        confidence: 95,
        createdAt: '2024-01-10T09:00:00Z'
      },
      visual: {
        color: '#8B5CF6',
        style: 'solid' as const,
        width: 2
      }
    },
    
    // Table to Service
    {
      id: 'edge-table1-service1',
      source: 'table-message-routing',
      target: 'service-dpg',
      type: 'depends-on' as const,
      label: 'Used by',
      metadata: {
        confidence: 96,
        createdAt: '2024-01-15T10:30:00Z'
      },
      visual: {
        color: '#F59E0B',
        style: 'solid' as const,
        width: 2
      }
    }
  ] as LineageEdge[]
};

export function NAPASLineageViewer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nodeTypeFilters, setNodeTypeFilters] = useState<string[]>([
    'document', 'term', 'schema', 'table', 'service'
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter nodes and edges based on current filters
  const filteredNodes = mockLineageData.nodes.filter(node => {
    const matchesSearch = !searchQuery || 
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.metadata.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = nodeTypeFilters.includes(node.type);
    
    return matchesSearch && matchesType;
  });

  const filteredEdges = mockLineageData.edges.filter(edge => {
    const sourceExists = filteredNodes.some(node => node.id === edge.source);
    const targetExists = filteredNodes.some(node => node.id === edge.target);
    return sourceExists && targetExists;
  });

  // Event handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    
    // Find connected nodes and edges
    const connectedNodes: string[] = [];
    const connectedEdges: string[] = [];
    
    filteredEdges.forEach(edge => {
      if (edge.source === nodeId || edge.target === nodeId) {
        connectedEdges.push(edge.id);
        if (edge.source === nodeId) connectedNodes.push(edge.target);
        if (edge.target === nodeId) connectedNodes.push(edge.source);
      }
    });
    
    setHighlightedNodes(connectedNodes);
    setHighlightedEdges(connectedEdges);
  }, [filteredEdges]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.25));
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

  // Get selected node data
  const selectedNodeData = selectedNode ? 
    filteredNodes.find(node => node.id === selectedNode) : null;

  // Render node
  const renderNode = (node: LineageNode) => {
    const isSelected = selectedNode === node.id;
    const isHighlighted = highlightedNodes.includes(node.id);
    const isHovered = hoveredNode === node.id;
    
    const scale = zoom;
    const x = node.position.x * scale + pan.x;
    const y = node.position.y * scale + pan.y;
    
    const opacity = isSelected || isHighlighted || !selectedNode ? 1 : 0.3;
    
    return (
      <g
        key={node.id}
        transform={`translate(${x}, ${y})`}
        style={{ cursor: 'pointer', opacity }}
        onClick={() => handleNodeClick(node.id)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* Node shape */}
        {node.visual.shape === 'rectangle' && (
          <rect
            x={-node.visual.size / 2}
            y={-30}
            width={node.visual.size}
            height={60}
            rx={8}
            fill={node.visual.color}
            stroke={isSelected ? '#1D4ED8' : isHovered ? '#3B82F6' : 'transparent'}
            strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
            className="transition-all duration-200"
          />
        )}
        
        {node.visual.shape === 'circle' && (
          <circle
            r={node.visual.size / 2}
            fill={node.visual.color}
            stroke={isSelected ? '#1D4ED8' : isHovered ? '#3B82F6' : 'transparent'}
            strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
            className="transition-all duration-200"
          />
        )}
        
        {node.visual.shape === 'hexagon' && (
          <polygon
            points={`${-node.visual.size/2},0 ${-node.visual.size/4},-${node.visual.size/2.3} ${node.visual.size/4},-${node.visual.size/2.3} ${node.visual.size/2},0 ${node.visual.size/4},${node.visual.size/2.3} ${-node.visual.size/4},${node.visual.size/2.3}`}
            fill={node.visual.color}
            stroke={isSelected ? '#1D4ED8' : isHovered ? '#3B82F6' : 'transparent'}
            strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
            className="transition-all duration-200"
          />
        )}
        
        {node.visual.shape === 'diamond' && (
          <polygon
            points={`0,-${node.visual.size/2} ${node.visual.size/2},0 0,${node.visual.size/2} -${node.visual.size/2},0`}
            fill={node.visual.color}
            stroke={isSelected ? '#1D4ED8' : isHovered ? '#3B82F6' : 'transparent'}
            strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
            className="transition-all duration-200"
          />
        )}
        
        {/* Node icon */}
        <text
          textAnchor="middle"
          dy="0.35em"
          fill="white"
          fontSize="16"
          fontWeight="bold"
        >
          {node.type === 'document' ? '📄' : 
           node.type === 'term' ? '📖' :
           node.type === 'schema' ? '🗄️' :
           node.type === 'table' ? '📊' : '⚙️'}
        </text>
        
        {/* Node label */}
        {showLabels && (
          <text
            textAnchor="middle"
            dy={node.visual.size / 2 + 20}
            fill="#374151"
            fontSize="12"
            fontWeight="500"
            className="pointer-events-none"
          >
            <tspan x="0" dy="0">{node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name}</tspan>
          </text>
        )}
        
        {/* Confidence indicator */}
        <circle
          cx={node.visual.size / 2 - 10}
          cy={-node.visual.size / 2 + 10}
          r="8"
          fill={node.metadata.confidence >= 90 ? '#10B981' : 
                node.metadata.confidence >= 80 ? '#3B82F6' :
                node.metadata.confidence >= 70 ? '#F59E0B' : '#EF4444'}
          className="opacity-80"
        />
        <text
          x={node.visual.size / 2 - 10}
          y={-node.visual.size / 2 + 10}
          textAnchor="middle"
          dy="0.35em"
          fill="white"
          fontSize="10"
          fontWeight="bold"
        >
          {node.metadata.confidence}
        </text>
      </g>
    );
  };

  // Render edge
  const renderEdge = (edge: LineageEdge) => {
    const sourceNode = filteredNodes.find(n => n.id === edge.source);
    const targetNode = filteredNodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    const scale = zoom;
    const sourceX = sourceNode.position.x * scale + pan.x;
    const sourceY = sourceNode.position.y * scale + pan.y;
    const targetX = targetNode.position.x * scale + pan.x;
    const targetY = targetNode.position.y * scale + pan.y;
    
    const isHighlighted = highlightedEdges.includes(edge.id);
    const opacity = isHighlighted || !selectedNode ? 1 : 0.2;
    
    // Calculate control points for curved edge
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    const controlY = midY - 50;
    
    return (
      <g key={edge.id} style={{ opacity }}>
        {/* Edge path */}
        <path
          d={`M ${sourceX} ${sourceY} Q ${midX} ${controlY} ${targetX} ${targetY}`}
          fill="none"
          stroke={edge.visual.color}
          strokeWidth={edge.visual.width}
          strokeDasharray={edge.visual.style === 'dashed' ? '5,5' : 'none'}
          markerEnd="url(#arrowhead)"
          className="transition-all duration-200"
        />
        
        {/* Edge label */}
        {showLabels && (
          <text
            x={midX}
            y={controlY - 10}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="10"
            className="pointer-events-none"
          >
            {edge.label}
          </text>
        )}
        
        {/* Confidence indicator on edge */}
        <circle
          cx={midX}
          cy={controlY + 15}
          r="6"
          fill={edge.metadata.confidence >= 90 ? '#10B981' : 
                edge.metadata.confidence >= 80 ? '#3B82F6' :
                edge.metadata.confidence >= 70 ? '#F59E0B' : '#EF4444'}
          className="opacity-70"
        />
        <text
          x={midX}
          y={controlY + 15}
          textAnchor="middle"
          dy="0.35em"
          fill="white"
          fontSize="8"
          fontWeight="bold"
        >
          {edge.metadata.confidence}
        </text>
      </g>
    );
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'deprecated': return AlertTriangle;
      case 'pending': return Info;
      default: return Info;
    }
  };

  const getBusinessValueIcon = (value: string) => {
    switch (value) {
      case 'critical': return Star;
      case 'high': return TrendingUp;
      case 'medium': return Activity;
      case 'low': return Info;
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">NAPAS ACH Data Lineage</h1>
                <p className="text-sm text-gray-600">Trace data flow from documents to services</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
              <span className="text-sm text-gray-600 min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
            </div>
            
            {/* View Controls */}
            <Button 
              variant={showGrid ? 'primary' : 'ghost'} 
              size="sm" 
              icon={Grid3X3}
              onClick={() => setShowGrid(!showGrid)}
            />
            <Button 
              variant={showLabels ? 'primary' : 'ghost'} 
              size="sm" 
              icon={Eye}
              onClick={() => setShowLabels(!showLabels)}
            />
            <Button 
              variant={showLegend ? 'primary' : 'ghost'} 
              size="sm" 
              icon={Info}
              onClick={() => setShowLegend(!showLegend)}
            />
            <Button variant="ghost" size="sm" icon={Maximize2} />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search nodes, descriptions, or tags..."
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
          
          <div className="text-sm text-gray-600">
            {filteredNodes.length} nodes, {filteredEdges.length} connections
          </div>
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
        {/* Graph Canvas */}
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              ref={svgRef}
              className="w-full h-full"
              style={{ background: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'transparent', backgroundSize: '20px 20px' }}
            >
              {/* Definitions */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                </marker>
              </defs>
              
              {/* Render edges */}
              {filteredEdges.map(renderEdge)}
              
              {/* Render nodes */}
              {filteredNodes.map(renderNode)}
            </svg>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">Documents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Terms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                  <span className="text-sm text-gray-700">Schemas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                  <span className="text-sm text-gray-700">Tables</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
                  <span className="text-sm text-gray-700">Services</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {selectedNodeData ? (
            <>
              {/* Node Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: selectedNodeData.visual.color }}>
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
                        <Badge variant="default" size="sm">{selectedNodeData.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={X} onClick={() => setSelectedNode(null)} />
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {selectedNodeData.metadata.description}
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
                      <span className="font-semibold text-gray-900">{selectedNodeData.metadata.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedNodeData.metadata.confidence >= 90 ? 'bg-emerald-500' :
                          selectedNodeData.metadata.confidence >= 80 ? 'bg-blue-500' :
                          selectedNodeData.metadata.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedNodeData.metadata.confidence}%` }}
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
                        <p className="font-medium text-gray-900">{selectedNodeData.metadata.owner}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Business Unit</span>
                        <p className="font-medium text-gray-900">{selectedNodeData.metadata.businessUnit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Created</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedNodeData.metadata.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Modified</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedNodeData.metadata.modifiedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Value & Usage */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Business Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {React.createElement(getBusinessValueIcon(selectedNodeData.metadata.businessValue), { 
                          className: "w-5 h-5 text-blue-600" 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">Business Value</div>
                      <div className="font-semibold text-gray-900 capitalize">{selectedNodeData.metadata.businessValue}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-sm text-gray-600">Usage Count</div>
                      <div className="font-semibold text-gray-900">{selectedNodeData.metadata.usageCount}</div>
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
                    {selectedNodeData.metadata.tags.map(tag => (
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
                        {filteredEdges
                          .filter(edge => edge.target === selectedNodeData.id)
                          .map(edge => {
                            const sourceNode = filteredNodes.find(n => n.id === edge.source);
                            return sourceNode ? (
                              <div key={edge.id} className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: sourceNode.visual.color }}>
                                  {React.createElement(getNodeIcon(sourceNode.type), { 
                                    className: "w-3 h-3 text-white" 
                                  })}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{sourceNode.name}</div>
                                  <div className="text-xs text-gray-500">{edge.label}</div>
                                </div>
                                <Badge variant="info" size="sm">{edge.metadata.confidence}%</Badge>
                              </div>
                            ) : null;
                          })}
                        {filteredEdges.filter(e => e.target === selectedNodeData.id).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-2">No incoming connections</p>
                        )}
                      </div>
                    </div>

                    {/* Outgoing connections */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Outgoing</h4>
                      <div className="space-y-2">
                        {filteredEdges
                          .filter(edge => edge.source === selectedNodeData.id)
                          .map(edge => {
                            const targetNode = filteredNodes.find(n => n.id === edge.target);
                            return targetNode ? (
                              <div key={edge.id} className="flex items-center space-x-2 p-2 bg-emerald-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: targetNode.visual.color }}>
                                  {React.createElement(getNodeIcon(targetNode.type), { 
                                    className: "w-3 h-3 text-white" 
                                  })}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">{targetNode.name}</div>
                                  <div className="text-xs text-gray-500">{edge.label}</div>
                                </div>
                                <Badge variant="success" size="sm">{edge.metadata.confidence}%</Badge>
                              </div>
                            ) : null;
                          })}
                        {filteredEdges.filter(e => e.source === selectedNodeData.id).length === 0 && (
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
                <div className="mt-6">
                  <Button variant="primary" size="sm" className="w-full">
                    Select a Starting Point
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flow View Example */}
      <div className="bg-white border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Data Flow Overview</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-lg inline-block mb-2">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm font-medium">Documents</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <div className="p-3 bg-emerald-100 rounded-lg inline-block mb-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-sm font-medium">Business Terms</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-block mb-2">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-sm font-medium">Database Schemas</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <div className="p-3 bg-indigo-100 rounded-lg inline-block mb-2">
              <Table className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-sm font-medium">Database Tables</div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <div className="p-3 bg-amber-100 rounded-lg inline-block mb-2">
              <GitBranch className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-sm font-medium">Services</div>
          </div>
        </div>
      </div>
    </div>
  );
}