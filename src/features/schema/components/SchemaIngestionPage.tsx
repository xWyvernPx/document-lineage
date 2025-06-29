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
  ArrowLeft,
  Link,
  Shield,
  Hash,
  Type,
  Info,
  BookOpen,
  GitBranch
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
  primaryKeys?: string[];
  foreignKeys?: Array<{
    column: string;
    referencedTable: string;
    referencedColumn: string;
  }>;
  indexes?: Array<{
    name: string;
    columns: string[];
    isUnique: boolean;
  }>;
}

interface SchemaColumn {
  id: string;
  tableId: string;
  columnName: string;
  dataType: string;
  maxLength?: number;
  precision?: number;
  scale?: number;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  hasIndex: boolean;
  defaultValue?: string;
  description?: string;
  mappedTerm?: {
    termId: string;
    termName: string;
    confidence: number;
    isVerified: boolean;
  };
  businessRules?: string[];
  dataQuality?: {
    completeness: number;
    uniqueness: number;
    validity: number;
  };
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
    description: 'Customer master data table containing all customer information and contact details',
    lastUpdated: '2024-01-16T08:30:00Z',
    isIngested: true,
    mappedTerms: 8,
    owner: 'sales_team',
    primaryKeys: ['customer_id'],
    foreignKeys: [
      { column: 'region_id', referencedTable: 'regions', referencedColumn: 'id' }
    ],
    indexes: [
      { name: 'idx_customer_email', columns: ['email'], isUnique: true },
      { name: 'idx_customer_name', columns: ['first_name', 'last_name'], isUnique: false }
    ]
  },
  {
    id: '2',
    connectionId: '1',
    schemaName: 'sales',
    tableName: 'orders',
    tableType: 'table',
    columnCount: 15,
    rowCount: 234567,
    description: 'Order transaction records with customer and product relationships',
    lastUpdated: '2024-01-16T09:15:00Z',
    isIngested: true,
    mappedTerms: 12,
    owner: 'sales_team',
    primaryKeys: ['order_id'],
    foreignKeys: [
      { column: 'customer_id', referencedTable: 'customers', referencedColumn: 'customer_id' },
      { column: 'product_id', referencedTable: 'products', referencedColumn: 'product_id' }
    ]
  },
  {
    id: '3',
    connectionId: '1',
    schemaName: 'analytics',
    tableName: 'customer_metrics',
    tableType: 'view',
    columnCount: 8,
    description: 'Customer analytics and metrics view aggregating customer behavior data',
    lastUpdated: '2024-01-16T07:45:00Z',
    isIngested: false,
    mappedTerms: 0,
    owner: 'analytics_team'
  }
];

const mockColumns: SchemaColumn[] = [
  {
    id: '1',
    tableId: '1',
    columnName: 'customer_id',
    dataType: 'INTEGER',
    isNullable: false,
    isPrimaryKey: true,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Unique identifier for each customer',
    mappedTerm: {
      termId: 'term_1',
      termName: 'Customer Identifier',
      confidence: 0.95,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 100,
      validity: 99.8
    }
  },
  {
    id: '2',
    tableId: '1',
    columnName: 'first_name',
    dataType: 'VARCHAR',
    maxLength: 50,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Customer first name',
    mappedTerm: {
      termId: 'term_2',
      termName: 'First Name',
      confidence: 0.92,
      isVerified: true
    },
    businessRules: ['Must contain only alphabetic characters', 'Maximum 50 characters'],
    dataQuality: {
      completeness: 98.5,
      uniqueness: 45.2,
      validity: 97.1
    }
  },
  {
    id: '3',
    tableId: '1',
    columnName: 'last_name',
    dataType: 'VARCHAR',
    maxLength: 50,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Customer last name',
    mappedTerm: {
      termId: 'term_3',
      termName: 'Last Name',
      confidence: 0.91,
      isVerified: true
    },
    businessRules: ['Must contain only alphabetic characters', 'Maximum 50 characters'],
    dataQuality: {
      completeness: 99.1,
      uniqueness: 23.8,
      validity: 96.9
    }
  },
  {
    id: '4',
    tableId: '1',
    columnName: 'email',
    dataType: 'VARCHAR',
    maxLength: 255,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Customer email address for communication',
    mappedTerm: {
      termId: 'term_4',
      termName: 'Email Address',
      confidence: 0.98,
      isVerified: true
    },
    businessRules: ['Must be valid email format', 'Must be unique across all customers'],
    dataQuality: {
      completeness: 96.8,
      uniqueness: 100,
      validity: 94.2
    }
  },
  {
    id: '5',
    tableId: '1',
    columnName: 'phone_number',
    dataType: 'VARCHAR',
    maxLength: 20,
    isNullable: true,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Customer phone number',
    businessRules: ['Must follow international phone format'],
    dataQuality: {
      completeness: 87.3,
      uniqueness: 89.1,
      validity: 92.5
    }
  },
  {
    id: '6',
    tableId: '1',
    columnName: 'date_of_birth',
    dataType: 'DATE',
    isNullable: true,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Customer date of birth',
    mappedTerm: {
      termId: 'term_5',
      termName: 'Date of Birth',
      confidence: 0.89,
      isVerified: false
    },
    businessRules: ['Must be a valid date', 'Customer must be at least 18 years old'],
    dataQuality: {
      completeness: 78.9,
      uniqueness: 67.4,
      validity: 98.7
    }
  },
  {
    id: '7',
    tableId: '1',
    columnName: 'created_at',
    dataType: 'TIMESTAMP',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    defaultValue: 'CURRENT_TIMESTAMP',
    description: 'Timestamp when customer record was created',
    dataQuality: {
      completeness: 100,
      uniqueness: 99.9,
      validity: 100
    }
  },
  {
    id: '8',
    tableId: '1',
    columnName: 'region_id',
    dataType: 'INTEGER',
    isNullable: true,
    isPrimaryKey: false,
    isForeignKey: true,
    isUnique: false,
    hasIndex: true,
    description: 'Foreign key reference to customer region',
    mappedTerm: {
      termId: 'term_6',
      termName: 'Region Identifier',
      confidence: 0.87,
      isVerified: false
    },
    dataQuality: {
      completeness: 94.2,
      uniqueness: 12.3,
      validity: 99.1
    }
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
  const [viewMode, setViewMode] = useState<'list' | 'schema'>('list');

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

  const getDatabaseIcon = (type: SchemaConnection['type']) => {
    return <Database className="w-5 h-5" />;
  };

  const getDataTypeIcon = (dataType: string) => {
    if (dataType.includes('INT') || dataType.includes('DECIMAL') || dataType.includes('NUMERIC')) {
      return <Hash className="w-4 h-4 text-blue-500" />;
    }
    if (dataType.includes('VARCHAR') || dataType.includes('TEXT') || dataType.includes('CHAR')) {
      return <Type className="w-4 h-4 text-green-500" />;
    }
    if (dataType.includes('DATE') || dataType.includes('TIME')) {
      return <Calendar className="w-4 h-4 text-purple-500" />;
    }
    return <Info className="w-4 h-4 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredConnections = mockConnections.filter(conn => {
    const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conn.database.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conn.status === statusFilter;
    const matchesType = typeFilter === 'all' || conn.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredTables = mockTables.filter(table => {
    if (selectedConnection && table.connectionId !== selectedConnection.id) return false;
    const matchesSearch = table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         table.schemaName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const tableColumns = selectedTable ? mockColumns.filter(col => col.tableId === selectedTable.id) : [];

  const getStats = () => {
    return {
      totalConnections: mockConnections.length,
      connectedSources: mockConnections.filter(c => c.status === 'connected').length,
      totalTables: mockTables.length,
      ingestedTables: mockTables.filter(t => t.isIngested).length,
      totalColumns: mockConnections.reduce((sum, conn) => sum + conn.columnCount, 0),
      mappedTerms: mockTables.reduce((sum, table) => sum + table.mappedTerms, 0)
    };
  };

  const stats = getStats();

  const handleViewTableSchema = (table: SchemaTable) => {
    setSelectedTable(table);
    setViewMode('schema');
    setActiveTab('tables');
  };

  const handleBackToTableList = () => {
    setSelectedTable(null);
    setViewMode('list');
  };

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
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedConnection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowLeft}
                    onClick={() => {
                      setSelectedConnection(null);
                      setActiveTab('connections');
                    }}
                  >
                    Back to Connections
                  </Button>
                )}
                {selectedTable && viewMode === 'schema' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ArrowLeft}
                    onClick={handleBackToTableList}
                  >
                    Back to Tables
                  </Button>
                )}
                <div>
                  {selectedConnection && (
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedTable && viewMode === 'schema' 
                        ? `Schema: ${selectedTable.schemaName}.${selectedTable.tableName}`
                        : `Tables in ${selectedConnection.name}`
                      }
                    </h2>
                  )}
                </div>
              </div>
              
              {selectedTable && viewMode === 'schema' && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={Download}>
                    Export Schema
                  </Button>
                  <Button variant="ghost" size="sm" icon={GitBranch}>
                    View Lineage
                  </Button>
                </div>
              )}
            </div>

            {/* Table Schema View */}
            {selectedTable && viewMode === 'schema' ? (
              <div className="space-y-6">
                {/* Table Overview */}
                <Card>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-emerald-100 rounded-lg">
                          <Table className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {selectedTable.schemaName}.{selectedTable.tableName}
                          </h3>
                          <p className="text-gray-600 mb-3">{selectedTable.description}</p>
                          <div className="flex items-center space-x-4">
                            <Badge variant="default" size="sm">{selectedTable.tableType}</Badge>
                            {selectedTable.isIngested ? (
                              <Badge variant="success" size="sm">Ingested</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Not Ingested</Badge>
                            )}
                            {selectedTable.owner && (
                              <span className="text-sm text-gray-500">Owner: {selectedTable.owner}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedTable.columnCount}</div>
                        <div className="text-sm text-gray-600">Columns</div>
                      </div>
                      {selectedTable.rowCount && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedTable.rowCount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Rows</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{selectedTable.mappedTerms}</div>
                        <div className="text-sm text-gray-600">Mapped Terms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round((selectedTable.mappedTerms / selectedTable.columnCount) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Mapping Progress</div>
                      </div>
                    </div>

                    {selectedTable.mappedTerms > 0 && (
                      <div className="mt-4">
                        <ProgressBar 
                          value={(selectedTable.mappedTerms / selectedTable.columnCount) * 100}
                          color="emerald"
                          showLabel
                        />
                      </div>
                    )}
                  </div>
                </Card>

                {/* Table Constraints */}
                {(selectedTable.primaryKeys || selectedTable.foreignKeys || selectedTable.indexes) && (
                  <Card>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Constraints & Indexes</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Primary Keys */}
                        {selectedTable.primaryKeys && selectedTable.primaryKeys.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Key className="w-4 h-4 mr-2 text-amber-500" />
                              Primary Keys
                            </h5>
                            <div className="space-y-1">
                              {selectedTable.primaryKeys.map(key => (
                                <Badge key={key} variant="warning" size="sm">{key}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Foreign Keys */}
                        {selectedTable.foreignKeys && selectedTable.foreignKeys.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Link className="w-4 h-4 mr-2 text-blue-500" />
                              Foreign Keys
                            </h5>
                            <div className="space-y-2">
                              {selectedTable.foreignKeys.map((fk, index) => (
                                <div key={index} className="text-sm">
                                  <Badge variant="info" size="sm">{fk.column}</Badge>
                                  <span className="text-gray-500 mx-2">→</span>
                                  <span className="text-gray-700">{fk.referencedTable}.{fk.referencedColumn}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Indexes */}
                        {selectedTable.indexes && selectedTable.indexes.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Database className="w-4 h-4 mr-2 text-green-500" />
                              Indexes
                            </h5>
                            <div className="space-y-2">
                              {selectedTable.indexes.map((index, idx) => (
                                <div key={idx} className="text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">{index.name}</span>
                                    {index.isUnique && <Badge variant="success" size="sm">Unique</Badge>}
                                  </div>
                                  <div className="text-gray-600">
                                    Columns: {index.columns.join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Columns Table */}
                <Card>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Column Details</h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Column</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Data Type</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Constraints</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Mapped Term</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Data Quality</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableColumns.map(column => (
                            <tr key={column.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  {getDataTypeIcon(column.dataType)}
                                  <div>
                                    <div className="font-medium text-gray-900">{column.columnName}</div>
                                    {column.description && (
                                      <div className="text-sm text-gray-500">{column.description}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-4 px-4">
                                <div className="font-mono text-sm text-gray-900">
                                  {column.dataType}
                                  {column.maxLength && `(${column.maxLength})`}
                                  {column.precision && column.scale && `(${column.precision},${column.scale})`}
                                </div>
                                {column.defaultValue && (
                                  <div className="text-xs text-gray-500">Default: {column.defaultValue}</div>
                                )}
                              </td>
                              
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {column.isPrimaryKey && <Badge variant="warning" size="sm">PK</Badge>}
                                  {column.isForeignKey && <Badge variant="info" size="sm">FK</Badge>}
                                  {column.isUnique && <Badge variant="success" size="sm">Unique</Badge>}
                                  {!column.isNullable && <Badge variant="default" size="sm">NOT NULL</Badge>}
                                  {column.hasIndex && <Badge variant="default" size="sm">Indexed</Badge>}
                                </div>
                              </td>
                              
                              <td className="py-4 px-4">
                                {column.mappedTerm ? (
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <BookOpen className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium text-gray-900">{column.mappedTerm.termName}</span>
                                      {column.mappedTerm.isVerified ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {Math.round(column.mappedTerm.confidence * 100)}% confidence
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Not mapped</span>
                                )}
                              </td>
                              
                              <td className="py-4 px-4">
                                {column.dataQuality ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-600">Complete:</span>
                                      <span className="text-xs font-medium">{column.dataQuality.completeness}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-600">Unique:</span>
                                      <span className="text-xs font-medium">{column.dataQuality.uniqueness}%</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-600">Valid:</span>
                                      <span className="text-xs font-medium">{column.dataQuality.validity}%</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No data</span>
                                )}
                              </td>
                              
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-1">
                                  <Button variant="ghost" size="sm" icon={BookOpen} title="Map Term" />
                                  <Button variant="ghost" size="sm" icon={Eye} title="View Details" />
                                  <Button variant="ghost" size="sm" icon={Edit3} title="Edit" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Business Rules */}
                {tableColumns.some(col => col.businessRules && col.businessRules.length > 0) && (
                  <Card>
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Business Rules</h4>
                      <div className="space-y-4">
                        {tableColumns
                          .filter(col => col.businessRules && col.businessRules.length > 0)
                          .map(column => (
                            <div key={column.id}>
                              <h5 className="font-medium text-gray-900 mb-2">{column.columnName}</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {column.businessRules!.map((rule, index) => (
                                  <li key={index} className="text-sm text-gray-600">{rule}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              /* Table List View */
              filteredTables.map(table => (
                <Card key={table.id} hover>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
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
                          </div>
                          
                          {table.description && (
                            <p className="text-gray-600 mb-3">{table.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
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
                              <span className="text-sm text-gray-600">Last Updated:</span>
                              <p className="font-medium text-gray-900">{formatDate(table.lastUpdated)}</p>
                            </div>
                          </div>
                          
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
                          icon={Eye}
                          onClick={() => handleViewTableSchema(table)}
                        >
                          View Schema
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
                          Map Columns
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
              ))
            )}
          </div>
        )}

        {activeTab === 'columns' && (
          <div>
            {selectedTable && (
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => {
                    setSelectedTable(null);
                    setActiveTab('tables');
                  }}
                >
                  Back to Tables
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
    </div>
  );
}