import { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Play,
  Pause,
  RotateCcw,
  Brain,
  Database
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { useJobs } from '../../../hooks/useJobs';
import { ProcessingJob } from '../../../lib/types';

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
  const { data: jobs = [], isLoading, error, refetch } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Note: These functions would need to be implemented with actual API calls
  const handleRetry = async (jobId: string) => {
    console.log('Retry job:', jobId);
    // TODO: Implement retry API call
  };

  const handlePauseResume = async (jobId: string) => {
    console.log('Pause/Resume job:', jobId);
    // TODO: Implement pause/resume API call
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
                  loading={isRefreshing || isLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Jobs Table */}
        <Card>
          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">
                    Failed to load jobs: {error instanceof Error ? error.message : 'Unknown error'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          )}

          {!isLoading && !error && (
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
          )}
          
          {!isLoading && !error && filteredJobs.length === 0 && (
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