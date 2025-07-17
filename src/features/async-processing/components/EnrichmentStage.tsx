import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Database, 
  Brain, 
  CheckCircle, 
  Flag, 
  Star, 
  Edit3, 
  Save, 
  X,
  GitBranch,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';

interface ExtractedTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  sourceSection: string;
  context: string;
  isPreferred: boolean;
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
    isApproved?: boolean;
  };
  alternativeMappings?: Array<{
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
  }>;
  relatedTerms: string[];
  synonyms: string[];
}

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: string;
  submittedBy: string;
}

const mockTerms: ExtractedTerm[] = [
  {
    id: '1',
    term: 'Message Routing Engine',
    definition: 'Core component responsible for directing ACH messages between internal services and NAPAS based on transaction type and routing rules. Ensures proper message delivery and transformation between NAPAS and internal banking systems.',
    category: 'System Component',
    confidence: 0.96,
    status: 'pending',
    sourceSection: 'Section 3.1 – System Architecture',
    context: 'The Message Routing Engine acts as the central hub for all ACH transaction flows, ensuring proper message delivery and transformation between NAPAS and internal banking systems.',
    isPreferred: true,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'routing_config',
      dataType: 'JSON',
      confidence: 0.94,
      llmReasoning: 'Strong semantic match between "Message Routing Engine" and the message_routing table routing_config column. The context about directing ACH messages aligns with routing configuration requirements.'
    },
    alternativeMappings: [
      {
        schemaName: 'payment_orchestration',
        tableName: 'routing_rules',
        columnName: 'engine_config',
        dataType: 'TEXT',
        confidence: 0.78,
        llmReasoning: 'Alternative mapping to payment orchestration routing rules. Lower confidence due to less specific table structure.'
      }
    ],
    relatedTerms: ['Message Router', 'Transaction Router', 'ACH Router', 'Payment Router'],
    synonyms: ['Routing Engine', 'Message Director', 'Transaction Router']
  },
  {
    id: '2',
    term: 'Transaction Correlation ID',
    definition: 'Unique identifier that tracks a single ACH transaction across all system components and services throughout its lifecycle. Enables end-to-end tracking and reconciliation across DPG, payment services, and core banking.',
    category: 'Data Element',
    confidence: 0.93,
    status: 'approved',
    sourceSection: 'Section 4.2 – Message Tracking',
    context: 'Each ACH transaction is assigned a correlation ID at initiation to enable end-to-end tracking and reconciliation across DPG, payment services, and core banking.',
    isPreferred: false,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'correlation_id',
      dataType: 'VARCHAR(64)',
      confidence: 0.97,
      llmReasoning: 'Excellent match for transaction correlation ID in message routing table. The tracking and reconciliation context perfectly aligns with correlation_id field purpose.',
      isApproved: true
    },
    relatedTerms: ['Trace ID', 'Transaction ID', 'Correlation Key', 'ACH Trace Number'],
    synonyms: ['Correlation Key', 'Transaction Trace', 'ACH Trace ID']
  },
  {
    id: '3',
    term: 'Clearing Cycle',
    definition: 'Scheduled time window during which NAPAS processes and settles ACH transactions. Banks must submit transactions within specific clearing cycles to ensure same-day or next-day settlement.',
    category: 'Operational Process',
    confidence: 0.95,
    status: 'flagged',
    sourceSection: 'Section 6.2 – Processing Schedule',
    context: 'Standard ACH transactions must be submitted to NAPAS by 2:00 PM local time for same-day processing, while same-day ACH requires 10:30 AM submission.',
    isPreferred: false,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'processing_schedules',
      columnName: 'clearing_cycle_config',
      dataType: 'JSON',
      confidence: 0.88,
      llmReasoning: 'Good match for clearing cycle in processing schedules table. The time window and settlement aspects align well with schedule configuration requirements.'
    },
    relatedTerms: ['Settlement Window', 'Processing Cycle', 'ACH Cycle', 'Clearing Window'],
    synonyms: ['Settlement Cycle', 'Processing Window', 'ACH Settlement']
  },
  {
    id: '4',
    term: 'HSM Integration',
    definition: 'Hardware Security Module integration for cryptographic operations including message signing and encryption for NAPAS communication. All NAPAS messages require HSM-based digital signatures and encryption.',
    category: 'Security Component',
    confidence: 0.91,
    status: 'pending',
    sourceSection: 'Section 4.1 – Security Requirements',
    context: 'All NAPAS messages require HSM-based digital signatures and encryption to ensure message integrity and non-repudiation.',
    isPreferred: true,
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'security_config',
      columnName: 'hsm_config',
      dataType: 'JSON',
      confidence: 0.94,
      llmReasoning: 'Strong alignment with HSM integration in security configuration table. The cryptographic operations context matches security configuration requirements.'
    },
    relatedTerms: ['Hardware Security', 'Cryptographic Module', 'Message Signing', 'Encryption Module'],
    synonyms: ['Hardware Security Module', 'Cryptographic Integration', 'Message Encryption']
  },
  {
    id: '5',
    term: 'Payment Orchestration Engine',
    definition: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services. Manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions.',
    category: 'System Component',
    confidence: 0.96,
    status: 'pending',
    sourceSection: 'Section 2.1 – Business Overview',
    context: 'The orchestration engine manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions processed through NAPAS.',
    isPreferred: true,
    schemaMapping: {
      schemaName: 'payment_orchestration',
      tableName: 'orchestration_engine',
      columnName: 'orchestration_config',
      dataType: 'JSON',
      confidence: 0.97,
      llmReasoning: 'Perfect match for payment orchestration engine in orchestration_engine table. The coordination and workflow management context aligns perfectly with orchestration configuration.'
    },
    alternativeMappings: [
      {
        schemaName: 'dpg_middleware',
        tableName: 'payment_routing',
        columnName: 'orchestration_rules',
        dataType: 'TEXT',
        confidence: 0.82,
        llmReasoning: 'Alternative mapping to DPG middleware payment routing. Good match but less specific to orchestration functionality.'
      }
    ],
    relatedTerms: ['Payment Coordinator', 'Transaction Orchestrator', 'Payment Manager', 'ACH Orchestrator'],
    synonyms: ['Payment Coordinator', 'Transaction Manager', 'ACH Orchestrator']
  },
  {
    id: '6',
    term: 'Same-Day ACH',
    definition: 'Expedited ACH processing service that enables same-business-day settlement for qualifying transactions through NAPAS infrastructure. Requires special handling with earlier cutoff times and higher fees.',
    category: 'Payment Type',
    confidence: 0.93,
    status: 'pending',
    sourceSection: 'Section 3.2 – Payment Types',
    context: 'Same-day ACH requires special handling with earlier cutoff times and higher fees, processed through dedicated NAPAS same-day settlement windows.',
    isPreferred: false,
    schemaMapping: {
      schemaName: 'payment_orchestration',
      tableName: 'payment_types',
      columnName: 'same_day_ach_config',
      dataType: 'JSON',
      confidence: 0.95,
      llmReasoning: 'Excellent match for same-day ACH in payment types table. The expedited processing and special handling context aligns perfectly with payment type configuration.'
    },
    relatedTerms: ['Expedited ACH', 'Fast ACH', 'Same-Day Settlement', 'Rapid ACH'],
    synonyms: ['Expedited ACH', 'Fast Settlement', 'Rapid ACH']
  },
  {
    id: '7',
    term: 'Provider Certification Process',
    definition: 'Formal validation process ensuring third-party payment providers meet technical and compliance standards for ACH processing. New providers must complete certification including API testing and security validation.',
    category: 'Process',
    confidence: 0.94,
    status: 'pending',
    sourceSection: 'Section 3.1 – Provider Onboarding',
    context: 'New payment providers must complete certification including API testing, security validation, and NAPAS connectivity verification before production use.',
    isPreferred: true,
    schemaMapping: {
      schemaName: 'third_party_integration',
      tableName: 'provider_management',
      columnName: 'certification_process',
      dataType: 'JSON',
      confidence: 0.96,
      llmReasoning: 'Strong match for provider certification process in provider management table. The validation and compliance context aligns perfectly with certification requirements.'
    },
    relatedTerms: ['Provider Validation', 'Certification Process', 'Provider Testing', 'Integration Certification'],
    synonyms: ['Provider Validation', 'Certification Workflow', 'Integration Testing']
  },
  {
    id: '8',
    term: 'Transaction Dashboard',
    definition: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails. Business users require comprehensive dashboards to monitor ACH transaction flows.',
    category: 'User Interface',
    confidence: 0.92,
    status: 'pending',
    sourceSection: 'Section 3.1 – Dashboard Requirements',
    context: 'Business users require comprehensive dashboards to monitor ACH transaction flows, identify issues, and track performance metrics in real-time.',
    isPreferred: false,
    schemaMapping: {
      schemaName: 'business_portal',
      tableName: 'dashboard_config',
      columnName: 'transaction_dashboard',
      dataType: 'JSON',
      confidence: 0.94,
      llmReasoning: 'Excellent match for transaction dashboard in dashboard configuration table. The monitoring and real-time display context aligns perfectly with dashboard configuration.'
    },
    relatedTerms: ['Transaction Monitor', 'ACH Dashboard', 'Payment Dashboard', 'Transaction View'],
    synonyms: ['Transaction Monitor', 'ACH Monitor', 'Payment View']
  }
];

interface EnrichmentStageProps {
  job: ProcessingJob;
  onBack: () => void;
  onNext: () => void;
}

export function EnrichmentStage({ job, onBack, onNext }: EnrichmentStageProps) {
  const [terms, setTerms] = useState<ExtractedTerm[]>(mockTerms);
  const [selectedTerm, setSelectedTerm] = useState<ExtractedTerm | null>(terms[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editedDefinition, setEditedDefinition] = useState('');

  const categories = Array.from(new Set(terms.map(term => term.category)));
  const statuses = ['pending', 'approved', 'rejected', 'flagged'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTermUpdate = (termId: string, updates: Partial<ExtractedTerm>) => {
    setTerms(prev => prev.map(term => 
      term.id === termId ? { ...term, ...updates } : term
    ));
    if (selectedTerm?.id === termId) {
      setSelectedTerm(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleEditDefinition = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    if (term) {
      setEditingTerm(termId);
      setEditedDefinition(term.definition);
    }
  };

  const handleSaveDefinition = () => {
    if (editingTerm) {
      handleTermUpdate(editingTerm, { definition: editedDefinition });
      setEditingTerm(null);
      setEditedDefinition('');
    }
  };

  const getStatusIcon = (status: ExtractedTerm['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-amber-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: ExtractedTerm['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="warning">Flagged</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getMappingConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'emerald';
    if (confidence >= 0.8) return 'blue';
    if (confidence >= 0.7) return 'amber';
    return 'red';
  };

  const getStats = () => {
    return {
      total: terms.length,
      approved: terms.filter(t => t.status === 'approved').length,
      pending: terms.filter(t => t.status === 'pending').length,
      flagged: terms.filter(t => t.status === 'flagged').length,
      rejected: terms.filter(t => t.status === 'rejected').length,
      withMappings: terms.filter(t => t.schemaMapping).length,
      preferred: terms.filter(t => t.isPreferred).length,
    };
  };

  const stats = getStats();
  const enrichmentProgress = (stats.approved + stats.rejected) / stats.total * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back to Classification
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Term Enrichment & Mapping</h1>
              <p className="text-gray-600 mt-1">{job.documentName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {stats.approved + stats.rejected} of {stats.total} terms reviewed
            </div>
            <Button variant="primary" onClick={onNext}>
              Proceed to Review
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-600">Upload Complete</span>
          </div>
          <div className="w-8 h-0.5 bg-emerald-500"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-600">Classification Complete</span>
          </div>
          <div className="w-8 h-0.5 bg-blue-500"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <span className="text-sm font-medium text-blue-600">Enrichment & Mapping</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">4</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Review</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Terms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.flagged}</div>
            <div className="text-sm text-gray-600">Flagged</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.withMappings}</div>
            <div className="text-sm text-gray-600">With Mappings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.preferred}</div>
            <div className="text-sm text-gray-600">Preferred</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{Math.round(enrichmentProgress)}%</div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
          <div className="flex items-center">
            <ProgressBar 
              value={enrichmentProgress} 
              color="emerald" 
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Terms List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredTerms.map(term => (
                <div
                  key={term.id}
                  onClick={() => setSelectedTerm(term)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    selectedTerm?.id === term.id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(term.status)}
                      <h3 className="font-medium text-gray-900 text-sm">{term.term}</h3>
                      {term.isPreferred && (
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info" size="sm">{term.category}</Badge>
                    {getStatusBadge(term.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{term.sourceSection}</span>
                    <span className={`px-2 py-1 rounded-full font-medium ${getConfidenceColor(term.confidence)}`}>
                      {Math.round(term.confidence * 100)}%
                    </span>
                  </div>

                  {/* Schema Mapping Preview */}
                  {term.schemaMapping && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <code className="text-gray-700 font-mono">
                          {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}.{term.schemaMapping.columnName}
                        </code>
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${getConfidenceColor(term.schemaMapping.confidence)}`}>
                          {Math.round(term.schemaMapping.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Term Details */}
        <div className="flex-1 flex flex-col">
          {selectedTerm ? (
            <>
              {/* Term Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h2>
                    {selectedTerm.isPreferred && (
                      <Star className="w-6 h-6 text-amber-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedTerm.confidence)}`}>
                      {Math.round(selectedTerm.confidence * 100)}% confidence
                    </span>
                    {getStatusBadge(selectedTerm.status)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Category: {selectedTerm.category}</span>
                  <span>•</span>
                  <span>Section: {selectedTerm.sourceSection}</span>
                </div>
              </div>

              {/* Term Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Definition */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Definition</h3>
                    {editingTerm !== selectedTerm.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleEditDefinition(selectedTerm.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {editingTerm === selectedTerm.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedDefinition}
                        onChange={(e) => setEditedDefinition(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveDefinition}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingTerm(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedTerm.definition}
                    </p>
                  )}
                </div>

                {/* Context */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Source Context</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-gray-700 italic">"{selectedTerm.context}"</p>
                  </div>
                </div>

                {/* Schema Mapping */}
                {selectedTerm.schemaMapping && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Suggested Schema Mapping
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <code className="text-lg font-mono text-gray-800">
                          {selectedTerm.schemaMapping.schemaName}.
                          {selectedTerm.schemaMapping.tableName}.
                          {selectedTerm.schemaMapping.columnName}
                        </code>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" size="sm">
                            {selectedTerm.schemaMapping.dataType}
                          </Badge>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(selectedTerm.schemaMapping.confidence)}`}>
                            {Math.round(selectedTerm.schemaMapping.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar 
                        value={selectedTerm.schemaMapping.confidence * 100}
                        color={getMappingConfidenceColor(selectedTerm.schemaMapping.confidence)}
                        className="mb-3"
                      />
                      
                      {/* LLM Reasoning */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Reasoning
                        </h4>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedTerm.schemaMapping.llmReasoning}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Mappings */}
                    {selectedTerm.alternativeMappings && selectedTerm.alternativeMappings.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Alternative Mappings</h4>
                        <div className="space-y-2">
                          {selectedTerm.alternativeMappings.map((mapping, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                              <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-gray-800">
                                  {mapping.schemaName}.{mapping.tableName}.{mapping.columnName}
                                </code>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">
                                    {Math.round(mapping.confidence * 100)}%
                                  </span>
                                  <Button variant="ghost" size="sm">
                                    Select
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Related Terms & Synonyms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <GitBranch className="w-5 h-5 mr-2" />
                      Related Terms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map(relatedTerm => (
                        <button
                          key={relatedTerm}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          {relatedTerm}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.synonyms.map(synonym => (
                        <Badge key={synonym} variant="default" size="sm">
                          {synonym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTerm.isPreferred}
                        onChange={(e) => handleTermUpdate(selectedTerm.id, { isPreferred: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">Mark as Preferred</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Flag}
                      onClick={() => handleTermUpdate(selectedTerm.id, { status: 'flagged' })}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Flag
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => handleTermUpdate(selectedTerm.id, { status: 'rejected' })}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleTermUpdate(selectedTerm.id, { status: 'approved' })}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Term</h3>
                <p className="text-gray-500">
                  Choose a term from the list to view and edit its details, definition, and schema mappings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}