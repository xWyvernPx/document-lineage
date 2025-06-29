import React, { useState } from 'react';
import { 
  Database, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown,
  Eye,
  Download,
  Settings,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Table,
  Columns,
  Key,
  FileText,
  Calendar,
  User,
  Save,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';

interface SchemaConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'snowflake' | 'bigquery' | 'redshift' | 'oracle';
  host: string;
  database: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  tableCount: number;
  columnCount: number;
  createdBy: string;
  createdAt: string;
}

interface SchemaTable {
  id: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  tableType: 'table' | 'view' | 'materialized_view';
  columnCount: number;
  rowCount?: number;
  description?: string;
  lastUpdated: string;
  isIngested: boolean;
  mappedTerms: number;
  owner?: string;
  tags?: string[];
  businessPurpose?: string;
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
}

interface SchemaColumn {
  id: string;
  tableId: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  description?: string;
  mappedTerm?: string;
  confidence?: number;
}

const mockConnections: SchemaConnection[] = [
  {
    id: '1',
    name: 'Production Data Warehouse',
    type: 'snowflake',
    host: 'company.snowflakecomputing.com',
    database: 'PROD_DW',
    status: 'connected',
    lastSync: '2024-01-16T10:30:00Z',
    tableCount: 247,
    columnCount: 1856,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: '2',
    name: 'Customer Database',
    type: 'postgresql',
    host: 'customer-db.company.com',
    database: 'customers',
    status: 'syncing',
    lastSync: '2024-01-16T09:45:00Z',
    tableCount: 89,
    columnCount: 567,
    createdBy: 'Michael Chen',
    createdAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '3',
    name: 'Analytics Platform',
    type: 'bigquery',
    host: 'bigquery.googleapis.com',
    database: 'analytics-prod',
    status: 'error',
    lastSync: '2024-01-15T16:20:00Z',
    tableCount: 156,
    columnCount: 892,
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-01-08T11:15:00Z'
  }
];

const mockTables: SchemaTable[] = [
  {
    id: '1',
    connectionId: '1',
    schemaName: 'sales',
    tableName: 'customers',
    tableType: 'table',
    columnCount: 12,
    rowCount: 45678,
    description: 'Customer master data table containing all customer information',
    lastUpdated: '2024-01-16T08:30:00Z',
    isIngested: true,
    mappedTerms: 8,
    owner: 'Sales Team',
    tags: ['customer', 'master-data', 'pii'],
    businessPurpose: 'Store and manage customer information for sales and marketing activities',
    dataClassification: 'confidential'
  },
  {
    id: '2',
    connectionId: '1',
    schemaName: 'sales',
    tableName: 'orders',
    tableType: 'table',
    columnCount: 15,
    rowCount: 234567,
    description: 'Order transaction records with payment and shipping details',
    lastUpdated: '2024-01-16T09:15:00Z',
    isIngested: true,
    mappedTerms: 12,
    owner: 'Sales Team',
    tags: ['orders', 'transactions', 'revenue'],
    businessPurpose: 'Track all customer orders and transaction history',
    dataClassification: 'internal'
  },
  {
    id: '3',
    connectionId: '1',
    schemaName: 'analytics',
    tableName: 'customer_metrics',
    tableType: 'view',
    columnCount: 8,
    description: 'Customer analytics and metrics view for reporting',
    lastUpdated: '2024-01-16T07:45:00Z',
    isIngested: false,
    mappedTerms: 0,
    owner: 'Analytics Team',
    tags: ['analytics', 'metrics', 'reporting'],
    businessPurpose: 'Provide aggregated customer metrics for business intelligence',
    dataClassification: 'internal'
  }
];

export function SchemaIngestionPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'tables' | 'columns'>('connections');
  const [selectedConnection, setSelectedConnection] = useState<SchemaConnection | null>(null);
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [editingTable, setEditingTable] = useState<SchemaTable | null>(null);
  const [tables, setTables] = useState<SchemaTable[]>(mockTables);

  const getStatusIcon = (status: SchemaConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SchemaConnection['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success">Connected</Badge>;
      case 'syncing':
        return <Badge variant="info">Syncing</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge variant="default">Disconnected</Badge>;
    }
  };

  const getClassificationBadge = (classification?: SchemaTable['dataClassification']) => {
    switch (classification) {
      case 'public':
        return <Badge variant="success">Public</Badge>;
      case 'internal':
        return <Badge variant="info">Internal</Badge>;
      case 'confidential':
        return <Badge variant="warning">Confidential</Badge>;
      case 'restricted':
        return <Badge variant="error">Restricted</Badge>;
      default:
        return <Badge variant="default">Unclassified</Badge>;
    }
  };

  const getDatabaseIcon = (type: SchemaConnection['type']) => {
    return <Database className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateTable = (updatedTable: SchemaTable) => {
    setTables(prev => prev.map(table => 
      table.id === updatedTable.id ? updatedTable : table
    ));
    setEditingTable(null);
  };

  const filteredConnections = mockConnections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.database.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conn.status === statusFilter;
    const matchesType = typeFilter === 'all' || conn.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredTables = tables.filter(table => {
    if (selectedConnection && table.connectionId !== selectedConnection.id) return false;
    const matchesSearch = table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.schemaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getStats = () => {
    return {
      totalConnections: mockConnections.length,
      connectedSources: mockConnections.filter(c => c.status === 'connected').length,
      totalTables: tables.length,
      ingestedTables: tables.filter(t => t.isIngested).length,
      totalColumns: mockConnections.reduce((sum, conn) => sum + conn.columnCount, 0),
      mappedTerms: tables.reduce((sum, table) => sum + table.mappedTerms, 0)
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schema Ingestion</h1>
            <p className="text-gray-600 mt-1">
              Connect and ingest database schemas for term mapping and lineage tracking
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" icon={Download}>
              Export Schema
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowAddConnection(true)}>
              Add Connection
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
            <div className="text-2xl font-bold text-purple-600">{stats.ingestedTables}</div>
            <div className="text-sm text-gray-600">Ingested</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.totalColumns}</div>
            <div className="text-sm text-gray-600">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.mappedTerms}</div>
            <div className="text-sm text-gray-600">Mapped Terms</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'connections', label: 'Data Connections', icon: Database },
              { id: 'tables', label: 'Tables & Views', icon: Table },
              { id: 'columns', label: 'Column Mapping', icon: Columns }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

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
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                {activeTab === 'connections' && (
                  <>
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="all">All Status</option>
                        <option value="connected">Connected</option>
                        <option value="syncing">Syncing</option>
                        <option value="error">Error</option>
                        <option value="disconnected">Disconnected</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <div className="relative">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
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
                  </>
                )}
                
                <Button variant="ghost" size="sm" icon={Filter}>
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            {filteredConnections.map(connection => (
              <Card key={connection.id} hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        {getDatabaseIcon(connection.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                          {getStatusIcon(connection.status)}
                          {getStatusBadge(connection.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Type:</span>
                            <p className="font-medium text-gray-900 capitalize">{connection.type}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Database:</span>
                            <p className="font-medium text-gray-900">{connection.database}</p>
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
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Last sync: {formatDate(connection.lastSync)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Created by: {connection.createdBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => {
                          setSelectedConnection(connection);
                          setActiveTab('tables');
                        }}
                      >
                        View Tables
                      </Button>
                      <Button variant="ghost" size="sm" icon={RefreshCw}>
                        Sync
                      </Button>
                      <Button variant="ghost" size="sm" icon={Settings}>
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-4">
            {selectedConnection && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedConnection(null);
                    setActiveTab('connections');
                  }}
                >
                  ← Back to Connections
                </Button>
                <h2 className="text-lg font-semibold text-gray-900 mt-2">
                  Tables in {selectedConnection.name}
                </h2>
              </div>
            )}
            
            {filteredTables.map(table => (
              <Card key={table.id} hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Table className="w-5 h-5 text-emerald-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {table.schemaName}.{table.tableName}
                          </h3>
                          <Badge variant="default" size="sm">{table.tableType}</Badge>
                          {table.isIngested ? (
                            <Badge variant="success" size="sm">Ingested</Badge>
                          ) : (
                            <Badge variant="default" size="sm">Not Ingested</Badge>
                          )}
                          {getClassificationBadge(table.dataClassification)}
                        </div>
                        
                        {table.description && (
                          <p className="text-gray-600 mb-3">{table.description}</p>
                        )}

                        {table.businessPurpose && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700">Business Purpose:</span>
                            <p className="text-sm text-gray-600 mt-1">{table.businessPurpose}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Columns:</span>
                            <p className="font-medium text-gray-900">{table.columnCount}</p>
                          </div>
                          {table.rowCount && (
                            <div>
                              <span className="text-sm text-gray-600">Rows:</span>
                              <p className="font-medium text-gray-900">{table.rowCount.toLocaleString()}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-sm text-gray-600">Mapped Terms:</span>
                            <p className="font-medium text-gray-900">{table.mappedTerms}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Owner:</span>
                            <p className="font-medium text-gray-900">{table.owner || 'Unassigned'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Last Updated:</span>
                            <p className="font-medium text-gray-900">{formatDate(table.lastUpdated)}</p>
                          </div>
                        </div>

                        {table.tags && table.tags.length > 0 && (
                          <div className="mb-3">
                            <span className="text-sm text-gray-600 block mb-1">Tags:</span>
                            <div className="flex flex-wrap gap-1">
                              {table.tags.map(tag => (
                                <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {table.mappedTerms > 0 && (
                          <div className="mt-3">
                            <ProgressBar 
                              value={(table.mappedTerms / table.columnCount) * 100}
                              color="emerald"
                              showLabel
                              className="mb-1"
                            />
                            <span className="text-xs text-gray-500">
                              {table.mappedTerms} of {table.columnCount} columns mapped
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setEditingTable(table)}
                      >
                        Update Schema
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Columns}
                        onClick={() => {
                          setSelectedTable(table);
                          setActiveTab('columns');
                        }}
                      >
                        View Columns
                      </Button>
                      {!table.isIngested ? (
                        <Button variant="primary" size="sm" icon={Upload}>
                          Ingest
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" icon={RefreshCw}>
                          Refresh
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'columns' && (
          <div>
            {selectedTable && (
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTable(null);
                    setActiveTab('tables');
                  }}
                >
                  ← Back to Tables
                </Button>
                <h2 className="text-lg font-semibold text-gray-900 mt-2">
                  Columns in {selectedTable.schemaName}.{selectedTable.tableName}
                </h2>
              </div>
            )}
            
            <Card>
              <div className="p-6">
                <div className="text-center py-12">
                  <Columns className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Column Mapping</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedTable 
                      ? `Column mapping for ${selectedTable.tableName} will be displayed here`
                      : 'Select a table to view column mappings'
                    }
                  </p>
                  <Button variant="primary">
                    Start Column Mapping
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Add Connection Modal */}
      {showAddConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddConnection(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Connection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
                <input
                  type="text"
                  placeholder="My Database Connection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select database type</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="snowflake">Snowflake</option>
                  <option value="bigquery">BigQuery</option>
                  <option value="redshift">Redshift</option>
                  <option value="oracle">Oracle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  placeholder="localhost:5432"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
                <input
                  type="text"
                  placeholder="my_database"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setShowAddConnection(false)}>
                Cancel
              </Button>
              <Button variant="primary">
                Test & Save Connection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Schema Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingTable(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Update Schema: {editingTable.schemaName}.{editingTable.tableName}
              </h3>
              <Button variant="ghost" size="sm" icon={X} onClick={() => setEditingTable(null)} />
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updatedTable: SchemaTable = {
                ...editingTable,
                description: formData.get('description') as string,
                businessPurpose: formData.get('businessPurpose') as string,
                owner: formData.get('owner') as string,
                dataClassification: formData.get('dataClassification') as SchemaTable['dataClassification'],
                tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean)
              };
              handleUpdateTable(updatedTable);
            }}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schema Name</label>
                      <input
                        type="text"
                        value={editingTable.schemaName}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                      <input
                        type="text"
                        value={editingTable.tableName}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingTable.description}
                    placeholder="Describe what this table contains and its purpose..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Business Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Purpose</label>
                  <textarea
                    name="businessPurpose"
                    defaultValue={editingTable.businessPurpose}
                    placeholder="Explain how this table is used in business processes..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Owner and Classification */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <input
                      type="text"
                      name="owner"
                      defaultValue={editingTable.owner}
                      placeholder="Team or person responsible"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Classification</label>
                    <select
                      name="dataClassification"
                      defaultValue={editingTable.dataClassification}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select classification</option>
                      <option value="public">Public</option>
                      <option value="internal">Internal</option>
                      <option value="confidential">Confidential</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingTable.tags?.join(', ')}
                    placeholder="customer, master-data, pii (comma separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Current Statistics */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Statistics</h4>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{editingTable.columnCount}</div>
                      <div className="text-sm text-gray-600">Columns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{editingTable.rowCount?.toLocaleString() || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{editingTable.mappedTerms}</div>
                      <div className="text-sm text-gray-600">Mapped Terms</div>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-amber-800">Schema Update Notice</h5>
                    <p className="text-sm text-amber-700 mt-1">
                      Updating schema information will help improve term mapping accuracy and data lineage tracking. 
                      This metadata is used for documentation and governance purposes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button variant="ghost" type="button" onClick={() => setEditingTable(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" icon={Save}>
                  Update Schema
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}