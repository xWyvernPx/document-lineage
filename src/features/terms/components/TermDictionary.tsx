import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Flag,
  Star,
  Database,
  GitBranch,
  Edit3,
  Eye,
  Download,
  FileText,
  Brain,
  ExternalLink,
  Network,
  MoreHorizontal
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Term } from '../../../types';

interface ExtendedTerm extends Term {
  dataLineage?: {
    upstreamSources: {
      system: string;
      table: string;
      column: string;
    }[];
    downstreamTargets: {
      system: string;
      table: string;
      column: string;
    }[];
  };
  lastModified?: string;
  modifiedBy?: string;
  usageCount?: number;
  synonyms?: string[];
}

const mockTerms: ExtendedTerm[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees.',
    sourceSection: 'Interest Rates',
    category: 'Financial',
    tags: ['lending', 'interest', 'APR', 'preferred'],
    usage: 'Used in loan documentation and regulatory compliance.',
    confidence: 0.95,
    status: 'reviewed',
    documentId: '1',
    reviewedBy: 'Jane Doe',
    reviewedAt: '2024-01-15T15:30:00Z',
    lastModified: '2024-01-15T15:30:00Z',
    modifiedBy: 'Jane Doe',
    usageCount: 47,
    synonyms: ['APR', 'Annual Rate'],
    relationships: [
      {
        id: '1',
        type: 'related-to',
        targetTermId: '2',
        targetTerm: 'Interest Rate',
        confidence: 0.9,
      },
      {
        id: '2',
        type: 'child-of',
        targetTermId: '3',
        targetTerm: 'Loan Terms',
        confidence: 0.85,
      }
    ],
    mappings: [
      {
        id: '1',
        type: 'maps-to',
        schemaName: 'lending',
        tableName: 'loan_products',
        columnName: 'apr',
        confidence: 0.88,
        verified: true,
      },
      {
        id: '2',
        type: 'maps-to',
        schemaName: 'reporting',
        tableName: 'loan_metrics',
        columnName: 'annual_percentage_rate',
        confidence: 0.92,
        verified: true,
      }
    ],
    dataLineage: {
      upstreamSources: [
        { system: 'LoanOrigination', table: 'applications', column: 'requested_apr' },
        { system: 'RateEngine', table: 'rate_calculations', column: 'final_apr' }
      ],
      downstreamTargets: [
        { system: 'CustomerPortal', table: 'loan_details', column: 'display_apr' },
        { system: 'Reporting', table: 'regulatory_reports', column: 'disclosed_apr' },
        { system: 'Analytics', table: 'loan_performance', column: 'effective_apr' }
      ]
    }
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis.',
    sourceSection: 'Underwriting Criteria',
    category: 'Risk Assessment',
    tags: ['credit', 'risk', 'FICO', 'underwriting'],
    usage: 'Applied in loan approval processes and investment decisions.',
    confidence: 0.87,
    status: 'reviewed',
    documentId: '1',
    reviewedBy: 'Michael Chen',
    reviewedAt: '2024-01-14T10:20:00Z',
    lastModified: '2024-01-14T10:20:00Z',
    modifiedBy: 'Michael Chen',
    usageCount: 89,
    synonyms: ['FICO Score', 'Credit Rating'],
    relationships: [
      {
        id: '3',
        type: 'related-to',
        targetTermId: '4',
        targetTerm: 'Risk Assessment',
        confidence: 0.92,
      }
    ],
    mappings: [
      {
        id: '3',
        type: 'maps-to',
        schemaName: 'customer',
        tableName: 'credit_profiles',
        columnName: 'fico_score',
        confidence: 0.95,
        verified: true,
      }
    ],
    dataLineage: {
      upstreamSources: [
        { system: 'CreditBureau', table: 'credit_reports', column: 'fico_score' },
        { system: 'InternalScoring', table: 'risk_models', column: 'calculated_score' }
      ],
      downstreamTargets: [
        { system: 'UnderwritingEngine', table: 'decisions', column: 'credit_score_used' },
        { system: 'PricingEngine', table: 'rate_factors', column: 'score_tier' }
      ]
    }
  },
  {
    id: '3',
    term: 'Data Subject',
    definition: 'An identified or identifiable natural person to whom personal data relates.',
    sourceSection: 'Data Protection',
    category: 'Legal',
    tags: ['GDPR', 'privacy', 'data', 'compliance'],
    usage: 'Used in data protection policies and privacy notices.',
    confidence: 0.92,
    status: 'flagged',
    documentId: '3',
    lastModified: '2024-01-13T14:45:00Z',
    modifiedBy: 'Sarah Wilson',
    usageCount: 23,
    synonyms: ['Data Principal', 'Individual'],
    relationships: [
      {
        id: '4',
        type: 'related-to',
        targetTermId: '5',
        targetTerm: 'Personal Data',
        confidence: 0.88,
      }
    ],
    mappings: [
      {
        id: '4',
        type: 'maps-to',
        schemaName: 'privacy',
        tableName: 'data_subjects',
        columnName: 'subject_id',
        confidence: 0.85,
        verified: false,
      }
    ],
    dataLineage: {
      upstreamSources: [
        { system: 'CustomerOnboarding', table: 'applications', column: 'customer_id' }
      ],
      downstreamTargets: [
        { system: 'PrivacyManagement', table: 'consent_records', column: 'subject_id' },
        { system: 'DataRetention', table: 'retention_schedules', column: 'data_subject' }
      ]
    }
  },
  {
    id: '4',
    term: 'Principal Balance',
    definition: 'The outstanding amount of money owed on a loan, excluding interest.',
    sourceSection: 'Loan Servicing',
    category: 'Financial',
    tags: ['loan', 'balance', 'principal', 'preferred'],
    usage: 'Tracked throughout the loan lifecycle for payment processing.',
    confidence: 0.94,
    status: 'reviewed',
    documentId: '2',
    reviewedBy: 'David Kim',
    reviewedAt: '2024-01-12T16:10:00Z',
    lastModified: '2024-01-12T16:10:00Z',
    modifiedBy: 'David Kim',
    usageCount: 156,
    synonyms: ['Outstanding Principal', 'Loan Balance'],
    relationships: [
      {
        id: '5',
        type: 'related-to',
        targetTermId: '1',
        targetTerm: 'Annual Percentage Rate',
        confidence: 0.75,
      }
    ],
    mappings: [
      {
        id: '5',
        type: 'maps-to',
        schemaName: 'lending',
        tableName: 'loan_accounts',
        columnName: 'current_principal_balance',
        confidence: 0.96,
        verified: true,
      }
    ],
    dataLineage: {
      upstreamSources: [
        { system: 'LoanOrigination', table: 'loan_details', column: 'original_amount' },
        { system: 'PaymentProcessing', table: 'payments', column: 'principal_portion' }
      ],
      downstreamTargets: [
        { system: 'CustomerPortal', table: 'account_summary', column: 'remaining_balance' },
        { system: 'Collections', table: 'delinquency_tracking', column: 'outstanding_principal' }
      ]
    }
  }
];

interface TermDictionaryProps {
  terms?: ExtendedTerm[];
  onEditTerm?: (term: ExtendedTerm) => void;
  onViewLineage?: (term: ExtendedTerm) => void;
}

export function TermDictionary({ 
  terms = mockTerms, 
  onEditTerm,
  onViewLineage 
}: TermDictionaryProps) {
  const [selectedTerm, setSelectedTerm] = useState<ExtendedTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showLineageGraph, setShowLineageGraph] = useState(false);

  const categories = Array.from(new Set(terms.map(term => term.category)));
  const allTags = Array.from(new Set(terms.flatMap(term => term.tags)));
  const statuses = ['reviewed', 'flagged', 'auto', 'overridden'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesTag = tagFilter === 'all' || term.tags.includes(tagFilter);
    return matchesSearch && matchesStatus && matchesCategory && matchesTag;
  });

  const getStatusIcon = (status: Term['status']) => {
    switch (status) {
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'overridden':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Term['status']) => {
    switch (status) {
      case 'reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'flagged':
        return <Badge variant="error">Flagged</Badge>;
      case 'overridden':
        return <Badge variant="warning">Overridden</Badge>;
      default:
        return <Badge variant="default">Auto</Badge>;
    }
  };

  const isPreferred = (term: ExtendedTerm) => term.tags.includes('preferred');

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
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 pb-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search terms or definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={Download}>
              Export
            </Button>
            <Button variant="ghost" size="sm" icon={Network} onClick={() => setShowLineageGraph(!showLineageGraph)}>
              {showLineageGraph ? 'List View' : 'Graph View'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-5 gap-6 h-[calc(100vh-300px)]">
        {/* Left Panel (35%) - Terms List */}
        <div className="col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Business Terms ({filteredTerms.length})
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                {filteredTerms.map(term => (
                  <div
                    key={term.id}
                    onClick={() => setSelectedTerm(term)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedTerm?.id === term.id
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(term.status)}
                        <h3 className="font-medium text-gray-900 text-sm">
                          {term.term}
                        </h3>
                        {isPreferred(term) && (
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {term.definition}
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="info" size="sm">{term.category}</Badge>
                      {getStatusBadge(term.status)}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {term.usageCount} times</span>
                      <span>{Math.round(term.confidence * 100)}% confidence</span>
                    </div>

                    {/* Schema Mappings Preview */}
                    {term.mappings && term.mappings.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Database className="w-3 h-3" />
                          <span>{term.mappings.length} schema mapping{term.mappings.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel (65%) - Term Details */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col">
            {selectedTerm ? (
              <>
                {/* Term Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-gray-900">{selectedTerm.term}</h1>
                      {isPreferred(selectedTerm) && (
                        <Star className="w-6 h-6 text-amber-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedTerm.status)}
                      <Button variant="ghost" size="sm" icon={MoreHorizontal} />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Category: {selectedTerm.category}</span>
                    <span>•</span>
                    <span>Used {selectedTerm.usageCount} times</span>
                    <span>•</span>
                    <span>Modified {formatDate(selectedTerm.lastModified || '')}</span>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Definition */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">Definition</h3>
                      <Button variant="ghost" size="sm" icon={Edit3} onClick={() => onEditTerm?.(selectedTerm)} />
                    </div>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedTerm.definition}
                    </p>
                  </div>

                  {/* Usage Context */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Usage Context
                    </h3>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedTerm.usage}
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      Source: {selectedTerm.sourceSection}
                    </div>
                  </div>

                  {/* Synonyms */}
                  {selectedTerm.synonyms && selectedTerm.synonyms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Synonyms</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerm.synonyms.map(synonym => (
                          <Badge key={synonym} variant="default" size="sm">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.tags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant={tag === 'preferred' ? 'warning' : 'default'} 
                          size="sm"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Related Terms */}
                  {selectedTerm.relationships && selectedTerm.relationships.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <GitBranch className="w-5 h-5 mr-2" />
                        Related Terms
                      </h3>
                      <div className="space-y-2">
                        {selectedTerm.relationships.map(rel => (
                          <div key={rel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="default" size="sm">{rel.type}</Badge>
                              <button 
                                className="font-medium text-blue-600 hover:text-blue-700"
                                onClick={() => {
                                  const relatedTerm = terms.find(t => t.id === rel.targetTermId);
                                  if (relatedTerm) setSelectedTerm(relatedTerm);
                                }}
                              >
                                {rel.targetTerm}
                              </button>
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round(rel.confidence * 100)}% confidence
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schema Mappings */}
                  {selectedTerm.mappings && selectedTerm.mappings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Schema Mappings
                      </h3>
                      <div className="space-y-3">
                        {selectedTerm.mappings.map(mapping => (
                          <div key={mapping.id} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <code className="text-sm font-mono text-gray-800">
                                {mapping.schemaName}.{mapping.tableName}.{mapping.columnName}
                              </code>
                              <div className="flex items-center space-x-2">
                                {mapping.verified ? (
                                  <Badge variant="success" size="sm">Verified</Badge>
                                ) : (
                                  <Badge variant="warning" size="sm">Unverified</Badge>
                                )}
                                <span className="text-sm text-gray-500">
                                  {Math.round(mapping.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Type: {mapping.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Lineage */}
                  {selectedTerm.dataLineage && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          <Network className="w-5 h-5 mr-2" />
                          Data Lineage
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={ExternalLink}
                          onClick={() => onViewLineage?.(selectedTerm)}
                        >
                          View Full Lineage
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Upstream Sources */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Upstream Sources</h4>
                          <div className="space-y-2">
                            {selectedTerm.dataLineage.upstreamSources.map((source, index) => (
                              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                                <code className="text-blue-800">
                                  {source.system}.{source.table}.{source.column}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Downstream Targets */}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Downstream Targets</h4>
                          <div className="space-y-2">
                            {selectedTerm.dataLineage.downstreamTargets.map((target, index) => (
                              <div key={index} className="p-2 bg-emerald-50 rounded text-sm">
                                <code className="text-emerald-800">
                                  {target.system}.{target.table}.{target.column}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Information */}
                  {selectedTerm.reviewedBy && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Review Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Reviewed by:</span>
                            <p className="font-medium text-gray-900">{selectedTerm.reviewedBy}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Review date:</span>
                            <p className="font-medium text-gray-900">
                              {formatDate(selectedTerm.reviewedAt || '')}
                            </p>
                          </div>
                        </div>
                        {selectedTerm.reviewNotes && (
                          <div className="mt-3">
                            <span className="text-gray-600 text-sm">Notes:</span>
                            <p className="text-gray-700 mt-1">{selectedTerm.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Panel */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" icon={Eye}>
                        View Document
                      </Button>
                      <Button variant="ghost" size="sm" icon={GitBranch}>
                        View Relationships
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="ghost" size="sm" icon={Flag}>
                        Flag for Review
                      </Button>
                      <Button variant="secondary" size="sm" icon={Edit3} onClick={() => onEditTerm?.(selectedTerm)}>
                        Edit
                      </Button>
                      <Button variant="primary" size="sm">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Term</h3>
                  <p className="text-gray-500 max-w-sm">
                    Choose a term from the list to view its definition, relationships, and data lineage information.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}