import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText,
  BookOpen,
  Database,
  Table,
  GitBranch,
  Network,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface NAPASLineageNode {
  id: string;
  name: string;
  type: 'document' | 'term' | 'schema' | 'service' | 'database';
  system: string;
  schema?: string;
  table?: string;
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
}

interface NAPASLineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-to' | 'maps-to' | 'depends-on' | 'integrates-with';
  description?: string;
  confidence?: number;
}

// Mock NAPAS ACH lineage data based on the actual data structure
const mockNAPASData = {
  documents: [
    {
      id: 'dpg-001',
      name: 'DPG Middleware Integration Specification v2.1.pdf',
      type: 'document' as const,
      system: 'Document Management',
      metadata: {
        description: 'Technical specification for DPG middleware integration with NAPAS',
        owner: 'Technical Architecture Team',
        lastModified: '2024-01-15T09:30:00Z',
        tags: ['technical', 'integration', 'middleware', 'napas'],
        confidence: 0.94,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'System Overview'
      }
    },
    {
      id: 'dpg-002',
      name: 'NAPAS Connectivity Requirements and SLA v1.3.docx',
      type: 'document' as const,
      system: 'Document Management',
      metadata: {
        description: 'Infrastructure requirements and SLA specifications for NAPAS connectivity',
        owner: 'Infrastructure Team',
        lastModified: '2024-01-14T14:20:00Z',
        tags: ['infrastructure', 'sla', 'connectivity', 'napas'],
        confidence: 0.92,
        status: 'active' as const,
        documentId: 'dpg-002',
        sourceSection: 'Network Connectivity'
      }
    }
  ],
  terms: [
    {
      id: 'term-msg-routing',
      name: 'Message Routing Engine',
      type: 'term' as const,
      system: 'Term Dictionary',
      metadata: {
        description: 'Core component responsible for directing ACH messages between internal services and NAPAS',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['system-component', 'routing', 'ach', 'middleware'],
        confidence: 0.96,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'System Overview'
      }
    },
    {
      id: 'term-correlation-id',
      name: 'Transaction Correlation ID',
      type: 'term' as const,
      system: 'Term Dictionary',
      metadata: {
        description: 'Unique identifier that tracks a single ACH transaction across all system components',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['data-element', 'tracking', 'correlation', 'ach'],
        confidence: 0.93,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'Message Routing'
      }
    },
    {
      id: 'term-circuit-breaker',
      name: 'Circuit Breaker Pattern',
      type: 'term' as const,
      system: 'Term Dictionary',
      metadata: {
        description: 'Fault tolerance mechanism that prevents cascading failures',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['design-pattern', 'fault-tolerance', 'resilience'],
        confidence: 0.89,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'Error Handling'
      }
    }
  ],
  schemas: [
    {
      id: 'schema-dpg-middleware',
      name: 'dpg_middleware',
      type: 'schema' as const,
      system: 'Database',
      schema: 'dpg_middleware',
      metadata: {
        description: 'DPG middleware database schema for NAPAS integration',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['database', 'schema', 'middleware', 'napas'],
        confidence: 0.95,
        status: 'active' as const
      }
    },
    {
      id: 'schema-infrastructure',
      name: 'infrastructure',
      type: 'schema' as const,
      system: 'Database',
      schema: 'infrastructure',
      metadata: {
        description: 'Infrastructure configuration and monitoring schema',
        owner: 'Infrastructure Team',
        lastModified: '2024-01-14T18:00:00Z',
        tags: ['database', 'schema', 'infrastructure', 'monitoring'],
        confidence: 0.92,
        status: 'active' as const
      }
    }
  ],
  tables: [
    {
      id: 'table-message-routing',
      name: 'message_routing',
      type: 'database' as const,
      system: 'Database',
      schema: 'dpg_middleware',
      table: 'message_routing',
      metadata: {
        description: 'Message routing configuration and state management',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['table', 'routing', 'configuration'],
        confidence: 0.95,
        status: 'active' as const
      }
    },
    {
      id: 'table-circuit-breaker',
      name: 'circuit_breaker_state',
      type: 'database' as const,
      system: 'Database',
      schema: 'dpg_middleware',
      table: 'circuit_breaker_state',
      metadata: {
        description: 'Circuit breaker state and configuration management',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['table', 'circuit-breaker', 'state'],
        confidence: 0.88,
        status: 'active' as const
      }
    }
  ],
  services: [
    {
      id: 'service-dpg',
      name: 'DPG Service',
      type: 'service' as const,
      system: 'Microservices',
      metadata: {
        description: 'Digital Payment Gateway service for NAPAS integration',
        owner: 'Development Team',
        lastModified: '2024-01-15T10:00:00Z',
        tags: ['service', 'payment', 'gateway', 'napas'],
        confidence: 0.96,
        status: 'active' as const
      }
    }
  ]
};

export function NAPASLineageViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'documents' | 'terms' | 'schemas' | 'tables' | 'services'>('all');
  const [selectedNode, setSelectedNode] = useState<NAPASLineageNode | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    documents: true,
    terms: true,
    schemas: true,
    tables: true,
    services: true
  });

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
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: NAPASLineageNode['type']) => {
    const colors = {
      document: 'bg-blue-500 border-blue-600',
      term: 'bg-emerald-500 border-emerald-600',
      schema: 'bg-purple-500 border-purple-600',
      database: 'bg-indigo-500 border-indigo-600',
      service: 'bg-amber-500 border-amber-600'
    };
    return colors[type];
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderNodeCard = (node: NAPASLineageNode) => (
    <div key={node.id} className="cursor-pointer" onClick={() => setSelectedNode(node)}>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg text-white ${getNodeColor(node.type)}`}>
            {getNodeIcon(node.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {node.schema && node.table ? `${node.schema}.${node.table}` : node.name}
              </h3>
              {node.metadata?.status && getStatusIcon(node.metadata.status)}
            </div>
            <p className="text-xs text-gray-500 mb-2">{node.system}</p>
            {node.metadata?.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {node.metadata.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {node.metadata?.tags?.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                ))}
                {node.metadata?.tags && node.metadata.tags.length > 2 && (
                  <Badge variant="default" size="sm">+{node.metadata.tags.length - 2}</Badge>
                )}
              </div>
              {node.metadata?.confidence && (
                <span className="text-xs font-medium text-gray-700">
                  {Math.round(node.metadata.confidence * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSection = (title: string, key: string, nodes: NAPASLineageNode[]) => (
    <div key={key} className="space-y-3">
      <button
        onClick={() => toggleSection(key)}
        className="flex items-center justify-between w-full py-2 text-left hover:bg-gray-50 rounded-lg px-2"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{nodes.length}</span>
          {expandedSections[key] ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      
      {expandedSections[key] && (
        <div className="space-y-3 pl-4">
          {nodes.map(renderNodeCard)}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">NAPAS ACH Data Lineage</h1>
            <p className="text-sm text-gray-600">Document to Schema Mapping and Lineage Tracking</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents, terms, schemas, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === 'documents' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('documents')}
            >
              Documents
            </Button>
            <Button
              variant={selectedCategory === 'terms' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('terms')}
            >
              Terms
            </Button>
            <Button
              variant={selectedCategory === 'schemas' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('schemas')}
            >
              Schemas
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Node List */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto p-4">
          <div className="space-y-6">
            {selectedCategory === 'all' || selectedCategory === 'documents' ? 
              renderSection('Documents', 'documents', mockNAPASData.documents) : null}
            {selectedCategory === 'all' || selectedCategory === 'terms' ? 
              renderSection('Terms', 'terms', mockNAPASData.terms) : null}
            {selectedCategory === 'all' || selectedCategory === 'schemas' ? 
              renderSection('Schemas', 'schemas', mockNAPASData.schemas) : null}
            {selectedCategory === 'all' || selectedCategory === 'tables' ? 
              renderSection('Database Tables', 'tables', mockNAPASData.tables) : null}
            {selectedCategory === 'all' || selectedCategory === 'services' ? 
              renderSection('Services', 'services', mockNAPASData.services) : null}
          </div>
        </div>

        {/* Right Panel - Node Details */}
        <div className="w-1/2 bg-white overflow-y-auto p-4">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Node Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg text-white ${getNodeColor(selectedNode.type)}`}>
                    {getNodeIcon(selectedNode.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedNode.schema && selectedNode.table ? 
                        `${selectedNode.schema}.${selectedNode.table}` : 
                        selectedNode.name
                      }
                    </h2>
                    <p className="text-sm text-gray-500">{selectedNode.system}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{selectedNode.type}</Badge>
                  {selectedNode.metadata?.status && (
                    <Badge variant={selectedNode.metadata.status === 'active' ? 'success' : 'warning'}>
                      {selectedNode.metadata.status}
                    </Badge>
                  )}
                  {selectedNode.metadata?.confidence && (
                    <Badge variant="default">
                      {Math.round(selectedNode.metadata.confidence * 100)}% Confidence
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedNode.metadata?.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedNode.metadata.description}</p>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Metadata</h3>
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

              {/* Tags */}
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

              {/* Lineage Information */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Lineage Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Source Document</span>
                      <Badge variant="info" size="sm">Document</Badge>
                    </div>
                    <p className="text-gray-600">
                      {selectedNode.metadata?.documentId ? 
                        `Extracted from ${selectedNode.metadata.documentId}` : 
                        'No source document identified'
                      }
                    </p>
                  </div>
                  
                  {selectedNode.schema && (
                    <div className="p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Schema Mapping</span>
                        <Badge variant="success" size="sm">Schema</Badge>
                      </div>
                      <p className="text-gray-600">
                        Mapped to {selectedNode.schema} schema
                        {selectedNode.table && ` in ${selectedNode.table} table`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Node</h3>
                <p className="text-gray-500 max-w-sm">
                  Click on any document, term, schema, or service to view its details and lineage information.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 