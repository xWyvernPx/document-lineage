import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  Database,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { ProgressBar } from '../../../components/ProgressBar';
import { allNapasDocuments, DocumentMetadata } from '../../../data/napas-documents';

interface APIJob {
  textractJobId: string;
  completedAt?: string;
  documentId: string;
  updatedAt: string;
  status: string;
  textractFeatures: string[];
  timestamp: string;
  createdAt: string;
  jobId: string;
  bucket: string;
  key: string;
}

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

// API endpoint for jobs
const API_ENDPOINT = 'https://dru6kanhq2.execute-api.ap-southeast-1.amazonaws.com/dev/jobs';

// Function to map API jobs to ProcessingJob format
const mapApiJobsToProcessingJobs = (apiJobs: APIJob[]): ProcessingJob[] => {
  return apiJobs.map(job => {
    // Extract file name from the key
    const keyParts = job.key.split('/');
    const fileName = keyParts[keyParts.length - 1];
    // Remove UUID (format: 8-4-4-4-12 hex digits) and the dash right after it
const cleanFileName = fileName.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, '');

    
    // Determine file type from key
    const fileType = fileName.toLowerCase().includes('.pdf') ? 'pdf' : 
                    fileName.toLowerCase().includes('.docx') ? 'docx' : 'image';

    
    // Map API status to ProcessingJob status
    let status: ProcessingJob['status'] = 'completed';
    let progress = 100;
    let currentStage: ProcessingJob['currentStage'] = 'completed';
    
    switch(job.status) {
      case 'CLASSIFIED':
        status = 'completed';
        currentStage = 'completed';
        break;
      case 'PROCESSING':
        status = 'processing';
        progress = 70;
        currentStage = 'enrichment';
        break;
      case 'FAILED':
        status = 'failed';
        progress = 0;
        break;
      default:
        status = 'processing';
        progress = 50;
        currentStage = 'classification';
    }

    return {
      id: job.documentId,
      documentName: cleanFileName,
      type: fileType,
      status,
      progress,
      submittedAt: job.createdAt,
      submittedBy: 'System User', // This might need to be sourced from elsewhere
      completedAt: job.completedAt,
      estimatedCompletion: job.status === 'PROCESSING' ? 
        new Date(Date.now() + 1800000).toISOString() : undefined,
      extractedTerms: status === 'completed' ? Math.floor(Math.random() * 50) + 10 : undefined,
      error: status === 'failed' ? 'Document processing failed' : undefined,
      size: Math.floor(Math.random() * 5000000) + 500000, // Random size between 500KB and 5MB
      currentStage,
    };
  });
};

// Convert NAPAS documents to ProcessingJob format
const convertNapasDocumentsToJobs = (documents: DocumentMetadata[]): ProcessingJob[] => {
  return documents.map((doc, index) => {
    // Determine status based on document status
    let status: ProcessingJob['status'] = 'completed';
    let progress = 100;
    let currentStage: ProcessingJob['currentStage'] = 'completed';
    let extractedTerms = doc.extractedTerms?.length || 0;
    let completedAt = doc.uploadedAt;
    let estimatedCompletion: string | undefined;
    let error: string | undefined;

    // Simulate some documents in different states for variety
    if (index % 7 === 0) {
      status = 'processing';
      progress = Math.floor(Math.random() * 80) + 20;
      currentStage = ['classification', 'enrichment'][Math.floor(Math.random() * 2)] as ProcessingJob['currentStage'];
      estimatedCompletion = new Date(Date.now() + Math.random() * 3600000).toISOString();
    } else if (index % 11 === 0) {
      status = 'failed';
      progress = 0;
      currentStage = 'upload';
      error = 'Document processing failed - retry required';
    } else if (index % 13 === 0) {
      status = 'paused';
      progress = Math.floor(Math.random() * 50) + 10;
      currentStage = 'classification';
    } else if (index % 17 === 0) {
      status = 'queued';
      progress = 0;
      currentStage = 'upload';
    }

    // Determine file type from document name
    const fileType = doc.name.toLowerCase().includes('.pdf') ? 'pdf' : 
                    doc.name.toLowerCase().includes('.docx') ? 'docx' : 'pdf';

    return {
      id: doc.id,
      documentName: doc.name,
      type: fileType,
      status,
      progress,
      submittedAt: doc.uploadedAt,
      submittedBy: doc.uploadedBy,
      completedAt: status === 'completed' ? completedAt : undefined,
      estimatedCompletion,
      extractedTerms: status === 'completed' ? extractedTerms : undefined,
      error,
      size: doc.size,
      currentStage,
    };
  });
};

const napasJobs: ProcessingJob[] = convertNapasDocumentsToJobs(allNapasDocuments);

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
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const processedJobs = mapApiJobsToProcessingJobs(data.items);
      setJobs(processedJobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
      // Fallback to mock data if API fails
      if (jobs.length === 0) {
        setJobs(napasJobs);
      }
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
    
    // Clean up interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Simulate real-time updates for processing jobs
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setJobs(prev => prev.map(job => {
        if (job.status === 'processing' && job.progress < 100) {
          // Slower increment to make progress take at least 2 minutes to complete
          // 2 minutes = 120 seconds, interval is 2 seconds, so we need ~60 increments
          // Maximum increment of ~1.67% per update to ensure at least 2 minutes
          const newProgress = Math.min(job.progress + Math.random() * 1.5, 100);
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
    await fetchJobs();
  };

  const getStats = () => {
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'completed').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      failed: jobs.filter(j => j.status === 'failed').length
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
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
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
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading jobs...</h3>
              <p className="text-gray-500">Please wait while we fetch the job data.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading jobs</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button variant="primary" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Document</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Progress</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900">Submitted</th>
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
                          <div className="flex items-center space-x-2">
                            {job.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Eye}
                                onClick={() => onViewClassification?.(job)}
                              >
                                View
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
            </>
          )}
        </Card>
      </div>
    </div>
  );
}