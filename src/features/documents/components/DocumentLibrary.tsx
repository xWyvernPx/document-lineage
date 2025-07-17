import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Eye, 
  Download, 
  MoreHorizontal,
  Search,
  Filter,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Database,
  BookOpen,
  Tag,
  ExternalLink,
  Edit3,
  Trash2,
  Archive,
  Share2,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { Document } from '../../../types';

interface DocumentLibraryProps {
  documents?: Document[];
  onViewDocument: (document: Document) => void;
  onEditDocument?: (document: Document) => void;
  onDeleteDocument?: (document: Document) => void;
  onReprocessDocument?: (document: Document) => void;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Lending Policy v2.1.pdf',
    type: 'pdf',
    size: 2457600,
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'Sarah Johnson',
    status: 'completed',
    classification: {
      type: 'Policy',
      domain: 'Lending',
      sections: ['Interest Rates', 'Risk Assessment', 'Compliance Requirements'],
      confidence: 0.95,
    },
    terms: [
      { id: '1', term: 'Annual Percentage Rate', definition: 'The yearly cost of a loan...', sourceSection: 'Interest Rates', category: 'Financial', tags: ['lending'], usage: 'Loan documentation', confidence: 0.95, status: 'reviewed', documentId: '1' },
      { id: '2', term: 'Credit Score', definition: 'Numerical expression of creditworthiness...', sourceSection: 'Risk Assessment', category: 'Risk', tags: ['credit'], usage: 'Underwriting', confidence: 0.92, status: 'reviewed', documentId: '1' }
    ]
  },
  {
    id: '2',
    name: 'Business Requirements Document v1.5.docx',
    type: 'docx',
    size: 1048576,
    uploadedAt: '2024-01-14T14:22:00Z',
    uploadedBy: 'Michael Chen',
    status: 'processing',
    processingProgress: 65,
  },
  {
    id: '3',
    name: 'Regulatory Compliance Framework.pdf',
    type: 'pdf',
    size: 3145728,
    uploadedAt: '2024-01-13T09:15:00Z',
    uploadedBy: 'Emily Rodriguez',
    status: 'completed',
    classification: {
      type: 'Regulatory',
      domain: 'Compliance',
      sections: ['Data Protection', 'Financial Regulations', 'Audit Requirements'],
      confidence: 0.88,
    },
    terms: [
      { id: '3', term: 'Data Subject', definition: 'An identified or identifiable natural person...', sourceSection: 'Data Protection', category: 'Legal', tags: ['GDPR'], usage: 'Privacy policies', confidence: 0.90, status: 'flagged', documentId: '3' }
    ]
  },
  {
    id: '4',
    name: 'Credit Risk Assessment Model.pdf',
    type: 'pdf',
    size: 1876543,
    uploadedAt: '2024-01-12T16:45:00Z',
    uploadedBy: 'David Kim',
    status: 'failed',
    classification: {
      type: 'BRD',
      domain: 'Risk',
      sections: ['Model Overview', 'Risk Factors', 'Validation'],
      confidence: 0.82,
    }
  },
  {
    id: '5',
    name: 'Customer Onboarding Process.docx',
    type: 'docx',
    size: 987654,
    uploadedAt: '2024-01-11T11:20:00Z',
    uploadedBy: 'Lisa Wang',
    status: 'completed',
    classification: {
      type: 'SRS',
      domain: 'Tech',
      sections: ['User Journey', 'System Requirements', 'Integration Points'],
      confidence: 0.91,
    },
    terms: [
      { id: '4', term: 'KYC Verification', definition: 'Know Your Customer verification process...', sourceSection: 'User Journey', category: 'Process', tags: ['compliance'], usage: 'Customer onboarding', confidence: 0.88, status: 'reviewed', documentId: '5' }
    ]
  },
  {
    id: '6',
    name: 'Data Governance Charter.pdf',
    type: 'pdf',
    size: 1234567,
    uploadedAt: '2024-01-10T08:30:00Z',
    uploadedBy: 'Robert Chen',
    status: 'uploading',
    processingProgress: 25,
  }
];

export function DocumentLibrary({ 
  documents = mockDocuments, 
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onReprocessDocument
}: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const statuses = ['uploading', 'processing', 'completed', 'failed'];
  const types = ['pdf', 'docx', 'image'];
  const domains = Array.from(new Set(documents.map(doc => doc.classification?.domain).filter(Boolean)));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.classification?.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesDomain = domainFilter === 'all' || doc.classification?.domain === domainFilter;
    return matchesSearch && matchesStatus && matchesType && matchesDomain;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'uploading':
        return <Badge variant="info">Uploading</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'uploading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === sortedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(sortedDocuments.map(doc => doc.id));
    }
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const completed = documents.filter(d => d.status === 'completed').length;
    const processing = documents.filter(d => d.status === 'processing' || d.status === 'uploading').length;
    const failed = documents.filter(d => d.status === 'failed').length;
    const totalTerms = documents.reduce((sum, doc) => sum + (doc.terms?.length || 0), 0);
    
    return { total, completed, processing, failed, totalTerms };
  };

  const stats = getDocumentStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Documents</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalTerms}</div>
          <div className="text-sm text-gray-600">Extracted Terms</div>
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
              placeholder="Search documents, authors, or document types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              
              {selectedDocuments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedDocuments.length} selected
                  </span>
                  <Button variant="ghost" size="sm" icon={Archive}>
                    Archive
                  </Button>
                  <Button variant="ghost" size="sm" icon={Share2}>
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600">
                    Delete
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
                {sortedDocuments.length} of {documents.length} documents
              </span>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.toUpperCase()}
                    </option>
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
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <Button variant="ghost" size="sm" onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setDomainFilter('all');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Document List/Grid */}
      {viewMode === 'list' ? (
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === sortedDocuments.length && sortedDocuments.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Name</span>
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Status</span>
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Domain</th>
                  <th className="text-left py-3 px-4">Terms</th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('size')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Size</span>
                      {sortBy === 'size' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center space-x-1 font-medium text-gray-900 hover:text-blue-600"
                    >
                      <span>Uploaded</span>
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDocuments.map(document => (
                  <tr key={document.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(document.id)}
                        onChange={() => handleSelectDocument(document.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <button
                            onClick={() => onViewDocument(document)}
                            className="font-medium text-gray-900 hover:text-blue-600 text-left"
                          >
                            {document.name}
                          </button>
                          <div className="text-sm text-gray-500">
                            by {document.uploadedBy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        {getStatusBadge(document.status)}
                      </div>
                      {(document.status === 'processing' || document.status === 'uploading') && document.processingProgress && (
                        <div className="mt-1">
                          <ProgressBar 
                            value={document.processingProgress} 
                            color={document.status === 'processing' ? 'amber' : 'blue'}
                            className="w-20"
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default" size="sm">
                        {document.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {document.classification?.domain ? (
                        <Badge variant="info" size="sm">
                          {document.classification.domain}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {document.terms ? (
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">{document.terms.length}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatFileSize(document.size)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(document.uploadedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => onViewDocument(document)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Download}
                          disabled={document.status !== 'completed'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedDocuments.map(document => (
            <Card key={document.id} hover className="relative">
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.id)}
                  onChange={() => handleSelectDocument(document.id)}
                  className="rounded border-gray-300"
                />
              </div>
              
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="sm" icon={MoreHorizontal} />
              </div>

              <div className="pt-8 pb-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-xl">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="text-center mb-4">
                  <button
                    onClick={() => onViewDocument(document)}
                    className="font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2"
                  >
                    {document.name}
                  </button>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {getStatusIcon(document.status)}
                    {getStatusBadge(document.status)}
                  </div>
                </div>

                {(document.status === 'processing' || document.status === 'uploading') && document.processingProgress && (
                  <div className="mb-4">
                    <ProgressBar 
                      value={document.processingProgress} 
                      color={document.status === 'processing' ? 'amber' : 'blue'}
                      showLabel
                    />
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="default" size="sm">
                      {document.type.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {document.classification?.domain && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Domain:</span>
                      <Badge variant="info" size="sm">
                        {document.classification.domain}
                      </Badge>
                    </div>
                  )}
                  
                  {document.terms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Terms:</span>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-3 h-3 text-purple-500" />
                        <span className="font-medium">{document.terms.length}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="text-gray-900">{formatFileSize(document.size)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded:</span>
                    <span className="text-gray-900">{formatDate(document.uploadedAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">By:</span>
                    <span className="text-gray-900">{document.uploadedBy}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => onViewDocument(document)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    disabled={document.status !== 'completed'}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {sortedDocuments.length === 0 && (
        <Card className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || domainFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Upload your first document to get started with term extraction.'}
          </p>
          <Button variant="primary">
            Upload Document
          </Button>
        </Card>
      )}
    </div>
  );
}