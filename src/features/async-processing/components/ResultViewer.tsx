import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Check, 
  Flag, 
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
  Calendar
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
  isEdited: boolean;
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    confidence: number;
  };
  relatedTerms: string[];
}

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'completed';
  submittedAt: string;
  submittedBy: string;
  completedAt: string;
  extractedTerms: number;
}

const mockTerms: ExtractedTerm[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees.',
    category: 'Financial',
    confidence: 0.95,
    status: 'pending',
    sourceSection: 'Interest Rates',
    context: 'The APR must be clearly disclosed to borrowers and calculated according to regulatory requirements.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_products',
      columnName: 'annual_percentage_rate',
      confidence: 0.92,
    },
    relatedTerms: ['Interest Rate', 'Loan Cost', 'APR'],
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis.',
    category: 'Risk Assessment',
    confidence: 0.89,
    status: 'approved',
    sourceSection: 'Underwriting Criteria',
    context: 'Minimum credit score requirements vary by loan product and risk tolerance.',
    isEdited: false,
    schemaMapping: {
      schemaName: 'customer',
      tableName: 'credit_profiles',
      columnName: 'fico_score',
      confidence: 0.88,
    },
    relatedTerms: ['FICO Score', 'Creditworthiness', 'Risk Assessment'],
  },
  {
    id: '3',
    term: 'Principal Balance',
    definition: 'The outstanding amount of money owed on a loan, excluding interest.',
    category: 'Financial',
    confidence: 0.87,
    status: 'flagged',
    sourceSection: 'Loan Servicing',
    context: 'Principal balance decreases with each payment according to the amortization schedule.',
    isEdited: false,
    relatedTerms: ['Outstanding Balance', 'Loan Amount', 'Amortization'],
  },
];

interface ResultViewerProps {
  job: ProcessingJob;
  onBack: () => void;
}

export function ResultViewer({ job, onBack }: ResultViewerProps) {
  const [terms, setTerms] = useState<ExtractedTerm[]>(mockTerms);
  const [selectedTerm, setSelectedTerm] = useState<ExtractedTerm | null>(terms[0]);
  const [editingTerm, setEditingTerm] = useState<string | null>(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewNote, setReviewNote] = useState('');

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

  const handleStatusChange = (termId: string, status: ExtractedTerm['status']) => {
    setTerms(prev => prev.map(term => 
      term.id === termId ? { ...term, status } : term
    ));
    
    if (selectedTerm?.id === termId) {
      setSelectedTerm(prev => prev ? { ...prev, status } : null);
    }
  };

  const getStatusIcon = (status: ExtractedTerm['status']) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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

  const getStats = () => {
    return {
      total: terms.length,
      approved: terms.filter(t => t.status === 'approved').length,
      pending: terms.filter(t => t.status === 'pending').length,
      flagged: terms.filter(t => t.status === 'flagged').length,
      rejected: terms.filter(t => t.status === 'rejected').length,
      edited: terms.filter(t => t.isEdited).length,
    };
  };

  const stats = getStats();
  const reviewProgress = (stats.approved + stats.rejected) / stats.total * 100;

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <span>Completed {new Date(job.completedAt).toLocaleDateString()}</span>
                </div>
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
            <Button variant="primary" size="sm">
              Publish Terms
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.edited}</div>
            <div className="text-sm text-gray-600">Edited</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{Math.round(reviewProgress)}%</div>
            <div className="text-sm text-gray-600">Reviewed</div>
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
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
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
                      {getStatusIcon(term.status)}
                      <h3 className="font-medium text-gray-900 text-sm">{term.term}</h3>
                      {term.isEdited && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Edited" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="info" size="sm">{term.category}</Badge>
                    {getStatusBadge(term.status)}
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

                {/* Review Notes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Review Notes</h3>
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add notes about this term..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Panel */}
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
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Flag}
                      onClick={() => handleStatusChange(selectedTerm.id, 'flagged')}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      Flag
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => handleStatusChange(selectedTerm.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      icon={Check}
                      onClick={() => handleStatusChange(selectedTerm.id, 'approved')}
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