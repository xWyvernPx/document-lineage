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
  ChevronRight,
  ArrowRight,
  Users,
  Calendar,
  Tag,
  ExternalLink,
  Download,
  Share2,
  Zap,
  TrendingUp,
  Activity,
  Shield,
  Code,
  Settings,
  Info,
  Star,
  Heart,
  Lightbulb
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
    usageCount?: number;
    businessValue?: 'high' | 'medium' | 'low';
    dataQuality?: number;
  };
}

interface LineageConnection {
  from: string;
  to: string;
  type: 'extracts-to' | 'maps-to' | 'depends-on' | 'integrates-with' | 'transforms-to';
  description: string;
  confidence: number;
}

// Enhanced mock data with more realistic NAPAS ACH content
const mockNAPASData = {
  documents: [
    {
      id: 'dpg-001',
      name: 'DPG Middleware Integration Specification v2.1.pdf',
      type: 'document' as const,
      system: 'Document Management',
      metadata: {
        description: 'Comprehensive technical specification for integrating DPG middleware with NAPAS ACH processing infrastructure',
        owner: 'Technical Architecture Team',
        lastModified: '2024-01-15T09:30:00Z',
        tags: ['technical', 'integration', 'middleware', 'napas', 'ach'],
        confidence: 0.94,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'System Overview',
        usageCount: 47,
        businessValue: 'high' as const,
        dataQuality: 0.96
      }
    },
    {
      id: 'payment-brd',
      name: 'ACH Payment Orchestration Business Requirements v3.0.pdf',
      type: 'document' as const,
      system: 'Document Management',
      metadata: {
        description: 'Business requirements for orchestrating ACH payments across multiple third-party providers and internal banking services',
        owner: 'Payment Product Team',
        lastModified: '2024-01-16T10:15:00Z',
        tags: ['business', 'payment', 'orchestration', 'ach', 'requirements'],
        confidence: 0.95,
        status: 'active' as const,
        documentId: 'payment-brd',
        sourceSection: 'Business Overview',
        usageCount: 89,
        businessValue: 'high' as const,
        dataQuality: 0.98
      }
    },
    {
      id: 'portal-guide',
      name: 'Business User Portal Requirements v1.8.docx',
      type: 'document' as const,
      system: 'Document Management',
      metadata: {
        description: 'User interface requirements and workflows for business users monitoring ACH transactions',
        owner: 'Business Operations Team',
        lastModified: '2024-01-15T11:30:00Z',
        tags: ['ui', 'portal', 'business', 'monitoring', 'ach'],
        confidence: 0.88,
        status: 'active' as const,
        documentId: 'portal-guide',
        sourceSection: 'Dashboard Requirements',
        usageCount: 34,
        businessValue: 'medium' as const,
        dataQuality: 0.91
      }
    }
  ],
  terms: [
    {
      id: 'term-msg-routing',
      name: 'Message Routing Engine',
      type: 'term' as const,
      system: 'Business Glossary',
      metadata: {
        description: 'Core component responsible for directing ACH messages between internal services and NAPAS based on transaction type and routing rules',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T15:30:00Z',
        tags: ['system-component', 'routing', 'ach', 'middleware', 'preferred'],
        confidence: 0.96,
        status: 'active' as const,
        documentId: 'dpg-001',
        sourceSection: 'System Overview',
        usageCount: 156,
        businessValue: 'high' as const,
        dataQuality: 0.97
      }
    },
    {
      id: 'term-payment-orchestration',
      name: 'Payment Orchestration Engine',
      type: 'term' as const,
      system: 'Business Glossary',
      metadata: {
        description: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services',
        owner: 'Data Governance Team',
        lastModified: '2024-01-16T11:20:00Z',
        tags: ['system-component', 'payment', 'orchestration', 'ach', 'preferred'],
        confidence: 0.96,
        status: 'active' as const,
        documentId: 'payment-brd',
        sourceSection: 'Business Overview',
        usageCount: 203,
        businessValue: 'high' as const,
        dataQuality: 0.98
      }
    },
    {
      id: 'term-transaction-dashboard',
      name: 'Transaction Dashboard',
      type: 'term' as const,
      system: 'Business Glossary',
      metadata: {
        description: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails',
        owner: 'Data Governance Team',
        lastModified: '2024-01-15T14:45:00Z',
        tags: ['ui-component', 'monitoring', 'dashboard', 'ach', 'real-time'],
        confidence: 0.92,
        status: 'active' as const,
        documentId: 'portal-guide',
        sourceSection: 'Dashboard Requirements',
        usageCount: 78,
        businessValue: 'medium' as const,
        dataQuality: 0.94
      }
    },
    {
      id: 'term-same-day-ach',
      name: 'Same-Day ACH',
      type: 'term' as const,
      system: 'Business Glossary',
      metadata: {
        description: 'Expedited ACH processing service that enables same-business-day settlement for qualifying transactions through NAPAS infrastructure',
        owner: 'Data Governance Team',
        lastModified: '2024-01-16T09:15:00Z',
        tags: ['payment-type', 'expedited', 'settlement', 'ach', 'napas'],
        confidence: 0.93,
        status: 'active' as const,
        documentId: 'payment-brd',
        sourceSection: 'Payment Types',
        usageCount: 145,
        businessValue: 'high' as const,
        dataQuality: 0.95
      }
    }
  ],
  schemas: [
    {
      id: 'schema-dpg-middleware',
      name: 'dpg_middleware',
      type: 'schema' as const,
      system: 'Database Schema Registry',
      schema: 'dpg_middleware',
      metadata: {
        description: 'Database schema containing DPG middleware configuration, routing rules, and message processing state for NAPAS integration',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['database', 'schema', 'middleware', 'napas', 'production'],
        confidence: 0.95,
        status: 'active' as const,
        usageCount: 89,
        businessValue: 'high' as const,
        dataQuality: 0.97
      }
    },
    {
      id: 'schema-payment-orchestration',
      name: 'payment_orchestration',
      type: 'schema' as const,
      system: 'Database Schema Registry',
      schema: 'payment_orchestration',
      metadata: {
        description: 'Schema for payment orchestration engine including routing rules, provider configurations, and transaction workflows',
        owner: 'Payment Team',
        lastModified: '2024-01-16T13:30:00Z',
        tags: ['database', 'schema', 'payment', 'orchestration', 'production'],
        confidence: 0.97,
        status: 'active' as const,
        usageCount: 134,
        businessValue: 'high' as const,
        dataQuality: 0.98
      }
    },
    {
      id: 'schema-business-portal',
      name: 'business_portal',
      type: 'schema' as const,
      system: 'Database Schema Registry',
      schema: 'business_portal',
      metadata: {
        description: 'Schema supporting business user portal functionality including dashboards, reports, and user management',
        owner: 'Portal Team',
        lastModified: '2024-01-15T16:20:00Z',
        tags: ['database', 'schema', 'portal', 'ui', 'business'],
        confidence: 0.89,
        status: 'active' as const,
        usageCount: 67,
        businessValue: 'medium' as const,
        dataQuality: 0.92
      }
    }
  ],
  tables: [
    {
      id: 'table-message-routing',
      name: 'message_routing',
      type: 'database' as const,
      system: 'Production Database',
      schema: 'dpg_middleware',
      table: 'message_routing',
      metadata: {
        description: 'Configuration table for ACH message routing rules, including NAPAS endpoint mappings and transformation logic',
        owner: 'Database Team',
        lastModified: '2024-01-15T12:00:00Z',
        tags: ['table', 'routing', 'configuration', 'ach', 'napas'],
        confidence: 0.95,
        status: 'active' as const,
        usageCount: 245,
        businessValue: 'high' as const,
        dataQuality: 0.96
      }
    },
    {
      id: 'table-payment-routes',
      name: 'payment_routes',
      type: 'database' as const,
      system: 'Production Database',
      schema: 'payment_orchestration',
      table: 'payment_routes',
      metadata: {
        description: 'Payment routing configuration including provider selection logic, fallback rules, and cost optimization parameters',
        owner: 'Payment Team',
        lastModified: '2024-01-16T14:15:00Z',
        tags: ['table', 'payment', 'routing', 'providers', 'optimization'],
        confidence: 0.97,
        status: 'active' as const,
        usageCount: 189,
        businessValue: 'high' as const,
        dataQuality: 0.98
      }
    },
    {
      id: 'table-dashboard-config',
      name: 'dashboard_config',
      type: 'database' as const,
      system: 'Production Database',
      schema: 'business_portal',
      table: 'dashboard_config',
      metadata: {
        description: 'Configuration for business user dashboards including widget layouts, data sources, and refresh intervals',
        owner: 'Portal Team',
        lastModified: '2024-01-15T17:30:00Z',
        tags: ['table', 'dashboard', 'configuration', 'ui', 'business'],
        confidence: 0.91,
        status: 'active' as const,
        usageCount: 78,
        businessValue: 'medium' as const,
        dataQuality: 0.93
      }
    }
  ],
  services: [
    {
      id: 'service-dpg',
      name: 'DPG Service',
      type: 'service' as const,
      system: 'Microservices Platform',
      metadata: {
        description: 'Digital Payment Gateway service providing secure, reliable communication with NAPAS ACH infrastructure',
        owner: 'Development Team',
        lastModified: '2024-01-15T10:00:00Z',
        tags: ['service', 'payment', 'gateway', 'napas', 'production'],
        confidence: 0.96,
        status: 'active' as const,
        usageCount: 1247,
        businessValue: 'high' as const,
        dataQuality: 0.97
      }
    },
    {
      id: 'service-payment-orchestration',
      name: 'Payment Orchestration Service',
      type: 'service' as const,
      system: 'Microservices Platform',
      metadata: {
        description: 'Orchestrates ACH payment processing across multiple providers with intelligent routing and fallback capabilities',
        owner: 'Payment Team',
        lastModified: '2024-01-16T11:45:00Z',
        tags: ['service', 'payment', 'orchestration', 'ach', 'production'],
        confidence: 0.98,
        status: 'active' as const,
        usageCount: 2156,
        businessValue: 'high' as const,
        dataQuality: 0.99
      }
    },
    {
      id: 'service-business-portal',
      name: 'Business Portal Service',
      type: 'service' as const,
      system: 'Microservices Platform',
      metadata: {
        description: 'Web service powering business user interfaces for ACH transaction monitoring and management',
        owner: 'Portal Team',
        lastModified: '2024-01-15T15:20:00Z',
        tags: ['service', 'portal', 'ui', 'business', 'monitoring'],
        confidence: 0.92,
        status: 'active' as const,
        usageCount: 567,
        businessValue: 'medium' as const,
        dataQuality: 0.94
      }
    }
  ]
};

const lineageConnections: LineageConnection[] = [
  {
    from: 'dpg-001',
    to: 'term-msg-routing',
    type: 'extracts-to',
    description: 'Term extracted from technical specification',
    confidence: 0.96
  },
  {
    from: 'payment-brd',
    to: 'term-payment-orchestration',
    type: 'extracts-to',
    description: 'Business concept defined in requirements',
    confidence: 0.96
  },
  {
    from: 'portal-guide',
    to: 'term-transaction-dashboard',
    type: 'extracts-to',
    description: 'UI component specified in portal requirements',
    confidence: 0.92
  },
  {
    from: 'term-msg-routing',
    to: 'schema-dpg-middleware',
    type: 'maps-to',
    description: 'Business concept implemented in database schema',
    confidence: 0.94
  },
  {
    from: 'term-payment-orchestration',
    to: 'schema-payment-orchestration',
    type: 'maps-to',
    description: 'Payment orchestration logic stored in dedicated schema',
    confidence: 0.97
  },
  {
    from: 'schema-dpg-middleware',
    to: 'table-message-routing',
    type: 'integrates-with',
    description: 'Schema contains routing configuration table',
    confidence: 0.95
  },
  {
    from: 'schema-payment-orchestration',
    to: 'table-payment-routes',
    type: 'integrates-with',
    description: 'Schema includes payment routing rules',
    confidence: 0.97
  },
  {
    from: 'table-message-routing',
    to: 'service-dpg',
    type: 'depends-on',
    description: 'Service reads routing configuration from table',
    confidence: 0.96
  },
  {
    from: 'table-payment-routes',
    to: 'service-payment-orchestration',
    type: 'depends-on',
    description: 'Service uses routing rules for payment processing',
    confidence: 0.98
  },
  {
    from: 'table-dashboard-config',
    to: 'service-business-portal',
    type: 'depends-on',
    description: 'Portal service loads dashboard configurations',
    confidence: 0.92
  }
];

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
  const [viewMode, setViewMode] = useState<'overview' | 'flow'>('overview');

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
      document: 'bg-blue-500 border-blue-600 text-white',
      term: 'bg-emerald-500 border-emerald-600 text-white',
      schema: 'bg-purple-500 border-purple-600 text-white',
      database: 'bg-indigo-500 border-indigo-600 text-white',
      service: 'bg-amber-500 border-amber-600 text-white'
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

  const getBusinessValueIcon = (value?: string) => {
    switch (value) {
      case 'high':
        return <Star className="w-4 h-4 text-amber-500 fill-current" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <Activity className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConnectedNodes = (nodeId: string) => {
    const connections = lineageConnections.filter(
      conn => conn.from === nodeId || conn.to === nodeId
    );
    return connections;
  };

  const renderNodeCard = (node: NAPASLineageNode) => (
    <div key={node.id} className="cursor-pointer group" onClick={() => setSelectedNode(node)}>
      <Card className={`p-4 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        selectedNode?.id === node.id ? 'ring-2 ring-blue-400 shadow-lg' : ''
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-lg ${getNodeColor(node.type)} shadow-sm`}>
            {getNodeIcon(node.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                {node.schema && node.table ? `${node.schema}.${node.table}` : node.name}
              </h3>
              <div className="flex items-center space-x-1">
                {node.metadata?.businessValue && getBusinessValueIcon(node.metadata.businessValue)}
                {node.metadata?.status && getStatusIcon(node.metadata.status)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="default" size="sm">{node.system}</Badge>
              {node.metadata?.tags?.includes('preferred') && (
                <Badge variant="warning" size="sm">Preferred</Badge>
              )}
              {node.metadata?.tags?.includes('production') && (
                <Badge variant="success" size="sm">Production</Badge>
              )}
            </div>

            {node.metadata?.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {node.metadata.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              {node.metadata?.confidence && (
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-600">
                    {Math.round(node.metadata.confidence * 100)}% confidence
                  </span>
                </div>
              )}
              
              {node.metadata?.usageCount && (
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-green-500" />
                  <span className="text-gray-600">
                    {node.metadata.usageCount} uses
                  </span>
                </div>
              )}
              
              {node.metadata?.dataQuality && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-gray-600">
                    {Math.round(node.metadata.dataQuality * 100)}% quality
                  </span>
                </div>
              )}
              
              {node.metadata?.owner && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600 truncate">
                    {node.metadata.owner.split(' ')[0]}
                  </span>
                </div>
              )}
            </div>

            {node.metadata?.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {node.metadata.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="default" size="sm" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {node.metadata.tags.length > 3 && (
                  <Badge variant="default" size="sm" className="text-xs">
                    +{node.metadata.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSection = (title: string, key: string, nodes: NAPASLineageNode[], icon: React.ComponentType<any>) => {
    const Icon = icon;
    return (
      <div key={key} className="space-y-3">
        <button
          onClick={() => toggleSection(key)}
          className="flex items-center justify-between w-full py-3 px-4 text-left hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="info" size="sm">{nodes.length}</Badge>
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
  };

  const renderFlowView = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">NAPAS ACH Data Flow</h3>
        <p className="text-gray-600">Follow the journey from business documents to production services</p>
      </div>
      
      {/* Flow visualization */}
      <div className="relative">
        <div className="flex flex-col space-y-8">
          {/* Documents to Terms */}
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <h4 className="font-medium text-gray-700">Business Documents</h4>
              <div className="grid grid-cols-1 gap-3">
                {mockNAPASData.documents.slice(0, 2).map(doc => (
                  <div key={doc.id} className="w-64">
                    {renderNodeCard(doc)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-gray-600 mt-2">extracts to</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <h4 className="font-medium text-gray-700">Business Terms</h4>
              <div className="grid grid-cols-1 gap-3">
                {mockNAPASData.terms.slice(0, 2).map(term => (
                  <div key={term.id} className="w-64">
                    {renderNodeCard(term)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Terms to Schemas */}
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <h4 className="font-medium text-gray-700">Database Schemas</h4>
              <div className="grid grid-cols-1 gap-3">
                {mockNAPASData.schemas.slice(0, 2).map(schema => (
                  <div key={schema.id} className="w-64">
                    {renderNodeCard(schema)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-gray-600 mt-2">implements as</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <h4 className="font-medium text-gray-700">Database Tables</h4>
              <div className="grid grid-cols-1 gap-3">
                {mockNAPASData.tables.slice(0, 2).map(table => (
                  <div key={table.id} className="w-64">
                    {renderNodeCard(table)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tables to Services */}
          <div className="flex items-center justify-center space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <h4 className="font-medium text-gray-700">Microservices</h4>
              <div className="grid grid-cols-1 gap-3">
                {mockNAPASData.services.slice(0, 2).map(service => (
                  <div key={service.id} className="w-64">
                    {renderNodeCard(service)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <ArrowRight className="w-8 h-8 text-amber-500" />
              <span className="text-sm text-gray-600 mt-2">powers</span>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-dashed border-green-300">
                <div className="text-center">
                  <Zap className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-green-800 mb-2">NAPAS ACH Processing</h4>
                  <p className="text-sm text-green-700">Live production system processing ACH transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const allNodes = [
    ...mockNAPASData.documents,
    ...mockNAPASData.terms,
    ...mockNAPASData.schemas,
    ...mockNAPASData.tables,
    ...mockNAPASData.services
  ];

  const filteredNodes = allNodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         node.metadata?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'documents' && node.type === 'document') ||
                           (selectedCategory === 'terms' && node.type === 'term') ||
                           (selectedCategory === 'schemas' && node.type === 'schema') ||
                           (selectedCategory === 'tables' && node.type === 'database') ||
                           (selectedCategory === 'services' && node.type === 'service');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Network className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NAPAS ACH Data Lineage</h1>
                <p className="text-gray-600">Trace business concepts from documents to production systems</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" icon={Download}>
                Export
              </Button>
              <Button variant="ghost" size="sm" icon={Share2}>
                Share
              </Button>
              <Button variant="ghost" size="sm" icon={Settings}>
                Settings
              </Button>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Documents</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{mockNAPASData.documents.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Terms</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900">{mockNAPASData.terms.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-1">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Schemas</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{mockNAPASData.schemas.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2 mb-1">
                <Table className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">Tables</span>
              </div>
              <div className="text-2xl font-bold text-indigo-900">{mockNAPASData.tables.length}</div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-2 mb-1">
                <GitBranch className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Services</span>
              </div>
              <div className="text-2xl font-bold text-amber-900">{mockNAPASData.services.length}</div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search across all lineage data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'overview' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('overview')}
                  className="rounded-md"
                >
                  Overview
                </Button>
                <Button
                  variant={viewMode === 'flow' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('flow')}
                  className="rounded-md"
                >
                  Flow View
                </Button>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewMode === 'flow' ? (
          renderFlowView()
        ) : (
          <div className="flex overflow-hidden bg-white rounded-xl shadow-lg">
            {/* Left Panel - Node List */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-300px)]">
              <div className="p-6 space-y-6">
                {selectedCategory === 'all' || selectedCategory === 'documents' ? 
                  renderSection('Business Documents', 'documents', mockNAPASData.documents, FileText) : null}
                {selectedCategory === 'all' || selectedCategory === 'terms' ? 
                  renderSection('Business Terms', 'terms', mockNAPASData.terms, BookOpen) : null}
                {selectedCategory === 'all' || selectedCategory === 'schemas' ? 
                  renderSection('Database Schemas', 'schemas', mockNAPASData.schemas, Database) : null}
                {selectedCategory === 'all' || selectedCategory === 'tables' ? 
                  renderSection('Database Tables', 'tables', mockNAPASData.tables, Table) : null}
                {selectedCategory === 'all' || selectedCategory === 'services' ? 
                  renderSection('Microservices', 'services', mockNAPASData.services, GitBranch) : null}
              </div>
            </div>

            {/* Right Panel - Node Details */}
            <div className="w-1/2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {selectedNode ? (
                <div className="p-6 space-y-6">
                  {/* Enhanced Node Header */}
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-3 rounded-xl ${getNodeColor(selectedNode.type)} shadow-lg`}>
                        {getNodeIcon(selectedNode.type)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedNode.schema && selectedNode.table ? 
                            `${selectedNode.schema}.${selectedNode.table}` : 
                            selectedNode.name
                          }
                        </h2>
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge variant="info">{selectedNode.system}</Badge>
                          <Badge variant="default">{selectedNode.type}</Badge>
                          {selectedNode.metadata?.status && (
                            <Badge variant={selectedNode.metadata.status === 'active' ? 'success' : 'warning'}>
                              {selectedNode.metadata.status}
                            </Badge>
                          )}
                          {selectedNode.metadata?.businessValue && (
                            <Badge variant={selectedNode.metadata.businessValue === 'high' ? 'warning' : 'default'}>
                              {selectedNode.metadata.businessValue} value
                            </Badge>
                          )}
                        </div>
                        {selectedNode.metadata?.description && (
                          <p className="text-gray-600 leading-relaxed">
                            {selectedNode.metadata.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedNode.metadata?.confidence && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Confidence</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {Math.round(selectedNode.metadata.confidence * 100)}%
                        </div>
                      </div>
                    )}
                    
                    {selectedNode.metadata?.usageCount && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Activity className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Usage Count</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900">
                          {selectedNode.metadata.usageCount}
                        </div>
                      </div>
                    )}
                    
                    {selectedNode.metadata?.dataQuality && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Data Quality</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {Math.round(selectedNode.metadata.dataQuality * 100)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Metadata */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2" />
                      Metadata
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Owner:</span>
                          <p className="font-medium text-gray-900">{selectedNode.metadata?.owner || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Modified:</span>
                          <p className="font-medium text-gray-900">
                            {selectedNode.metadata?.lastModified ? 
                              formatDate(selectedNode.metadata.lastModified) : 
                              'Unknown'
                            }
                          </p>
                        </div>
                        {selectedNode.metadata?.documentId && (
                          <div>
                            <span className="text-gray-600">Document ID:</span>
                            <p className="font-medium text-gray-900">{selectedNode.metadata.documentId}</p>
                          </div>
                        )}
                        {selectedNode.metadata?.sourceSection && (
                          <div>
                            <span className="text-gray-600">Source Section:</span>
                            <p className="font-medium text-gray-900">{selectedNode.metadata.sourceSection}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Tags */}
                  {selectedNode.metadata?.tags && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Tag className="w-5 h-5 mr-2" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.metadata.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant={tag === 'preferred' ? 'warning' : tag === 'production' ? 'success' : 'default'} 
                            size="sm"
                            className="hover:scale-105 transition-transform cursor-pointer"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Lineage Connections */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Network className="w-5 h-5 mr-2" />
                      Lineage Connections
                    </h3>
                    <div className="space-y-3">
                      {getConnectedNodes(selectedNode.id).map((connection, index) => {
                        const isOutgoing = connection.from === selectedNode.id;
                        const connectedNodeId = isOutgoing ? connection.to : connection.from;
                        const connectedNode = allNodes.find(n => n.id === connectedNodeId);
                        
                        return (
                          <div key={index} className={`p-3 rounded-lg border ${
                            isOutgoing ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <ArrowRight className={`w-4 h-4 ${
                                  isOutgoing ? 'text-blue-600' : 'text-emerald-600'
                                }`} />
                                <span className="font-medium text-gray-900">
                                  {connectedNode?.name}
                                </span>
                              </div>
                              <Badge variant={isOutgoing ? 'info' : 'success'} size="sm">
                                {connection.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{connection.description}</p>
                            <div className="text-xs text-gray-500">
                              Confidence: {Math.round(connection.confidence * 100)}%
                            </div>
                          </div>
                        );
                      })}
                      
                      {getConnectedNodes(selectedNode.id).length === 0 && (
                        <div className="text-center py-8">
                          <Network className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No lineage connections found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button variant="primary" size="sm" icon={ExternalLink}>
                      View Full Details
                    </Button>
                    <Button variant="ghost" size="sm" icon={Download}>
                      Export Data
                    </Button>
                    <Button variant="ghost" size="sm" icon={Share2}>
                      Share
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore NAPAS Lineage</h3>
                    <p className="text-gray-500 max-w-sm leading-relaxed">
                      Click on any document, term, schema, or service to discover its relationships and trace data lineage across your NAPAS ACH integration.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}