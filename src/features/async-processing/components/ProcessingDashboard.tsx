import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Download, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Database,
  Settings,
  Code,
  Image,
  File,
  ChevronDown,
  Grid,
  List,
  X
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image' | 'json' | 'pptx' | 'xlsx' | 'txt' | 'xml';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused' | 'published';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
  documentType?: string;
  relatedService?: string;
  businessDomain?: string;
}

const mockJobs: ProcessingJob[] = [
  // Financial Services Documents
  {
    id: 'doc_fin_001',
    documentName: 'NAPAS_Payment_Request_Structure_v1.3.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-15T14:30:00Z',
    submittedBy: 'Nguyen Van Minh',
    completedAt: '2025-01-15T14:45:00Z',
    extractedTerms: 47,
    size: 2516582,
    documentType: 'API Specification',
    relatedService: 'Payment Gateway',
    businessDomain: 'Financial Services'
  },
  {
    id: 'doc_fin_002',
    documentName: 'Credit_Risk_Assessment_Model.docx',
    type: 'docx',
    status: 'processing',
    progress: 63,
    submittedAt: '2025-01-15T07:50:00Z',
    submittedBy: 'Sarah Johnson',
    estimatedCompletion: '2025-01-15T08:30:00Z',
    size: 1887437,
    documentType: 'Business Requirements',
    relatedService: 'Risk Management',
    businessDomain: 'Financial Services'
  },
  // Healthcare Documents
  {
    id: 'doc_health_001',
    documentName: 'Patient_Data_Privacy_Policy.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-14T10:15:00Z',
    submittedBy: 'Dr. Emily Chen',
    completedAt: '2025-01-14T10:35:00Z',
    extractedTerms: 55,
    size: 3250586,
    documentType: 'Policy Document',
    relatedService: 'Patient Management',
    businessDomain: 'Healthcare'
  },
  {
    id: 'doc_health_002',
    documentName: 'Medical_Device_Integration_Guide.json',
    type: 'json',
    status: 'failed',
    progress: 0,
    submittedAt: '2025-01-15T08:20:00Z',
    submittedBy: 'Michael Rodriguez',
    error: 'Invalid JSON format - unable to parse schema',
    size: 4718592,
    documentType: 'Technical Specification',
    relatedService: 'Device Integration',
    businessDomain: 'Healthcare'
  },
  // E-commerce Documents
  {
    id: 'doc_ecom_001',
    documentName: 'Product_Catalog_Schema_v2.0.xlsx',
    type: 'xlsx',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-13T09:00:00Z',
    submittedBy: 'Lisa Wang',
    completedAt: '2025-01-13T09:25:00Z',
    extractedTerms: 62,
    size: 2831155,
    documentType: 'Data Schema',
    relatedService: 'Product Management',
    businessDomain: 'E-commerce'
  },
  {
    id: 'doc_ecom_002',
    documentName: 'Customer_Journey_Mapping.pptx',
    type: 'pptx',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-12T16:45:00Z',
    submittedBy: 'David Kim',
    completedAt: '2025-01-12T17:05:00Z',
    extractedTerms: 39,
    size: 1992294,
    documentType: 'Process Flow',
    relatedService: 'Customer Experience',
    businessDomain: 'E-commerce'
  },
  // Manufacturing Documents
  {
    id: 'doc_mfg_001',
    documentName: 'Quality_Control_Procedures.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-11T11:30:00Z',
    submittedBy: 'Robert Chen',
    completedAt: '2025-01-11T11:55:00Z',
    extractedTerms: 53,
    size: 3984588,
    documentType: 'Standard Operating Procedure',
    relatedService: 'Quality Assurance',
    businessDomain: 'Manufacturing'
  },
  {
    id: 'doc_mfg_002',
    documentName: 'Supply_Chain_Optimization.txt',
    type: 'txt',
    status: 'processing',
    progress: 78,
    submittedAt: '2025-01-15T09:40:00Z',
    submittedBy: 'Jennifer Liu',
    estimatedCompletion: '2025-01-15T10:15:00Z',
    size: 1677721,
    documentType: 'Research Report',
    relatedService: 'Supply Chain',
    businessDomain: 'Manufacturing'
  },
  // Technology Documents
  {
    id: 'doc_tech_001',
    documentName: 'API_Documentation_v3.0.xml',
    type: 'xml',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-01-10T06:00:00Z',
    submittedBy: 'Alex Thompson',
    completedAt: '2025-01-10T06:30:00Z',
    extractedTerms: 41,
    size: 3041280,
    documentType: 'API Documentation',
    relatedService: 'Platform Services',
    businessDomain: 'Technology'
  },
  {
    id: 'doc_tech_002',
    documentName: 'System_Architecture_Diagram.png',
    type: 'image',
    status: 'failed',
    progress: 0,
    submittedAt: '2025-01-15T12:30:00Z',
    submittedBy: 'Maria Garcia',
    error: 'Image resolution too low for OCR processing',
    size: 2306867,
    documentType: 'System Diagram',
    relatedService: 'Architecture',
    businessDomain: 'Technology'
  }
];

interface ProcessingDocumentProps {
  onViewResults: (job: ProcessingJob) => void;
  onViewClassification?: (job: ProcessingJob) => void;
  onViewEnrichment?: (job: ProcessingJob) => void;
}

export function ProcessingDocument({ 
  onViewResults, 
  onViewClassification, 
  onViewEnrichment 
}: ProcessingDocumentProps) {
  const [jobs, setJobs] = useState<ProcessingJob[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time updates with proper cleanup
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'processing' && job.progress < 100) {
          const newProgress = Math.min(job.progress + Math.random() * 5, 100);
          if (newProgress >= 100) {
            return {
              ...job,
              status: 'completed',
              progress: 100,
              completedAt: new Date().toISOString(),
              extractedTerms: Math.floor(Math.random() * 30) + 25,
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const services = Array.from(new Set(jobs.map(job => job.relatedService).filter(Boolean)));
  const domains = Array.from(new Set(jobs.map(job => job.businessDomain).filter(Boolean)));
  const documentTypes = Array.from(new Set(jobs.map(job => job.type).filter(Boolean)));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.documentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.relatedService?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.businessDomain?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesService = serviceFilter === 'all' || job.relatedService === serviceFilter;
    const matchesDomain = domainFilter === 'all' || job.businessDomain === domainFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesStatus && matchesService && matchesDomain && matchesType;
  });

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      case 'paused':
        return <Badge variant="warning">Paused</Badge>;
      default:
        return <Badge variant="default">Queued</Badge>;
    }
  };

  const getFileIcon = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'json':
        return <Code className="w-4 h-4 text-green-600" />;
      case 'xml':
        return <Code className="w-4 h-4 text-orange-600" />;
      case 'pptx':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'xlsx':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-purple-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDomainColor = (domain?: string) => {
    const colors: Record<string, string> = {
      'Financial Services': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'E-commerce': 'bg-purple-100 text-purple-800',
      'Manufacturing': 'bg-orange-100 text-orange-800',
      'Technology': 'bg-gray-100 text-gray-800'
    };
    return colors[domain || ''] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleRetry = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'queued', progress: 0, error: undefined }
        : job
    ));
  };

  const handlePauseResume = (jobId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        if (job.status === 'processing') {
          return { ...job, status: 'paused' };
        } else if (job.status === 'paused') {
          return { ...job, status: 'processing' };
        }
      }
      return job;
    }));
  };

  const getStats = () => {
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'completed').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      queued: jobs.filter(j => j.status === 'queued').length,
    };
  };

  const stats = getStats();

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredJobs.map(job => (
        <Card key={job.id} hover className="relative">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getFileIcon(job.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate" title={job.documentName}>
                    {job.documentName}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1">
                    {job.type.toUpperCase()} • {formatFileSize(job.size)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" icon={MoreHorizontal} />
            </div>

            {/* Status & Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                {getStatusBadge(job.status)}
                {job.extractedTerms && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Database className="w-3 h-3" />
                    <span>{job.extractedTerms}</span>
                  </div>
                )}
              </div>
              
              {(job.status === 'processing' || job.status === 'paused') && (
                <ProgressBar 
                  value={job.progress} 
                  color={job.status === 'paused' ? 'amber' : 'blue'}
                  showLabel
                  className="mb-2"
                />
              )}
              
              {job.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                  {job.error}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4">
              {job.documentType && (
                <div className="text-xs">
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-1 font-medium">{job.documentType}</span>
                </div>
              )}
              {job.businessDomain && (
                <div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(job.businessDomain)}`}>
                    {job.businessDomain}
                  </span>
                </div>
              )}
              {job.relatedService && (
                <div className="text-xs">
                  <span className="text-gray-500">Service:</span>
                  <span className="ml-1">{job.relatedService}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <div>{job.submittedBy}</div>
                <div>{formatDate(job.submittedAt)}</div>
              </div>
              
              <div className="flex items-center space-x-1">
                {job.status === 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => onViewResults(job)}
                  />
                )}
                {job.status === 'failed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => handleRetry(job.id)}
                  />
                )}
                {(job.status === 'processing' || job.status === 'paused') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={job.status === 'processing' ? Pause : Play}
                    onClick={() => handlePauseResume(job.id)}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-medium text-gray-900">Document</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900 hidden md:table-cell">Type & Domain</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900 hidden lg:table-cell">Progress</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900 hidden sm:table-cell">Terms</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900 hidden xl:table-cell">Submitted</th>
              <th className="text-left py-4 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {getFileIcon(job.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => onViewResults(job)}
                        className="font-medium text-gray-900 hover:text-blue-600 text-left truncate block w-full"
                        title={job.documentName}
                      >
                        {job.documentName}
                      </button>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{job.type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatFileSize(job.size)}</span>
                      </div>
                      {/* Mobile-only metadata */}
                      <div className="md:hidden mt-1 space-y-1">
                        {job.businessDomain && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(job.businessDomain)}`}>
                            {job.businessDomain}
                          </span>
                        )}
                        <div className="text-xs text-gray-500">
                          {job.submittedBy} • {formatDate(job.submittedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="py-4 px-4 hidden md:table-cell">
                  <div className="space-y-1">
                    {job.documentType && (
                      <div className="text-sm font-medium text-gray-900">{job.documentType}</div>
                    )}
                    {job.businessDomain && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(job.businessDomain)}`}>
                        {job.businessDomain}
                      </span>
                    )}
                    {job.relatedService && (
                      <div className="text-xs text-gray-500">{job.relatedService}</div>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status)}
                    {getStatusBadge(job.status)}
                  </div>
                  {job.error && (
                    <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={job.error}>
                      {job.error}
                    </div>
                  )}
                  {/* Mobile progress */}
                  {(job.status === 'processing' || job.status === 'paused') && (
                    <div className="lg:hidden mt-2 w-24">
                      <ProgressBar 
                        value={job.progress} 
                        color={job.status === 'paused' ? 'amber' : 'blue'}
                        showLabel
                      />
                    </div>
                  )}
                </td>
                
                <td className="py-4 px-4 hidden lg:table-cell">
                  {job.status === 'processing' || job.status === 'paused' ? (
                    <div className="w-32">
                      <ProgressBar 
                        value={job.progress} 
                        color={job.status === 'paused' ? 'amber' : 'blue'}
                        showLabel
                      />
                      {job.estimatedCompletion && (
                        <div className="text-xs text-gray-500 mt-1">
                          ETA: {formatDate(job.estimatedCompletion)}
                        </div>
                      )}
                    </div>
                  ) : job.status === 'completed' ? (
                    <div className="text-sm text-emerald-600 font-medium">100%</div>
                  ) : (
                    <div className="text-sm text-gray-400">-</div>
                  )}
                </td>

                <td className="py-4 px-4 hidden sm:table-cell">
                  {job.extractedTerms ? (
                    <div className="flex items-center space-x-1">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{job.extractedTerms}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                
                <td className="py-4 px-4 hidden xl:table-cell">
                  <div className="text-sm text-gray-900">{formatDate(job.submittedAt)}</div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{job.submittedBy}</span>
                  </div>
                </td>
                
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-1">
                    {job.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => onViewResults(job)}
                      />
                    )}
                    
                    {job.status === 'failed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={RotateCcw}
                        onClick={() => handleRetry(job.id)}
                      />
                    )}
                    
                    {(job.status === 'processing' || job.status === 'paused') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={job.status === 'processing' ? Pause : Play}
                        onClick={() => handlePauseResume(job.id)}
                      />
                    )}
                    
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
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Document Processing</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            Monitor document processing across all business domains and extract business terms
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <Card padding="sm" className="text-center">
            <div className="text-xl lg:text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs lg:text-sm text-gray-600">Total</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-xl lg:text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-xs lg:text-sm text-gray-600">Completed</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-xl lg:text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-xs lg:text-sm text-gray-600">Processing</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-xl lg:text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs lg:text-sm text-gray-600">Failed</div>
          </Card>
          <Card padding="sm" className="text-center col-span-2 lg:col-span-1">
            <div className="text-xl lg:text-2xl font-bold text-gray-600">{stats.queued}</div>
            <div className="text-xs lg:text-sm text-gray-600">Queued</div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents, users, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base lg:text-lg"
                />
              </div>
              
              {/* Controls Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Filter}
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-shrink-0"
                  >
                    Filters
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={RefreshCw}
                    onClick={handleRefresh}
                    loading={isRefreshing}
                    className="flex-shrink-0"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <span className="text-sm text-gray-600">
                    {filteredJobs.length} of {jobs.length} documents
                  </span>
                  
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
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="queued">Queued</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="paused">Paused</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                    >
                      <option value="all">All Types</option>
                      {documentTypes.map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
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
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                    >
                      <option value="all">All Services</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setDomainFilter('all');
                      setServiceFilter('all');
                      setSearchQuery('');
                    }}
                    className="w-full"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Content */}
        {viewMode === 'grid' ? renderGridView() : renderListView()}
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || domainFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Upload documents from any business domain to start processing'}
            </p>
            <Button variant="primary">
              Upload Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}