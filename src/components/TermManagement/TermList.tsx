import React from 'react';
import { Search, Filter, ChevronDown, Star, Database, Clock, CheckCircle, AlertTriangle, Flag } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';

interface Term {
  id: string;
  term: string;
  definition: string;
  sourceSection: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  context: string;
  relatedTerms: string[];
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
    isApproved?: boolean;
    isRejected?: boolean;
  };
  alternativeMappings?: Array<{
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
  }>;
  isPreferred?: boolean;
}

interface TermListProps {
  terms: Term[];
  selectedTerm: Term | null;
  onTermSelect: (term: Term) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  showSchemaPreview?: boolean;
}

export function TermList({
  terms,
  selectedTerm,
  onTermSelect,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  showSchemaPreview = false
}: TermListProps) {
  const categories = Array.from(new Set(terms.map(term => term.category)));
  const statuses = ['pending', 'approved', 'rejected', 'flagged'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusIcon = (status: Term['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Term['status']) => {
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

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Extracted Terms</h2>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
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
              onChange={(e) => onCategoryFilterChange(e.target.value)}
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

      {/* Term List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {filteredTerms.map(term => (
            <div
              key={term.id}
              onClick={() => onTermSelect(term)}
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
              {showSchemaPreview && term.schemaMapping && (
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
    </Card>
  );
}