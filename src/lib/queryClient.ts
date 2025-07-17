import { QueryClient } from '@tanstack/react-query';

// Create a client with default configuration optimized for this application
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times with exponential backoff
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect if data is still fresh
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations 2 times
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Document-related queries
  documents: {
    all: ['documents'] as const,
    lists: () => [...queryKeys.documents.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.documents.lists(), { filters }] as const,
    details: () => [...queryKeys.documents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.documents.details(), id] as const,
    processing: () => [...queryKeys.documents.all, 'processing'] as const,
  },

  // Jobs-related queries
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (filters?: string) => [...queryKeys.jobs.lists(), { filters }] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },
  
  // Terms-related queries
  terms: {
    all: ['terms'] as const,
    lists: () => [...queryKeys.terms.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.terms.lists(), { filters }] as const,
    details: () => [...queryKeys.terms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.terms.details(), id] as const,
    enrichment: () => [...queryKeys.terms.all, 'enrichment'] as const,
  },
  
  // Classification-related queries
  classifications: {
    all: ['classifications'] as const,
    lists: () => [...queryKeys.classifications.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.classifications.all, 'detail', id] as const,
  },
  
  // Lineage-related queries
  lineage: {
    all: ['lineage'] as const,
    graph: (entityId: string) => [...queryKeys.lineage.all, 'graph', entityId] as const,
    details: (entityId: string) => [...queryKeys.lineage.all, 'details', entityId] as const,
    detail: (entityId: string, options?: any) => [...queryKeys.lineage.all, 'detail', entityId, options] as const,
    multiple: (entityIds: string[], options?: any) => [...queryKeys.lineage.all, 'multiple', entityIds, options] as const,
    raw: (entityId: string, options?: any) => [...queryKeys.lineage.all, 'raw', entityId, options] as const,
    reactflow: (entityId: string, options?: any) => [...queryKeys.lineage.all, 'reactflow', entityId, options] as const,
  },
  
  // Schema-related queries
  schemas: {
    all: ['schemas'] as const,
    list: () => [...queryKeys.schemas.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.schemas.all, 'detail', id] as const,
    mappings: () => [...queryKeys.schemas.all, 'mappings'] as const,
    latest: (connectionId: string, options: string) => [...queryKeys.schemas.all, 'latest', connectionId, options] as const,
    search: (filters: string) => [...queryKeys.schemas.all, 'search', filters] as const,
    tableSearch: (filters: string) => [...queryKeys.schemas.all, 'tableSearch', filters] as const,
  },
  
  // Connection-related queries
  connections: {
    all: ['connections'] as const,
    lists: () => [...queryKeys.connections.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.connections.lists(), { filters }] as const,
    details: () => [...queryKeys.connections.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.connections.details(), id] as const,
    test: (id: string) => [...queryKeys.connections.all, 'test', id] as const,
  },
  
  // Crawl-related queries
  crawl: {
    all: ['crawl'] as const,
    statuses: () => [...queryKeys.crawl.all, 'status'] as const,
    status: (jobId: string) => [...queryKeys.crawl.statuses(), jobId] as const,
    allStatuses: () => [...queryKeys.crawl.statuses(), 'all'] as const,
    history: (connectionId?: string) => [...queryKeys.crawl.all, 'history', connectionId] as const,
  },
} as const;
