import { apiClient, isMockMode } from '../lib/apiClient';
import { mockConnectionApiService } from './mockConnectionApiService';
import type { 
  SchemaConnection, 
  CreateConnectionRequest, 
  UpdateConnectionRequest,
  ConnectionFilters,
  CrawlJob,
  StartCrawlRequest,
  ApiResponse
} from '../lib/types';

export class ConnectionApiService {
  private baseUrl = '/connections';
  private crawlUrl = '/crawl';

  // Connection CRUD operations
  async createConnection(data: CreateConnectionRequest): Promise<ApiResponse<SchemaConnection>> {
    if (isMockMode()) {
      return mockConnectionApiService.createConnection(data);
    }
    
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getConnections(filters?: ConnectionFilters): Promise<ApiResponse<{
    connections: SchemaConnection[];
    total: number;
  }>> {
    console.log('[ConnectionApiService] getConnections called with filters:', filters);
    console.log('[ConnectionApiService] isMockMode():', isMockMode());
    
    if (isMockMode()) {
      console.log('[ConnectionApiService] Using mock service');
      return mockConnectionApiService.getConnections(filters);
    }
    
    console.log('[ConnectionApiService] Using real API, making request to:', this.baseUrl);
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    console.log('[ConnectionApiService] Final request URL:', url);
    const response = await apiClient.get(url);
    console.log('[ConnectionApiService] Raw response:', response);
    return response.data;
  }

  async getConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    if (isMockMode()) {
      return mockConnectionApiService.getConnection(id);
    }
    
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateConnection(id: string, data: UpdateConnectionRequest): Promise<ApiResponse<SchemaConnection>> {
    if (isMockMode()) {
      return mockConnectionApiService.updateConnection(id, data);
    }
    
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    if (isMockMode()) {
      return mockConnectionApiService.deleteConnection(id);
    }
    
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async testConnection(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    if (isMockMode()) {
      return mockConnectionApiService.testConnection(id);
    }
    
    const response = await apiClient.post(`${this.baseUrl}/${id}/test`);
    return response.data;
  }

  // Crawling operations
  async startCrawl(data: StartCrawlRequest): Promise<ApiResponse<CrawlJob>> {
    if (isMockMode()) {
      return mockConnectionApiService.startCrawl(data);
    }
    
    const url = `${this.crawlUrl}/${data.connectionId}`;
    
    // Only include payload if schemas or tables are provided
    const payload = (data.schemas && data.schemas.length > 0) || (data.tables && data.tables.length > 0) 
      ? {
          schemas: data.schemas,
          tables: data.tables
        }
      : undefined;
    
    console.log('[ConnectionApiService] startCrawl - URL:', url);
    console.log('[ConnectionApiService] startCrawl - Payload:', payload);
    console.log('[ConnectionApiService] startCrawl - Full request data:', data);
    
    try {
      const response = payload 
        ? await apiClient.post(url, payload)
        : await apiClient.post(url);
      console.log('[ConnectionApiService] startCrawl - Success response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[ConnectionApiService] startCrawl - Error:', error);
      console.error('[ConnectionApiService] startCrawl - Error response:', error.response?.data);
      throw error;
    }
  }

  async getCrawlStatus(jobId?: string): Promise<ApiResponse<CrawlJob | CrawlJob[]>> {
    if (isMockMode()) {
      return mockConnectionApiService.getCrawlStatus(jobId);
    }
    
    const url = jobId ? `${this.crawlUrl}/status/${jobId}` : `${this.crawlUrl}/status`;
    const response = await apiClient.get(url);
    return response.data;
  }

  async getCrawlHistory(connectionId?: string): Promise<ApiResponse<CrawlJob[]>> {
    if (isMockMode()) {
      return mockConnectionApiService.getCrawlHistory(connectionId);
    }
    
    const params = connectionId ? `?connectionId=${connectionId}` : '';
    const response = await apiClient.get(`${this.crawlUrl}/history${params}`);
    return response.data;
  }

  async cancelCrawl(jobId: string): Promise<ApiResponse<void>> {
    if (isMockMode()) {
      return mockConnectionApiService.cancelCrawl(jobId);
    }
    
    const response = await apiClient.post(`${this.crawlUrl}/cancel/${jobId}`);
    return response.data;
  }
}

// Create singleton instance
export const connectionApiService = new ConnectionApiService();
