import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SchemaConnection } from '../lib/types';

interface ConnectionStore {
  connections: SchemaConnection[];
  selectedConnection: SchemaConnection | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
    type: string;
  };
  
  // Actions
  setConnections: (connections: SchemaConnection[]) => void;
  addConnection: (connection: SchemaConnection) => void;
  updateConnection: (id: string, updates: Partial<SchemaConnection>) => void;
  removeConnection: (id: string) => void;
  setSelectedConnection: (connection: SchemaConnection | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setFilters: (filters: Partial<ConnectionStore['filters']>) => void;
  resetFilters: () => void;
}

const initialFilters = {
  search: '',
  status: 'all',
  type: 'all',
};

export const useConnectionStore = create<ConnectionStore>()(
  devtools(
    (set) => ({
      connections: [],
      selectedConnection: null,
      isLoading: false,
      error: null,
      filters: initialFilters,

      setConnections: (connections) =>
        {
          console.log('[ConnectionStore] setConnections called with:', connections);
          set({ connections }, false, 'setConnections')
        },

      addConnection: (connection) =>
        set(
          (state) => ({
            connections: [...state.connections, connection],
          }),
          false,
          'addConnection'
        ),

      updateConnection: (id, updates) =>
        set(
          (state) => ({
            connections: state.connections.map((conn) =>
              conn.id === id ? { ...conn, ...updates } : conn
            ),
            selectedConnection:
              state.selectedConnection?.id === id
                ? { ...state.selectedConnection, ...updates }
                : state.selectedConnection,
          }),
          false,
          'updateConnection'
        ),

      removeConnection: (id) =>
        set(
          (state) => ({
            connections: state.connections.filter((conn) => conn.id !== id),
            selectedConnection:
              state.selectedConnection?.id === id
                ? null
                : state.selectedConnection,
          }),
          false,
          'removeConnection'
        ),

      setSelectedConnection: (connection) =>
        set({ selectedConnection: connection }, false, 'setSelectedConnection'),

      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'setLoading'),

      setError: (error) =>
        set({ error }, false, 'setError'),

      clearError: () =>
        set({ error: null }, false, 'clearError'),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set({ filters: initialFilters }, false, 'resetFilters'),
    }),
    {
      name: 'connection-store',
    }
  )
);
