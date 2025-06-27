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
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
  status: 'preferred' | 'pending' | 'published' | 'flagged';
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
  };
  relatedTerms: string[];
  tags: string[];
  lastUpdated: string;
  updatedBy: string;
}

const mockPublishedTerms: PublishedTerm[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees. This rate includes both the interest rate and additional costs or fees associated with the loan.',
    category: 'Financial',
    domain: 'Lending',
    documentName: 'Credit Policy v3.2.pdf',
    documentId: 'doc1',
    sourceSection: 'Interest Rates',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_products',
      columnName: 'annual_percentage_rate',
    },
    relatedTerms: ['Interest Rate', 'Loan Cost', 'APR'],
    tags: ['lending', 'interest', 'preferred'],
    lastUpdated: '2024-01-16T15:30:00Z',
    updatedBy: 'Sarah Johnson'
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis. Ranges typically from 300 to 850, with higher scores indicating better creditworthiness.',
    category: 'Risk Assessment',
    domain: 'Risk Management',
    documentName: 'Credit Policy v3.2.pdf',
    documentId: 'doc1',
    sourceSection: 'Underwriting Criteria',
    publishedAt: '2024-01-16T15:30:00Z',
    publishedBy: 'Sarah Johnson',
    confidence: 0.89,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'customer',
      tableName: 'credit_profiles',
      columnName: 'fico_score',
    },
    relatedTerms: ['FICO Score', 'Creditworthiness', 'Risk Assessment'],
    tags: ['credit', 'risk', 'underwriting'],
    lastUpdated: '2024-01-16T14:20:00Z',
    updatedBy: 'Michael Chen'
  },
  {
    id: '3',
    term: 'Business Requirements',
    definition: 'Documented needs and expectations that a business solution must fulfill to achieve organizational objectives. These requirements guide system design and development.',
    category: 'Process',
    domain: 'Project Management',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    sourceSection: 'Business Requirements',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.95,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'project_management',
      tableName: 'requirements',
      columnName: 'business_requirement_text',
    },
    relatedTerms: ['Functional Requirements', 'System Requirements', 'User Stories'],
    tags: ['business', 'requirements', 'preferred'],
    lastUpdated: '2024-01-15T11:20:00Z',
    updatedBy: 'Michael Chen'
  },
  {
    id: '4',
    term: 'Risk Assessment',
    definition: 'Systematic process of evaluating potential risks that could negatively impact business operations or project outcomes.',
    category: 'Risk Management',
    domain: 'Risk Management',
    documentName: 'Business Requirements v1.5.docx',
    documentId: 'doc2',
    sourceSection: 'Risk Assessment',
    publishedAt: '2024-01-15T11:20:00Z',
    publishedBy: 'Michael Chen',
    confidence: 0.89,
    isPreferred: false,
    status: 'published',
    relatedTerms: ['Risk Mitigation', 'Risk Analysis', 'Risk Matrix'],
    tags: ['risk', 'assessment', 'process'],
    lastUpdated: '2024-01-15T10:45:00Z',
    updatedBy: 'Emily Rodriguez'
  },
  {
    id: '5',
    term: 'Data Governance',
    definition: 'Framework of policies, procedures, and controls that ensure data quality, security, and compliance across the organization.',
    category: 'Data Management',
    domain: 'Technology',
    documentName: 'Compliance Framework.pdf',
    documentId: 'doc3',
    sourceSection: 'Data Strategy',
    publishedAt: '2024-01-14T09:45:00Z',
    publishedBy: 'Emily Rodriguez',
    confidence: 0.93,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'data_management',
      tableName: 'governance_policies',
      columnName: 'policy_description',
    },
    relatedTerms: ['Data Quality', 'Data Stewardship', 'Compliance Framework'],
    tags: ['data', 'governance', 'preferred'],
    lastUpdated: '2024-01-14T09:45:00Z',
    updatedBy: 'Emily Rodriguez'
  },
  {
    id: '6',
    term: 'Principal Balance',
    definition: 'The outstanding amount of money owed on a loan, excluding interest. This amount decreases with each payment made toward the loan.',
    category: 'Financial',
    domain: 'Lending',
    documentName: 'Loan Servicing Guide.pdf',
    documentId: 'doc4',
    sourceSection: 'Payment Processing',
    publishedAt: '2024-01-13T16:30:00Z',
    publishedBy: 'David Kim',
    confidence: 0.92,
    isPreferred: false,
    status: 'published',
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_accounts',
      columnName: 'current_principal_balance',
    },
    relatedTerms: ['Outstanding Balance', 'Loan Amount', 'Amortization'],
    tags: ['lending', 'balance', 'principal'],
    lastUpdated: '2024-01-13T16:30:00Z',
    updatedBy: 'David Kim'
  },
  {
    id: '7',
    term: 'Customer Onboarding',
    definition: 'Process of integrating new customers into the organization\'s systems and services, including identity verification and account setup.',
    category: 'Process',
    domain: 'Operations',
    documentName: 'Customer Onboarding Process.docx',
    documentId: 'doc5',
    sourceSection: 'Onboarding Workflow',
    publishedAt: '2024-01-12T14:15:00Z',
    publishedBy: 'Lisa Wang',
    confidence: 0.88,
    isPreferred: false,
    status: 'pending',
    relatedTerms: ['KYC', 'Identity Verification', 'Account Setup'],
    tags: ['customer', 'onboarding', 'process'],
    lastUpdated: '2024-01-12T14:15:00Z',
    updatedBy: 'Lisa Wang'
  },
  {
    id: '8',
    term: 'Regulatory Compliance',
    definition: 'Adherence to laws, regulations, guidelines and specifications relevant to business operations and industry standards.',
    category: 'Legal',
    domain: 'Compliance',
    documentName: 'Compliance Framework.pdf',
    documentId: 'doc3',
    sourceSection: 'Regulatory Requirements',
    publishedAt: '2024-01-11T10:00:00Z',
    publishedBy: 'Robert Chen',
    confidence: 0.94,
    isPreferred: true,
    status: 'preferred',
    schemaMapping: {
      schemaName: 'compliance',
      tableName: 'regulatory_requirements',
      columnName: 'compliance_description',
    },
    relatedTerms: ['Legal Requirements', 'Industry Standards', 'Audit'],
    tags: ['compliance', 'regulatory', 'preferred'],
    lastUpdated: '2024-01-11T10:00:00Z',
    updatedBy: 'Robert Chen'
  }
];

const ITEMS_PER_PAGE = 6;

export function TermDictionary() {
  const [terms] = useState<PublishedTerm[]>(mockPublishedTerms);
  const [selectedTerm, setSelectedTerm] = useState<PublishedTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLineageViewer, setShowLineageViewer] = useState(false);
  const [lineageTerm, setLineageTerm] = useState<PublishedTerm | null>(null);

  const documents = Array.from(new Set(terms.map(term => term.documentName)));
  const categories = Array.from(new Set(terms.map(term => term.category)));
  const domains = Array.from(new Set(terms.map(term => term.domain)));
  const statuses = ['preferred', 'published', 'pending', 'flagged'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocument = documentFilter === 'all' || term.documentName === documentFilter;
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    const matchesDomain = domainFilter === 'all' || term.domain === domainFilter;
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    return matchesSearch && matchesDocument && matchesCategory && matchesDomain && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTerms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTerms = filteredTerms.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preferred':
        return <Badge variant="warning">Preferred</Badge>;
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'pending':
        return <Badge variant="default">Pending</Badge>;
      case 'flagged':
        return <Badge variant="error">Flagged</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleExportTerms = () => {
    const csvContent = [
      ['Term', 'Definition', 'Category', 'Domain', 'Document', 'Section', 'Status', 'Confidence', 'Last Updated'].join(','),
      ...filteredTerms.map(term => [
        `"${term.term}"`,
        `"${term.definition}"`,
        term.category,
        term.domain,
        `"${term.documentName}"`,
        `"${term.sourceSection}"`,
        term.status,
        Math.round(term.confidence * 100) + '%',
        formatDate(term.lastUpdated)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'term-dictionary.csv';
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

  const handleTogglePreferred = (termId: string) => {
    // In a real app, this would make an API call
    console.log('Toggle preferred for term:', termId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Term Dictionary</h1>
            <p className="text-gray-600 mt-1">
              Browse and manage business terms with their definitions and relationships
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportTerms}
            >
              Export Dictionary ({filteredTerms.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredTerms.length} Terms Found
            </h2>
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTerms.length)} of {filteredTerms.length} terms
            </p>
          </div>
          
          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Terms List */}
        <div className="space-y-4 mb-8">
          {paginatedTerms.map(term => (
            <Card key={term.id} className="hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Term Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{term.term}</h3>
                      {term.isPreferred && (
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                      )}
                      {getStatusBadge(term.status)}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3 line-clamp-2">
                      {term.definition}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(term.confidence)}`}>
                      {Math.round(term.confidence * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={MoreHorizontal}
                      onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                    />
                  </div>
                </div>

                {/* Term Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{term.documentName}</div>
                      <div className="text-xs text-gray-500">{term.sourceSection}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{term.category}</div>
                      <div className="text-xs text-gray-500">{term.domain}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {term.schemaMapping ? 'Mapped' : 'Not Mapped'}
                      </div>
                      {term.schemaMapping && (
                        <div className="text-xs text-gray-500 font-mono">
                          {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(term.lastUpdated)}</div>
                      <div className="text-xs text-gray-500">by {term.updatedBy}</div>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={term.isPreferred}
                        onChange={() => handleTogglePreferred(term.id)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-gray-700">Preferred</span>
                    </label>
                    
                    {term.relatedTerms.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {term.relatedTerms.length} related
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Network}
                      onClick={() => handleViewLineage(term)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Lineage
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
                    >
                      {selectedTerm?.id === term.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedTerm?.id === term.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    {/* Full Definition */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Full Definition</h4>
                      <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                        {term.definition}
                      </p>
                    </div>

                    {/* Schema Mapping Details */}
                    {term.schemaMapping && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Database className="w-4 h-4 mr-2" />
                          Schema Mapping
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <code className="text-sm font-mono text-gray-800">
                            {term.schemaMapping.schemaName}.{term.schemaMapping.tableName}.{term.schemaMapping.columnName}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Related Terms */}
                    {term.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <GitBranch className="w-4 h-4 mr-2" />
                          Related Terms
                        </h4>
                        <div className="flex flex-wrap gap-2">
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
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {term.tags.map(tag => (
                            <Badge key={tag} variant="info" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTerms.length)} of {filteredTerms.length} terms
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Terms Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || documentFilter !== 'all' || categoryFilter !== 'all' || domainFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No terms have been published to the dictionary yet.'}
            </p>
            <Button variant="primary">
              Process Documents
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}