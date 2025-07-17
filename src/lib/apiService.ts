import { apiClient, isMockMode } from './apiClient';
import { 
  ApiResponse, 
  DocumentDetails, 
  DocumentUploadRequest, 
  DocumentProcessingJob,
  ExtractedTerm,
  TermEnrichmentRequest,
  DocumentClassification,
  SchemaConnection,
  SchemaTable,
  JobsApiResponse,
  DocumentFilters,
  TermFilters,
  PaginatedRequest,
  LineageGraph
} from './types';
import { mockApiService } from './mockApi';

/**
 * Main API service class that handles all API communication
 * Automatically switches between mock and real API based on current mode
 */
export class ApiService {
  // Document-related API methods
  async uploadDocument(request: DocumentUploadRequest): Promise<ApiResponse<DocumentDetails>> {
    if (isMockMode()) {
      return mockApiService.uploadDocument(request);
    }
    
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }
    
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async getDocuments(filters?: DocumentFilters, pagination?: PaginatedRequest): Promise<ApiResponse<DocumentDetails[]>> {
    if (isMockMode()) {
      return mockApiService.getDocuments(filters, pagination);
    }
    
    const params = {
      ...pagination,
      ...filters,
    };
    
    const response = await apiClient.get('/documents', { params });
    return response.data;
  }

  async getDocument(id: string): Promise<ApiResponse<DocumentDetails>> {
    if (isMockMode()) {
      return mockApiService.getDocument(id);
    }
    
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    if (isMockMode()) {
      return mockApiService.deleteDocument(id);
    }
    
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  }

  // Processing job methods
  async getProcessingJobs(): Promise<ApiResponse<DocumentProcessingJob[]>> {
    if (isMockMode()) {
      return mockApiService.getProcessingJobs();
    }
    
    const response = await apiClient.get('/processing/jobs');
    return response.data;
  }

  // Real API Jobs endpoint
  async getJobs(): Promise<JobsApiResponse> {
    if (isMockMode()) {
      // Return mock data in the same format as real API
      const mockJobs = await mockApiService.getProcessingJobs();
      return {
        items: mockJobs.data.map(job => ({
          textractJobId: job.id,
          documentId: job.documentId,
          updatedAt: job.submittedAt,
          status: job.status.toUpperCase() as 'PROCESSING' | 'CLASSIFIED' | 'FAILED' | 'QUEUED' | 'COMPLETED',
          timestamp: job.submittedAt,
          createdAt: job.submittedAt,
          jobId: job.id,
          bucket: 'mock-bucket',
          key: `uploads/${job.documentName}`,
          completedAt: job.completedAt,
          originalName: `uploads/${job.documentName}`,
        }))
      };
    }
    
    // Use the specific jobs API endpoint (different from the main API)
    const response = await fetch('https://dlast203z6.execute-api.ap-southeast-1.amazonaws.com/dev/jobs', {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async getProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    if (isMockMode()) {
      return mockApiService.getProcessingJob(id);
    }
    
    const response = await apiClient.get(`/processing/jobs/${id}`);
    return response.data;
  }

  async pauseProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    if (isMockMode()) {
      return mockApiService.pauseProcessingJob(id);
    }
    
    const response = await apiClient.post(`/processing/jobs/${id}/pause`);
    return response.data;
  }

  async resumeProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    if (isMockMode()) {
      return mockApiService.resumeProcessingJob(id);
    }
    
    const response = await apiClient.post(`/processing/jobs/${id}/resume`);
    return response.data;
  }

  async cancelProcessingJob(id: string): Promise<ApiResponse<void>> {
    if (isMockMode()) {
      return mockApiService.cancelProcessingJob(id);
    }
    
    const response = await apiClient.post(`/processing/jobs/${id}/cancel`);
    return response.data;
  }

  // Terms-related API methods
  async getTerms(filters?: TermFilters, pagination?: PaginatedRequest): Promise<ApiResponse<ExtractedTerm[]>> {
    if (isMockMode()) {
      return mockApiService.getTerms(filters, pagination);
    }
    
    const params = {
      ...pagination,
      ...filters,
    };
    
    const response = await apiClient.get('/terms', { params });
    return response.data;
  }

  async getTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    if (isMockMode()) {
      return mockApiService.getTerm(id);
    }
    
    const response = await apiClient.get(`/terms/${id}`);
    return response.data;
  }

  async updateTerm(id: string, request: TermEnrichmentRequest): Promise<ApiResponse<ExtractedTerm>> {
    if (isMockMode()) {
      return mockApiService.updateTerm(id, request);
    }
    
    const response = await apiClient.put(`/terms/${id}`, request);
    return response.data;
  }

  async approveTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    if (isMockMode()) {
      return mockApiService.approveTerm(id);
    }
    
    const response = await apiClient.post(`/terms/${id}/approve`);
    return response.data;
  }

  async rejectTerm(id: string, reason?: string): Promise<ApiResponse<ExtractedTerm>> {
    if (isMockMode()) {
      return mockApiService.rejectTerm(id, reason);
    }
    
    const response = await apiClient.post(`/terms/${id}/reject`, { reason });
    return response.data;
  }

  async publishTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    if (isMockMode()) {
      return mockApiService.publishTerm(id);
    }
    
    const response = await apiClient.post(`/terms/${id}/publish`);
    return response.data;
  }

  // Classification methods
  async getDocumentClassification(documentId: string): Promise<ApiResponse<DocumentClassification>> {
    if (isMockMode()) {
      return mockApiService.getDocumentClassification(documentId);
    }
    
    const response = await apiClient.get(`/documents/${documentId}/classification`);
    return response.data;
  }

  async updateDocumentClassification(
    documentId: string, 
    classification: Partial<DocumentClassification>
  ): Promise<ApiResponse<DocumentClassification>> {
    if (isMockMode()) {
      return mockApiService.updateDocumentClassification(documentId, classification);
    }
    
    const response = await apiClient.put(`/documents/${documentId}/classification`, classification);
    return response.data;
  }

  async approveClassification(documentId: string): Promise<ApiResponse<DocumentClassification>> {
    if (isMockMode()) {
      return mockApiService.approveClassification(documentId);
    }
    
    const response = await apiClient.post(`/documents/${documentId}/classification/approve`);
    return response.data;
  }

  // Lineage methods
  async getLineageGraph(entityId: string, direction: 'upstream' | 'downstream' | 'both' = 'both', depth: number = 3): Promise<ApiResponse<LineageGraph>> {
    if (isMockMode()) {
      return mockApiService.getLineageGraph(entityId, direction, depth);
    }
    
    const response = await apiClient.get(`/lineage/${entityId}`, {
      params: { direction, depth }
    });
    return response.data;
  }

  // Schema methods
  async getSchemaConnections(): Promise<ApiResponse<SchemaConnection[]>> {
    if (isMockMode()) {
      return mockApiService.getSchemaConnections();
    }
    
    const response = await apiClient.get('/schemas/connections');
    return response.data;
  }

  async getSchemaConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    if (isMockMode()) {
      return mockApiService.getSchemaConnection(id);
    }
    
    const response = await apiClient.get(`/schemas/connections/${id}`);
    return response.data;
  }

  async getSchemaTables(connectionId: string): Promise<ApiResponse<SchemaTable[]>> {
    if (isMockMode()) {
      return mockApiService.getSchemaTables(connectionId);
    }
    
    const response = await apiClient.get(`/schemas/connections/${connectionId}/tables`);
    return response.data;
  }

  async testSchemaConnection(connection: Omit<SchemaConnection, 'id' | 'isActive' | 'lastSync' | 'tableCount'>): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (isMockMode()) {
      return mockApiService.testSchemaConnection(connection);
    }
    
    const response = await apiClient.post('/schemas/connections/test', connection);
    return response.data;
  }

  async syncSchemaConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    if (isMockMode()) {
      return mockApiService.syncSchemaConnection(id);
    }
    
    const response = await apiClient.post(`/schemas/connections/${id}/sync`);
    return response.data;
  }

  // Health check and system status
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; version: string }>> {
    if (isMockMode()) {
      return mockApiService.healthCheck();
    }
    
    const response = await apiClient.get('/health');
    return response.data;
  }

  // Batch operations
  async bulkUpdateTerms(updates: Array<{ id: string; updates: TermEnrichmentRequest }>): Promise<ApiResponse<ExtractedTerm[]>> {
    if (isMockMode()) {
      return mockApiService.bulkUpdateTerms(updates);
    }
    
    const response = await apiClient.post('/terms/bulk-update', { updates });
    return response.data;
  }

  async bulkApproveTerms(termIds: string[]): Promise<ApiResponse<ExtractedTerm[]>> {
    if (isMockMode()) {
      return mockApiService.bulkApproveTerms(termIds);
    }
    
    const response = await apiClient.post('/terms/bulk-approve', { termIds });
    return response.data;
  }
}

// Create and export the singleton instance
export const apiService = new ApiService();
