import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Table, 
  Key, 
  Link, 
  Check, 
  AlertCircle,
  AlertTriangle,
  Filter,
  Eye,
  Edit3,
  Tag,
  Building,
  FileText,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader,
  Clock,
  User,
  ExternalLink,
  RefreshCw,
  ChevronUp
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface Connection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'aws-glue' | 'athena' | 'snowflake' | 'bigquery';
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  host?: string;
  database?: string;
  lastConnected?: string;
}

interface Schema {
  name: string;
  tables: Table[];
  expanded?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  rowCount?: number;
  selected?: boolean;
  metadata?: TableMetadata;
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
}

interface ForeignKey {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

interface TableMetadata {
  title?: string;
  description?: string;
  domain?: string;
  tags?: string[];
  owner?: string;
  classification?: string;
  lastImported?: string;
  importedBy?: string;
  status?: 'imported' | 'in-progress' | 'needs-metadata';
}

interface ImportedSchema {
  connectionId: string;
  connectionName: string;
  schemas: ImportedSchemaData[];
}

interface ImportedSchemaData {
  name: string;
  tables: ImportedTable[];
  expanded?: boolean;
}

interface ImportedTable {
  name: string;
  title?: string;
  domain?: string;
  tags?: string[];
  owner?: string;
  classification?: string;
  lastImported: string;
  importedBy: string;
  status: 'imported' | 'in-progress' | 'needs-metadata';
  columns?: Column[];
}

const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Production DB',
    type: 'postgresql',
    status: 'connected',
    host: 'prod-db.company.com',
    database: 'main_db',
    lastConnected: '2024-01-16T10:30:00Z'
  },
  {
    id: '2',
    name: 'Data Warehouse',
    type: 'snowflake',
    status: 'connected',
    host: 'company.snowflakecomputing.com',
    database: 'analytics',
    lastConnected: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    name: 'AWS Glue Catalog',
    type: 'aws-glue',
    status: 'disconnected',
    lastConnected: '2024-01-15T14:20:00Z'
  }
];

const mockSchemas: Schema[] = [
  {
    name: 'public',
    expanded: true,
    tables: [
      {
        name: 'customers',
        selected: true,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'first_name', type: 'VARCHAR(50)', nullable: false },
          { name: 'last_name', type: 'VARCHAR(50)', nullable: false },
          { name: 'email', type: 'VARCHAR(100)', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false }
        ],
        primaryKeys: ['id'],
        foreignKeys: [],
        rowCount: 15420,
        metadata: {
          title: 'Customer Master Data',
          description: 'Core customer information including contact details and registration data',
          domain: 'Customer Management',
          tags: ['customer', 'master-data', 'pii'],
          owner: 'Data Team',
          classification: 'Confidential'
        }
      },
      {
        name: 'orders',
        selected: true,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'customer_id', type: 'INTEGER', nullable: false, isForeignKey: true },
          { name: 'order_date', type: 'DATE', nullable: false },
          { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false },
          { name: 'status', type: 'VARCHAR(20)', nullable: false }
        ],
        primaryKeys: ['id'],
        foreignKeys: [
          { column: 'customer_id', referencedTable: 'customers', referencedColumn: 'id' }
        ],
        rowCount: 45230,
        metadata: {
          title: 'Order Transactions',
          description: 'Customer order history and transaction details',
          domain: 'Sales',
          tags: ['orders', 'transactions', 'sales'],
          owner: 'Sales Team'
        }
      },
      {
        name: 'products',
        selected: false,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)', nullable: false },
          { name: 'price', type: 'DECIMAL(8,2)', nullable: false },
          { name: 'category_id', type: 'INTEGER', nullable: true, isForeignKey: true }
        ],
        primaryKeys: ['id'],
        foreignKeys: [
          { column: 'category_id', referencedTable: 'categories', referencedColumn: 'id' }
        ],
        rowCount: 1250
      }
    ]
  },
  {
    name: 'analytics',
    expanded: false,
    tables: [
      {
        name: 'customer_metrics',
        selected: false,
        columns: [
          { name: 'customer_id', type: 'INTEGER', nullable: false },
          { name: 'total_orders', type: 'INTEGER', nullable: false },
          { name: 'lifetime_value', type: 'DECIMAL(12,2)', nullable: false }
        ],
        primaryKeys: ['customer_id'],
        foreignKeys: [],
        rowCount: 12340
      }
    ]
  }
];

const mockImportedSchemas: ImportedSchema[] = [
  {
    connectionId: '1',
    connectionName: 'Production DB',
    schemas: [
      {
        name: 'public',
        expanded: true,
        tables: [
          {
            name: 'users',
            title: 'User Accounts',
            domain: 'User Management',
            tags: ['users', 'authentication', 'pii'],
            owner: 'Security Team',
            classification: 'Confidential',
            lastImported: '2024-01-15T14:30:00Z',
            importedBy: 'John Doe',
            status: 'imported',
            columns: [
              { name: 'id', type: 'INTEGER', nullable: false, isPrimaryKey: true },
              { name: 'username', type: 'VARCHAR(50)', nullable: false },
              { name: 'email', type: 'VARCHAR(100)', nullable: false },
              { name: 'password_hash', type: 'VARCHAR(255)', nullable: false }
            ]
          },
          {
            name: 'audit_logs',
            title: 'System Audit Trail',
            domain: 'Security',
            tags: ['audit', 'logging', 'compliance'],
            owner: 'Security Team',
            classification: 'Internal',
            lastImported: '2024-01-14T09:20:00Z',
            importedBy: 'Jane Smith',
            status: 'imported'
          },
          {
            name: 'temp_imports',
            status: 'in-progress',
            lastImported: '2024-01-16T11:00:00Z',
            importedBy: 'Mike Johnson'
          }
        ]
      },
      {
        name: 'reporting',
        expanded: false,
        tables: [
          {
            name: 'daily_metrics',
            title: 'Daily Business Metrics',
            domain: 'Analytics',
            tags: ['metrics', 'reporting'],
            owner: 'Analytics Team',
            lastImported: '2024-01-13T16:45:00Z',
            importedBy: 'Sarah Wilson',
            status: 'needs-metadata'
          }
        ]
      }
    ]
  },
  {
    connectionId: '2',
    connectionName: 'Data Warehouse',
    schemas: [
      {
        name: 'dwh',
        expanded: false,
        tables: [
          {
            name: 'fact_sales',
            title: 'Sales Fact Table',
            domain: 'Sales',
            tags: ['sales', 'fact-table', 'dwh'],
            owner: 'BI Team',
            classification: 'Internal',
            lastImported: '2024-01-12T10:15:00Z',
            importedBy: 'David Kim',
            status: 'imported'
          }
        ]
      }
    ]
  }
];

export function SchemaIngestionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(mockConnections[0]);
  const [schemas, setSchemas] = useState<Schema[]>(mockSchemas);
  const [selectedTable, setSelectedTable] = useState<Table | null>(mockSchemas[0].tables[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedSchemas] = useState<ImportedSchema[]>(mockImportedSchemas);
  const [importedSchemasExpanded, setImportedSchemasExpanded] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'to-import' | 'imported'>('to-import');
  const [importedSearchQuery, setImportedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImportedTable, setSelectedImportedTable] = useState<ImportedTable | null>(null);

  const itemsPerPage = 6;

  const steps = [
    { id: 1, name: 'Connect', description: 'Connect to data source' },
    { id: 2, name: 'Select', description: 'Choose schemas and tables' },
    { id: 3, name: 'Annotate', description: 'Add metadata and import' }
  ];

  const getConnectionIcon = (type: Connection['type']) => {
    return <Database className="w-4 h-4" />;
  };

  const getConnectionStatus = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <div className="w-2 h-2 bg-emerald-500 rounded-full" />;
      case 'connecting':
        return <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getImportStatusIcon = (status: ImportedTable['status']) => {
    switch (status) {
      case 'imported':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'needs-metadata':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getImportStatusBadge = (status: ImportedTable['status']) => {
    switch (status) {
      case 'imported':
        return <Badge variant="success" size="sm">Imported</Badge>;
      case 'in-progress':
        return <Badge variant="info" size="sm">In Progress</Badge>;
      case 'needs-metadata':
        return <Badge variant="warning" size="sm">Needs Metadata</Badge>;
      default:
        return <Badge variant="default" size="sm">Unknown</Badge>;
    }
  };

  const getMetadataStatusBadge = (table: ImportedTable) => {
    if (table.status !== 'imported') return null;
    
    const hasTitle = !!table.title;
    const hasTags = table.tags && table.tags.length > 0;
    const hasOwner = !!table.owner;
    
    if (hasTitle && hasTags && hasOwner) {
      return <Badge variant="success" size="sm">✅ Annotated</Badge>;
    } else if (!hasTags) {
      return <Badge variant="warning" size="sm">⚠️ Missing Tags</Badge>;
    } else {
      return <Badge variant="default" size="sm">💤 Not Reviewed</Badge>;
    }
  };

  const toggleSchema = (schemaName: string) => {
    setSchemas(prev => prev.map(schema => 
      schema.name === schemaName 
        ? { ...schema, expanded: !schema.expanded }
        : schema
    ));
  };

  const toggleImportedSchema = (connectionId: string, schemaName: string) => {
    // This would update imported schemas expansion state
    console.log('Toggle imported schema:', connectionId, schemaName);
  };

  const toggleTableSelection = (schemaName: string, tableName: string) => {
    setSchemas(prev => prev.map(schema => 
      schema.name === schemaName
        ? {
            ...schema,
            tables: schema.tables.map(table =>
              table.name === tableName
                ? { ...table, selected: !table.selected }
                : table
            )
          }
        : schema
    ));
  };

  const updateTableMetadata = (field: keyof TableMetadata, value: string | string[]) => {
    if (!selectedTable) return;
    
    setSchemas(prev => prev.map(schema => ({
      ...schema,
      tables: schema.tables.map(table =>
        table.name === selectedTable.name
          ? {
              ...table,
              metadata: {
                ...table.metadata,
                [field]: value
              }
            }
          : table
      )
    })));

    setSelectedTable(prev => prev ? {
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    } : null);
  };

  const getSelectedTablesCount = () => {
    return schemas.reduce((count, schema) => 
      count + schema.tables.filter(table => table.selected).length, 0
    );
  };

  const getAllImportedTables = () => {
    return importedSchemas.flatMap(conn => 
      conn.schemas.flatMap(schema => 
        schema.tables.map(table => ({
          ...table,
          connectionName: conn.connectionName,
          schemaName: schema.name
        }))
      )
    );
  };

  const getFilteredImportedTables = () => {
    const allTables = getAllImportedTables();
    return allTables.filter(table => 
      table.name.toLowerCase().includes(importedSearchQuery.toLowerCase()) ||
      table.title?.toLowerCase().includes(importedSearchQuery.toLowerCase()) ||
      table.domain?.toLowerCase().includes(importedSearchQuery.toLowerCase())
    );
  };

  const getPaginatedImportedTables = () => {
    const filtered = getFilteredImportedTables();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      tables: filtered.slice(startIndex, endIndex),
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const handleImport = async () => {
    setIsImporting(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsImporting(false);
    // Show success message or redirect
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect to Data Source</h2>
              <p className="text-gray-600">Choose an existing connection or create a new one to access your database schemas.</p>
            </div>

            {showNewConnection ? (
              <Card>
                <h3 className="text-lg font-medium text-gray-900 mb-4">New Connection</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
                    <input
                      type="text"
                      placeholder="My Database"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>PostgreSQL</option>
                      <option>MySQL</option>
                      <option>AWS Glue</option>
                      <option>Amazon Athena</option>
                      <option>Snowflake</option>
                      <option>BigQuery</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                    <input
                      type="text"
                      placeholder="database_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="ghost" onClick={() => setShowNewConnection(false)}>
                    Cancel
                  </Button>
                  <Button>Test Connection</Button>
                  <Button variant="primary">Save & Connect</Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockConnections.map(connection => (
                  <Card 
                    key={connection.id} 
                    hover 
                    className={`cursor-pointer transition-all ${
                      selectedConnection?.id === connection.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getConnectionIcon(connection.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{connection.name}</h3>
                            {getConnectionStatus(connection.status)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {connection.type.toUpperCase()} • {connection.host || 'Cloud Service'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={connection.status === 'connected' ? 'success' : 'default'}>
                          {connection.status}
                        </Badge>
                        {connection.lastConnected && (
                          <p className="text-xs text-gray-500 mt-1">
                            Last: {new Date(connection.lastConnected).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Schemas and Tables</h2>
              <p className="text-gray-600">Choose which schemas and tables you want to import into the business glossary.</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveMainTab('to-import')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeMainTab === 'to-import'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🟢 To Be Imported ({getSelectedTablesCount()})
                </button>
                <button
                  onClick={() => setActiveMainTab('imported')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeMainTab === 'imported'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📄 Imported Tables ({getAllImportedTables().length})
                </button>
              </nav>
            </div>

            {activeMainTab === 'to-import' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {getSelectedTablesCount()} tables selected for import
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search for Imported Tables */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search imported tables..."
                    value={importedSearchQuery}
                    onChange={(e) => {
                      setImportedSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Imported Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedImportedTables().tables.map((table, index) => (
                    <Card 
                      key={`${table.connectionName}-${table.schemaName}-${table.name}`}
                      hover
                      className={`cursor-pointer transition-all ${
                        selectedImportedTable?.name === table.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedImportedTable(table)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getImportStatusIcon(table.status)}
                            <h3 className="font-medium text-gray-900 text-sm">
                              {table.schemaName}.{table.name}
                            </h3>
                          </div>
                          {getImportStatusBadge(table.status)}
                        </div>

                        {table.title && (
                          <p className="text-sm text-gray-600">{table.title}</p>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Connection:</span>
                            <span className="text-gray-700">{table.connectionName}</span>
                          </div>
                          
                          {table.domain && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Domain:</span>
                              <Badge variant="info" size="sm">{table.domain}</Badge>
                            </div>
                          )}
                          
                          {table.owner && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Owner:</span>
                              <span className="text-gray-700">{table.owner}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Imported:</span>
                            <span className="text-gray-700">{formatDate(table.lastImported)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">By:</span>
                            <span className="text-gray-700">{table.importedBy}</span>
                          </div>
                        </div>

                        {table.tags && table.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {table.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                            ))}
                            {table.tags.length > 3 && (
                              <Badge variant="default" size="sm">+{table.tags.length - 3}</Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {getMetadataStatusBadge(table)}
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" icon={Eye} />
                            <Button variant="ghost" size="sm" icon={RefreshCw} />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {getPaginatedImportedTables().totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getPaginatedImportedTables().totalCount)} of {getPaginatedImportedTables().totalCount} tables
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {getPaginatedImportedTables().totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(getPaginatedImportedTables().totalPages, prev + 1))}
                        disabled={currentPage === getPaginatedImportedTables().totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeMainTab === 'to-import' && (
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <Card>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Tables</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {schemas.map(schema => (
                        <div key={schema.name}>
                          <button
                            onClick={() => toggleSchema(schema.name)}
                            className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-50 rounded"
                          >
                            {schema.expanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <Database className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">{schema.name}</span>
                            <Badge variant="default" size="sm">{schema.tables.length} tables</Badge>
                          </button>
                          
                          {schema.expanded && (
                            <div className="ml-6 space-y-1">
                              {schema.tables.map(table => (
                                <div
                                  key={table.name}
                                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                                    selectedTable?.name === table.name ? 'bg-blue-50' : ''
                                  }`}
                                  onClick={() => setSelectedTable(table)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={table.selected || false}
                                    onChange={() => toggleTableSelection(schema.name, table.name)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Table className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-700">{table.name}</span>
                                  {table.rowCount && (
                                    <span className="text-xs text-gray-500">({table.rowCount.toLocaleString()} rows)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div>
                  <Card>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Table Preview</h3>
                    {selectedTable ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{selectedTable.name}</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {selectedTable.columns.length} columns • {selectedTable.rowCount?.toLocaleString()} rows
                          </p>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedTable.columns.map(column => (
                            <div key={column.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center space-x-2">
                                {column.isPrimaryKey && <Key className="w-3 h-3 text-amber-500" />}
                                {column.isForeignKey && <Link className="w-3 h-3 text-blue-500" />}
                                <span className="font-mono text-sm text-gray-900">{column.name}</span>
                              </div>
                              <span className="text-xs text-gray-500">{column.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Table className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Select a table to preview</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Annotate and Import</h2>
              <p className="text-gray-600">Add metadata to your selected tables before importing them into the business glossary.</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <Card>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Tables</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {schemas.flatMap(schema => 
                      schema.tables.filter(table => table.selected).map(table => (
                        <div
                          key={table.name}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTable?.name === table.name 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTable(table)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Table className="w-4 h-4 text-gray-400" />
                              <div>
                                <h4 className="font-medium text-gray-900">{table.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {table.columns.length} columns • {table.rowCount?.toLocaleString()} rows
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {table.metadata?.title ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                              )}
                              <Badge variant={table.metadata?.title ? 'success' : 'warning'} size="sm">
                                {table.metadata?.title ? 'Annotated' : 'Needs Metadata'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <Card>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Table Metadata</h3>
                  {selectedTable ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FileText className="w-4 h-4 inline mr-1" />
                          Title
                        </label>
                        <input
                          type="text"
                          value={selectedTable.metadata?.title || ''}
                          onChange={(e) => updateTableMetadata('title', e.target.value)}
                          placeholder="Enter a descriptive title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Edit3 className="w-4 h-4 inline mr-1" />
                          Description
                        </label>
                        <textarea
                          value={selectedTable.metadata?.description || ''}
                          onChange={(e) => updateTableMetadata('description', e.target.value)}
                          placeholder="Describe the purpose and content of this table"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Building className="w-4 h-4 inline mr-1" />
                          Business Domain
                        </label>
                        <select
                          value={selectedTable.metadata?.domain || ''}
                          onChange={(e) => updateTableMetadata('domain', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select domain</option>
                          <option value="Customer Management">Customer Management</option>
                          <option value="Sales">Sales</option>
                          <option value="Finance">Finance</option>
                          <option value="Operations">Operations</option>
                          <option value="Analytics">Analytics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Tag className="w-4 h-4 inline mr-1" />
                          Tags
                        </label>
                        <input
                          type="text"
                          value={selectedTable.metadata?.tags?.join(', ') || ''}
                          onChange={(e) => updateTableMetadata('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                          placeholder="customer, master-data, pii"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                        <input
                          type="text"
                          value={selectedTable.metadata?.owner || ''}
                          onChange={(e) => updateTableMetadata('owner', e.target.value)}
                          placeholder="Data Team"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                        <select
                          value={selectedTable.metadata?.classification || ''}
                          onChange={(e) => updateTableMetadata('classification', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select classification</option>
                          <option value="Public">Public</option>
                          <option value="Internal">Internal</option>
                          <option value="Confidential">Confidential</option>
                          <option value="Restricted">Restricted</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Edit3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Select a table to add metadata</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schema Ingestion</h1>
            <p className="text-gray-600 mt-1">Import database schemas into your business glossary</p>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  currentStep === step.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : currentStep > step.id 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === step.id 
                      ? 'bg-blue-600 text-white' 
                      : currentStep > step.id 
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-xs">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Connection Status */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Connections</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                icon={Plus}
                onClick={() => setShowNewConnection(true)}
              >
                New
              </Button>
            </div>
            
            {selectedConnection && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  {getConnectionStatus(selectedConnection.status)}
                  <span className="font-medium text-gray-900">{selectedConnection.name}</span>
                </div>
                <p className="text-xs text-gray-500">{selectedConnection.type.toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search schemas and tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Schema Browser */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Schema Browser</h4>
              {currentStep >= 2 && selectedConnection ? (
                <div className="space-y-2">
                  {schemas.map(schema => (
                    <div key={schema.name}>
                      <button
                        onClick={() => toggleSchema(schema.name)}
                        className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-50 rounded"
                      >
                        {schema.expanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <Database className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900">{schema.name}</span>
                      </button>
                      
                      {schema.expanded && (
                        <div className="ml-6 space-y-1">
                          {schema.tables.map(table => (
                            <div
                              key={table.name}
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${
                                selectedTable?.name === table.name ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => setSelectedTable(table)}
                            >
                              <Table className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 text-sm">{table.name}</span>
                              {table.selected && (
                                <Check className="w-3 h-3 text-emerald-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Connect to a data source to browse schemas</p>
                </div>
              )}
            </div>

            {/* Imported Schemas Section */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => setImportedSchemasExpanded(!importedSchemasExpanded)}
                className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 rounded p-2"
              >
                <h4 className="font-medium text-gray-900 flex items-center">
                  📂 Imported Schemas
                </h4>
                {importedSchemasExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {importedSchemasExpanded && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {importedSchemas.map(connection => (
                    <div key={connection.connectionId}>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-sm">
                        <Database className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">{connection.connectionName}</span>
                      </div>
                      
                      {connection.schemas.map(schema => (
                        <div key={schema.name} className="ml-4">
                          <button
                            onClick={() => toggleImportedSchema(connection.connectionId, schema.name)}
                            className="flex items-center space-x-2 w-full text-left p-1 hover:bg-gray-50 rounded text-sm"
                          >
                            {schema.expanded ? (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            )}
                            <span className="text-gray-600">{schema.name}</span>
                          </button>
                          
                          {schema.expanded && (
                            <div className="ml-6 space-y-1">
                              {schema.tables.map(table => (
                                <div
                                  key={table.name}
                                  className="flex items-center justify-between p-1 hover:bg-gray-50 rounded cursor-pointer"
                                  title={`Imported ${formatDate(table.lastImported)} by ${table.importedBy}`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {getImportStatusIcon(table.status)}
                                    <span className="text-gray-600 text-xs">{table.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-3">
                {currentStep === 3 && (
                  <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={isImporting || getSelectedTablesCount() === 0}
                    className="flex items-center space-x-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Import Schema ({getSelectedTablesCount()} tables)</span>
                      </>
                    )}
                  </Button>
                )}
                
                {currentStep < 3 && (
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                    disabled={
                      (currentStep === 1 && !selectedConnection) ||
                      (currentStep === 2 && getSelectedTablesCount() === 0)
                    }
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}