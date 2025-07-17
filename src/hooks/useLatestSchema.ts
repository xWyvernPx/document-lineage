import { useQuery } from '@tanstack/react-query';
import { latestSchemaApiService } from '../services/latestSchemaApiService';
import { queryKeys } from '../lib/queryClient';
import type { 
  LatestSchemaResponse,
  LatestSchemaTable,
  SchemaSearchFilters
} from '../lib/types';

// Hook to get latest schema for a specific connection
export function useLatestSchema(
  connectionId: string, 
  options: {
    tableName?: string;
    schemaName?: string;
    includeColumns?: boolean;
  } = {},
  queryOptions: {
    enabled?: boolean;
    staleTime?: number;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.schemas.latest(connectionId, JSON.stringify(options)),
    queryFn: async (): Promise<LatestSchemaResponse> => {
      const response = await latestSchemaApiService.getLatestSchemaByConnection(connectionId, options);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch latest schema');
      }
    },
    enabled: queryOptions.enabled !== false && !!connectionId,
    staleTime: queryOptions.staleTime ?? 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to search schemas (latest only by default)
export function useSchemaSearch(
  filters: SchemaSearchFilters = {},
  queryOptions: {
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.schemas.search(JSON.stringify(filters)),
    queryFn: async (): Promise<{ schemas: LatestSchemaTable[]; total: number }> => {
      const response = await latestSchemaApiService.searchSchemas(filters);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to search schemas');
      }
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook to search tables (latest only by default)
export function useTableSearch(
  filters: SchemaSearchFilters = {},
  queryOptions: {
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.schemas.tableSearch(JSON.stringify(filters)),
    queryFn: async (): Promise<{ tables: LatestSchemaTable[]; total: number }> => {
      const response = await latestSchemaApiService.searchTables(filters);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to search tables');
      }
    },
    enabled: queryOptions.enabled !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
