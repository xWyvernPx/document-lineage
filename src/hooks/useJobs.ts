import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { apiService } from '../lib/apiService';
import { ProcessingJob, ApiJobResponse } from '../lib/types';

// Helper function to convert API response to UI format
function convertApiJobToProcessingJob(apiJob: ApiJobResponse): ProcessingJob {
  // Extract filename from originalName or key
  const documentName = apiJob.originalName 
    ? apiJob.originalName.split('/').pop() || apiJob.originalName
    : apiJob.key.split('/').pop() || apiJob.key;
  
  // Determine file type from filename
  const getFileType = (filename: string): 'pdf' | 'docx' | 'image' => {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx' || ext === 'doc') return 'docx';
    return 'image'; // fallback
  };

  // Map API status to UI status
  const mapStatus = (apiStatus: string): ProcessingJob['status'] => {
    switch (apiStatus) {
      case 'PROCESSING':
        return 'processing';
      case 'CLASSIFIED':
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'failed';
      case 'QUEUED':
        return 'queued';
      default:
        return 'queued';
    }
  };

  // Map status to current stage
  const mapCurrentStage = (apiStatus: string): ProcessingJob['currentStage'] => {
    switch (apiStatus) {
      case 'PROCESSING':
        return 'classification';
      case 'CLASSIFIED':
      case 'COMPLETED':
        return 'completed';
      case 'FAILED':
        return 'upload';
      case 'QUEUED':
        return 'upload';
      default:
        return 'upload';
    }
  };

  // Calculate progress based on status
  const getProgress = (status: string): number => {
    switch (status) {
      case 'QUEUED':
        return 0;
      case 'PROCESSING':
        return 50; // Assume 50% for processing
      case 'CLASSIFIED':
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return 0;
      default:
        return 0;
    }
  };

  // Estimate file size (since it's not provided by API)
  const estimateFileSize = (_filename: string): number => {
    // Return a random size between 1-10 MB for demo purposes
    // In real implementation, this would come from the API
    return Math.floor(Math.random() * 9000000) + 1000000;
  };

  const status = mapStatus(apiJob.status);
  const progress = getProgress(apiJob.status);

  return {
    id: apiJob.jobId,
    documentName,
    type: getFileType(documentName),
    status,
    progress,
    submittedAt: apiJob.createdAt,
    submittedBy: 'System', // API doesn't provide this, using placeholder
    completedAt: apiJob.completedAt,
    extractedTerms: status === 'completed' ? Math.floor(Math.random() * 50) + 10 : undefined,
    size: estimateFileSize(documentName),
    currentStage: mapCurrentStage(apiJob.status),
    textractJobId: apiJob.textractJobId,
    documentId: apiJob.documentId,
    bucket: apiJob.bucket,
    key: apiJob.key,
  };
}

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.lists(),
    queryFn: async (): Promise<ProcessingJob[]> => {
      const response = await apiService.getJobs();
      return response.items.map(convertApiJobToProcessingJob);
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 1000, // Consider data stale after 1 second
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: async (): Promise<ProcessingJob | null> => {
      const response = await apiService.getJobs();
      const job = response.items.find(item => item.jobId === id);
      return job ? convertApiJobToProcessingJob(job) : null;
    },
    enabled: !!id,
  });
}
