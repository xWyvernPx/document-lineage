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
}

const mockJobs: ProcessingJob[] = [
  {
    id: '1',
    documentName: 'Credit Policy v3.2.pdf',
    type: 'pdf',
    status: 'completed',
    progress: 100,
    submittedAt: '2024-01-16T10:30:00Z',
    submittedBy: 'Sarah Johnson',
    completedAt: '2024-01-16T10:45:00Z',
    extractedTerms: 47,
    size: 2457600,
    currentStage: 'completed',
  },
  {
    id: '2',
    documentName: 'Business Requirements v1.5.docx',
    type: 'docx',
    status: 'processing',
    progress: 65,
    submittedAt: '2024-01-16T11:15:00Z',
    submittedBy: 'Michael Chen',
    estimatedCompletion: '2024-01-16T11:35:00Z',
    size: 1048576,
    currentStage: 'enrichment',
  },
  {
    id: '3',
    documentName: 'Compliance Framework.pdf',
    type: 'pdf',
    status: 'failed',
    progress: 0,
    submittedAt: '2024-01-16T09:45:00Z',
    submittedBy: 'Emily Rodriguez',
    error: 'Document format not supported',
    size: 3145728,
    currentStage: 'upload',
  },
  {
    id: '4',
    documentName: 'Risk Assessment Model.pdf',
    type: 'pdf',
    status: 'processing',
    progress: 35,
    submittedAt: '2024-01-16T11:30:00Z',
    submittedBy: 'David Kim',
    size: 1876543,
    currentStage: 'classification',
  },
  {
    id: '5',
    documentName: 'Customer Onboarding Process.docx',
    type: 'docx',
    status: 'paused',
    progress: 25,
    submittedAt: '2024-01-16T10:00:00Z',
    submittedBy: 'Lisa Wang',
    size: 987654,
    currentStage: 'classification',
  },
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time updates with proper cleanup
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'processing' && job.progress < 100) {
          const newProgress = Math.min(job.progress + Math.random() * 10, 100);
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
    }, 2000);

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
                         job.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Processing</h1>
          <p className="text-gray-600">
            Monitor document processing jobs and view extraction results
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents or users..."
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
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Stage</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Progress</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Submitted</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Results</th>
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
                          <div className="font-medium text-gray-900">{job.documentName}</div>
                          <div className="text-sm text-gray-500">
                            {job.type.toUpperCase()} • {formatFileSize(job.size)}
                          </div>
                        </div>
                      </div>
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
                      <div className="text-sm text-gray-900">{formatDate(job.submittedAt)}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{job.submittedBy}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {job.status === 'completed' && job.extractedTerms ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{job.extractedTerms} terms</div>
                          <div className="text-xs text-gray-500">extracted</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
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
                {searchQuery || statusFilter !== 'all' 
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