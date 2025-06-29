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
  Settings
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { napasDocuments, getDocumentStats } from '../../../data/napas-documents';

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
  currentStage?: 'upload' | 'classification' | 'enrichment' | 'review' | 'completed';
  service?: string;
  domain?: string;
  documentType?: string;
}

// Convert NAPAS documents to processing jobs
const convertNapasToJobs = (): ProcessingJob[] => {
  return napasDocuments.map(doc => ({
    id: doc.id,
    documentName: doc.name,
    type: doc.name.endsWith('.pdf') ? 'pdf' : 'docx',
    status: doc.status === 'completed' ? 'completed' : 
           doc.status === 'processing' ? 'processing' : 'failed',
    progress: doc.status === 'completed' ? 100 : 
             doc.status === 'processing' ? Math.floor(Math.random() * 80) + 10 : 0,
    submittedAt: doc.uploadedAt,
    submittedBy: doc.uploadedBy,
    completedAt: doc.status === 'completed' ? doc.uploadedAt : undefined,
    extractedTerms: doc.extractedTerms.length,
    size: doc.size,
    currentStage: doc.status === 'completed' ? 'completed' : 
                 doc.status === 'processing' ? 'enrichment' : 'upload',
    service: doc.service,
    domain: doc.classification.domain,
    documentType: doc.type
  }));
};

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
  const [jobs, setJobs] = useState<ProcessingJob[]>(convertNapasToJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get unique services and types for filters
  const services = Array.from(new Set(jobs.map(job => job.service).filter(Boolean)));
  const documentTypes = Array.from(new Set(jobs.map(job => job.documentType).filter(Boolean)));

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
              extractedTerms: Math.floor(Math.random() * 50) + 10,
              currentStage: 'completed',
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (job.service && job.service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesService = serviceFilter === 'all' || job.service === serviceFilter;
    const matchesType = typeFilter === 'all' || job.documentType === typeFilter;
    return matchesSearch && matchesStatus && matchesService && matchesType;
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

  const getStageIcon = (stage?: ProcessingJob['currentStage']) => {
    switch (stage) {
      case 'classification':
        return <Brain className="w-4 h-4 text-blue-500" />;
      case 'enrichment':
        return <Database className="w-4 h-4 text-purple-500" />;
      case 'review':
        return <Eye className="w-4 h-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStageBadge = (stage?: ProcessingJob['currentStage']) => {
    switch (stage) {
      case 'classification':
        return <Badge variant="info">Classification</Badge>;
      case 'enrichment':
        return <Badge variant="warning">Enrichment</Badge>;
      case 'review':
        return <Badge variant="default">Review</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="default">Upload</Badge>;
    }
  };

  const getServiceBadge = (service?: string) => {
    if (!service) return null;
    
    const serviceColors: Record<string, string> = {
      'DPG': 'bg-blue-100 text-blue-800',
      'Transaction Payment': 'bg-emerald-100 text-emerald-800',
      'Internal Portal': 'bg-purple-100 text-purple-800',
      'Core Banking': 'bg-amber-100 text-amber-800',
      'Napas Gateway': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${serviceColors[service] || 'bg-gray-100 text-gray-800'}`}>
        {service}
      </span>
    );
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
        ? { ...job, status: 'queued', progress: 0, error: undefined, currentStage: 'upload' }
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
    const stats = getDocumentStats();
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'completed').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      queued: jobs.filter(j => j.status === 'queued').length,
      totalTerms: jobs.reduce((sum, job) => sum + (job.extractedTerms || 0), 0),
      serviceStats: stats.serviceBreakdown,
      typeStats: stats.typeBreakdown
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
            Monitor ACH integration document processing and term extraction across all NAPAS services
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalTerms}</div>
            <div className="text-sm text-gray-600">Terms Extracted</div>
          </Card>
        </div>

        {/* Service Breakdown */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">NAPAS Service Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.serviceStats).map(([service, count]) => (
                <div key={service} className="text-center">
                  <div className="text-xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{service}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Controls */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents, services, or users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
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

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Types</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
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
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Service</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Stage</th>
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
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <button
                            onClick={() => onViewResults(job)}
                            className="font-medium text-gray-900 hover:text-blue-600 text-left"
                          >
                            {job.documentName}
                          </button>
                          <div className="text-sm text-gray-500">
                            {job.type.toUpperCase()} • {formatFileSize(job.size)}
                          </div>
                          {job.domain && (
                            <div className="text-xs text-gray-400 mt-1">{job.domain}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {getServiceBadge(job.service)}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        {getStatusBadge(job.status)}
                      </div>
                      {job.error && (
                        <div className="text-xs text-red-600 mt-1">{job.error}</div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStageIcon(job.currentStage)}
                        {getStageBadge(job.currentStage)}
                      </div>
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
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => onViewResults(job)}
                          >
                            View
                          </Button>
                        )}

                        {job.currentStage === 'classification' && onViewClassification && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Brain}
                            onClick={() => onViewClassification(job)}
                          >
                            Classify
                          </Button>
                        )}

                        {job.currentStage === 'enrichment' && onViewEnrichment && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Database}
                            onClick={() => onViewEnrichment(job)}
                          >
                            Enrich
                          </Button>
                        )}
                        
                        {job.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={RotateCcw}
                            onClick={() => handleRetry(job.id)}
                          >
                            Retry
                          </Button>
                        )}
                        
                        {(job.status === 'processing' || job.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={job.status === 'processing' ? Pause : Play}
                            onClick={() => handlePauseResume(job.id)}
                          >
                            {job.status === 'processing' ? 'Pause' : 'Resume'}
                          </Button>
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
                {searchQuery || statusFilter !== 'all' || serviceFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Upload documents to start processing'
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