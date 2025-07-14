import type { 
  SchemaConnection, 
  CreateConnectionRequest, 
  UpdateConnectionRequest,
  ConnectionFilters,
  CrawlJob,
  StartCrawlRequest,
  ApiResponse
} from '../lib/types';

// Mock data similar to the SchemaIngestionPage component
const mockConnections: SchemaConnection[] = [
  {
    connectionId: '1',
    name: 'Production Data Warehouse',
    type: 'snowflake',
    databaseType: 'snowflake',
    host: 'company.snowflakecomputing.com',
    port: 443,
    database: 'PROD_DW',
    databaseName: 'PROD_DW',
    ssl: true,
    status: 'Synced',
    lastSync: '2024-01-16T10:30:00Z',
    tableCount: 247,
    columnCount: 1856,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z'
  },
  {
    connectionId: '2',
    name: 'Customer Database',
    type: 'postgresql',
    databaseType: 'postgresql',
    host: 'customer-db.company.com',
    port: 5432,
    database: 'customers',
    databaseName: 'customers',
    ssl: true,
    status: 'syncing',
    lastSync: '2024-01-16T09:45:00Z',
    tableCount: 89,
    columnCount: 567,
    createdBy: 'Michael Chen',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-16T09:45:00Z'
  },
  {
    connectionId: '3',
    name: 'Analytics Platform',
    type: 'bigquery',
    databaseType: 'bigquery',
    host: 'bigquery.googleapis.com',
    port: 443,
    database: 'analytics-prod',
    databaseName: 'analytics-prod',
    ssl: true,
    status: 'sync failed',
    lastSync: '2024-01-15T16:20:00Z',
    tableCount: 156,
    columnCount: 892,
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-01-08T11:15:00Z',
    updatedAt: '2024-01-15T16:20:00Z'
  },
  {
    connectionId: '4',
    name: 'Financial Transactions',
    type: 'oracle',
    databaseType: 'oracle',
    host: 'fin-db.company.com',
    port: 1521,
    database: 'FINANCE_PROD',
    databaseName: 'FINANCE_PROD',
    ssl: true,
    status: 'Synced',
    lastSync: '2024-01-16T11:15:00Z',
    tableCount: 134,
    columnCount: 1023,
    createdBy: 'David Kim',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-16T11:15:00Z'
  },
  {
    connectionId: '5',
    name: 'Marketing Analytics',
    type: 'redshift',
    databaseType: 'redshift',
    host: 'marketing-cluster.company.com',
    port: 5439,
    database: 'MARKETING_DW',
    databaseName: 'MARKETING_DW',
    ssl: true,
    status: 'Synced',
    lastSync: '2024-01-16T08:20:00Z',
    tableCount: 78,
    columnCount: 445,
    createdBy: 'Lisa Wang',
    createdAt: '2024-01-09T13:45:00Z',
    updatedAt: '2024-01-16T08:20:00Z'
  },
  {
    connectionId: '6',
    name: 'Inventory Management',
    type: 'mysql',
    databaseType: 'mysql',
    host: 'inventory-db.company.com',
    port: 3306,
    database: 'inventory_system',
    databaseName: 'inventory_system',
    ssl: true,
    status: 'Init',
    lastSync: '2024-01-14T22:10:00Z',
    tableCount: 45,
    columnCount: 234,
    createdBy: 'Robert Martinez',
    createdAt: '2024-01-11T16:20:00Z',
    updatedAt: '2024-01-14T22:10:00Z'
  }
];

const mockCrawlJobs: CrawlJob[] = [
  {
    id: 'crawl-1',
    connectionId: '1',
    status: 'completed',
    progress: 100,
    totalTables: 247,
    processedTables: 247,
    startedAt: '2024-01-16T10:00:00Z',
    completedAt: '2024-01-16T10:30:00Z',
    createdBy: 'Sarah Johnson'
  },
  {
    id: 'crawl-2',
    connectionId: '2',
    status: 'running',
    progress: 65,
    totalTables: 89,
    processedTables: 58,
    startedAt: '2024-01-16T09:30:00Z',
    createdBy: 'Michael Chen'
  },
  {
    id: 'crawl-3',
    connectionId: '3',
    status: 'failed',
    progress: 25,
    totalTables: 156,
    processedTables: 39,
    startedAt: '2024-01-16T08:00:00Z',
    error: 'Authentication failed: Invalid credentials',
    createdBy: 'Emily Rodriguez'
  }
];

export class MockConnectionApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
      message,
    };
  }

  private createErrorResponse(message: string, code?: string): ApiResponse<never> {
    return {
      success: false,
      data: null as never,
      message: `${code ? `[${code}] ` : ''}${message}`,
      timestamp: new Date().toISOString(),
    };
  }

  async getConnections(filters?: ConnectionFilters): Promise<ApiResponse<{
    connections: SchemaConnection[];
    total: number;
  }>> {
    await this.delay(800);
    
    let filteredConnections = [...mockConnections];
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredConnections = filteredConnections.filter(conn => 
        conn.name.toLowerCase().includes(searchLower) ||
        conn.database.toLowerCase().includes(searchLower) ||
        conn.host.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.status && filters.status !== 'all') {
      filteredConnections = filteredConnections.filter(conn => 
        conn.status === filters.status
      );
    }
    
    if (filters?.type && filters.type !== 'all') {
      filteredConnections = filteredConnections.filter(conn => 
        conn.type === filters.type
      );
    }
    
    // Handle pagination
    if (filters?.limit || filters?.offset) {
      const offset = filters?.offset || 0;
      const limit = filters?.limit || 10;
      filteredConnections = filteredConnections.slice(offset, offset + limit);
    }
    
    return {
      data: {
        connections: filteredConnections,
        total: filteredConnections.length
      },
      success: true,
      timestamp: new Date().toISOString()
    }
  }

  async getConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    await this.delay(300);
    
    const connection = mockConnections.find(conn => conn.connectionId === id);
    
    if (!connection) {
      return this.createErrorResponse(`Connection with id ${id} not found`, 'NOT_FOUND');
    }
    
    return this.createSuccessResponse(connection);
  }

  async createConnection(data: CreateConnectionRequest): Promise<ApiResponse<SchemaConnection>> {
    await this.delay(1200);
    
    // Simulate validation
    if (!data.name || !data.host || !data.databaseName) {
      return this.createErrorResponse('Missing required fields', 'VALIDATION_ERROR');
    }
    
    const newConnection: SchemaConnection = {
      connectionId: this.generateId(),
      name: data.name,
      description: data.description,
      type: data.databaseType,
      databaseType: data.databaseType,
      host: data.host,
      port: data.port,
      database: data.databaseName,
      databaseName: data.databaseName,
      ssl: data.ssl || false,
      status: 'Init',
      lastSync: new Date().toISOString(),
      tableCount: 0,
      columnCount: 0,
      createdBy: 'Current User', // In real app, get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockConnections.push(newConnection);
    
    return this.createSuccessResponse(newConnection, 'Connection created successfully');
  }

  async updateConnection(id: string, data: UpdateConnectionRequest): Promise<ApiResponse<SchemaConnection>> {
    await this.delay(800);
    
    const connectionIndex = mockConnections.findIndex(conn => conn.connectionId === id);
    
    if (connectionIndex === -1) {
      return this.createErrorResponse(`Connection with id ${id} not found`, 'NOT_FOUND');
    }
    
    const updatedConnection = {
      ...mockConnections[connectionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    mockConnections[connectionIndex] = updatedConnection;
    
    return this.createSuccessResponse(updatedConnection, 'Connection updated successfully');
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    await this.delay(600);
    
    const connectionIndex = mockConnections.findIndex(conn => conn.connectionId === id);
    
    if (connectionIndex === -1) {
      return this.createErrorResponse(`Connection with id ${id} not found`, 'NOT_FOUND');
    }
    
    mockConnections.splice(connectionIndex, 1);
    
    return this.createSuccessResponse(undefined, 'Connection deleted successfully');
  }

  async testConnection(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    await this.delay(2000); // Simulate connection testing time
    
    const connection = mockConnections.find(conn => conn.connectionId === id);
    
    if (!connection) {
      return this.createErrorResponse(`Connection with id ${id} not found`, 'NOT_FOUND');
    }
    
    // Simulate different test results based on connection status
    const isSuccess = connection.status !== 'sync failed';
    
    return this.createSuccessResponse({
      success: isSuccess,
      message: isSuccess 
        ? 'Connection test successful' 
        : 'Connection test failed: Unable to connect to database'
    });
  }

  async startCrawl(data: StartCrawlRequest): Promise<ApiResponse<CrawlJob>> {
    await this.delay(1000);
    
    const connection = mockConnections.find(conn => conn.connectionId === data.connectionId);
    
    if (!connection) {
      return this.createErrorResponse(`Connection with id ${data.connectionId} not found`, 'NOT_FOUND');
    }
    
    const newCrawlJob: CrawlJob = {
      id: this.generateId(),
      connectionId: data.connectionId,
      status: 'pending',
      progress: 0,
      totalTables: connection.tableCount,
      processedTables: 0,
      startedAt: new Date().toISOString(),
      createdBy: 'Current User',
    };
    
    mockCrawlJobs.push(newCrawlJob);
    
    // Simulate crawl starting
    setTimeout(() => {
      const jobIndex = mockCrawlJobs.findIndex(job => job.id === newCrawlJob.id);
      if (jobIndex !== -1) {
        mockCrawlJobs[jobIndex].status = 'running';
      }
    }, 2000);
    
    return this.createSuccessResponse(newCrawlJob, 'Crawl job started successfully');
  }

  async getCrawlStatus(jobId?: string): Promise<ApiResponse<CrawlJob | CrawlJob[]>> {
    await this.delay(200);
    
    if (jobId) {
      const job = mockCrawlJobs.find(job => job.id === jobId);
      if (!job) {
        return this.createErrorResponse(`Crawl job with id ${jobId} not found`, 'NOT_FOUND');
      }
      return this.createSuccessResponse(job);
    } else {
      return this.createSuccessResponse(mockCrawlJobs);
    }
  }

  async getCrawlHistory(connectionId?: string): Promise<ApiResponse<CrawlJob[]>> {
    await this.delay(400);
    
    let filteredJobs = [...mockCrawlJobs];
    
    if (connectionId) {
      filteredJobs = filteredJobs.filter(job => job.connectionId === connectionId);
    }
    
    // Sort by most recent first
    filteredJobs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    
    return this.createSuccessResponse(filteredJobs);
  }

  async cancelCrawl(jobId: string): Promise<ApiResponse<void>> {
    await this.delay(500);
    
    const jobIndex = mockCrawlJobs.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
      return this.createErrorResponse(`Crawl job with id ${jobId} not found`, 'NOT_FOUND');
    }
    
    const job = mockCrawlJobs[jobIndex];
    
    if (job.status !== 'running' && job.status !== 'pending') {
      return this.createErrorResponse('Cannot cancel completed or failed job', 'INVALID_STATUS');
    }
    
    mockCrawlJobs[jobIndex] = {
      ...job,
      status: 'failed',
      error: 'Cancelled by user',
      completedAt: new Date().toISOString(),
    };
    
    return this.createSuccessResponse(undefined, 'Crawl job cancelled successfully');
  }
}

// Create singleton instance
export const mockConnectionApiService = new MockConnectionApiService();
