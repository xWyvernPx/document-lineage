import React, { useState } from 'react';
import { Search, Filter, BookOpen, CheckCircle, AlertCircle, Clock, Flag } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Term } from '../../../types';

interface TermListProps {
  terms: Term[];
  onReviewTerm: (term: Term) => void;
}

const mockTerms: Term[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees.',
    sourceSection: 'Interest Rates',
    category: 'Financial',
    tags: ['lending', 'interest', 'APR'],
    usage: 'Used in loan documentation and regulatory compliance.',
    confidence: 0.95,
    status: 'reviewed',
    documentId: '1',
    reviewedBy: 'Jane Doe',
    reviewedAt: '2024-01-15T15:30:00Z',
    relationships: [
      {
        id: '1',
        type: 'related-to',
        targetTermId: '2',
        targetTerm: 'Interest Rate',
        confidence: 0.9,
      },
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
    ],
  },
  {
    id: '2',
    term: 'Risk Assessment',
    definition: 'The process of evaluating potential risks that could be involved in a projected activity or undertaking.',
    sourceSection: 'Risk Management',
    category: 'Process',
    tags: ['risk', 'evaluation', 'analysis'],
    usage: 'Applied in loan approval processes and investment decisions.',
    confidence: 0.87,
    status: 'flagged',
    documentId: '1',
  },
  {
    id: '3',
    term: 'Data Subject',
    definition: 'An identified or identifiable natural person to whom personal data relates.',
    sourceSection: 'Data Protection',
    category: 'Legal',
    tags: ['GDPR', 'privacy', 'data'],
    usage: 'Used in data protection policies and privacy notices.',
    confidence: 0.92,
    status: 'auto',
    documentId: '3',
  },
];

export function TermList({ terms = mockTerms, onReviewTerm }: TermListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusIcon = (status: Term['status']) => {
    switch (status) {
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'overridden':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
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

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search terms or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="auto">Auto</option>
            <option value="flagged">Flagged</option>
            <option value="reviewed">Reviewed</option>
            <option value="overridden">Overridden</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTerms.map(term => (
          <Card key={term.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{term.term}</h3>
                    {getStatusIcon(term.status)}
                    {getStatusBadge(term.status)}
                    <Badge variant="info">{term.category}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {term.definition}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Section: {term.sourceSection}</span>
                      <span>Confidence: {Math.round(term.confidence * 100)}%</span>
                      {term.reviewedBy && (
                        <span>Reviewed by: {term.reviewedBy}</span>
                      )}
                    </div>
                    
                    {term.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {term.tags.map(tag => (
                          <Badge key={tag} size="sm" variant="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {term.relationships && term.relationships.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 block mb-1">Related terms:</span>
                        <div className="flex flex-wrap gap-2">
                          {term.relationships.map(rel => (
                            <div key={rel.id} className="flex items-center space-x-1 text-xs bg-gray-50 px-2 py-1 rounded">
                              <span className="text-gray-500">{rel.type}:</span>
                              <span className="font-medium">{rel.targetTerm}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {term.mappings && term.mappings.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 block mb-1">Schema mappings:</span>
                        <div className="space-y-1">
                          {term.mappings.map(mapping => (
                            <div key={mapping.id} className="flex items-center space-x-2 text-xs">
                              <Badge 
                                size="sm" 
                                variant={mapping.verified ? 'success' : 'warning'}
                              >
                                {mapping.schemaName}.{mapping.tableName}.{mapping.columnName}
                              </Badge>
                              <span className="text-gray-500">
                                {Math.round(mapping.confidence * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onReviewTerm(term)}
                >
                  Review
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}