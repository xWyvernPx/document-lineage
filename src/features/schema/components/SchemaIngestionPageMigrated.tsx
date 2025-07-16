import { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter,
  Plus,
  Download,
  RefreshCw,
  Settings,
  Eye,
  ChevronDown,
  Server,
  Cloud,
  HardDrive,
  Layers,
} from 'lucide-react';

import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';

// Import the new hooks and stores
import { useConnections, useTestConnection, useStartCrawl, useCreateConnection } from '../../../hooks/useConnections';
import { useConnectionStore } from '../../../stores/connectionStore';
import { getApiMode, setApiMode } from '../../../lib/apiClient';
import { CreateConnectionRequest, SchemaConnection } from '../../../lib/types';
import { ConnectionSchemaView } from './ConnectionSchemaView';

// Database icon and color mapping based on database type
const getDatabaseIconConfig = (databaseType: string) => {
  const configs = {
    postgresql: {
      icon: Database,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'PostgreSQL'
    },
    mysql: {
      icon: Database,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      label: 'MySQL'
    },
    snowflake: {
      icon: Cloud,
      bgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      label: 'Snowflake'
    },
    bigquery: {
      icon: Layers,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      label: 'BigQuery'
    },
    redshift: {
      icon: Server,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      label: 'Redshift'
    },
    oracle: {
      icon: HardDrive,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      label: 'Oracle'
    }
  };
  
  // Default fallback for unknown database types
  return configs[databaseType as keyof typeof configs] || {
    icon: Database,
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    label: databaseType?.charAt(0).toUpperCase() + databaseType?.slice(1) || 'Unknown'
  };
};

export function SchemaIngestionPageMigrated() {
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [viewingSchemaConnection, setViewingSchemaConnection] = useState<SchemaConnection | null>(null);
  
  // Form state for creating new connections
  const [connectionForm, setConnectionForm] = useState<CreateConnectionRequest>({
    name: '',
    description: '',
    databaseType: 'postgresql',
    host: '',
    port: 5432,
    databaseName: '',
    username: '',
    password: '',
    ssl: false,
  });

  // Use the connection store
  const {
    connections,
    isLoading,
    error,
    filters,
    setFilters,
    clearError
  } = useConnectionStore();

  // Use React Query hooks
  const {
    isLoading: isQueryLoading,
    error: queryError,
    refetch: refetchConnections
  } = useConnections(filters);

  console.log('[SchemaIngestionPageMigrated] Component rendered');
  console.log('[SchemaIngestionPageMigrated] filters:', filters);
  console.log('[SchemaIngestionPageMigrated] isQueryLoading:', isQueryLoading);
  console.log('[SchemaIngestionPageMigrated] queryError:', queryError);
  console.log('[SchemaIngestionPageMigrated] connections from store:', connections);

  // Force initial load on component mount
  useEffect(() => {
    console.log('[SchemaIngestionPageMigrated] Component mounted, triggering refetch');
    refetchConnections();
  }, [refetchConnections]);

  const testConnectionMutation = useTestConnection();
  const startCrawlMutation = useStartCrawl();
  const createConnectionMutation = useCreateConnection();

  // Current API mode state
  const [currentApiMode, setCurrentApiMode] = useState(getApiMode());

  // Handle search filter changes
  const handleSearchChange = (search: string) => {
    setFilters({ search });
  };

  const handleStatusFilterChange = (status: string) => {
    setFilters({ status });
  };

  const handleTypeFilterChange = (type: string) => {
    setFilters({ type });
  };

  // Handle API mode switching
  const handleApiModeSwitch = () => {
    const newMode = currentApiMode === 'mock' ? 'real' : 'mock';
    setApiMode(newMode);
    setCurrentApiMode(newMode);
  };

  // Handle connection testing
  const handleTestConnection = async (connectionId: string) => {
    try {
      const result = await testConnectionMutation.mutateAsync(connectionId);
      console.log('Connection test result:', result);
      // You could show a toast notification here
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  // Handle viewing schema tables for a connection
  const handleViewTables = (connection: SchemaConnection) => {
    setViewingSchemaConnection(connection);
  };

  // Handle back from schema view
  const handleBackFromSchemaView = () => {
    setViewingSchemaConnection(null);
  };

  // Handle crawl starting
  const handleStartCrawl = async (connectionId: string) => {
    try {
      console.log('Starting crawl for connection:', connectionId);
      
      // First check if there's already a crawl running
     /*  console.log('Checking for existing crawl jobs...');
      const crawlStatusResponse = await connectionApiService.getCrawlStatus();
      
      if (crawlStatusResponse.success && crawlStatusResponse.data) {
        const activeCrawls = Array.isArray(crawlStatusResponse.data) 
          ? crawlStatusResponse.data.filter(job => 
              job.connectionId === connectionId && 
              (job.status === 'running' || job.status === 'pending')
            )
          : [];
          
        if (activeCrawls.length > 0) {
          const activeCrawl = activeCrawls[0];
          const confirmStop = confirm(
            `There's already a crawl ${activeCrawl.status} for this connection (Job ID: ${activeCrawl.id}). ` +
            `Do you want to cancel it and start a new one?`
          );
          
          if (confirmStop) {
            console.log('Cancelling existing crawl:', activeCrawl.id);
            await connectionApiService.cancelCrawl(activeCrawl.id);
            console.log('Existing crawl cancelled, starting new one...');
          } else {
            console.log('User chose not to cancel existing crawl');
            return;
          }
        }
      } */
      
      const result = await startCrawlMutation.mutateAsync({ connectionId });
      console.log('Crawl started successfully:', result);
      alert(`Crawl started successfully! Job ID: ${result.id}`);
      
      // Invalidate and refetch connections to get updated status
      console.log('Refreshing connections after crawl start...');
      refetchConnections();
    } catch (error: any) {
      console.error('Failed to start crawl:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Extract meaningful error message
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Unknown error';
      
      alert(`Failed to start crawl: ${errorMessage}`);
    }
  };

  // Handle form input changes
  const handleFormChange = (field: keyof CreateConnectionRequest, value: string | number | boolean) => {
    setConnectionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle connection creation
  const handleCreateConnection = async () => {
    try {
      const result = await createConnectionMutation.mutateAsync(connectionForm);
      console.log('Connection created:', result);
      
      // Reset form and close modal
      setConnectionForm({
        name: '',
        description: '',
        databaseType: 'postgresql',
        host: '',
        port: 5432,
        databaseName: '',
        username: '',
        password: '',
        ssl: false,
      });
      setShowAddConnection(false);
      
      // Refresh connections list
      refetchConnections();
    } catch (error) {
      console.error('Failed to create connection:', error);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddConnection(false);
    // Reset form when closing
    setConnectionForm({
      name: '',
      description: '',
      databaseType: 'postgresql',
      host: '',
      port: 5432,
      databaseName: '',
      username: '',
      password: '',
      ssl: false,
    });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Synced':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'sync failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'Init':
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  // Get status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Synced':
        return <Badge variant="success">Synced</Badge>;
      case 'syncing':
        return <Badge variant="info">Syncing</Badge>;
      case 'sync failed':
        return <Badge variant="error">Sync Failed</Badge>;
      case 'Init':
      default:
        return <Badge variant="default">Init</Badge>;
    }
  };

  // Clear any errors when component mounts
  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000); // Auto-clear errors after 5 seconds
    }
  }, [error, clearError]);

  const stats = {
    totalConnections: connections.length,
    connectedSources: connections.filter(c => c.status === 'Synced').length,
    totalTables: connections.reduce((sum, conn) => sum + conn.tableCount, 0),
    totalColumns: connections.reduce((sum, conn) => sum + conn.columnCount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Conditional rendering based on view state */}
      {viewingSchemaConnection ? (
        <div className="max-w-7xl mx-auto">
          <ConnectionSchemaView 
            connection={viewingSchemaConnection}
            onBack={handleBackFromSchemaView}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Schema Ingestion</h1>
                <p className="text-gray-600 mt-1">
                  Connect and ingest database schemas for term mapping and lineage tracking
                </p>
              </div>
          
          <div className="flex items-center space-x-3">
            {/* API Mode Switch */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Mode:</span>
              <button
                onClick={handleApiModeSwitch}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  currentApiMode === 'mock' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {currentApiMode === 'mock' ? '🎭 Mock' : '🌐 Real'} API
              </button>
            </div>
            
            <Button variant="ghost" size="sm" icon={Download}>
              Export Schema
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddConnection(true)}>
              Add Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || queryError) && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error || (queryError instanceof Error ? queryError.message : 'Unknown error')}
                </div>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto mb-6 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalConnections}</div>
            <div className="text-sm text-gray-600">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.connectedSources}</div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTables}</div>
            <div className="text-sm text-gray-600">Tables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.totalColumns}</div>
            <div className="text-sm text-gray-600">Columns</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isQueryLoading) && (
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-gray-600">Loading connections...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={filters.status}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Init">Init</option>
                    <option value="syncing">Syncing</option>
                    <option value="Synced">Synced</option>
                    <option value="sync failed">Sync Failed</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <div className="relative">
                  <select
                    value={filters.type}
                    onChange={(e) => handleTypeFilterChange(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="snowflake">Snowflake</option>
                    <option value="bigquery">BigQuery</option>
                    <option value="redshift">Redshift</option>
                    <option value="oracle">Oracle</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <Button variant="ghost" size="sm" icon={Filter}>
                  Filters
                </Button>
                
                <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetchConnections()}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Connections List */}
        {!isLoading && !isQueryLoading && (
          <div className="space-y-4">
            {connections.map(connection => (
              <Card key={connection.connectionId} hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {(() => {
                        const dbConfig = getDatabaseIconConfig(connection.databaseType);
                        const IconComponent = dbConfig.icon;
                        return (
                          <div className={`p-3 rounded-lg ${dbConfig.bgColor}`}>
                            <IconComponent className={`w-5 h-5 ${dbConfig.iconColor}`} />
                          </div>
                        );
                      })()}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                          {getStatusIcon(connection.status)}
                          {getStatusBadge(connection.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Type:</span>
                            <p className="font-medium text-gray-900">{getDatabaseIconConfig(connection.databaseType).label}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Database:</span>
                            <p className="font-medium text-gray-900">{connection.database || connection.databaseName}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Tables:</span>
                            <p className="font-medium text-gray-900">{connection.tableCount}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Columns:</span>
                            <p className="font-medium text-gray-900">{connection.columnCount}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Last sync: {formatDate(connection.lastSync)}</span>
                          <span>Created by: {connection.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewTables(connection)}
                      >
                        View Tables
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={RefreshCw}
                        onClick={() => handleTestConnection(connection.connectionId)}
                        disabled={testConnectionMutation.isPending}
                      >
                        {testConnectionMutation.isPending ? 'Testing...' : 'Test'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStartCrawl(connection.connectionId)}
                        disabled={startCrawlMutation.isPending}
                      >
                        {startCrawlMutation.isPending ? 'Starting...' : 'Crawl'}
                      </Button>
                      <Button variant="ghost" size="sm" icon={Settings}>
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {connections.length === 0 && !isLoading && !isQueryLoading && (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new database connection.
                </p>
                <div className="mt-6">
                  <Button variant="primary" icon={Plus} onClick={() => setShowAddConnection(true)}>
                    Add Connection
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showAddConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto z-10">
            <h3 className="text-lg font-semibold mb-4">Add New Connection</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Name *
                </label>
                <input
                  type="text"
                  value={connectionForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="My Database Connection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={connectionForm.description || ''}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database Type *
                </label>
                <select
                  value={connectionForm.databaseType}
                  onChange={(e) => {
                    const databaseType = e.target.value as CreateConnectionRequest['databaseType'];
                    handleFormChange('databaseType', databaseType);
                    // Set default port based on database type
                    const defaultPorts = {
                      postgresql: 5432,
                      mysql: 3306,
                      oracle: 1521,
                      redshift: 5439,
                      bigquery: 443,
                      snowflake: 443
                    };
                    handleFormChange('port', defaultPorts[databaseType] || 5432);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="oracle">Oracle</option>
                  <option value="redshift">Amazon Redshift</option>
                  <option value="bigquery">Google BigQuery</option>
                  <option value="snowflake">Snowflake</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={connectionForm.host}
                    onChange={(e) => handleFormChange('host', e.target.value)}
                    placeholder="localhost"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={connectionForm.port || ''}
                    onChange={(e) => handleFormChange('port', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Database Name *
                </label>
                <input
                  type="text"
                  value={connectionForm.databaseName}
                  onChange={(e) => handleFormChange('databaseName', e.target.value)}
                  placeholder="my_database"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={connectionForm.username}
                  onChange={(e) => handleFormChange('username', e.target.value)}
                  placeholder="username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={connectionForm.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={connectionForm.ssl || false}
                  onChange={(e) => handleFormChange('ssl', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ssl" className="ml-2 text-sm text-gray-700">
                  Use SSL Connection
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleCreateConnection}
                disabled={createConnectionMutation.isPending || !connectionForm.name || !connectionForm.host || !connectionForm.databaseName || !connectionForm.username || !connectionForm.password}
              >
                {createConnectionMutation.isPending ? 'Creating...' : 'Create Connection'}
              </Button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
