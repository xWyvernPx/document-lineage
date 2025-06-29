import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Database, 
  Table, 
  BarChart3, 
  GitBranch, 
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Code,
  Activity,
  FileText,
  Network,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Brain,
  Download,
  Edit3,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface NAPASLineageNode {
  id: string;
  name: string;
  type: 'document' | 'term' | 'schema' | 'service' | 'system' | 'api' | 'database' | 'middleware';
  system: string;
  schema?: string;
  table?: string;
  column?: string;
  metadata?: {
    description?: string;
    owner?: string;
    lastModified?: string;
    tags?: string[];
    confidence?: number;
    status?: 'active' | 'deprecated' | 'pending' | 'review';
    documentId?: string;
    sourceSection?: string;
  };
  position: { x: number; y: number };
}

interface NAPASLineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-to' | 'maps-to' | 'depends-on' | 'integrates-with' | 'transforms-to' | 'validates-against' | 'contains';
  description?: string;
  transformationLogic?: string;
  confidence?: number;
}

interface NAPASLineageData {
  nodes: NAPASLineageNode[];
  edges: NAPASLineageEdge[];
  focusNode: string;
}

// Mock NAPAS ACH lineage data based on the actual data structure
const mockNAPASLineageData: NAPASLineageData = {
  focusNode: 'dpg-001',
  nodes: [
    // Documents
    {
      id: 'dpg-001',
      name: 'DPG Middleware Integration Specification v2.1.pdf',
      type: 'document',
      system: 'Document Management',
      metadata: {
        description: 'Technical specification for DPG middleware integration with NAPAS',
        owner: 'Technical Architecture Team',
        lastModified: '2024-01-15T09:30:00Z',
        tags: ['technical', 'integration', 'middleware', 'napas'],
        confidence: 0.94,
        status: 'active',
        documentId: 'dpg-001',
        sourceSection: 'System Overview'
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'dpg-002',
      name: 'NAPAS Connectivity Requirements and SLA v1.3.docx',
      type: 'document',
      system: 'Document Management',
      metadata: {
        description: 'Infrastructure requirements and SLA specifications for NAPAS connectivity',
        owner: 'Infrastructure Team',
        lastModified: '2024-01-14T14:20:00Z',
        tags: ['infrastructure', 'sla', 'connectivity', 'napas'],
        confidence: 0.92,
        status: 'active',
        documentId: 'dpg-002',
        sourceSection: 'Network Connectivity'
      },
      position: { x: 100, y: 400 }
    },
    {
      id: 'tps-001',
      name: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
      type: 'document',
      system: 'Document Management',
      metadata: {
        description: 'Business requirements for ACH payment orchestration and processing',
        owner: 'Payment Product Team',
        lastModified: '2024-01-16T10:15:00Z',
        tags: ['business', 'payment', 'orchestration', 'ach'],
        confidence: 0.95,
        status: 'active',
        documentId: 'tps-001',
        sourceSection: 'Business Overview'
      },
      position: { x: 100, y: 600 }
    },
    
    // Terms extracted from documents
    {
      id: 'term-msg-routing',
      name: 'Message Routing Engine',
      type: 'term',
      system: 'Term Dictionary',
      metadata: {
        description: 'Core component responsible for directing ACH messages between internal services and NAPAS',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['system-component', 'routing', 'ach', 'middleware'],
        confidence: 0.96,
        status: 'active',
        documentId: 'dpg-001',
        sourceSection: 'System Overview'
      },
      position: { x: 400, y: 200 }
    },
    {
      id: 'term-correlation-id',
      name: 'Transaction Correlation ID',
      type: 'term',
      system: 'Term Dictionary',
      metadata: {
        description: 'Unique identifier that tracks a single ACH transaction across all system components',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['data-element', 'tracking', 'correlation', 'ach'],
        confidence: 0.93,
        status: 'active',
        documentId: 'dpg-001',
        sourceSection: 'Message Routing'
      },
      position: { x: 400, y: 350 }
    },
    {
      id: 'term-circuit-breaker',
      name: 'Circuit Breaker Pattern',
      type: 'term',
      system: 'Term Dictionary',
      metadata: {
        description: 'Fault tolerance mechanism that prevents cascading failures',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['design-pattern', 'fault-tolerance', 'resilience'],
        confidence: 0.89,
        status: 'active',
        documentId: 'dpg-001',
        sourceSection: 'Error Handling'
      },
      position: { x: 400, y: 500 }
    },
    {
      id: 'term-dedicated-line',
      name: 'NAPAS Dedicated Line',
      type: 'term',
      system: 'Term Dictionary',
      metadata: {
        description: 'Secure, dedicated network connection between bank infrastructure and NAPAS',
        owner: 'Data Governance Team',
        lastModified: '2024-01-14T16:20:00Z',
        tags: ['infrastructure', 'network', 'connectivity', 'napas'],
        confidence: 0.94,
        status: 'active',
        documentId: 'dpg-002',
        sourceSection: 'Network Connectivity'
      },
      position: { x: 400, y: 650 }
    },
    
    // Schema mappings
    {
      id: 'schema-dpg-middleware',
      name: 'dpg_middleware',
      type: 'schema',
      system: 'Database',
      schema: 'dpg_middleware',
      metadata: {
        description: 'DPG middleware database schema for NAPAS integration',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['database', 'schema', 'middleware', 'napas'],
        confidence: 0.95,
        status: 'active'
      },
      position: { x: 700, y: 200 }
    },
    {
      id: 'schema-infrastructure',
      name: 'infrastructure',
      type: 'schema',
      system: 'Database',
      schema: 'infrastructure',
      metadata: {
        description: 'Infrastructure configuration and monitoring schema',
        owner: 'Infrastructure Team',
        lastModified: '2024-01-14T18:00:00Z',
        tags: ['database', 'schema', 'infrastructure', 'monitoring'],
        confidence: 0.92,
        status: 'active'
      },
      position: { x: 700, y: 400 }
    },
    
    // Database tables
    {
      id: 'table-message-routing',
      name: 'message_routing',
      type: 'database',
      system: 'Database',
      schema: 'dpg_middleware',
      table: 'message_routing',
      metadata: {
        description: 'Message routing configuration and state management',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['table', 'routing', 'configuration'],
        confidence: 0.95,
        status: 'active'
      },
      position: { x: 1000, y: 150 }
    },
    {
      id: 'table-circuit-breaker',
      name: 'circuit_breaker_state',
      type: 'database',
      system: 'Database',
      schema: 'dpg_middleware',
      table: 'circuit_breaker_state',
      metadata: {
        description: 'Circuit breaker state and configuration management',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['table', 'circuit-breaker', 'state'],
        confidence: 0.88,
        status: 'active'
      },
      position: { x: 1000, y: 300 }
    },
    {
      id: 'table-dedicated-line',
      name: 'dedicated_line_config',
      type: 'database',
      system: 'Database',
      schema: 'infrastructure',
      table: 'dedicated_line_config',
      metadata: {
        description: 'NAPAS dedicated line configuration and monitoring',
        owner: 'Infrastructure Team',
        lastModified: '2024-01-14T18:00:00Z',
        tags: ['table', 'network', 'configuration'],
        confidence: 0.95,
        status: 'active'
      },
      position: { x: 1000, y: 450 }
    },
    
    // Services
    {
      id: 'service-dpg',
      name: 'DPG Service',
      type: 'service',
      system: 'Microservices',
      metadata: {
        description: 'Digital Payment Gateway service for NAPAS integration',
        owner: 'Development Team',
        lastModified: '2024-01-15T10:00:00Z',
        tags: ['service', 'payment', 'gateway', 'napas'],
        confidence: 0.96,
        status: 'active'
      },
      position: { x: 1300, y: 200 }
    },
    {
      id: 'service-payment-orchestration',
      name: 'Payment Orchestration',
      type: 'service',
      system: 'Microservices',
      metadata: {
        description: 'ACH payment orchestration and processing service',
        owner: 'Payment Team',
        lastModified: '2024-01-16T11:00:00Z',
        tags: ['service', 'payment', 'orchestration', 'ach'],
        confidence: 0.94,
        status: 'active'
      },
      position: { x: 1300, y: 400 }
    }
  ],
  edges: [
    // Document to Term relationships
    {
      id: 'edge-doc1-term1',
      source: 'dpg-001',
      target: 'term-msg-routing',
      type: 'extracts-to',
      description: 'Extracted from System Overview section',
      confidence: 0.96
    },
    {
      id: 'edge-doc1-term2',
      source: 'dpg-001',
      target: 'term-correlation-id',
      type: 'extracts-to',
      description: 'Extracted from Message Routing section',
      confidence: 0.93
    },
    {
      id: 'edge-doc1-term3',
      source: 'dpg-001',
      target: 'term-circuit-breaker',
      type: 'extracts-to',
      description: 'Extracted from Error Handling section',
      confidence: 0.89
    },
    {
      id: 'edge-doc2-term4',
      source: 'dpg-002',
      target: 'term-dedicated-line',
      type: 'extracts-to',
      description: 'Extracted from Network Connectivity section',
      confidence: 0.94
    },
    
    // Term to Schema mappings
    {
      id: 'edge-term1-schema1',
      source: 'term-msg-routing',
      target: 'schema-dpg-middleware',
      type: 'maps-to',
      description: 'Maps to dpg_middleware schema',
      confidence: 0.94
    },
    {
      id: 'edge-term3-schema1',
      source: 'term-circuit-breaker',
      target: 'schema-dpg-middleware',
      type: 'maps-to',
      description: 'Maps to dpg_middleware schema',
      confidence: 0.88
    },
    {
      id: 'edge-term4-schema2',
      source: 'term-dedicated-line',
      target: 'schema-infrastructure',
      type: 'maps-to',
      description: 'Maps to infrastructure schema',
      confidence: 0.95
    },
    
    // Schema to Table relationships
    {
      id: 'edge-schema1-table1',
      source: 'schema-dpg-middleware',
      target: 'table-message-routing',
      type: 'contains',
      description: 'Contains message_routing table',
      confidence: 0.95
    },
    {
      id: 'edge-schema1-table2',
      source: 'schema-dpg-middleware',
      target: 'table-circuit-breaker',
      type: 'contains',
      description: 'Contains circuit_breaker_state table',
      confidence: 0.88
    },
    {
      id: 'edge-schema2-table3',
      source: 'schema-infrastructure',
      target: 'table-dedicated-line',
      type: 'contains',
      description: 'Contains dedicated_line_config table',
      confidence: 0.95
    },
    
    // Service dependencies
    {
      id: 'edge-table1-service1',
      source: 'table-message-routing',
      target: 'service-dpg',
      type: 'depends-on',
      description: 'DPG service depends on message routing configuration',
      confidence: 0.95
    },
    {
      id: 'edge-table2-service1',
      source: 'table-circuit-breaker',
      target: 'service-dpg',
      type: 'depends-on',
      description: 'DPG service depends on circuit breaker state',
      confidence: 0.88
    },
    {
      id: 'edge-table3-service2',
      source: 'table-dedicated-line',
      target: 'service-payment-orchestration',
      type: 'depends-on',
      description: 'Payment orchestration depends on network configuration',
      confidence: 0.95
    }
  ]
};

export function DataLineageViewer() {
  const [lineageData] = useState<NAPASLineageData>(mockNAPASLineageData);
  const [selectedNode, setSelectedNode] = useState<NAPASLineageNode | null>(
    lineageData.nodes.find(n => n.id === lineageData.focusNode) || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'overview' | 'lineage' | 'mappings' | 'metadata'>('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    documents: true,
    terms: true,
    schemas: true,
    services: true
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getNodeIcon = (type: NAPASLineageNode['type']) => {
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
      case 'system':
        return <Network className="w-4 h-4" />;
      case 'api':
        return <Code className="w-4 h-4" />;
      case 'middleware':
        return <Activity className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: NAPASLineageNode['type'], isSelected: boolean) => {
    const baseColors = {
      document: isSelected ? 'bg-blue-600 border-blue-700' : 'bg-blue-500 border-blue-600',
      term: isSelected ? 'bg-emerald-600 border-emerald-700' : 'bg-emerald-500 border-emerald-600',
      schema: isSelected ? 'bg-purple-600 border-purple-700' : 'bg-purple-500 border-purple-600',
      database: isSelected ? 'bg-indigo-600 border-indigo-700' : 'bg-indigo-500 border-indigo-600',
      service: isSelected ? 'bg-amber-600 border-amber-700' : 'bg-amber-500 border-amber-600',
      system: isSelected ? 'bg-gray-600 border-gray-700' : 'bg-gray-500 border-gray-600',
      api: isSelected ? 'bg-rose-600 border-rose-700' : 'bg-rose-500 border-rose-600',
      middleware: isSelected ? 'bg-cyan-600 border-cyan-700' : 'bg-cyan-500 border-cyan-600'
    };
    return baseColors[type];
  };

  const getEdgeColor = (type: NAPASLineageEdge['type']) => {
    switch (type) {
      case 'extracts-to':
        return 'stroke-blue-500';
      case 'maps-to':
        return 'stroke-emerald-500';
      case 'depends-on':
        return 'stroke-amber-500';
      case 'integrates-with':
        return 'stroke-purple-500';
      case 'transforms-to':
        return 'stroke-rose-500';
      case 'validates-against':
        return 'stroke-cyan-500';
      case 'contains':
        return 'stroke-gray-500';
      default:
        return 'stroke-gray-400';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deprecated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderNode = (node: NAPASLineageNode) => {
    const isSelected = selectedNode?.id === node.id;
    const isFocus = node.id === lineageData.focusNode;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isFocus ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
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
            <div className={`p-1.5 rounded text-white ${getNodeColor(node.type, isSelected)}`}>
              {getNodeIcon(node.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {node.schema && node.table ? `${node.schema}.${node.table}` : node.name}
              </h3>
              <p className="text-xs text-gray-500">{node.system}</p>
            </div>
            {node.metadata?.status && getStatusIcon(node.metadata.status)}
          </div>
          
          {node.metadata?.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {node.metadata.description}
            </p>
          )}
          
          {node.metadata?.confidence && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Confidence:</span>
              <span className="font-medium text-gray-700">
                {Math.round(node.metadata.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEdge = (edge: NAPASLineageEdge) => {
    const sourceNode = lineageData.nodes.find(n => n.id === edge.source);
    const targetNode = lineageData.nodes.find(n => n.id === edge.target);
    
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
        {edge.description && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 25}
            className="text-xs fill-gray-600"
            textAnchor="middle"
          >
            {edge.description}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">NAPAS ACH Data Lineage</h1>
            <p className="text-sm text-gray-600">Document to Schema Mapping and Lineage Tracking</p>
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

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents, terms, schemas, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Types
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Types</option>
                  <option>Documents</option>
                  <option>Terms</option>
                  <option>Schemas</option>
                  <option>Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Systems
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Systems</option>
                  <option>Document Management</option>
                  <option>Term Dictionary</option>
                  <option>Database</option>
                  <option>Microservices</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Deprecated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Levels</option>
                  <option>High (90%+)</option>
                  <option>Medium (70-89%)</option>
                  <option>Low (&lt;70%)</option>
                </select>
              </div>
            </div>
          </div>
        )}
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
              {lineageData.edges.map(renderEdge)}
            </svg>
            
            {/* Nodes */}
            {lineageData.nodes.map(renderNode)}
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
                    {selectedNode.schema && selectedNode.table ? 
                      `${selectedNode.schema}.${selectedNode.table}` : 
                      selectedNode.name
                    }
                  </h2>
                  <Button variant="ghost" size="sm" icon={ExternalLink} />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{selectedNode.system}</Badge>
                  <Badge variant="default">{selectedNode.type}</Badge>
                  {selectedNode.metadata?.status && (
                    <Badge variant={selectedNode.metadata.status === 'active' ? 'success' : 'warning'}>
                      {selectedNode.metadata.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'lineage', label: 'Lineage' },
                    { id: 'mappings', label: 'Mappings' },
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
                        {selectedNode.metadata?.description || 'No description available'}
                      </p>
                    </div>
                    
                    {selectedNode.metadata?.confidence && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Confidence Score</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${selectedNode.metadata.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round(selectedNode.metadata.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Metadata</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span className="text-gray-900">{selectedNode.metadata?.owner || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Modified:</span>
                          <span className="text-gray-900">
                            {selectedNode.metadata?.lastModified ? 
                              new Date(selectedNode.metadata.lastModified).toLocaleDateString() : 
                              'Unknown'
                            }
                          </span>
                        </div>
                        {selectedNode.metadata?.documentId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Document ID:</span>
                            <span className="text-gray-900">{selectedNode.metadata.documentId}</span>
                          </div>
                        )}
                        {selectedNode.metadata?.sourceSection && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Source Section:</span>
                            <span className="text-gray-900">{selectedNode.metadata.sourceSection}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedNode.metadata?.tags && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.metadata.tags.map(tag => (
                            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'lineage' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Upstream Dependencies</h3>
                      <div className="space-y-2">
                        {lineageData.edges
                          .filter(edge => edge.target === selectedNode.id)
                          .map(edge => {
                            const sourceNode = lineageData.nodes.find(n => n.id === edge.source);
                            return (
                              <div key={edge.id} className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{sourceNode?.name}</span>
                                  <Badge variant="info" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                                {edge.confidence && (
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">Confidence:</span>
                                    <span className="text-xs font-medium">{Math.round(edge.confidence * 100)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {lineageData.edges.filter(edge => edge.target === selectedNode.id).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No upstream dependencies found</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Downstream Dependencies</h3>
                      <div className="space-y-2">
                        {lineageData.edges
                          .filter(edge => edge.source === selectedNode.id)
                          .map(edge => {
                            const targetNode = lineageData.nodes.find(n => n.id === edge.target);
                            return (
                              <div key={edge.id} className="p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{targetNode?.name}</span>
                                  <Badge variant="success" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                                {edge.confidence && (
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-500">Confidence:</span>
                                    <span className="text-xs font-medium">{Math.round(edge.confidence * 100)}%</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        {lineageData.edges.filter(edge => edge.source === selectedNode.id).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No downstream dependencies found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'mappings' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Schema Mappings</h3>
                      <div className="space-y-2">
                        {selectedNode.schema && selectedNode.table ? (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{selectedNode.schema}.{selectedNode.table}</span>
                              <Badge variant="default" size="sm">Current</Badge>
                            </div>
                            <p className="text-xs text-gray-600">Active schema mapping</p>
                            {selectedNode.metadata?.confidence && (
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">Confidence:</span>
                                <span className="text-xs font-medium">{Math.round(selectedNode.metadata.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No schema mappings available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Related Terms</h3>
                      <div className="space-y-2">
                        {lineageData.nodes
                          .filter(node => 
                            node.type === 'term' && 
                            lineageData.edges.some(edge => 
                              (edge.source === selectedNode.id && edge.target === node.id) ||
                              (edge.target === selectedNode.id && edge.source === node.id)
                            )
                          )
                          .map(term => (
                            <div key={term.id} className="p-3 bg-amber-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{term.name}</span>
                                <Badge variant="warning" size="sm">Term</Badge>
                              </div>
                              <p className="text-xs text-gray-600">{term.metadata?.description}</p>
                            </div>
                          ))}
                        {lineageData.nodes.filter(node => 
                          node.type === 'term' && 
                          lineageData.edges.some(edge => 
                            (edge.source === selectedNode.id && edge.target === node.id) ||
                            (edge.target === selectedNode.id && edge.source === node.id)
                          )
                        ).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No related terms found</p>
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
                        {selectedNode.schema && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Schema:</span>
                            <span className="text-gray-900">{selectedNode.schema}</span>
                          </div>
                        )}
                        {selectedNode.table && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Table:</span>
                            <span className="text-gray-900">{selectedNode.table}</span>
                          </div>
                        )}
                        {selectedNode.column && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Column:</span>
                            <span className="text-gray-900">{selectedNode.column}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Document Information</h3>
                      <div className="space-y-2 text-sm">
                        {selectedNode.metadata?.documentId ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Document ID:</span>
                              <span className="text-gray-900">{selectedNode.metadata.documentId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Source Section:</span>
                              <span className="text-gray-900">{selectedNode.metadata.sourceSection}</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">No document information available</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Quality Metrics</h3>
                      <div className="space-y-2 text-sm">
                        {selectedNode.metadata?.confidence && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence Score:</span>
                            <span className="text-gray-900">{Math.round(selectedNode.metadata.confidence * 100)}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-gray-900">{selectedNode.metadata?.status || 'Unknown'}</span>
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
    </div>
  );
}