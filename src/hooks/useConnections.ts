import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionApiService } from '../services/connectionApiService';
import { useConnectionStore } from '../stores/connectionStore';
import { queryKeys } from '../lib/queryClient';
import type { 
  CreateConnectionRequest, 
  UpdateConnectionRequest,
  ConnectionFilters,
  StartCrawlRequest
} from '../lib/types';

// Query hooks
export function useConnections(filters?: ConnectionFilters) {
  const setConnections = useConnectionStore((state) => state.setConnections);
  const setLoading = useConnectionStore((state) => state.setLoading);
  const setError = useConnectionStore((state) => state.setError);

  console.log('[useConnections] Hook called with filters:', filters);

  return useQuery({
    queryKey: queryKeys.connections.list(JSON.stringify(filters || {})),
    queryFn: async () => {
      console.log('[useConnections] Query function executing...');
      setLoading(true);
      try {
        console.log('[useConnections] Calling connectionApiService.getConnections...');
        const response = await connectionApiService.getConnections(filters);
        console.log('[useConnections] API response:', response);
        
        if (response.success && response.data) {
          setConnections(response.data.connections);
          setError(null);
          return response.data;
        } else {
          throw new Error('Failed to fetch connections');
        }
      } catch (error) {
        console.error('[useConnections] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: true, // Explicitly enable the query
  });
}

export function useConnection(id: string) {
  const setSelectedConnection = useConnectionStore((state) => state.setSelectedConnection);
  const setError = useConnectionStore((state) => state.setError);

  return useQuery({
    queryKey: queryKeys.connections.detail(id),
    queryFn: async () => {
      try {
        const response = await connectionApiService.getConnection(id);
        if (response.success && response.data) {
          setSelectedConnection(response.data);
          setError(null);
          return response.data;
        } else {
          throw new Error('Failed to fetch connection');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCrawlStatus(jobId?: string) {
  return useQuery({
    queryKey: jobId ? queryKeys.crawl.status(jobId) : queryKeys.crawl.allStatuses(),
    queryFn: async () => {
      const response = await connectionApiService.getCrawlStatus(jobId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to fetch crawl status');
      }
    },
    enabled: true,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 0, // Always consider stale for real-time updates
  });
}

export function useCrawlHistory(connectionId?: string) {
  return useQuery({
    queryKey: queryKeys.crawl.history(connectionId),
    queryFn: async () => {
      const response = await connectionApiService.getCrawlHistory(connectionId);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to fetch crawl history');
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Mutation hooks
export function useCreateConnection() {
  const queryClient = useQueryClient();
  const addConnection = useConnectionStore((state) => state.addConnection);
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: CreateConnectionRequest) => {
      const response = await connectionApiService.createConnection(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to create connection');
      }
    },
    onSuccess: (newConnection) => {
      // Optimistic update to store
      addConnection(newConnection);
      
      // Invalidate and refetch connections list
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.all });
      
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  const updateConnection = useConnectionStore((state) => state.updateConnection);
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateConnectionRequest }) => {
      const response = await connectionApiService.updateConnection(id, data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to update connection');
      }
    },
    onSuccess: (updatedConnection) => {
      // Optimistic update to store
      updateConnection(updatedConnection.id, updatedConnection);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.detail(updatedConnection.id) });
      
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  const removeConnection = useConnectionStore((state) => state.removeConnection);
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await connectionApiService.deleteConnection(id);
      if (response.success) {
        return id;
      } else {
        throw new Error('Failed to delete connection');
      }
    },
    onSuccess: (deletedId) => {
      // Optimistic update to store
      removeConnection(deletedId);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.all });
      queryClient.removeQueries({ queryKey: queryKeys.connections.detail(deletedId) });
      
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}

export function useTestConnection() {
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await connectionApiService.testConnection(id);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to test connection');
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}

export function useStartCrawl() {
  const queryClient = useQueryClient();
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: StartCrawlRequest) => {
      const response = await connectionApiService.startCrawl(data);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Failed to start crawl');
      }
    },
    onSuccess: (crawlJob) => {
      // Invalidate crawl-related queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.crawl.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.detail(crawlJob.connectionId) });
      // Also invalidate all connections list queries to reflect any status changes
      queryClient.invalidateQueries({ queryKey: queryKeys.connections.lists() });
      
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}

export function useCancelCrawl() {
  const queryClient = useQueryClient();
  const setError = useConnectionStore((state) => state.setError);

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await connectionApiService.cancelCrawl(jobId);
      if (response.success) {
        return jobId;
      } else {
        throw new Error('Failed to cancel crawl');
      }
    },
    onSuccess: () => {
      // Invalidate crawl status queries
      queryClient.invalidateQueries({ queryKey: queryKeys.crawl.all });
      
      setError(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    },
  });
}
