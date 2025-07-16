// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

// Document-related types
export interface DocumentUploadRequest {
  file: File;
  metadata?: {
    description?: string;
    tags?: string[];
    category?: string;
  };
}

export interface DocumentProcessingJob {
  id: string;
  documentId: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused' | 'published';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
  currentStage?: 'upload' | 'classification' | 'enrichment' | 'review' | 'completed';
}

export interface DocumentDetails {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  extractedText?: string;
  classification?: DocumentClassification;
  processingJob?: DocumentProcessingJob;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

// Classification types
export interface DocumentClassification {
  id: string;
  documentId: string;
  documentType: {
    type: string;
    confidence: number;
  };
  businessDomain: string[];
  sections: Array<{
    name: string;
    confidence: number;
    startPage?: number;
    endPage?: number;
  }>;
  confidence: number;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isApproved?: boolean;
}

// Term-related types
export interface ExtractedTerm {
  id: string;
  term: string;
  definition: string;
  sourceSection: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  context: string;
  relatedTerms: string[];
  documentId: string;
  extractedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  schemaMapping?: SchemaMapping;
  alternativeMappings?: SchemaMapping[];
  isPreferred?: boolean;
}

export interface TermEnrichmentRequest {
  termId: string;
  updates: Partial<Pick<ExtractedTerm, 'definition' | 'category' | 'relatedTerms' | 'status'>>;
  schemaMapping?: SchemaMapping;
  reviewNotes?: string;
}

// Schema mapping types
export interface SchemaMapping {
  id?: string;
  schemaName: string;
  tableName: string;
  columnName: string;
  dataType: string;
  confidence: number;
  llmReasoning: string;
  isApproved?: boolean;
  isRejected?: boolean;
  mappedBy?: string;
  mappedAt?: string;
}

// Schema Management Types
export interface SchemaConnection {
  connectionId: string;
  name: string;
  databaseName: string;
  description?: string;
  type: 'postgresql' | 'mysql' | 'snowflake' | 'bigquery' | 'redshift' | 'oracle';
  databaseType: 'postgresql' | 'mysql' | 'snowflake' | 'bigquery' | 'redshift' | 'oracle';
  host: string;
  port?: number;
  database: string;
  username?: string;
  ssl?: boolean;
  status: 'Init' | 'syncing' | 'Synced' | 'sync failed';
  lastSync: string;
  tableCount: number;
  columnCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SchemaTable {
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

export interface SchemaColumn {
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

export interface CrawlJob {
  id: string;
  connectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalTables?: number;
  processedTables?: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  createdBy: string;
}

// Schema API Request/Response Types
export interface CreateConnectionRequest {
  name: string;
  description?: string;
  databaseType: SchemaConnection['type'];
  host: string;
  port?: number;
  databaseName: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export interface UpdateConnectionRequest {
  name?: string;
  description?: string;
  host?: string;
  port?: number;
  databaseName?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface ConnectionFilters {
  search?: string;
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface StartCrawlRequest {
  connectionId: string;
  schemas?: string[];
  tables?: string[];
}

// Latest Schema Types
export interface LatestSchemaResponse {
  connectionId: string;
  latest: boolean;
  extractionTimestamp: string;
  schemaId: string;
  statistics: {
    totalTables: number;
    totalColumns: number;
    databaseTypes: string[];
    schemaNames: string[];
    tableTypes: string[];
    databaseGroups: number;
  };
  schemas: LatestSchemaTable[];
}

export interface LatestSchemaTable {
  systemId: string;
  version: string;
  databaseName: string;
  schemaName: string;
  tableName: string;
  tableType: 'TABLE' | 'VIEW' | 'MATERIALIZED_VIEW';
  totalColumns: number;
  columns?: LatestSchemaColumn[];
  columnClassifications?: Record<string, any>;
  businessMetadata?: Record<string, any>;
  latest: boolean;
  extractionTimestamp: string;
}

export interface LatestSchemaColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
  columnPosition: number;
  precision?: number;
  scale?: number;
  maxLength?: number;
  description?: string;
  classification?: {
    type: string;
    confidence: number;
  };
}

export interface SchemaSearchFilters {
  connectionId?: string;
  tableName?: string;
  schemaName?: string;
  includeColumns?: boolean;
  includeHistorical?: boolean;
}
