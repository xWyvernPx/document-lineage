import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Database, 
  Calendar,
  User,
  ChevronDown,
  Eye,
  ExternalLink,
  BookOpen,
  GitBranch,
  Star,
  Tag,
  Network,
  X
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { DataLineageViewer } from '../../lineage/components/DataLineageViewer';

interface PublishedTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  domain: string;
  documentName: string;
  documentId: string;
  sourceSection: string;
  publishedAt: string;
  publishedBy: string;
  confidence: number;
  isPreferred: boolean;
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
  };
  relatedTerms: string[];
  tags: string[];
}

const mockPublishedTerms: PublishedTerm[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees.',
    category: 'Financial',
    domain: 'Lending',
    documentName: 'Credit Policy v3.2.pdf',
    documentId: 'doc1',
    sourceSection: 'Interest Rates',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.95,
    isPreferred: true,
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_products',
      columnName: 'annual_percentage_rate',
    },
    relatedTerms: ['Interest Rate', 'Loan Cost', 'APR'],
    tags: ['lending', 'interest', 'preferred']
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis.',
    category: 'Risk Assessment',
    domain: 'Risk Management',
    documentName: 'Credit Policy v3.2.pdf',
    documentId: 'doc1',
    sourceSection: 'Underwriting Criteria',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.89,
    isPreferred: false,
    schemaMapping: {
      schemaName: 'customer',
      tableName: 'credit_profiles',
      columnName: 'fico_score',
    },
    relatedTerms: ['FICO Score', 'Creditworthiness', 'Risk Assessment'],
    tags: ['credit', 'risk', 'underwriting']
  },
  {
    id: '3',
    term: 'Business Requirements',
    definition: 'Documented needs and expectations that a business solution must fulfill to achieve organizational objectives.',
    category: 'Process',
    domain: 'Project Management',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    sourceSection: 'Business Requirements',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.95,
    isPreferred: true,
    schemaMapping: {
      schemaName: 'project_management',
      tableName: 'requirements',
      columnName: 'business_requirement_text',
    },
    relatedTerms: ['Functional Requirements', 'System Requirements', 'User Stories'],
    tags: ['business', 'requirements', 'preferred']
  },
  {
    id: '4',
    term: 'Risk Assessment',
    definition: 'Systematic process of evaluating potential risks that could negatively impact business operations.',
    category: 'Risk Management',
    domain: 'Risk Management',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    sourceSection: 'Risk Assessment',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.89,
    isPreferred: false,
    relatedTerms: ['Risk Mitigation', 'Risk Analysis', 'Risk Matrix'],
    tags: ['risk', 'assessment', 'process']
  },
  {
    id: '5',
    term: 'Data Governance',
    definition: 'Framework of policies, procedures, and controls that ensure data quality, security, and compliance.',
    category: 'Data Management',
    domain: 'Technology',
    documentName: 'Compliance Framework.pdf',
    documentId: 'doc3',
    sourceSection: 'Data Strategy',
    publishedAt: '2024-01-14T09:45:00Z',
    publishedBy: 'Emily Rodriguez',
    confidence: 0.93,
    isPreferred: true,
    schemaMapping: {
      schemaName: 'data_management',
      tableName: 'governance_policies',
      columnName: 'policy_description',
    },
    relatedTerms: ['Data Quality', 'Data Stewardship', 'Compliance Framework'],
    tags: ['data', 'governance', 'preferred']
  }
];

export function TermDictionary() {
  const [terms] = useState<PublishedTerm[]>(mockPublishedTerms);
  const [selectedTerm, setSelectedTerm] = useState<PublishedTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  const [showLineageViewer, setShowLineageViewer] = useState(false);
  const [lineageTerm, setLineageTerm] = useState<PublishedTerm | null>(null);

  const documents = Array.from(new Set(terms.map(term => term.documentName)));
  const categories = Array.from(new Set(terms.map(term => term.category)));
  const domains = Array.from(new Set(terms.map(term => term.domain)));

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocument = documentFilter === 'all' || term.documentName === documentFilter;
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesDomain = domainFilter === 'all' || term.domain === domainFilter;
    return matchesSearch && matchesDocument && matchesCategory && matchesDomain;
  });

  const groupedTerms = filteredTerms.reduce((groups, term) => {
    const key = term.documentName;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(term);
    return groups;
  }, {} as Record<string, PublishedTerm[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const handleExportTerms = () => {
    const csvContent = [
      ['Term', 'Definition', 'Category', 'Domain', 'Document', 'Section', 'Published Date', 'Published By', 'Confidence'].join(','),
      ...filteredTerms.map(term => [
        `"${term.term}"`,
        `"${term.definition}"`,
        term.category,
        term.domain,
        `"${term.documentName}"`,
        `"${term.sourceSection}"`,
        formatDate(term.publishedAt),
        term.publishedBy,
        Math.round(term.confidence * 100) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-terms-dictionary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewLineage = (term: PublishedTerm) => {
    setLineageTerm(term);
    setShowLineageViewer(true);
  };

  const handleCloseLineage = () => {
    setShowLineageViewer(false);
    setLineageTerm(null);
  };

  const getStats = () => {
    return {
      total: terms.length,
      documents: documents.length,
      preferred: terms.filter(t => t.isPreferred).length,
      withMappings: terms.filter(t => t.schemaMapping).length,
    };
  };

  const stats = getStats();

  // Show lineage viewer if requested
  if (showLineageViewer && lineageTerm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with close button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Data Lineage for "{lineageTerm.term}"
              </h1>
              <p className="text-gray-600 mt-1">
                Explore data flow and dependencies for this business term
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleCloseLineage}
            >
              Back to Dictionary
            </Button>
          </div>
        </div>
        
        {/* Lineage Viewer */}
        <div className="flex-1">
          <DataLineageViewer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Term Dictionary</h1>
          <p className="text-gray-600">
            Browse, search, and manage business terms with their definitions, relationships, and data lineage
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Business Terms</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.documents}</div>
            <div className="text-sm text-gray-600">Source Documents</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.preferred}</div>
            <div className="text-sm text-gray-600">Preferred Terms</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.withMappings}</div>
            <div className="text-sm text-gray-600">Schema Mappings</div>
          </Card>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left Panel - Filters & Search */}
          <div className="col-span-2">
            <Card className="h-fit">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search terms, definitions, or documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                    <div className="relative">
                      <select
                        value={documentFilter}
                        onChange={(e) => setDocumentFilter(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Documents</option>
                        {documents.map(doc => (
                          <option key={doc} value={doc}>{doc}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                    <div className="relative">
                      <select
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Domains</option>
                        {domains.map(domain => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                  <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grouped' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grouped')}
                      className="flex-1"
                    >
                      By Document
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1"
                    >
                      All Terms
                    </Button>
                  </div>
                </div>

                {/* Export */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={handleExportTerms}
                    className="w-full"
                  >
                    Export Dictionary ({filteredTerms.length})
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Terms Display */}
          <div className="col-span-3">
            <Card className="h-fit">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Business Terms ({filteredTerms.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={GitBranch}>
                      View Lineage
                    </Button>
                    <Button variant="ghost" size="sm" icon={ExternalLink}>
                      Advanced Search
                    </Button>
                  </div>
                </div>

                {viewMode === 'grouped' ? (
                  <div className="space-y-6">
                    {Object.entries(groupedTerms).map(([documentName, documentTerms]) => (
                      <div key={documentName}>
                        <div className="flex items-center space-x-3 mb-4">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <h3 className="text-lg font-medium text-gray-900">{documentName}</h3>
                          <Badge variant="info" size="sm">{documentTerms.length} terms</Badge>
                        </div>
                        
                        <div className="grid gap-4">
                          {documentTerms.map(term => (
                            <div
                              key={term.id}
                              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">{term.term}</h4>
                                  {term.isPreferred && (
                                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="info" size="sm">{term.category}</Badge>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(term.confidence)}`}>
                                    {Math.round(term.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {term.definition}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                  <span>Section: {term.sourceSection}</span>
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>{term.publishedBy}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(term.publishedAt)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {term.schemaMapping && (
                                    <div className="flex items-center space-x-1">
                                      <Database className="w-3 h-3" />
                                      <span>Schema Mapped</span>
                                    </div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Network}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewLineage(term);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="View Data Lineage"
                                  />
                                </div>
                              </div>

                              {/* Expanded Details */}
                              {selectedTerm?.id === term.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                  {/* Schema Mapping */}
                                  {term.schemaMapping && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Database className="w-4 h-4 mr-1" />
                                        Schema Mapping
                                      </h5>
                                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                        {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}.{term.schemaMapping.columnName}
                                      </code>
                                    </div>
                                  )}

                                  {/* Related Terms */}
                                  {term.relatedTerms.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <GitBranch className="w-4 h-4 mr-1" />
                                        Related Terms
                                      </h5>
                                      <div className="flex flex-wrap gap-1">
                                        {term.relatedTerms.map(relatedTerm => (
                                          <Badge key={relatedTerm} variant="default" size="sm">
                                            {relatedTerm}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tags */}
                                  {term.tags.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        Tags
                                      </h5>
                                      <div className="flex flex-wrap gap-1">
                                        {term.tags.map(tag => (
                                          <Badge key={tag} variant="default" size="sm">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTerms.map(term => (
                      <div
                        key={term.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{term.term}</h4>
                            {term.isPreferred && (
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="info" size="sm">{term.category}</Badge>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(term.confidence)}`}>
                              {Math.round(term.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {term.definition}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Document: {term.documentName}</span>
                            <span>Section: {term.sourceSection}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(term.publishedAt)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Network}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLineage(term);
                              }}
                              className="text-blue-600 hover:text-blue-700"
                              title="View Data Lineage"
                            />
                          </div>
                        </div>

                        {/* Expanded Details for List View */}
                        {selectedTerm?.id === term.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            {/* Schema Mapping */}
                            {term.schemaMapping && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <Database className="w-4 h-4 mr-1" />
                                  Schema Mapping
                                </h5>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}.{term.schemaMapping.columnName}
                                </code>
                              </div>
                            )}

                            {/* Related Terms */}
                            {term.relatedTerms.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <GitBranch className="w-4 h-4 mr-1" />
                                  Related Terms
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {term.relatedTerms.map(relatedTerm => (
                                    <Badge key={relatedTerm} variant="default" size="sm">
                                      {relatedTerm}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tags */}
                            {term.tags.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                  <Tag className="w-4 h-4 mr-1" />
                                  Tags
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {term.tags.map(tag => (
                                    <Badge key={tag} variant="default" size="sm">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {filteredTerms.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Terms Found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery || documentFilter !== 'all' || categoryFilter !== 'all' || domainFilter !== 'all'
                        ? 'Try adjusting your search criteria or filters.'
                        : 'No terms have been published to the dictionary yet.'}
                    </p>
                    <Button variant="primary">
                      Process Documents
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}