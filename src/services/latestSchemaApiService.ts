import { apiClient, isMockMode } from '../lib/apiClient';
import type { 
  LatestSchemaResponse,
  LatestSchemaTable,
  SchemaSearchFilters,
  ApiResponse
} from '../lib/types';

export class LatestSchemaApiService {
  private baseUrl = '/connections';
  private schemaSearchUrl = '/schemas';

  // Get latest schema for a specific connection
  async getLatestSchemaByConnection(
    connectionId: string, 
    options: {
      tableName?: string;
      schemaName?: string;
      includeColumns?: boolean;
    } = {}
  ): Promise<ApiResponse<LatestSchemaResponse>> {
    if (isMockMode()) {
      return this.getMockLatestSchema(connectionId, options);
    }
    
    const params = new URLSearchParams();
    if (options.tableName) params.append('tableName', options.tableName);
    if (options.schemaName) params.append('schemaName', options.schemaName);
    if (options.includeColumns) params.append('includeColumns', 'true');
    
    const queryString = params.toString();
    const url = `${this.baseUrl}/${connectionId}/schemas/latest${queryString ? `?${queryString}` : ''}`;
    
    console.log('[LatestSchemaApiService] getLatestSchemaByConnection - URL:', url);
    
    try {
      const response = await apiClient.get(url);
      console.log('[LatestSchemaApiService] getLatestSchemaByConnection - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[LatestSchemaApiService] getLatestSchemaByConnection - Error:', error);
      throw error;
    }
  }

  // Search schemas (latest only by default)
  async searchSchemas(filters: SchemaSearchFilters = {}): Promise<ApiResponse<{
    schemas: LatestSchemaTable[];
    total: number;
  }>> {
    if (isMockMode()) {
      return this.getMockSearchResults(filters);
    }
    
    const params = new URLSearchParams();
    if (filters.connectionId) params.append('connectionId', filters.connectionId);
    if (filters.tableName) params.append('tableName', filters.tableName);
    if (filters.schemaName) params.append('schemaName', filters.schemaName);
    if (filters.includeColumns) params.append('includeColumns', 'true');
    if (filters.includeHistorical) params.append('includeHistorical', 'true');
    
    const queryString = params.toString();
    const url = `${this.schemaSearchUrl}/search${queryString ? `?${queryString}` : ''}`;
    
    console.log('[LatestSchemaApiService] searchSchemas - URL:', url);
    
    try {
      const response = await apiClient.get(url);
      console.log('[LatestSchemaApiService] searchSchemas - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[LatestSchemaApiService] searchSchemas - Error:', error);
      throw error;
    }
  }

  // Search tables (latest only by default)
  async searchTables(filters: SchemaSearchFilters = {}): Promise<ApiResponse<{
    tables: LatestSchemaTable[];
    total: number;
  }>> {
    if (isMockMode()) {
      return this.getMockTableSearchResults(filters);
    }
    
    const params = new URLSearchParams();
    if (filters.connectionId) params.append('connectionId', filters.connectionId);
    if (filters.tableName) params.append('tableName', filters.tableName);
    if (filters.schemaName) params.append('schemaName', filters.schemaName);
    if (filters.includeColumns) params.append('includeColumns', 'true');
    if (filters.includeHistorical) params.append('includeHistorical', 'true');
    
    const queryString = params.toString();
    const url = `${this.schemaSearchUrl}/tables/search${queryString ? `?${queryString}` : ''}`;
    
    console.log('[LatestSchemaApiService] searchTables - URL:', url);
    
    try {
      const response = await apiClient.get(url);
      console.log('[LatestSchemaApiService] searchTables - Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[LatestSchemaApiService] searchTables - Error:', error);
      throw error;
    }
  }

  // Mock data for development/testing
  private async getMockLatestSchema(
    connectionId: string, 
    options: { tableName?: string; schemaName?: string; includeColumns?: boolean }
  ): Promise<ApiResponse<LatestSchemaResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockColumns = options.includeColumns ? [
      {
        columnName: 'id',
        dataType: 'BIGINT',
        isNullable: false,
        isPrimaryKey: true,
        isForeignKey: false,
        columnPosition: 1,
        description: 'Primary key identifier'
      },
      {
        columnName: 'name',
        dataType: 'VARCHAR',
        maxLength: 255,
        isNullable: false,
        isPrimaryKey: false,
        isForeignKey: false,
        columnPosition: 2,
        description: 'Entity name'
      },
      {
        columnName: 'created_at',
        dataType: 'TIMESTAMP',
        isNullable: false,
        isPrimaryKey: false,
        isForeignKey: false,
        columnPosition: 3,
        defaultValue: 'CURRENT_TIMESTAMP',
        description: 'Creation timestamp'
      }
    ] : undefined;

    const mockSchemas: LatestSchemaTable[] = [
      {
        systemId: `${connectionId}-testdb-public-users`,
        version: '2025-07-15T10:30:00Z',
        databaseName: 'testdb',
        schemaName: 'public',
        tableName: 'users',
        tableType: 'TABLE',
        totalColumns: 8,
        columns: mockColumns,
        latest: true,
        extractionTimestamp: '2025-07-15T10:30:00Z'
      },
      {
        systemId: `${connectionId}-testdb-public-orders`,
        version: '2025-07-15T10:30:00Z',
        databaseName: 'testdb',
        schemaName: 'public',
        tableName: 'orders',
        tableType: 'TABLE',
        totalColumns: 12,
        columns: mockColumns,
        latest: true,
        extractionTimestamp: '2025-07-15T10:30:00Z'
      },
      {
        systemId: `${connectionId}-testdb-analytics-metrics`,
        version: '2025-07-15T10:30:00Z',
        databaseName: 'testdb',
        schemaName: 'analytics',
        tableName: 'metrics',
        tableType: 'VIEW',
        totalColumns: 6,
        columns: mockColumns,
        latest: true,
        extractionTimestamp: '2025-07-15T10:30:00Z'
      }
    ];

    // Filter by table/schema name if provided
    let filteredSchemas = mockSchemas;
    if (options.tableName) {
      filteredSchemas = filteredSchemas.filter(s => 
        s.tableName.toLowerCase().includes(options.tableName!.toLowerCase())
      );
    }
    if (options.schemaName) {
      filteredSchemas = filteredSchemas.filter(s => 
        s.schemaName.toLowerCase().includes(options.schemaName!.toLowerCase())
      );
    }

    const response: LatestSchemaResponse = {
      connectionId,
      latest: true,
      extractionTimestamp: '2025-07-15T10:30:00Z',
      schemaId: `schema-${connectionId}-latest`,
      statistics: {
        totalTables: filteredSchemas.length,
        totalColumns: filteredSchemas.reduce((sum, s) => sum + s.totalColumns, 0),
        databaseTypes: ['postgresql'],
        schemaNames: [...new Set(filteredSchemas.map(s => s.schemaName))],
        tableTypes: [...new Set(filteredSchemas.map(s => s.tableType))],
        databaseGroups: 1
      },
      schemas: filteredSchemas
    };

    return {
      success: true,
      data: response,
      message: 'Latest schema retrieved successfully',
      timestamp: new Date().toISOString()
    };
  }

  private async getMockSearchResults(_filters: SchemaSearchFilters): Promise<ApiResponse<{
    schemas: LatestSchemaTable[];
    total: number;
  }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty results for now - can be enhanced later
    return {
      success: true,
      data: {
        schemas: [],
        total: 0
      },
      message: 'Search completed',
      timestamp: new Date().toISOString()
    };
  }

  private async getMockTableSearchResults(_filters: SchemaSearchFilters): Promise<ApiResponse<{
    tables: LatestSchemaTable[];
    total: number;
  }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty results for now - can be enhanced later
    return {
      success: true,
      data: {
        tables: [],
        total: 0
      },
      message: 'Table search completed',
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const latestSchemaApiService = new LatestSchemaApiService();
