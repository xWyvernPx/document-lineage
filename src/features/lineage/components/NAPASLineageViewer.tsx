import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Download, 
  Share2, 
  Settings, 
  Grid3X3, 
  Move, 
  Eye, 
  EyeOff, 
  Layers, 
  FileText,
  BookOpen,
  Database,
  Table,
  GitBranch,
  Network,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Edit3,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Heart,
  Lightbulb,
  Brain,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Bookmark,
  Flag,
  Archive,
  Trash2,
  Copy,
  Link,
  RefreshCw,
  Save,
  Upload,
  X,
  Plus,
  Minus,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MousePointer,
  Hand,
  Crosshair
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

// Enhanced data structures for comprehensive lineage
interface LineageNode {
  id: string;
  name: string;
  type: 'document' | 'term' | 'schema' | 'table' | 'service' | 'api' | 'system';
  category: string;
  position: { x: number; y: number };
  metadata: {
    description: string;
    owner: string;
    steward?: string;
    createdAt: string;
    modifiedAt: string;
    version: string;
    sourceSystem?: string;
    documentId?: string;
    sourceSection?: string;
    businessUnit: string;
    tags: string[];
    status: 'active' | 'deprecated' | 'pending' | 'archived';
    confidence: number;
    usageCount: number;
    businessValue: 'critical' | 'high' | 'medium' | 'low';
    dataQuality: number;
    lastValidated?: string;
    validatedBy?: string;
    notes?: string;
    relatedAssets?: string[];
    dependencies?: string[];
    consumers?: string[];
  };
  visual: {
    color: string;
    shape: 'rectangle' | 'circle' | 'hexagon' | 'diamond';
    size: number;
    icon: string;
  };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'extracts-from' | 'maps-to' | 'depends-on' | 'contains' | 'derives-from' | 'flows-to' | 'references';
  label: string;
  metadata: {
    confidence: number;
    strength: 'strong' | 'medium' | 'weak';
    createdAt: string;
    validatedAt?: string;
    transformationLogic?: string;
    businessRules?: string[];
    notes?: string;
  };
  visual: {
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
    width: number;
  };
}

interface FilterState {
  search: string;
  nodeTypes: string[];
  confidenceRange: [number, number];
  statusFilters: string[];
  businessUnits: string[];
  dateRange: {
    start: string;
    end: string;
  };
  businessValue: string[];
  tags: string[];
}

interface ViewState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNode: string | null;
  hoveredNode: string | null;
  highlightedNodes: string[];
  highlightedEdges: string[];
  showGrid: boolean;
  showLabels: boolean;
  showMinimap: boolean;
  layoutMode: 'force' | 'hierarchical' | 'circular' | 'manual';
  fullscreen: boolean;
}

// Comprehensive mock data for demonstration
const mockLineageData = {
  nodes: [
    // Documents
    {
      id: 'doc-dpg-spec',
      name: 'DPG Middleware Integration Specification v2.1',
      type: 'document' as const,
      category: 'Technical Specification',
      position: { x: 100, y: 200 },
      metadata: {
        description: 'Comprehensive technical specification for integrating DPG middleware with NAPAS ACH processing infrastructure, including message routing, error handling, and security protocols.',
        owner: 'Technical Architecture Team',
        steward: 'Sarah Johnson',
        createdAt: '2024-01-10T09:00:00Z',
        modifiedAt: '2024-01-15T09:30:00Z',
        version: '2.1.0',
        sourceSystem: 'Confluence',
        documentId: 'TECH-SPEC-001',
        businessUnit: 'Technology',
        tags: ['technical', 'integration', 'middleware', 'napas', 'ach', 'production'],
        status: 'active' as const,
        confidence: 94,
        usageCount: 47,
        businessValue: 'critical' as const,
        dataQuality: 96,
        lastValidated: '2024-01-15T10:00:00Z',
        validatedBy: 'Architecture Review Board',
        notes: 'Core integration document for NAPAS connectivity',
        relatedAssets: ['API-SPEC-001', 'SECURITY-DOC-003'],
        dependencies: ['NAPAS-API-v3.2'],
        consumers: ['DPG Service', 'Payment Orchestration']
      },
      visual: {
        color: '#3B82F6',
        shape: 'rectangle' as const,
        size: 120,
        icon: 'FileText'
      }
    },
    {
      id: 'doc-payment-brd',
      name: 'ACH Payment Orchestration Business Requirements v3.0',
      type: 'document' as const,
      category: 'Business Requirements',
      position: { x: 100, y: 400 },
      metadata: {
        description: 'Business requirements for orchestrating ACH payments across multiple third-party providers and internal banking services with intelligent routing and fallback capabilities.',
        owner: 'Payment Product Team',
        steward: 'Michael Chen',
        createdAt: '2024-01-12T14:00:00Z',
        modifiedAt: '2024-01-16T10:15:00Z',
        version: '3.0.0',
        sourceSystem: 'SharePoint',
        documentId: 'BRD-PAY-001',
        businessUnit: 'Payments',
        tags: ['business', 'requirements', 'payment', 'orchestration', 'ach'],
        status: 'active' as const,
        confidence: 95,
        usageCount: 89,
        businessValue: 'critical' as const,
        dataQuality: 98,
        lastValidated: '2024-01-16T11:00:00Z',
        validatedBy: 'Product Management',
        notes: 'Primary business requirements for payment orchestration',
        relatedAssets: ['TECH-SPEC-002', 'API-SPEC-003'],
        dependencies: ['Third-Party Provider APIs'],
        consumers: ['Payment Team', 'Engineering Team']
      },
      visual: {
        color: '#3B82F6',
        shape: 'rectangle' as const,
        size: 120,
        icon: 'FileText'
      }
    },
    {
      id: 'doc-portal-guide',
      name: 'Business User Portal Requirements v1.8',
      type: 'document' as const,
      category: 'User Interface Specification',
      position: { x: 100, y: 600 },
      metadata: {
        description: 'User interface requirements and workflows for business users monitoring ACH transactions, including dashboard layouts, reporting capabilities, and user management.',
        owner: 'Business Operations Team',
        steward: 'Emily Rodriguez',
        createdAt: '2024-01-08T11:00:00Z',
        modifiedAt: '2024-01-15T11:30:00Z',
        version: '1.8.0',
        sourceSystem: 'Confluence',
        documentId: 'UI-SPEC-001',
        businessUnit: 'Operations',
        tags: ['ui', 'portal', 'business', 'monitoring', 'ach', 'dashboard'],
        status: 'active' as const,
        confidence: 88,
        usageCount: 34,
        businessValue: 'high' as const,
        dataQuality: 91,
        lastValidated: '2024-01-15T12:00:00Z',
        validatedBy: 'UX Team',
        notes: 'Portal requirements for business user interfaces',
        relatedAssets: ['DESIGN-SYSTEM-001'],
        dependencies: ['Business Portal API'],
        consumers: ['UI/UX Team', 'Frontend Developers']
      },
      visual: {
        color: '#3B82F6',
        shape: 'rectangle' as const,
        size: 120,
        icon: 'FileText'
      }
    },

    // Business Terms
    {
      id: 'term-msg-routing',
      name: 'Message Routing Engine',
      type: 'term' as const,
      category: 'System Component',
      position: { x: 450, y: 200 },
      metadata: {
        description: 'Core component responsible for directing ACH messages between internal services and NAPAS based on transaction type, routing rules, and business logic. Ensures proper message delivery and transformation.',
        owner: 'Data Governance Team',
        steward: 'Jennifer Walsh',
        createdAt: '2024-01-15T14:00:00Z',
        modifiedAt: '2024-01-15T15:30:00Z',
        version: '1.2.0',
        sourceSystem: 'Business Glossary',
        documentId: 'doc-dpg-spec',
        sourceSection: 'System Overview',
        businessUnit: 'Technology',
        tags: ['system-component', 'routing', 'ach', 'middleware', 'preferred', 'core'],
        status: 'active' as const,
        confidence: 96,
        usageCount: 156,
        businessValue: 'critical' as const,
        dataQuality: 97,
        lastValidated: '2024-01-15T16:00:00Z',
        validatedBy: 'Technical SME',
        notes: 'Critical component for ACH message processing',
        relatedAssets: ['Message Router', 'Transaction Router', 'ACH Router'],
        dependencies: ['NAPAS API', 'Internal Message Bus'],
        consumers: ['DPG Service', 'Monitoring Systems']
      },
      visual: {
        color: '#10B981',
        shape: 'circle' as const,
        size: 80,
        icon: 'BookOpen'
      }
    },
    {
      id: 'term-payment-orchestration',
      name: 'Payment Orchestration Engine',
      type: 'term' as const,
      category: 'System Component',
      position: { x: 450, y: 400 },
      metadata: {
        description: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services. Manages complex payment workflows, routing decisions, and fallback scenarios.',
        owner: 'Data Governance Team',
        steward: 'Jennifer Walsh',
        createdAt: '2024-01-16T10:00:00Z',
        modifiedAt: '2024-01-16T11:20:00Z',
        version: '1.0.0',
        sourceSystem: 'Business Glossary',
        documentId: 'doc-payment-brd',
        sourceSection: 'Business Overview',
        businessUnit: 'Payments',
        tags: ['system-component', 'payment', 'orchestration', 'ach', 'preferred'],
        status: 'active' as const,
        confidence: 96,
        usageCount: 203,
        businessValue: 'critical' as const,
        dataQuality: 98,
        lastValidated: '2024-01-16T12:00:00Z',
        validatedBy: 'Payment SME',
        notes: 'Core orchestration engine for payment processing',
        relatedAssets: ['Payment Coordinator', 'Transaction Orchestrator'],
        dependencies: ['Third-Party APIs', 'Core Banking'],
        consumers: ['Payment Service', 'Analytics Platform']
      },
      visual: {
        color: '#10B981',
        shape: 'circle' as const,
        size: 80,
        icon: 'BookOpen'
      }
    },
    {
      id: 'term-transaction-dashboard',
      name: 'Transaction Dashboard',
      type: 'term' as const,
      category: 'User Interface Component',
      position: { x: 450, y: 600 },
      metadata: {
        description: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails. Provides comprehensive visibility into payment operations.',
        owner: 'Data Governance Team',
        steward: 'Jennifer Walsh',
        createdAt: '2024-01-15T13:00:00Z',
        modifiedAt: '2024-01-15T14:45:00Z',
        version: '1.1.0',
        sourceSystem: 'Business Glossary',
        documentId: 'doc-portal-guide',
        sourceSection: 'Dashboard Requirements',
        businessUnit: 'Operations',
        tags: ['ui-component', 'monitoring', 'dashboard', 'ach', 'real-time'],
        status: 'active' as const,
        confidence: 92,
        usageCount: 78,
        businessValue: 'high' as const,
        dataQuality: 94,
        lastValidated: '2024-01-15T15:00:00Z',
        validatedBy: 'Business SME',
        notes: 'Primary dashboard for transaction monitoring',
        relatedAssets: ['Transaction Monitor', 'ACH Dashboard'],
        dependencies: ['Transaction API', 'Real-time Data Stream'],
        consumers: ['Business Portal', 'Operations Team']
      },
      visual: {
        color: '#10B981',
        shape: 'circle' as const,
        size: 80,
        icon: 'BookOpen'
      }
    },

    // Database Schemas
    {
      id: 'schema-dpg-middleware',
      name: 'dpg_middleware',
      type: 'schema' as const,
      category: 'Database Schema',
      position: { x: 800, y: 200 },
      metadata: {
        description: 'Database schema containing DPG middleware configuration, routing rules, message processing state, and monitoring data for NAPAS integration.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-10T08:00:00Z',
        modifiedAt: '2024-01-15T12:00:00Z',
        version: '2.1.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Technology',
        tags: ['database', 'schema', 'middleware', 'napas', 'production', 'core'],
        status: 'active' as const,
        confidence: 95,
        usageCount: 89,
        businessValue: 'critical' as const,
        dataQuality: 97,
        lastValidated: '2024-01-15T13:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Core schema for DPG middleware operations',
        relatedAssets: ['dpg_config', 'dpg_monitoring'],
        dependencies: ['PostgreSQL 14.x'],
        consumers: ['DPG Service', 'Monitoring Service']
      },
      visual: {
        color: '#8B5CF6',
        shape: 'hexagon' as const,
        size: 100,
        icon: 'Database'
      }
    },
    {
      id: 'schema-payment-orchestration',
      name: 'payment_orchestration',
      type: 'schema' as const,
      category: 'Database Schema',
      position: { x: 800, y: 400 },
      metadata: {
        description: 'Schema for payment orchestration engine including routing rules, provider configurations, transaction workflows, and performance metrics.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-12T09:00:00Z',
        modifiedAt: '2024-01-16T13:30:00Z',
        version: '1.5.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Payments',
        tags: ['database', 'schema', 'payment', 'orchestration', 'production'],
        status: 'active' as const,
        confidence: 97,
        usageCount: 134,
        businessValue: 'critical' as const,
        dataQuality: 98,
        lastValidated: '2024-01-16T14:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Primary schema for payment orchestration',
        relatedAssets: ['payment_config', 'payment_metrics'],
        dependencies: ['PostgreSQL 14.x'],
        consumers: ['Payment Service', 'Analytics Service']
      },
      visual: {
        color: '#8B5CF6',
        shape: 'hexagon' as const,
        size: 100,
        icon: 'Database'
      }
    },
    {
      id: 'schema-business-portal',
      name: 'business_portal',
      type: 'schema' as const,
      category: 'Database Schema',
      position: { x: 800, y: 600 },
      metadata: {
        description: 'Schema supporting business user portal functionality including dashboards, reports, user management, and configuration settings.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-08T10:00:00Z',
        modifiedAt: '2024-01-15T16:20:00Z',
        version: '1.3.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Operations',
        tags: ['database', 'schema', 'portal', 'ui', 'business', 'reporting'],
        status: 'active' as const,
        confidence: 89,
        usageCount: 67,
        businessValue: 'high' as const,
        dataQuality: 92,
        lastValidated: '2024-01-15T17:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Schema for business portal operations',
        relatedAssets: ['portal_config', 'portal_analytics'],
        dependencies: ['PostgreSQL 14.x'],
        consumers: ['Portal Service', 'Reporting Service']
      },
      visual: {
        color: '#8B5CF6',
        shape: 'hexagon' as const,
        size: 100,
        icon: 'Database'
      }
    },

    // Database Tables
    {
      id: 'table-message-routing',
      name: 'message_routing',
      type: 'table' as const,
      category: 'Database Table',
      position: { x: 1150, y: 150 },
      metadata: {
        description: 'Configuration table for ACH message routing rules, including NAPAS endpoint mappings, transformation logic, and routing priorities.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-10T08:30:00Z',
        modifiedAt: '2024-01-15T12:00:00Z',
        version: '2.1.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Technology',
        tags: ['table', 'routing', 'configuration', 'ach', 'napas', 'core'],
        status: 'active' as const,
        confidence: 95,
        usageCount: 245,
        businessValue: 'critical' as const,
        dataQuality: 96,
        lastValidated: '2024-01-15T13:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Core routing configuration table',
        relatedAssets: ['routing_rules', 'endpoint_config'],
        dependencies: ['dpg_middleware schema'],
        consumers: ['DPG Service', 'Monitoring Dashboard']
      },
      visual: {
        color: '#6366F1',
        shape: 'rectangle' as const,
        size: 90,
        icon: 'Table'
      }
    },
    {
      id: 'table-payment-routes',
      name: 'payment_routes',
      type: 'table' as const,
      category: 'Database Table',
      position: { x: 1150, y: 350 },
      metadata: {
        description: 'Payment routing configuration including provider selection logic, fallback rules, cost optimization parameters, and performance metrics.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-12T09:30:00Z',
        modifiedAt: '2024-01-16T14:15:00Z',
        version: '1.5.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Payments',
        tags: ['table', 'payment', 'routing', 'providers', 'optimization'],
        status: 'active' as const,
        confidence: 97,
        usageCount: 189,
        businessValue: 'critical' as const,
        dataQuality: 98,
        lastValidated: '2024-01-16T15:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Primary payment routing table',
        relatedAssets: ['provider_config', 'routing_metrics'],
        dependencies: ['payment_orchestration schema'],
        consumers: ['Payment Service', 'Analytics Platform']
      },
      visual: {
        color: '#6366F1',
        shape: 'rectangle' as const,
        size: 90,
        icon: 'Table'
      }
    },
    {
      id: 'table-dashboard-config',
      name: 'dashboard_config',
      type: 'table' as const,
      category: 'Database Table',
      position: { x: 1150, y: 550 },
      metadata: {
        description: 'Configuration for business user dashboards including widget layouts, data sources, refresh intervals, and user preferences.',
        owner: 'Database Team',
        steward: 'Robert Kim',
        createdAt: '2024-01-08T11:00:00Z',
        modifiedAt: '2024-01-15T17:30:00Z',
        version: '1.3.0',
        sourceSystem: 'PostgreSQL Production',
        businessUnit: 'Operations',
        tags: ['table', 'dashboard', 'configuration', 'ui', 'business'],
        status: 'active' as const,
        confidence: 91,
        usageCount: 78,
        businessValue: 'high' as const,
        dataQuality: 93,
        lastValidated: '2024-01-15T18:00:00Z',
        validatedBy: 'Database Administrator',
        notes: 'Dashboard configuration table',
        relatedAssets: ['widget_config', 'user_preferences'],
        dependencies: ['business_portal schema'],
        consumers: ['Portal Service', 'UI Components']
      },
      visual: {
        color: '#6366F1',
        shape: 'rectangle' as const,
        size: 90,
        icon: 'Table'
      }
    },

    // Services
    {
      id: 'service-dpg',
      name: 'DPG Service',
      type: 'service' as const,
      category: 'Microservice',
      position: { x: 1500, y: 200 },
      metadata: {
        description: 'Digital Payment Gateway service providing secure, reliable communication with NAPAS ACH infrastructure. Handles message routing, transformation, and error recovery.',
        owner: 'Development Team',
        steward: 'Alex Thompson',
        createdAt: '2024-01-05T08:00:00Z',
        modifiedAt: '2024-01-15T10:00:00Z',
        version: '2.1.3',
        sourceSystem: 'Kubernetes Production',
        businessUnit: 'Technology',
        tags: ['service', 'payment', 'gateway', 'napas', 'production', 'critical'],
        status: 'active' as const,
        confidence: 96,
        usageCount: 1247,
        businessValue: 'critical' as const,
        dataQuality: 97,
        lastValidated: '2024-01-15T11:00:00Z',
        validatedBy: 'DevOps Team',
        notes: 'Core service for NAPAS connectivity',
        relatedAssets: ['DPG API', 'Message Router'],
        dependencies: ['message_routing table', 'NAPAS API'],
        consumers: ['Payment Orchestration', 'Monitoring Systems']
      },
      visual: {
        color: '#F59E0B',
        shape: 'diamond' as const,
        size: 110,
        icon: 'GitBranch'
      }
    },
    {
      id: 'service-payment-orchestration',
      name: 'Payment Orchestration Service',
      type: 'service' as const,
      category: 'Microservice',
      position: { x: 1500, y: 400 },
      metadata: {
        description: 'Orchestrates ACH payment processing across multiple providers with intelligent routing, fallback capabilities, and real-time monitoring.',
        owner: 'Development Team',
        steward: 'Alex Thompson',
        createdAt: '2024-01-08T09:00:00Z',
        modifiedAt: '2024-01-16T11:45:00Z',
        version: '1.8.2',
        sourceSystem: 'Kubernetes Production',
        businessUnit: 'Payments',
        tags: ['service', 'payment', 'orchestration', 'ach', 'production'],
        status: 'active' as const,
        confidence: 98,
        usageCount: 2156,
        businessValue: 'critical' as const,
        dataQuality: 99,
        lastValidated: '2024-01-16T12:00:00Z',
        validatedBy: 'DevOps Team',
        notes: 'Primary payment orchestration service',
        relatedAssets: ['Payment API', 'Provider Integrations'],
        dependencies: ['payment_routes table', 'Third-Party APIs'],
        consumers: ['Business Portal', 'Analytics Platform']
      },
      visual: {
        color: '#F59E0B',
        shape: 'diamond' as const,
        size: 110,
        icon: 'GitBranch'
      }
    },
    {
      id: 'service-business-portal',
      name: 'Business Portal Service',
      type: 'service' as const,
      category: 'Microservice',
      position: { x: 1500, y: 600 },
      metadata: {
        description: 'Web service powering business user interfaces for ACH transaction monitoring, reporting, and management. Provides real-time dashboards and analytics.',
        owner: 'Development Team',
        steward: 'Alex Thompson',
        createdAt: '2024-01-06T10:00:00Z',
        modifiedAt: '2024-01-15T15:20:00Z',
        version: '1.5.1',
        sourceSystem: 'Kubernetes Production',
        businessUnit: 'Operations',
        tags: ['service', 'portal', 'ui', 'business', 'monitoring', 'dashboard'],
        status: 'active' as const,
        confidence: 92,
        usageCount: 567,
        businessValue: 'high' as const,
        dataQuality: 94,
        lastValidated: '2024-01-15T16:00:00Z',
        validatedBy: 'DevOps Team',
        notes: 'Business portal backend service',
        relatedAssets: ['Portal API', 'Dashboard Components'],
        dependencies: ['dashboard_config table', 'Analytics API'],
        consumers: ['Business Users', 'Operations Team']
      },
      visual: {
        color: '#F59E0B',
        shape: 'diamond' as const,
        size: 110,
        icon: 'GitBranch'
      }
    }
  ] as LineageNode[],

  edges: [
    // Document to Term relationships
    {
      id: 'edge-doc1-term1',
      source: 'doc-dpg-spec',
      target: 'term-msg-routing',
      type: 'extracts-from' as const,
      label: 'Extracted from System Overview',
      metadata: {
        confidence: 96,
        strength: 'strong' as const,
        createdAt: '2024-01-15T14:30:00Z',
        validatedAt: '2024-01-15T15:00:00Z',
        notes: 'High-confidence extraction from technical specification'
      },
      visual: {
        color: '#3B82F6',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-doc2-term2',
      source: 'doc-payment-brd',
      target: 'term-payment-orchestration',
      type: 'extracts-from' as const,
      label: 'Extracted from Business Overview',
      metadata: {
        confidence: 96,
        strength: 'strong' as const,
        createdAt: '2024-01-16T10:30:00Z',
        validatedAt: '2024-01-16T11:00:00Z',
        notes: 'Core business concept extraction'
      },
      visual: {
        color: '#3B82F6',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-doc3-term3',
      source: 'doc-portal-guide',
      target: 'term-transaction-dashboard',
      type: 'extracts-from' as const,
      label: 'Extracted from Dashboard Requirements',
      metadata: {
        confidence: 92,
        strength: 'strong' as const,
        createdAt: '2024-01-15T13:30:00Z',
        validatedAt: '2024-01-15T14:00:00Z',
        notes: 'UI component specification extraction'
      },
      visual: {
        color: '#3B82F6',
        style: 'solid' as const,
        width: 2
      }
    },

    // Term to Schema mappings
    {
      id: 'edge-term1-schema1',
      source: 'term-msg-routing',
      target: 'schema-dpg-middleware',
      type: 'maps-to' as const,
      label: 'Implemented in dpg_middleware schema',
      metadata: {
        confidence: 94,
        strength: 'strong' as const,
        createdAt: '2024-01-15T15:00:00Z',
        validatedAt: '2024-01-15T15:30:00Z',
        transformationLogic: 'Business concept mapped to database schema design',
        notes: 'Direct implementation mapping'
      },
      visual: {
        color: '#10B981',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-term2-schema2',
      source: 'term-payment-orchestration',
      target: 'schema-payment-orchestration',
      type: 'maps-to' as const,
      label: 'Implemented in payment_orchestration schema',
      metadata: {
        confidence: 97,
        strength: 'strong' as const,
        createdAt: '2024-01-16T11:00:00Z',
        validatedAt: '2024-01-16T11:30:00Z',
        transformationLogic: 'Payment orchestration logic stored in dedicated schema',
        notes: 'Primary implementation schema'
      },
      visual: {
        color: '#10B981',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-term3-schema3',
      source: 'term-transaction-dashboard',
      target: 'schema-business-portal',
      type: 'maps-to' as const,
      label: 'Implemented in business_portal schema',
      metadata: {
        confidence: 91,
        strength: 'strong' as const,
        createdAt: '2024-01-15T14:00:00Z',
        validatedAt: '2024-01-15T14:30:00Z',
        transformationLogic: 'Dashboard configuration stored in portal schema',
        notes: 'UI component implementation'
      },
      visual: {
        color: '#10B981',
        style: 'solid' as const,
        width: 2
      }
    },

    // Schema to Table relationships
    {
      id: 'edge-schema1-table1',
      source: 'schema-dpg-middleware',
      target: 'table-message-routing',
      type: 'contains' as const,
      label: 'Contains message_routing table',
      metadata: {
        confidence: 95,
        strength: 'strong' as const,
        createdAt: '2024-01-10T09:00:00Z',
        validatedAt: '2024-01-15T12:30:00Z',
        notes: 'Core table within schema'
      },
      visual: {
        color: '#8B5CF6',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-schema2-table2',
      source: 'schema-payment-orchestration',
      target: 'table-payment-routes',
      type: 'contains' as const,
      label: 'Contains payment_routes table',
      metadata: {
        confidence: 97,
        strength: 'strong' as const,
        createdAt: '2024-01-12T10:00:00Z',
        validatedAt: '2024-01-16T14:30:00Z',
        notes: 'Primary routing table'
      },
      visual: {
        color: '#8B5CF6',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-schema3-table3',
      source: 'schema-business-portal',
      target: 'table-dashboard-config',
      type: 'contains' as const,
      label: 'Contains dashboard_config table',
      metadata: {
        confidence: 91,
        strength: 'strong' as const,
        createdAt: '2024-01-08T11:30:00Z',
        validatedAt: '2024-01-15T17:30:00Z',
        notes: 'Dashboard configuration table'
      },
      visual: {
        color: '#8B5CF6',
        style: 'solid' as const,
        width: 2
      }
    },

    // Table to Service dependencies
    {
      id: 'edge-table1-service1',
      source: 'table-message-routing',
      target: 'service-dpg',
      type: 'depends-on' as const,
      label: 'DPG service reads routing configuration',
      metadata: {
        confidence: 96,
        strength: 'strong' as const,
        createdAt: '2024-01-15T10:30:00Z',
        validatedAt: '2024-01-15T11:00:00Z',
        transformationLogic: 'Service loads routing rules from database table',
        notes: 'Critical dependency for service operation'
      },
      visual: {
        color: '#F59E0B',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-table2-service2',
      source: 'table-payment-routes',
      target: 'service-payment-orchestration',
      type: 'depends-on' as const,
      label: 'Payment service uses routing rules',
      metadata: {
        confidence: 98,
        strength: 'strong' as const,
        createdAt: '2024-01-16T12:00:00Z',
        validatedAt: '2024-01-16T12:30:00Z',
        transformationLogic: 'Service executes payment routing based on table configuration',
        notes: 'Primary dependency for payment processing'
      },
      visual: {
        color: '#F59E0B',
        style: 'solid' as const,
        width: 2
      }
    },
    {
      id: 'edge-table3-service3',
      source: 'table-dashboard-config',
      target: 'service-business-portal',
      type: 'depends-on' as const,
      label: 'Portal service loads dashboard configurations',
      metadata: {
        confidence: 92,
        strength: 'strong' as const,
        createdAt: '2024-01-15T16:00:00Z',
        validatedAt: '2024-01-15T16:30:00Z',
        transformationLogic: 'Service renders dashboards based on configuration data',
        notes: 'Configuration dependency for UI rendering'
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
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedNode: null,
    hoveredNode: null,
    highlightedNodes: [],
    highlightedEdges: [],
    showGrid: true,
    showLabels: true,
    showMinimap: false,
    layoutMode: 'manual',
    fullscreen: false
  });

  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    nodeTypes: ['document', 'term', 'schema', 'table', 'service'],
    confidenceRange: [0, 100],
    statusFilters: ['active', 'deprecated', 'pending'],
    businessUnits: ['Technology', 'Payments', 'Operations'],
    dateRange: { start: '', end: '' },
    businessValue: ['critical', 'high', 'medium', 'low'],
    tags: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter nodes and edges based on current filters
  const filteredNodes = mockLineageData.nodes.filter(node => {
    const matchesSearch = !filterState.search || 
      node.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
      node.metadata.description.toLowerCase().includes(filterState.search.toLowerCase()) ||
      node.metadata.tags.some(tag => tag.toLowerCase().includes(filterState.search.toLowerCase()));
    
    const matchesType = filterState.nodeTypes.includes(node.type);
    const matchesConfidence = node.metadata.confidence >= filterState.confidenceRange[0] && 
                             node.metadata.confidence <= filterState.confidenceRange[1];
    const matchesStatus = filterState.statusFilters.includes(node.metadata.status);
    const matchesBusinessUnit = filterState.businessUnits.includes(node.metadata.businessUnit);
    const matchesBusinessValue = filterState.businessValue.includes(node.metadata.businessValue);
    
    return matchesSearch && matchesType && matchesConfidence && matchesStatus && 
           matchesBusinessUnit && matchesBusinessValue;
  });

  const filteredEdges = mockLineageData.edges.filter(edge => {
    const sourceExists = filteredNodes.some(node => node.id === edge.source);
    const targetExists = filteredNodes.some(node => node.id === edge.target);
    return sourceExists && targetExists;
  });

  // Event handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setViewState(prev => ({
      ...prev,
      selectedNode: nodeId,
      highlightedNodes: getConnectedNodes(nodeId),
      highlightedEdges: getConnectedEdges(nodeId)
    }));
  }, []);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    setViewState(prev => ({
      ...prev,
      hoveredNode: nodeId
    }));
  }, []);

  const getConnectedNodes = (nodeId: string): string[] => {
    const connected = new Set<string>();
    filteredEdges.forEach(edge => {
      if (edge.source === nodeId) connected.add(edge.target);
      if (edge.target === nodeId) connected.add(edge.source);
    });
    return Array.from(connected);
  };

  const getConnectedEdges = (nodeId: string): string[] => {
    return filteredEdges
      .filter(edge => edge.source === nodeId || edge.target === nodeId)
      .map(edge => edge.id);
  };

  const handleZoomIn = () => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2) }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.25) }));
  };

  const handleResetView = () => {
    setViewState(prev => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewState.pan.x, y: e.clientY - viewState.pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewState(prev => ({
        ...prev,
        pan: {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Get selected node data
  const selectedNode = viewState.selectedNode ? 
    filteredNodes.find(node => node.id === viewState.selectedNode) : null;

  // Render node
  const renderNode = (node: LineageNode) => {
    const isSelected = viewState.selectedNode === node.id;
    const isHighlighted = viewState.highlightedNodes.includes(node.id);
    const isHovered = viewState.hoveredNode === node.id;
    
    const scale = viewState.zoom;
    const x = node.position.x * scale + viewState.pan.x;
    const y = node.position.y * scale + viewState.pan.y;
    
    const opacity = isSelected || isHighlighted || !viewState.selectedNode ? 1 : 0.3;
    
    return (
      <g
        key={node.id}
        transform={`translate(${x}, ${y})`}
        style={{ cursor: 'pointer', opacity }}
        onClick={() => handleNodeClick(node.id)}
        onMouseEnter={() => handleNodeHover(node.id)}
        onMouseLeave={() => handleNodeHover(null)}
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
        {viewState.showLabels && (
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
    
    const scale = viewState.zoom;
    const sourceX = sourceNode.position.x * scale + viewState.pan.x;
    const sourceY = sourceNode.position.y * scale + viewState.pan.y;
    const targetX = targetNode.position.x * scale + viewState.pan.x;
    const targetY = targetNode.position.y * scale + viewState.pan.y;
    
    const isHighlighted = viewState.highlightedEdges.includes(edge.id);
    const opacity = isHighlighted || !viewState.selectedNode ? 1 : 0.2;
    
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
          strokeDasharray={edge.visual.style === 'dashed' ? '5,5' : 
                          edge.visual.style === 'dotted' ? '2,2' : 'none'}
          markerEnd="url(#arrowhead)"
          className="transition-all duration-200"
        />
        
        {/* Edge label */}
        {viewState.showLabels && (
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
      case 'pending': return Clock;
      case 'archived': return Archive;
      default: return Info;
    }
  };

  const getBusinessValueIcon = (value: string) => {
    switch (value) {
      case 'critical': return Star;
      case 'high': return TrendingUp;
      case 'medium': return Activity;
      case 'low': return BarChart3;
      default: return Info;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`h-screen bg-gray-50 flex flex-col ${viewState.fullscreen ? 'fixed inset-0 z-50' : ''}`}>
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
                <p className="text-sm text-gray-600">Interactive visualization of data relationships</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
              <span className="text-sm text-gray-600 min-w-12 text-center">
                {Math.round(viewState.zoom * 100)}%
              </span>
              <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-1">
              <Button 
                variant={viewState.showGrid ? 'primary' : 'ghost'} 
                size="sm" 
                icon={Grid3X3}
                onClick={() => setViewState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              />
              <Button 
                variant={viewState.showLabels ? 'primary' : 'ghost'} 
                size="sm" 
                icon={viewState.showLabels ? Eye : EyeOff}
                onClick={() => setViewState(prev => ({ ...prev, showLabels: !prev.showLabels }))}
              />
              <Button 
                variant={showLegend ? 'primary' : 'ghost'} 
                size="sm" 
                icon={Layers}
                onClick={() => setShowLegend(!showLegend)}
              />
            </div>
            
            {/* Action Controls */}
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" icon={Download}>
                Export
              </Button>
              <Button variant="ghost" size="sm" icon={Share2}>
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Maximize2}
                onClick={() => setViewState(prev => ({ ...prev, fullscreen: !prev.fullscreen }))}
              />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search nodes, descriptions, or tags..."
              value={filterState.search}
              onChange={(e) => setFilterState(prev => ({ ...prev, search: e.target.value }))}
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

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Node Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Node Types</label>
                <div className="space-y-1">
                  {['document', 'term', 'schema', 'table', 'service'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterState.nodeTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterState(prev => ({ ...prev, nodeTypes: [...prev.nodeTypes, type] }));
                          } else {
                            setFilterState(prev => ({ ...prev, nodeTypes: prev.nodeTypes.filter(t => t !== type) }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Confidence Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence: {filterState.confidenceRange[0]}% - {filterState.confidenceRange[1]}%
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filterState.confidenceRange[0]}
                    onChange={(e) => setFilterState(prev => ({ 
                      ...prev, 
                      confidenceRange: [parseInt(e.target.value), prev.confidenceRange[1]] 
                    }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filterState.confidenceRange[1]}
                    onChange={(e) => setFilterState(prev => ({ 
                      ...prev, 
                      confidenceRange: [prev.confidenceRange[0], parseInt(e.target.value)] 
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Status Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-1">
                  {['active', 'deprecated', 'pending', 'archived'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterState.statusFilters.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterState(prev => ({ ...prev, statusFilters: [...prev.statusFilters, status] }));
                          } else {
                            setFilterState(prev => ({ ...prev, statusFilters: prev.statusFilters.filter(s => s !== status) }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Business Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Value</label>
                <div className="space-y-1">
                  {['critical', 'high', 'medium', 'low'].map(value => (
                    <label key={value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterState.businessValue.includes(value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilterState(prev => ({ ...prev, businessValue: [...prev.businessValue, value] }));
                          } else {
                            setFilterState(prev => ({ ...prev, businessValue: prev.businessValue.filter(v => v !== value) }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm text-gray-700 capitalize">{value}</span>
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
              style={{ background: viewState.showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'transparent' }}
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
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Confidence</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">90%+ High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">80-89% Good</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">70-79% Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">&lt;70% Low</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Minimap */}
          {viewState.showMinimap && (
            <div className="absolute bottom-4 right-4 w-48 h-32 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <div className="text-xs text-gray-600 mb-1">Overview</div>
              <div className="w-full h-full bg-gray-100 rounded relative">
                {/* Minimap content would go here */}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {selectedNode ? (
            <>
              {/* Node Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg`} style={{ backgroundColor: selectedNode.visual.color }}>
                      {React.createElement(getNodeIcon(selectedNode.type), { 
                        className: "w-5 h-5 text-white" 
                      })}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {selectedNode.name}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <Badge variant="info" size="sm">{selectedNode.type}</Badge>
                        <Badge variant="default" size="sm">{selectedNode.category}</Badge>
                        {React.createElement(getStatusIcon(selectedNode.metadata.status), { 
                          className: `w-4 h-4 ${
                            selectedNode.metadata.status === 'active' ? 'text-emerald-500' :
                            selectedNode.metadata.status === 'deprecated' ? 'text-amber-500' :
                            selectedNode.metadata.status === 'pending' ? 'text-blue-500' : 'text-gray-500'
                          }` 
                        })}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" icon={X} onClick={() => setViewState(prev => ({ ...prev, selectedNode: null }))} />
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  {selectedNode.metadata.description}
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
                      <span className="font-semibold text-gray-900">{selectedNode.metadata.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedNode.metadata.confidence >= 90 ? 'bg-emerald-500' :
                          selectedNode.metadata.confidence >= 80 ? 'bg-blue-500' :
                          selectedNode.metadata.confidence >= 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${selectedNode.metadata.confidence}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedNode.metadata.confidence >= 90 ? 'High confidence' :
                       selectedNode.metadata.confidence >= 80 ? 'Good confidence' :
                       selectedNode.metadata.confidence >= 70 ? 'Medium confidence' : 'Low confidence'}
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
                        <p className="font-medium text-gray-900">{selectedNode.metadata.owner}</p>
                      </div>
                      {selectedNode.metadata.steward && (
                        <div>
                          <span className="text-sm text-gray-600">Steward</span>
                          <p className="font-medium text-gray-900">{selectedNode.metadata.steward}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-600">Business Unit</span>
                        <p className="font-medium text-gray-900">{selectedNode.metadata.businessUnit}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Version</span>
                        <p className="font-medium text-gray-900">{selectedNode.metadata.version}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Created</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedNode.metadata.createdAt)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Modified</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedNode.metadata.modifiedAt)}</p>
                      </div>
                    </div>
                    
                    {selectedNode.metadata.sourceSystem && (
                      <div>
                        <span className="text-sm text-gray-600">Source System</span>
                        <p className="font-medium text-gray-900">{selectedNode.metadata.sourceSystem}</p>
                      </div>
                    )}
                    
                    {selectedNode.metadata.documentId && (
                      <div>
                        <span className="text-sm text-gray-600">Document ID</span>
                        <p className="font-medium text-gray-900">{selectedNode.metadata.documentId}</p>
                      </div>
                    )}
                    
                    {selectedNode.metadata.sourceSection && (
                      <div>
                        <span className="text-sm text-gray-600">Source Section</span>
                        <p className="font-medium text-gray-900">{selectedNode.metadata.sourceSection}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Value & Quality */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Business Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {React.createElement(getBusinessValueIcon(selectedNode.metadata.businessValue), { 
                          className: "w-5 h-5 text-blue-600" 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">Business Value</div>
                      <div className="font-semibold text-gray-900 capitalize">{selectedNode.metadata.businessValue}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-sm text-gray-600">Data Quality</div>
                      <div className="font-semibold text-gray-900">{selectedNode.metadata.dataQuality}%</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-sm text-gray-600">Usage Count</div>
                      <div className="font-semibold text-gray-900">{selectedNode.metadata.usageCount}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {React.createElement(getStatusIcon(selectedNode.metadata.status), { 
                          className: `w-5 h-5 ${
                            selectedNode.metadata.status === 'active' ? 'text-emerald-600' :
                            selectedNode.metadata.status === 'deprecated' ? 'text-amber-600' :
                            selectedNode.metadata.status === 'pending' ? 'text-blue-600' : 'text-gray-600'
                          }` 
                        })}
                      </div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-gray-900 capitalize">{selectedNode.metadata.status}</div>
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
                    {selectedNode.metadata.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={tag === 'preferred' ? 'warning' : 
                                tag === 'production' ? 'success' :
                                tag === 'core' ? 'info' : 'default'} 
                        size="sm"
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setFilterState(prev => ({ ...prev, search: tag }))}
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
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Incoming ({filteredEdges.filter(e => e.target === selectedNode.id).length})</h4>
                      <div className="space-y-2">
                        {filteredEdges
                          .filter(edge => edge.target === selectedNode.id)
                          .slice(0, 3)
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
                        {filteredEdges.filter(e => e.target === selectedNode.id).length > 3 && (
                          <Button variant="ghost" size="sm" className="w-full text-sm">
                            Show {filteredEdges.filter(e => e.target === selectedNode.id).length - 3} more
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Outgoing connections */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Outgoing ({filteredEdges.filter(e => e.source === selectedNode.id).length})</h4>
                      <div className="space-y-2">
                        {filteredEdges
                          .filter(edge => edge.source === selectedNode.id)
                          .slice(0, 3)
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
                        {filteredEdges.filter(e => e.source === selectedNode.id).length > 3 && (
                          <Button variant="ghost" size="sm" className="w-full text-sm">
                            Show {filteredEdges.filter(e => e.source === selectedNode.id).length - 3} more
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {selectedNode.metadata.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Notes
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedNode.metadata.notes}
                    </p>
                  </div>
                )}
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
                <div className="mt-6 space-y-2">
                  <Button variant="primary" size="sm" className="w-full">
                    Select a Starting Point
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full">
                    View Tutorial
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}