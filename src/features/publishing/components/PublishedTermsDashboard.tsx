import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Download, 
  FileText, 
  Database, 
  Calendar,
  User,
  BookOpen,
  Star,
  CheckCircle,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface PublishedTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  domain: string;
  documentName: string;
  documentId: string;
  publishedAt: string;
  publishedBy: string;
  confidence: number;
  isPreferred: boolean;
  mappingCount: number;
  usageCount: number;
  sourceSection: string;
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
    publishedAt: '2024-01-16T10:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.95,
    isPreferred: true,
    mappingCount: 3,
    usageCount: 47,
    sourceSection: 'Interest Rates'
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis.',
    category: 'Risk Assessment',
    domain: 'Lending',
    documentName: 'Credit Policy v3.2.pdf',
    documentId: 'doc1',
    publishedAt: '2024-01-16T10:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.92,
    isPreferred: false,
    mappingCount: 2,
    usageCount: 89,
    sourceSection: 'Underwriting Criteria'
  },
  {
    id: '3',
    term: 'Business Requirements',
    definition: 'Documented needs and expectations that a business solution must fulfill to achieve organizational objectives.',
    category: 'Process',
    domain: 'Technology',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    publishedAt: '2024-01-15T14:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.95,
    isPreferred: true,
    mappingCount: 3,
    usageCount: 156,
    sourceSection: 'Business Requirements'
  },
  {
    id: '4',
    term: 'Risk Assessment',
    definition: 'Systematic process of evaluating potential risks that could negatively impact business operations.',
    category: 'Risk Management',
    domain: 'Risk',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    publishedAt: '2024-01-15T14:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.92,
    isPreferred: false,
    mappingCount: 2,
    usageCount: 78,
    sourceSection: 'Risk Assessment'
  },
  {
    id: '5',
    term: 'Implementation Plan',
    definition: 'Detailed roadmap outlining the steps, timeline, and resources required to execute a project.',
    category: 'Project Management',
    domain: 'Technology',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    publishedAt: '2024-01-15T14:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.89,
    isPreferred: false,
    mappingCount: 1,
    usageCount: 34,
    sourceSection: 'Implementation Plan'
  },
  {
    id: '6',
    term: 'Data Governance',
    definition: 'Framework of policies, procedures, and controls that ensure data quality, security, and compliance.',
    category: 'Data Management',
    domain: 'Compliance',
    documentName: 'Compliance Framework.pdf',
    documentId: 'doc3',
    publishedAt: '2024-01-14T16:45:00Z',
    publishedBy: 'Emily Rodriguez',
    confidence: 0.93,
    isPreferred: true,
    mappingCount: 4,
    usageCount: 123,
    sourceSection: 'Data Strategy'
  }
];

export function PublishedTermsDashboard() {
  const [terms] = useState<PublishedTerm[]>(mockPublishedTerms);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'term' | 'publishedAt' | 'usageCount' | 'confidence'>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);

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

  const sortedTerms = [...filteredTerms].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'term':
        comparison = a.term.localeCompare(b.term);
        break;
      case 'publishedAt':
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'usageCount':
        comparison = a.usageCount - b.usageCount;
        break;
      case 'confidence':
        comparison = a.confidence - b.confidence;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const groupedByDocument = sortedTerms.reduce((acc, term) => {
    if (!acc[term.documentName]) {
      acc[term.documentName] = [];
    }
    acc[term.documentName].push(term);
    return acc;
  }, {} as Record<string, PublishedTerm[]>);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectTerm = (termId: string) => {
    setSelectedTerms(prev => 
      prev.includes(termId) 
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTerms.length === sortedTerms.length) {
      setSelectedTerms([]);
    } else {
      setSelectedTerms(sortedTerms.map(term => term.id));
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

  const getStats = () => {
    return {
      total: terms.length,
      documents: documents.length,
      preferred: terms.filter(t => t.isPreferred).length,
      totalUsage: terms.reduce((sum, term) => sum + term.usageCount, 0),
      avgConfidence: terms.reduce((sum, term) => sum + term.confidence, 0) / terms.length
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Published Terms Dashboard</h1>
          <p className="text-gray-600">
            Browse and manage all published business terms across your organization
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" icon={Download}>
            Export All
          </Button>
          <Button variant="ghost" size="sm" icon={MoreHorizontal} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Published Terms</div>
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
          <div className="text-2xl font-bold text-purple-600">{stats.totalUsage}</div>
          <div className="text-sm text-gray-600">Total Usage</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(stats.avgConfidence * 100)}%</div>
          <div className="text-sm text-gray-600">Avg Confidence</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search terms, definitions, or documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <select
                    value={documentFilter}
                    onChange={(e) => setDocumentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Documents</option>
                    {documents.map(doc => (
                      <option key={doc} value={doc}>{doc}</option>
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
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Domains</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {selectedTerms.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedTerms.length} selected
                  </span>
                  <Button variant="ghost" size="sm" icon={Download}>
                    Export Selected
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={List}
                  onClick={() => setViewMode('list')}
                />
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={Grid}
                  onClick={() => setViewMode('grid')}
                />
              </div>
              
              <span className="text-sm text-gray-600">
                {sortedTerms.length} of {terms.length} terms
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Terms Display */}
      {viewMode === 'list' ? (
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedTerms.length === sortedTerms.length && sortedTerms.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('term')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Term</span>
                      {sortBy === 'term' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Domain</th>
                  <th className="text-left py-3 px-4">Document</th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('usageCount')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Usage</span>
                      {sortBy === 'usageCount' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('publishedAt')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Published</span>
                      {sortBy === 'publishedAt' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTerms.map(term => (
                  <tr key={term.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedTerms.includes(term.id)}
                        onChange={() => handleSelectTerm(term.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{term.term}</span>
                            {term.isPreferred && (
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {term.definition}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="info" size="sm">{term.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" size="sm">{term.domain}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {term.documentName}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{term.usageCount}</div>
                        <div className="text-gray-500">times</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDate(term.publishedAt)}</div>
                        <div className="text-gray-500 flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{term.publishedBy}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={ExternalLink}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={MoreHorizontal}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid View - Grouped by Document */
        <div className="space-y-6">
          {Object.entries(groupedByDocument).map(([documentName, documentTerms]) => (
            <Card key={documentName}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{documentName}</h3>
                      <p className="text-sm text-gray-600">{documentTerms.length} published terms</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                    <Button variant="ghost" size="sm" icon={Download}>
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documentTerms.map(term => (
                    <div
                      key={term.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{term.term}</h4>
                          {term.isPreferred && (
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedTerms.includes(term.id)}
                          onChange={() => handleSelectTerm(term.id)}
                          className="rounded border-gray-300"
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {term.definition}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="info" size="sm">{term.category}</Badge>
                          <Badge variant="default" size="sm">{term.domain}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Used {term.usageCount} times</span>
                          <span>{Math.round(term.confidence * 100)}% confidence</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Published {formatDate(term.publishedAt)}</span>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" icon={Eye} />
                            <Button variant="ghost" size="sm" icon={ExternalLink} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {sortedTerms.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Terms Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || documentFilter !== 'all' || categoryFilter !== 'all' || domainFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'No terms have been published yet.'}
          </p>
          <Button variant="primary">
            Publish Terms
          </Button>
        </Card>
      )}
    </div>
  );
}