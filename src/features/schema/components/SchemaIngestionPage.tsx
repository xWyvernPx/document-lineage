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
  description?: string;
  type: 'postgresql' | 'mysql' | 'snowflake' | 'bigquery' | 'redshift' | 'oracle';
  host: string;
  database: string;
  status: 'Init' | 'syncing' | 'Synced' | 'sync failed';
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
    status: 'Synced',
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
    status: 'sync failed',
    lastSync: '2024-01-15T16:20:00Z',
    tableCount: 156,
    columnCount: 892,
    createdBy: 'Emily Rodriguez',
    createdAt: '2024-01-08T11:15:00Z'
  },
  {
    id: '4',
    name: 'Financial Transactions',
    type: 'oracle',
    host: 'fin-db.company.com',
    database: 'FINANCE_PROD',
    status: 'Synced',
    lastSync: '2024-01-16T11:15:00Z',
    tableCount: 134,
    columnCount: 1023,
    createdBy: 'David Kim',
    createdAt: '2024-01-05T08:30:00Z'
  },
  {
    id: '5',
    name: 'Marketing Analytics',
    type: 'redshift',
    host: 'marketing-cluster.company.com',
    database: 'MARKETING_DW',
    status: 'Synced',
    lastSync: '2024-01-16T08:20:00Z',
    tableCount: 78,
    columnCount: 445,
    createdBy: 'Lisa Wang',
    createdAt: '2024-01-09T13:45:00Z'
  },
  {
    id: '6',
    name: 'Inventory Management',
    type: 'mysql',
    host: 'inventory-db.company.com',
    database: 'inventory_system',
    status: 'Init',
    lastSync: '2024-01-14T22:10:00Z',
    tableCount: 45,
    columnCount: 234,
    createdBy: 'Robert Martinez',
    createdAt: '2024-01-11T16:20:00Z'
  },
  {
    id: '7',
    name: 'HR Management System',
    type: 'postgresql',
    host: 'hr-db.company.com',
    database: 'hr_management',
    status: 'Synced',
    lastSync: '2024-01-16T07:30:00Z',
    tableCount: 67,
    columnCount: 389,
    createdBy: 'Jennifer Lee',
    createdAt: '2024-01-07T10:15:00Z'
  },
  {
    id: '8',
    name: 'E-commerce Platform',
    type: 'mysql',
    host: 'ecommerce-db.company.com',
    database: 'ecommerce_prod',
    status: 'syncing',
    lastSync: '2024-01-16T12:45:00Z',
    tableCount: 112,
    columnCount: 678,
    createdBy: 'Alex Thompson',
    createdAt: '2024-01-13T09:30:00Z'
  }
];

const mockTables: SchemaTable[] = [
  // Production Data Warehouse Tables
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
  },
  {
    id: '4',
    connectionId: '1',
    schemaName: 'finance',
    tableName: 'transactions',
    tableType: 'table',
    columnCount: 18,
    rowCount: 892345,
    description: 'Financial transaction records with payment processing details',
    lastUpdated: '2024-01-16T10:45:00Z',
    isIngested: true,
    mappedTerms: 14,
    owner: 'finance_team',
    primaryKeys: ['transaction_id'],
    foreignKeys: [
      { column: 'customer_id', referencedTable: 'customers', referencedColumn: 'customer_id' },
      { column: 'account_id', referencedTable: 'accounts', referencedColumn: 'account_id' }
    ],
    indexes: [
      { name: 'idx_transaction_date', columns: ['transaction_date'], isUnique: false },
      { name: 'idx_transaction_amount', columns: ['amount'], isUnique: false }
    ]
  },
  {
    id: '5',
    connectionId: '1',
    schemaName: 'inventory',
    tableName: 'products',
    tableType: 'table',
    columnCount: 14,
    rowCount: 12345,
    description: 'Product catalog with inventory and pricing information',
    lastUpdated: '2024-01-16T09:30:00Z',
    isIngested: true,
    mappedTerms: 10,
    owner: 'inventory_team',
    primaryKeys: ['product_id'],
    foreignKeys: [
      { column: 'category_id', referencedTable: 'categories', referencedColumn: 'category_id' },
      { column: 'supplier_id', referencedTable: 'suppliers', referencedColumn: 'supplier_id' }
    ]
  },
  // Customer Database Tables
  {
    id: '6',
    connectionId: '2',
    schemaName: 'public',
    tableName: 'user_profiles',
    tableType: 'table',
    columnCount: 16,
    rowCount: 125000,
    description: 'User profile information with preferences and settings',
    lastUpdated: '2024-01-16T09:45:00Z',
    isIngested: true,
    mappedTerms: 12,
    owner: 'customer_support',
    primaryKeys: ['user_id'],
    foreignKeys: [
      { column: 'subscription_id', referencedTable: 'subscriptions', referencedColumn: 'id' }
    ]
  },
  {
    id: '7',
    connectionId: '2',
    schemaName: 'public',
    tableName: 'subscriptions',
    tableType: 'table',
    columnCount: 9,
    rowCount: 45678,
    description: 'Customer subscription plans and billing information',
    lastUpdated: '2024-01-16T08:15:00Z',
    isIngested: true,
    mappedTerms: 7,
    owner: 'billing_team',
    primaryKeys: ['id'],
    foreignKeys: [
      { column: 'plan_id', referencedTable: 'plans', referencedColumn: 'id' }
    ]
  },
  // Analytics Platform Tables
  {
    id: '8',
    connectionId: '3',
    schemaName: 'analytics',
    tableName: 'page_views',
    tableType: 'table',
    columnCount: 12,
    rowCount: 5678901,
    description: 'Website page view tracking and analytics data',
    lastUpdated: '2024-01-16T07:30:00Z',
    isIngested: true,
    mappedTerms: 9,
    owner: 'analytics_team',
    primaryKeys: ['view_id'],
    foreignKeys: [
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'user_id' },
      { column: 'page_id', referencedTable: 'pages', referencedColumn: 'page_id' }
    ]
  },
  {
    id: '9',
    connectionId: '3',
    schemaName: 'analytics',
    tableName: 'conversion_events',
    tableType: 'table',
    columnCount: 11,
    rowCount: 234567,
    description: 'Conversion tracking events and funnel analysis data',
    lastUpdated: '2024-01-16T06:45:00Z',
    isIngested: true,
    mappedTerms: 8,
    owner: 'marketing_team',
    primaryKeys: ['event_id'],
    foreignKeys: [
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'user_id' },
      { column: 'campaign_id', referencedTable: 'campaigns', referencedColumn: 'campaign_id' }
    ]
  },
  // Financial Transactions Tables
  {
    id: '10',
    connectionId: '4',
    schemaName: 'FINANCE',
    tableName: 'PAYMENT_TRANSACTIONS',
    tableType: 'table',
    columnCount: 20,
    rowCount: 3456789,
    description: 'Payment processing transactions with full audit trail',
    lastUpdated: '2024-01-16T11:15:00Z',
    isIngested: true,
    mappedTerms: 16,
    owner: 'FINANCE_ADMIN',
    primaryKeys: ['TRANSACTION_ID'],
    foreignKeys: [
      { column: 'ACCOUNT_ID', referencedTable: 'ACCOUNTS', referencedColumn: 'ACCOUNT_ID' },
      { column: 'MERCHANT_ID', referencedTable: 'MERCHANTS', referencedColumn: 'MERCHANT_ID' }
    ],
    indexes: [
      { name: 'IDX_TRANSACTION_DATE', columns: ['TRANSACTION_DATE'], isUnique: false },
      { name: 'IDX_TRANSACTION_STATUS', columns: ['STATUS'], isUnique: false }
    ]
  },
  {
    id: '11',
    connectionId: '4',
    schemaName: 'FINANCE',
    tableName: 'ACCOUNTS',
    tableType: 'table',
    columnCount: 15,
    rowCount: 123456,
    description: 'Customer account information and balance details',
    lastUpdated: '2024-01-16T10:30:00Z',
    isIngested: true,
    mappedTerms: 12,
    owner: 'FINANCE_ADMIN',
    primaryKeys: ['ACCOUNT_ID'],
    foreignKeys: [
      { column: 'CUSTOMER_ID', referencedTable: 'CUSTOMERS', referencedColumn: 'CUSTOMER_ID' }
    ]
  },
  // Marketing Analytics Tables
  {
    id: '12',
    connectionId: '5',
    schemaName: 'marketing',
    tableName: 'campaign_performance',
    tableType: 'table',
    columnCount: 13,
    rowCount: 45678,
    description: 'Marketing campaign performance metrics and KPIs',
    lastUpdated: '2024-01-16T08:20:00Z',
    isIngested: true,
    mappedTerms: 10,
    owner: 'marketing_analytics',
    primaryKeys: ['campaign_id', 'date'],
    foreignKeys: [
      { column: 'campaign_id', referencedTable: 'campaigns', referencedColumn: 'campaign_id' }
    ]
  },
  {
    id: '13',
    connectionId: '5',
    schemaName: 'marketing',
    tableName: 'customer_segments',
    tableType: 'view',
    columnCount: 8,
    description: 'Customer segmentation analysis view',
    lastUpdated: '2024-01-16T07:15:00Z',
    isIngested: false,
    mappedTerms: 0,
    owner: 'marketing_analytics'
  },
  // Inventory Management Tables
  {
    id: '14',
    connectionId: '6',
    schemaName: 'inventory',
    tableName: 'stock_levels',
    tableType: 'table',
    columnCount: 11,
    rowCount: 23456,
    description: 'Current stock levels and inventory tracking',
    lastUpdated: '2024-01-14T22:10:00Z',
    isIngested: true,
    mappedTerms: 8,
    owner: 'inventory_admin',
    primaryKeys: ['product_id', 'warehouse_id'],
    foreignKeys: [
      { column: 'product_id', referencedTable: 'products', referencedColumn: 'product_id' },
      { column: 'warehouse_id', referencedTable: 'warehouses', referencedColumn: 'warehouse_id' }
    ]
  },
  // HR Management Tables
  {
    id: '15',
    connectionId: '7',
    schemaName: 'hr',
    tableName: 'employees',
    tableType: 'table',
    columnCount: 18,
    rowCount: 2345,
    description: 'Employee master data with personal and employment information',
    lastUpdated: '2024-01-16T07:30:00Z',
    isIngested: true,
    mappedTerms: 14,
    owner: 'hr_admin',
    primaryKeys: ['employee_id'],
    foreignKeys: [
      { column: 'department_id', referencedTable: 'departments', referencedColumn: 'department_id' },
      { column: 'manager_id', referencedTable: 'employees', referencedColumn: 'employee_id' }
    ],
    indexes: [
      { name: 'idx_employee_email', columns: ['email'], isUnique: true },
      { name: 'idx_employee_name', columns: ['first_name', 'last_name'], isUnique: false }
    ]
  },
  {
    id: '16',
    connectionId: '7',
    schemaName: 'hr',
    tableName: 'payroll',
    tableType: 'table',
    columnCount: 12,
    rowCount: 2345,
    description: 'Payroll processing and salary information',
    lastUpdated: '2024-01-16T06:45:00Z',
    isIngested: true,
    mappedTerms: 9,
    owner: 'payroll_admin',
    primaryKeys: ['payroll_id'],
    foreignKeys: [
      { column: 'employee_id', referencedTable: 'employees', referencedColumn: 'employee_id' }
    ]
  },
  // E-commerce Tables
  {
    id: '17',
    connectionId: '8',
    schemaName: 'ecommerce',
    tableName: 'orders',
    tableType: 'table',
    columnCount: 16,
    rowCount: 123456,
    description: 'E-commerce order processing and fulfillment data',
    lastUpdated: '2024-01-16T12:45:00Z',
    isIngested: true,
    mappedTerms: 13,
    owner: 'ecommerce_admin',
    primaryKeys: ['order_id'],
    foreignKeys: [
      { column: 'customer_id', referencedTable: 'customers', referencedColumn: 'customer_id' },
      { column: 'shipping_address_id', referencedTable: 'addresses', referencedColumn: 'address_id' }
    ]
  },
  {
    id: '18',
    connectionId: '8',
    schemaName: 'ecommerce',
    tableName: 'order_items',
    tableType: 'table',
    columnCount: 10,
    rowCount: 456789,
    description: 'Individual items within e-commerce orders',
    lastUpdated: '2024-01-16T12:30:00Z',
    isIngested: true,
    mappedTerms: 7,
    owner: 'ecommerce_admin',
    primaryKeys: ['order_item_id'],
    foreignKeys: [
      { column: 'order_id', referencedTable: 'orders', referencedColumn: 'order_id' },
      { column: 'product_id', referencedTable: 'products', referencedColumn: 'product_id' }
    ]
  }
];

const mockColumns: SchemaColumn[] = [
  // Customer table columns
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
  },
  // Orders table columns
  {
    id: '9',
    tableId: '2',
    columnName: 'order_id',
    dataType: 'BIGINT',
    isNullable: false,
    isPrimaryKey: true,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Unique identifier for each order',
    mappedTerm: {
      termId: 'term_7',
      termName: 'Order Identifier',
      confidence: 0.96,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 100,
      validity: 100
    }
  },
  {
    id: '10',
    tableId: '2',
    columnName: 'customer_id',
    dataType: 'INTEGER',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: true,
    isUnique: false,
    hasIndex: true,
    description: 'Reference to customer who placed the order',
    mappedTerm: {
      termId: 'term_1',
      termName: 'Customer Identifier',
      confidence: 0.95,
      isVerified: true
    },
    dataQuality: {
      completeness: 99.8,
      uniqueness: 45.6,
      validity: 99.9
    }
  },
  {
    id: '11',
    tableId: '2',
    columnName: 'order_date',
    dataType: 'TIMESTAMP',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Date and time when order was placed',
    mappedTerm: {
      termId: 'term_8',
      termName: 'Order Date',
      confidence: 0.94,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 23.4,
      validity: 99.8
    }
  },
  {
    id: '12',
    tableId: '2',
    columnName: 'total_amount',
    dataType: 'DECIMAL',
    precision: 10,
    scale: 2,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Total order amount including tax and shipping',
    mappedTerm: {
      termId: 'term_9',
      termName: 'Order Total',
      confidence: 0.93,
      isVerified: true
    },
    businessRules: ['Must be greater than 0', 'Includes tax and shipping'],
    dataQuality: {
      completeness: 99.9,
      uniqueness: 92.3,
      validity: 99.2
    }
  },
  {
    id: '13',
    tableId: '2',
    columnName: 'status',
    dataType: 'VARCHAR',
    maxLength: 20,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    defaultValue: "'pending'",
    description: 'Current status of the order',
    mappedTerm: {
      termId: 'term_10',
      termName: 'Order Status',
      confidence: 0.91,
      isVerified: true
    },
    businessRules: ['Must be one of: pending, confirmed, shipped, delivered, cancelled'],
    dataQuality: {
      completeness: 100,
      uniqueness: 5.2,
      validity: 99.2
    }
  },
  // Financial Transactions columns
  {
    id: '14',
    tableId: '10',
    columnName: 'TRANSACTION_ID',
    dataType: 'NUMBER',
    precision: 15,
    scale: 0,
    isNullable: false,
    isPrimaryKey: true,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Unique transaction identifier',
    mappedTerm: {
      termId: 'term_11',
      termName: 'Transaction Identifier',
      confidence: 0.97,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 100,
      validity: 100
    }
  },
  {
    id: '15',
    tableId: '10',
    columnName: 'ACCOUNT_ID',
    dataType: 'NUMBER',
    precision: 12,
    scale: 0,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: true,
    isUnique: false,
    hasIndex: true,
    description: 'Reference to customer account',
    mappedTerm: {
      termId: 'term_12',
      termName: 'Account Identifier',
      confidence: 0.95,
      isVerified: true
    },
    dataQuality: {
      completeness: 99.9,
      uniqueness: 34.2,
      validity: 99.8
    }
  },
  {
    id: '16',
    tableId: '10',
    columnName: 'TRANSACTION_AMOUNT',
    dataType: 'NUMBER',
    precision: 12,
    scale: 2,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Transaction amount in currency',
    mappedTerm: {
      termId: 'term_13',
      termName: 'Transaction Amount',
      confidence: 0.94,
      isVerified: true
    },
    businessRules: ['Must be greater than 0', 'Maximum 999999999.99'],
    dataQuality: {
      completeness: 99.8,
      uniqueness: 95.6,
      validity: 99.3
    }
  },
  {
    id: '17',
    tableId: '10',
    columnName: 'TRANSACTION_DATE',
    dataType: 'DATE',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Date when transaction occurred',
    mappedTerm: {
      termId: 'term_14',
      termName: 'Transaction Date',
      confidence: 0.96,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 67.8,
      validity: 99.9
    }
  },
  {
    id: '18',
    tableId: '10',
    columnName: 'STATUS',
    dataType: 'VARCHAR2',
    maxLength: 15,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    defaultValue: "'PENDING'",
    description: 'Transaction processing status',
    mappedTerm: {
      termId: 'term_15',
      termName: 'Transaction Status',
      confidence: 0.92,
      isVerified: true
    },
    businessRules: ['Must be one of: PENDING, APPROVED, DECLINED, CANCELLED'],
    dataQuality: {
      completeness: 100,
      uniqueness: 4.1,
      validity: 99.1
    }
  },
  // Employee table columns
  {
    id: '19',
    tableId: '15',
    columnName: 'employee_id',
    dataType: 'INTEGER',
    isNullable: false,
    isPrimaryKey: true,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Unique employee identifier',
    mappedTerm: {
      termId: 'term_16',
      termName: 'Employee Identifier',
      confidence: 0.96,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 100,
      validity: 100
    }
  },
  {
    id: '20',
    tableId: '15',
    columnName: 'first_name',
    dataType: 'VARCHAR',
    maxLength: 50,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Employee first name',
    mappedTerm: {
      termId: 'term_2',
      termName: 'First Name',
      confidence: 0.93,
      isVerified: true
    },
    businessRules: ['Must contain only alphabetic characters', 'Maximum 50 characters'],
    dataQuality: {
      completeness: 99.5,
      uniqueness: 42.1,
      validity: 98.3
    }
  },
  {
    id: '21',
    tableId: '15',
    columnName: 'last_name',
    dataType: 'VARCHAR',
    maxLength: 50,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Employee last name',
    mappedTerm: {
      termId: 'term_3',
      termName: 'Last Name',
      confidence: 0.92,
      isVerified: true
    },
    businessRules: ['Must contain only alphabetic characters', 'Maximum 50 characters'],
    dataQuality: {
      completeness: 99.8,
      uniqueness: 18.7,
      validity: 97.9
    }
  },
  {
    id: '22',
    tableId: '15',
    columnName: 'email',
    dataType: 'VARCHAR',
    maxLength: 255,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Employee email address',
    mappedTerm: {
      termId: 'term_4',
      termName: 'Email Address',
      confidence: 0.97,
      isVerified: true
    },
    businessRules: ['Must be valid email format', 'Must be unique across all employees'],
    dataQuality: {
      completeness: 98.2,
      uniqueness: 100,
      validity: 95.8
    }
  },
  {
    id: '23',
    tableId: '15',
    columnName: 'hire_date',
    dataType: 'DATE',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    description: 'Date when employee was hired',
    mappedTerm: {
      termId: 'term_17',
      termName: 'Hire Date',
      confidence: 0.94,
      isVerified: true
    },
    businessRules: ['Must be a valid date', 'Cannot be in the future'],
    dataQuality: {
      completeness: 100,
      uniqueness: 12.4,
      validity: 99.7
    }
  },
  {
    id: '24',
    tableId: '15',
    columnName: 'salary',
    dataType: 'DECIMAL',
    precision: 10,
    scale: 2,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Employee annual salary',
    mappedTerm: {
      termId: 'term_18',
      termName: 'Annual Salary',
      confidence: 0.89,
      isVerified: false
    },
    businessRules: ['Must be greater than 0', 'Maximum 999999.99'],
    dataQuality: {
      completeness: 95.6,
      uniqueness: 78.9,
      validity: 98.4
    }
  },
  // E-commerce order columns
  {
    id: '25',
    tableId: '17',
    columnName: 'order_id',
    dataType: 'BIGINT',
    isNullable: false,
    isPrimaryKey: true,
    isForeignKey: false,
    isUnique: true,
    hasIndex: true,
    description: 'Unique e-commerce order identifier',
    mappedTerm: {
      termId: 'term_19',
      termName: 'E-commerce Order ID',
      confidence: 0.95,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 100,
      validity: 100
    }
  },
  {
    id: '26',
    tableId: '17',
    columnName: 'customer_id',
    dataType: 'INTEGER',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: true,
    isUnique: false,
    hasIndex: true,
    description: 'Reference to customer who placed the order',
    mappedTerm: {
      termId: 'term_1',
      termName: 'Customer Identifier',
      confidence: 0.94,
      isVerified: true
    },
    dataQuality: {
      completeness: 99.7,
      uniqueness: 43.2,
      validity: 99.8
    }
  },
  {
    id: '27',
    tableId: '17',
    columnName: 'order_total',
    dataType: 'DECIMAL',
    precision: 10,
    scale: 2,
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Total order amount including tax and shipping',
    mappedTerm: {
      termId: 'term_20',
      termName: 'Order Total',
      confidence: 0.91,
      isVerified: true
    },
    businessRules: ['Must be greater than 0', 'Includes tax and shipping'],
    dataQuality: {
      completeness: 99.9,
      uniqueness: 92.3,
      validity: 99.2
    }
  },
  {
    id: '28',
    tableId: '17',
    columnName: 'shipping_address',
    dataType: 'TEXT',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: false,
    description: 'Shipping address for the order',
    mappedTerm: {
      termId: 'term_21',
      termName: 'Shipping Address',
      confidence: 0.88,
      isVerified: false
    },
    businessRules: ['Must contain valid address format'],
    dataQuality: {
      completeness: 98.4,
      uniqueness: 67.8,
      validity: 94.6
    }
  },
  {
    id: '29',
    tableId: '17',
    columnName: 'order_status',
    dataType: 'ENUM',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    defaultValue: "'pending'",
    description: 'Current status of the e-commerce order',
    mappedTerm: {
      termId: 'term_22',
      termName: 'E-commerce Order Status',
      confidence: 0.93,
      isVerified: true
    },
    businessRules: ['Must be one of: pending, processing, shipped, delivered, cancelled, refunded'],
    dataQuality: {
      completeness: 100,
      uniqueness: 6.7,
      validity: 99.4
    }
  },
  {
    id: '30',
    tableId: '17',
    columnName: 'created_at',
    dataType: 'TIMESTAMP',
    isNullable: false,
    isPrimaryKey: false,
    isForeignKey: false,
    isUnique: false,
    hasIndex: true,
    defaultValue: 'CURRENT_TIMESTAMP',
    description: 'Timestamp when order was created',
    mappedTerm: {
      termId: 'term_23',
      termName: 'Order Creation Timestamp',
      confidence: 0.96,
      isVerified: true
    },
    dataQuality: {
      completeness: 100,
      uniqueness: 99.9,
      validity: 100
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
      case 'Synced':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'sync failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Init':
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: SchemaConnection['status']) => {
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
    <div className="min-h-screen bg-gray-50 p-6">
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
      <div className="max-w-7xl mx-auto mb-6 mt-6">
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
      <div className="max-w-7xl mx-auto border-b border-gray-200">
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
                        <option value="Init">Init</option>
                        <option value="syncing">Syncing</option>
                        <option value="Synced">Synced</option>
                        <option value="sync failed">Sync Failed</option>
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
                        ? `Schema: ${selectedTable.schemaName.toLowerCase()}.${selectedTable.tableName.toLowerCase()}`
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
                            {selectedTable.schemaName.toLowerCase()}.{selectedTable.tableName.toLowerCase()}
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
                                    <div className="font-medium text-gray-900">{column.columnName.toLowerCase()}</div>
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
                              {table.schemaName.toLowerCase()}.{table.tableName.toLowerCase()}
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
                  Columns in {selectedTable.schemaName.toLowerCase()}.{selectedTable.tableName.toLowerCase()}
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
                      ? `Column mapping for ${selectedTable.tableName.toLowerCase()} will be displayed here`
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