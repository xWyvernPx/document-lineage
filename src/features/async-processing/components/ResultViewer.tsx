import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Star, 
  Download, 
  Share2,
  FileText,
  Database,
  GitBranch,
  Eye,
  MessageSquare,
  Clock,
  User,
  Calendar,
  CheckCircle,
  Upload
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { ProcessingJob } from '../types/ProcessingJob';

interface ExtractedTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  confidence: number;
  status: 'pending' | 'published';
  sourceSection: string;
  context: string;
  isEdited: boolean;
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    confidence: number;
  };
  relatedTerms: string[];
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
    isEdited: false,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'routing_config',
      confidence: 0.94,
    },
    relatedTerms: ['Message Router', 'Transaction Router', 'ACH Router', 'Payment Router'],
  },
  {
    id: '2',
    term: 'Transaction Correlation ID',
    definition: 'Unique identifier that tracks a single ACH transaction across all system components and services throughout its lifecycle. Enables end-to-end tracking and reconciliation across DPG, payment services, and core banking.',
    category: 'Data Element',
    confidence: 0.93,
    status: 'pending',
    sourceSection: 'Section 4.2 – Message Tracking',
    context: 'Each ACH transaction is assigned a correlation ID at initiation to enable end-to-end tracking and reconciliation across DPG, payment services, and core banking.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'message_routing',
      columnName: 'correlation_id',
      confidence: 0.97,
    },
    relatedTerms: ['Trace ID', 'Transaction ID', 'Correlation Key', 'ACH Trace Number'],
  },
  {
    id: '3',
    term: 'Clearing Cycle',
    definition: 'Scheduled time window during which NAPAS processes and settles ACH transactions. Banks must submit transactions within specific clearing cycles to ensure same-day or next-day settlement.',
    category: 'Operational Process',
    confidence: 0.95,
    status: 'pending',
    sourceSection: 'Section 6.2 – Processing Schedule',
    context: 'Standard ACH transactions must be submitted to NAPAS by 2:00 PM local time for same-day processing, while same-day ACH requires 10:30 AM submission.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'dpg_middleware',
      tableName: 'processing_schedules',
      columnName: 'clearing_cycle_config',
      confidence: 0.96,
    },
    relatedTerms: ['Settlement Window', 'Processing Cycle', 'ACH Cycle', 'Clearing Window'],
  },
  {
    id: '4',
    term: 'NAPAS Dedicated Line',
    definition: 'Secure, dedicated network connection between bank infrastructure and NAPAS data centers with guaranteed bandwidth and latency. Banks must maintain redundant dedicated lines with minimum 10Mbps bandwidth and sub-100ms latency.',
    category: 'Infrastructure',
    confidence: 0.94,
    status: 'pending',
    sourceSection: 'Section 2.1 – Network Connectivity',
    context: 'Banks must maintain redundant dedicated lines to NAPAS with minimum 10Mbps bandwidth and sub-100ms latency for real-time ACH processing.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'network_config',
      columnName: 'dedicated_line_config',
      confidence: 0.95,
    },
    relatedTerms: ['Dedicated Connection', 'Private Line', 'NAPAS Link', 'Secure Connection'],
  },
  {
    id: '5',
    term: 'HSM Integration',
    definition: 'Hardware Security Module integration for cryptographic operations including message signing and encryption for NAPAS communication. All NAPAS messages require HSM-based digital signatures and encryption.',
    category: 'Security Component',
    confidence: 0.91,
    status: 'pending',
    sourceSection: 'Section 4.1 – Security Requirements',
    context: 'All NAPAS messages require HSM-based digital signatures and encryption to ensure message integrity and non-repudiation.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'infrastructure',
      tableName: 'security_config',
      columnName: 'hsm_config',
      confidence: 0.93,
    },
    relatedTerms: ['Hardware Security', 'Cryptographic Module', 'Message Signing', 'Encryption Module'],
  },
  {
    id: '6',
    term: 'Payment Orchestration Engine',
    definition: 'Central system component that coordinates ACH payment flows across multiple third-party providers and internal banking services. Manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions.',
    category: 'System Component',
    confidence: 0.96,
    status: 'pending',
    sourceSection: 'Section 2.1 – Business Overview',
    context: 'The orchestration engine manages complex payment workflows, routing decisions, and fallback scenarios for ACH transactions processed through NAPAS.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'payment_orchestration',
      tableName: 'orchestration_engine',
      columnName: 'orchestration_config',
      confidence: 0.97,
    },
    relatedTerms: ['Payment Coordinator', 'Transaction Orchestrator', 'Payment Manager', 'ACH Orchestrator'],
  },
  {
    id: '7',
    term: 'Same-Day ACH',
    definition: 'Expedited ACH processing service that enables same-business-day settlement for qualifying transactions through NAPAS infrastructure. Requires special handling with earlier cutoff times and higher fees.',
    category: 'Payment Type',
    confidence: 0.93,
    status: 'pending',
    sourceSection: 'Section 3.2 – Payment Types',
    context: 'Same-day ACH requires special handling with earlier cutoff times and higher fees, processed through dedicated NAPAS same-day settlement windows.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'payment_orchestration',
      tableName: 'payment_types',
      columnName: 'same_day_ach_config',
      confidence: 0.95,
    },
    relatedTerms: ['Expedited ACH', 'Fast ACH', 'Same-Day Settlement', 'Rapid ACH'],
  },
  {
    id: '8',
    term: 'Provider Certification Process',
    definition: 'Formal validation process ensuring third-party payment providers meet technical and compliance standards for ACH processing. New providers must complete certification including API testing and security validation.',
    category: 'Process',
    confidence: 0.94,
    status: 'pending',
    sourceSection: 'Section 3.1 – Provider Onboarding',
    context: 'New payment providers must complete certification including API testing, security validation, and NAPAS connectivity verification before production use.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'third_party_integration',
      tableName: 'provider_management',
      columnName: 'certification_process',
      confidence: 0.96,
    },
    relatedTerms: ['Provider Validation', 'Certification Process', 'Provider Testing', 'Integration Certification'],
  },
  {
    id: '9',
    term: 'Transaction Dashboard',
    definition: 'Real-time monitoring interface displaying ACH transaction volumes, success rates, and processing status across NAPAS and other payment rails. Business users require comprehensive dashboards to monitor ACH transaction flows.',
    category: 'User Interface',
    confidence: 0.92,
    status: 'pending',
    sourceSection: 'Section 3.1 – Dashboard Requirements',
    context: 'Business users require comprehensive dashboards to monitor ACH transaction flows, identify issues, and track performance metrics in real-time.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'business_portal',
      tableName: 'dashboard_config',
      columnName: 'transaction_dashboard',
      confidence: 0.94,
    },
    relatedTerms: ['Transaction Monitor', 'ACH Dashboard', 'Payment Dashboard', 'Transaction View'],
  },
  {
    id: '10',
    term: 'Exception Management Workflow',
    definition: 'Business process for handling failed or rejected ACH transactions including investigation, resolution, and customer communication. Portal provides tools for business users to research transaction failures.',
    category: 'Business Process',
    confidence: 0.89,
    status: 'pending',
    sourceSection: 'Section 4.2 – Transaction Monitoring',
    context: 'Portal provides tools for business users to research transaction failures, initiate corrections, and communicate with customers about ACH issues.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'business_portal',
      tableName: 'exception_management',
      columnName: 'workflow_config',
      confidence: 0.91,
    },
    relatedTerms: ['Exception Handling', 'Error Management', 'Transaction Resolution', 'ACH Exceptions'],
  }
];

interface ResultViewerProps {
  job: ProcessingJob;
  onBack: () => void;
  onPublishComplete?: (job: ProcessingJob) => void;
  onTermDictionary?: () => void;
}

export function ResultViewer({ job, onBack, onPublishComplete, onTermDictionary }: ResultViewerProps) {
  const [terms, setTerms] = useState<ExtractedTerm[]>(mockTerms);
  const [selectedTerm, setSelectedTerm] = useState<ExtractedTerm | null>(terms[0]);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    };
  }, []);

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditTerm = (termId: string) => {
    const term = terms.find(t => t.id === termId);
    if (term) {
      setEditingTerm(termId);
      setEditedDefinition(term.definition);
    }
  };

  const handleSaveEdit = (termId: string) => {
    setTerms(prev => prev.map(term => 
      term.id === termId 
        ? { ...term, definition: editedDefinition, isEdited: true }
        : term
    ));
    setEditingTerm(null);
    setEditedDefinition('');
    
    // Update selected term if it's the one being edited
    if (selectedTerm?.id === termId) {
      setSelectedTerm(prev => prev ? { ...prev, definition: editedDefinition, isEdited: true } : null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTerm(null);
    setEditedDefinition('');
  };

  const handlePublishTerms = async () => {
    setIsPublishing(true);
    
    // Simulate publishing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update all terms to published status
    setTerms(prev => prev.map(term => ({ ...term, status: 'published' as const })));
    
    // Update job status
    const updatedJob = { ...job, status: 'published' as const };
    
    setIsPublishing(false);
    setShowSuccessToast(true);
    
    // Clear any existing timeout before setting a new one
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    // Auto-hide toast after 3 seconds with proper cleanup
    toastTimeoutRef.current = setTimeout(() => {
      setShowSuccessToast(false);
      toastTimeoutRef.current = null;
      // Redirect to dashboard
      if (onPublishComplete) {
        onPublishComplete(updatedJob);
      } else {
        onBack();
      }
    }, 3000);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getStats = () => {
    return {
      total: terms.length,
      published: terms.filter(t => t.status === 'published').length,
      pending: terms.filter(t => t.status === 'pending').length,
      edited: terms.filter(t => t.isEdited).length,
    };
  };

  const stats = getStats();
  const allPublished = stats.published === stats.total;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm transform transition-all duration-300 ease-in-out">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  Terms Published Successfully!
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Terms from {job.documentName} have been published to the Term Dictionary.
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium" onClick={onTermDictionary}>
                  View in Term Dictionary →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{job.documentName}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>{job.type.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{job.submittedBy}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Completed {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {allPublished && (
                  <Badge variant="success">Published</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" icon={Download}>
              Export
            </Button>
            <Button variant="ghost" size="sm" icon={Share2}>
              Share
            </Button>
            {!allPublished ? (
              <Button 
                variant="primary" 
                size="sm" 
                icon={Upload}
                onClick={handlePublishTerms}
                loading={isPublishing}
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish to Dictionary'}
              </Button>
            ) : (
              <Button 
                variant="success" 
                size="sm" 
                icon={CheckCircle}
                disabled
              >
                Published
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Terms</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.edited}</div>
            <div className="text-sm text-gray-600">Edited</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Terms List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
              </select>
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
                      {term.status === 'published' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <h3 className="font-medium text-gray-900 text-sm">{term.term}</h3>
                      {term.isEdited && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Edited" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info" size="sm">{term.category}</Badge>
                    <Badge variant={term.status === 'published' ? 'success' : 'default'}>
                      {term.status === 'published' ? 'Published' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{term.sourceSection}</span>
                    <span className={`px-2 py-1 rounded-full font-medium ${getConfidenceColor(term.confidence)}`}>
                      {Math.round(term.confidence * 100)}%
                    </span>
                  </div>
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
                    {selectedTerm.isEdited && (
                      <Badge variant="info" size="sm">Edited</Badge>
                    )}
                    {selectedTerm.status === 'published' && (
                      <Badge variant="success" size="sm">Published</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedTerm.confidence)}`}>
                      {Math.round(selectedTerm.confidence * 100)}% confidence
                    </span>
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
                    {editingTerm !== selectedTerm.id && selectedTerm.status !== 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => handleEditTerm(selectedTerm.id)}
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
                        <Button size="sm" onClick={() => handleSaveEdit(selectedTerm.id)}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Source Context
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-gray-700 italic">"{selectedTerm.context}"</p>
                  </div>
                </div>

                {/* Schema Mapping */}
                {selectedTerm.schemaMapping && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Schema Mapping
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-lg font-mono text-gray-800">
                          {selectedTerm.schemaMapping.schemaName}.
                          {selectedTerm.schemaMapping.tableName}.
                          {selectedTerm.schemaMapping.columnName}
                        </code>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(selectedTerm.schemaMapping.confidence)}`}>
                          {Math.round(selectedTerm.schemaMapping.confidence * 100)}%
                        </span>
                      </div>
                      <ProgressBar 
                        value={selectedTerm.schemaMapping.confidence * 100}
                        color="blue"
                      />
                    </div>
                  </div>
                )}

                {/* Related Terms */}
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
              </div>

              {/* Action Panel */}
              {selectedTerm.status !== 'published' && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View in Document
                      </Button>
                      <Button variant="ghost" size="sm" icon={Star}>
                        Mark as Preferred
                      </Button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Ready for publishing
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Term</h3>
                <p className="text-gray-500">
                  Choose a term from the list to view and edit its details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}