import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { lineageService } from '../services/lineageService';
import { transformServerToReactFlow } from '../utils/lineageTransformers';
import { LineageGraph, LineageResponse, ReactFlowResponse } from '../lib/types';

// Hook for fetching lineage data for a single entity
export function useLineage(
  entityId: string,
  options: {
    direction?: 'upstream' | 'downstream' | 'both';
    depth?: number;
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.lineage.detail(entityId, options),
    queryFn: async (): Promise<LineageGraph> => {
      const response = await lineageService.getLineage(entityId, options);
      return transformServerToReactFlow(response.data);
    },
    enabled: options.enabled !== false && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching lineage data for multiple entities
export function useMultipleLineage(
  entityIds: string[],
  options: {
    direction?: 'upstream' | 'downstream' | 'both';
    depth?: number;
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.lineage.multiple(entityIds, options),
    queryFn: async (): Promise<LineageGraph> => {
      const response = await lineageService.getMultipleLineage(entityIds, options);
      return transformServerToReactFlow(response.data);
    },
    enabled: options.enabled !== false && entityIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting raw lineage response (without transformation)
export function useLineageRaw(
  entityId: string,
  options: {
    direction?: 'upstream' | 'downstream' | 'both';
    depth?: number;
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.lineage.raw(entityId, options),
    queryFn: async (): Promise<LineageResponse> => {
      const response = await lineageService.getLineage(entityId, options);
      return response.data;
    },
    enabled: options.enabled !== false && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// NEW: Hook for fetching lineage in React Flow format directly
export function useLineageReactFlow(
  entityId: string,
  options: {
    direction?: 'upstream' | 'downstream' | 'both';
    depth?: number;
    enabled?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: queryKeys.lineage.reactflow(entityId, options),
    queryFn: async (): Promise<ReactFlowResponse> => {
      return await lineageService.getLineageReactFlow(entityId, options);
    },
    enabled: options.enabled !== false && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutation for updating node positions (if supported by backend)
export function useUpdateNodePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      entityId: string;
      nodeId: string;
      position: { x: number; y: number };
    }) => {
      // This would be implemented when backend supports position updates
      console.log('Updating node position:', params);
      return params;
    },
    onSuccess: (data) => {
      // Invalidate related lineage queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.lineage.detail(data.entityId),
      });
    },
  });
}

// Mutation for refreshing lineage data
export function useRefreshLineage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entityId: string) => {
      // Force refetch by invalidating queries
      await queryClient.invalidateQueries({
        queryKey: queryKeys.lineage.detail(entityId),
      });
      return entityId;
    },
  });
}

// Hook for preloading lineage data
export function usePrefetchLineage() {
  const queryClient = useQueryClient();

  return (
    entityId: string,
    options: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
    } = {}
  ) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.lineage.detail(entityId, options),
      queryFn: async (): Promise<LineageGraph> => {
        const response = await lineageService.getLineage(entityId, options);
        return transformServerToReactFlow(response.data);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}
