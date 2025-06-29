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
  File
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image' | 'json' | 'pptx';
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
  {
    id: 'doc_napas_001',
    documentName: 'NAPAS_Payment_Request_Structure_v1.3.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-28T14:30:00Z',
    submittedBy: 'Nguyen Van Minh',
    completedAt: '2025-06-28T14:45:00Z',
    extractedTerms: 47,
    size: 2516582, // 2.4 MB
    documentType: 'Message Spec',
    relatedService: 'DPG',
    businessDomain: 'ACH'
  },
  {
    id: 'doc_napas_002',
    documentName: 'ACH_Reconciliation_Flow_InternalPortal.docx',
    type: 'docx',
    status: 'processing',
    progress: 63,
    submittedAt: '2025-06-29T07:50:00Z',
    submittedBy: 'Trinh Khanh Linh',
    estimatedCompletion: '2025-06-29T08:30:00Z',
    size: 1887437, // 1.8 MB
    documentType: 'Process Flow',
    relatedService: 'Internal Portal',
    businessDomain: 'Reconciliation'
  },
  {
    id: 'doc_napas_003',
    documentName: 'Napas_ACH_API_Reference_v2.0.json',
    type: 'json',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-28T10:15:00Z',
    submittedBy: 'Pham Thi Huyen',
    completedAt: '2025-06-28T10:35:00Z',
    extractedTerms: 55,
    size: 3250586, // 3.1 MB
    documentType: 'API Contract',
    relatedService: 'Transaction Payment',
    businessDomain: 'Bank Transfer'
  },
  {
    id: 'doc_napas_004',
    documentName: 'ACH_Clearing_Diagram_v1.1.png',
    type: 'image',
    status: 'failed',
    progress: 0,
    submittedAt: '2025-06-29T08:20:00Z',
    submittedBy: 'Linh Tran',
    error: 'OCR processing failed - image quality too low',
    size: 4718592, // 4.5 MB
    documentType: 'Sequence Diagram',
    relatedService: 'Core Banking',
    businessDomain: 'Clearing'
  },
  {
    id: 'doc_napas_005',
    documentName: 'ACH_Full_Lifecycle_v3.0.pptx',
    type: 'pptx',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-27T09:00:00Z',
    submittedBy: 'Le Thanh Tung',
    completedAt: '2025-06-27T09:25:00Z',
    extractedTerms: 62,
    size: 2831155, // 2.7 MB
    documentType: 'Integration Guide',
    relatedService: 'DPG',
    businessDomain: 'ACH'
  },
  {
    id: 'doc_napas_006',
    documentName: 'InternalPortal_ACH_Dashboard_Specs.docx',
    type: 'docx',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-26T16:45:00Z',
    submittedBy: 'Pham Huu Hieu',
    completedAt: '2025-06-26T17:05:00Z',
    extractedTerms: 39,
    size: 1992294, // 1.9 MB
    documentType: 'Message Spec',
    relatedService: 'Internal Portal',
    businessDomain: 'Bank Transfer'
  },
  {
    id: 'doc_napas_007',
    documentName: 'Napas_XML_Message_Format_v3.4.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-25T11:30:00Z',
    submittedBy: 'Bui Thi Lan',
    completedAt: '2025-06-25T11:55:00Z',
    extractedTerms: 53,
    size: 3984588, // 3.8 MB
    documentType: 'Message Spec',
    relatedService: 'Napas Gateway',
    businessDomain: 'ACH'
  },
  {
    id: 'doc_napas_008',
    documentName: 'Transaction_Limit_Policy_v2.2.docx',
    type: 'docx',
    status: 'processing',
    progress: 78,
    submittedAt: '2025-06-29T09:40:00Z',
    submittedBy: 'Nguyen Huy Hoang',
    estimatedCompletion: '2025-06-29T10:15:00Z',
    size: 1677721, // 1.6 MB
    documentType: 'Integration Guide',
    relatedService: 'Transaction Payment',
    businessDomain: 'ACH'
  },
  {
    id: 'doc_napas_009',
    documentName: 'ACH_Settlement_Procedure_2025.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2025-06-28T06:00:00Z',
    submittedBy: 'Hoang Anh Dung',
    completedAt: '2025-06-28T06:30:00Z',
    extractedTerms: 41,
    size: 3041280, // 2.9 MB
    documentType: 'Process Flow',
    relatedService: 'Core Banking',
    businessDomain: 'Clearing'
  },
  {
    id: 'doc_napas_010',
    documentName: 'ACH_Error_Handling_Guide_v1.0.docx',
    type: 'docx',
    status: 'failed',
    progress: 0,
    submittedAt: '2025-06-29T12:30:00Z',
    submittedBy: 'Nguyen Thi My Linh',
    error: 'Document format corrupted - unable to extract text',
    size: 2306867, // 2.2 MB
    documentType: 'Integration Guide',
    relatedService: 'DPG',
    businessDomain: 'ACH'
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
  const [isRefreshing, setIsRefreshing] = useState(false);
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

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const services = Array.from(new Set(jobs.map(job => job.relatedService).filter(Boolean)));
  const domains = Array.from(new Set(jobs.map(job => job.businessDomain).filter(Boolean)));

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.documentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.relatedService?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.businessDomain?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesService = serviceFilter === 'all' || job.relatedService === serviceFilter;
    const matchesDomain = domainFilter === 'all' || job.businessDomain === domainFilter;
    return matchesSearch && matchesStatus && matchesService && matchesDomain;
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
      case 'pptx':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'image':
        return <Image className="w-4 h-4 text-purple-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (docType?: string) => {
    if (!docType) return null;
    
    const variants: Record<string, 'info' | 'success' | 'warning' | 'error' | 'default'> = {
      'Message Spec': 'info',
      'Process Flow': 'success',
      'API Contract': 'warning',
      'Integration Guide': 'default',
      'Sequence Diagram': 'error'
    };
    
    return <Badge variant={variants[docType] || 'default'} size="sm">{docType}</Badge>;
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
    // Simulate API call
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NAPAS ACH Document Processing</h1>
          <p className="text-gray-600">
            Monitor NAPAS ACH integration document processing and term extraction
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.queued}</div>
            <div className="text-sm text-gray-600">Queued</div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documents, users, services, or domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              
              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="queued">Queued</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Services</option>
                      {services.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={domainFilter}
                      onChange={(e) => setDomainFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Domains</option>
                      {domains.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleRefresh}
                  loading={isRefreshing}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Document</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Type & Service</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Progress</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Terms</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Submitted</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getFileIcon(job.type)}
                        </div>
                        <div>
                          <button
                            onClick={() => onViewResults(job)}
                            className="font-medium text-gray-900 hover:text-blue-600 text-left"
                          >
                            {job.documentName}
                          </button>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{job.type.toUpperCase()}</span>
                            <span>•</span>
                            <span>{formatFileSize(job.size)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {getDocumentTypeBadge(job.documentType)}
                        <div className="text-sm text-gray-600">
                          <div>{job.relatedService}</div>
                          <div className="text-xs text-gray-500">{job.businessDomain}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        {getStatusBadge(job.status)}
                      </div>
                      {job.error && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={job.error}>
                          {job.error}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
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

                    <td className="py-4 px-6">
                      {job.extractedTerms ? (
                        <div className="flex items-center space-x-1">
                          <Database className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">{job.extractedTerms}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{formatDate(job.submittedAt)}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{job.submittedBy}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        {job.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => onViewResults(job)}
                          />
                        )}

                        {job.status === 'processing' && onViewClassification && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Brain}
                            onClick={() => onViewClassification(job)}
                          />
                        )}

                        {job.status === 'processing' && onViewEnrichment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Database}
                            onClick={() => onViewEnrichment(job)}
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
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || domainFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Upload NAPAS ACH documents to start processing'
                }
              </p>
              <Button variant="primary">
                Upload Document
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}