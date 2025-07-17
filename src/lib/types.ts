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

// Real API Job Response Types (from AWS API)
export interface ApiJobResponse {
  textractJobId: string;
  originalName?: string;
  documentId: string;
  updatedAt: string;
  status: 'PROCESSING' | 'CLASSIFIED' | 'FAILED' | 'QUEUED' | 'COMPLETED';
  timestamp: string;
  createdAt: string;
  jobId: string;
  bucket: string;
  key: string;
  completedAt?: string;
  textractFeatures?: string[];
}

export interface JobsApiResponse {
  items: ApiJobResponse[];
}

// Converted processing job for UI (mapped from API response)
export interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
  currentStage?: 'upload' | 'classification' | 'enrichment' | 'review' | 'completed';
  textractJobId?: string;
  documentId?: string;
  bucket?: string;
  key?: string;
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
  name: string;
  type: string;
  comment: string;
  classification: string;
}

// Request and Filter types
export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface DocumentFilters {
  status?: string;
  type?: string;
  uploadedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TermFilters {
  status?: string;
  category?: string;
  sourceDocument?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Lineage types - React Flow compatible
export interface LineageNode {
  id: string;
  type?: string; // React Flow node type
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: 'document' | 'term' | 'schema' | 'connection' | 'table' | 'view' | 'dashboard' | 'notebook';
    metadata?: Record<string, any>;
    columns?: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
  };
  // React Flow specific properties
  draggable?: boolean;
  selectable?: boolean;
  deletable?: boolean;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type?: string; // React Flow edge type
  label?: string;
  data?: {
    relationship: string;
    properties?: Record<string, any>;
  };
  // React Flow specific properties  
  animated?: boolean;
  deletable?: boolean;
  style?: Record<string, any>;
  markerEnd?: string;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata?: {
    depth: number;
    direction: 'upstream' | 'downstream' | 'both';
    rootEntity: string;
  };
}

// Server response types for new lineage API contract
export interface LineageNodeData {
  id: string;
  name: string;
  type: 'table' | 'view' | 'dashboard' | 'notebook' | 'document' | 'term';
  schema?: string;
  database?: string;
  columns?: Array<{
    name: string;
    type: string;
    description?: string;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
  }>;
  metadata?: Record<string, any>;
  position?: { x: number; y: number };
}

export interface LineageEdgeData {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: 'join' | 'transformation' | 'reference' | 'dependency';
  sourceColumns?: string[];
  targetColumns?: string[];
  transformationLogic?: string;
  metadata?: Record<string, any>;
}

// New server contract types for RMI0002
export interface LineageServerNode {
  id: string;
  node_type: string; // 'table', 'column', 'business_term', etc.
  node_name: string; // e.g. 'account', 'payment'
  qualified_name: string; // e.g. 'neondb.public.account'
  metadata: Record<string, any>; // everything else (businessMetadata, etc.)
  jobId: string;
  system: string;
}

export interface LineageServerRelationship {
  relationship_id: string;
  source_node_id: string; // FK to lineage_nodes
  target_node_id: string; // FK to lineage_nodes
  relationship_type: string; // e.g. 'foreign_key', 'business_reference'
  business_rule?: Record<string, any>;
  source_meta?: Record<string, any>; // column information of source
  target_meta?: Record<string, any>; // column information of target
  confidence?: number; // confidence, if using AI
  is_verified?: boolean;
  jobId: string;
}

export interface LineageServerResponse {
  nodes: LineageServerNode[];
  edges: LineageServerRelationship[];
}

// React Flow compatible types for the new contract
export interface ReactFlowNodeData {
  label: string;
  nodeType?: 'table' | 'view' | 'dashboard' | 'notebook';
  columns?: Array<{
    name: string;
    type: string;
    classification?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface ReactFlowNodeType {
  id: string;
  type: string;
  data: ReactFlowNodeData;
  position: { x: number; y: number };
}

export interface ReactFlowEdgeType {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface ReactFlowResponse {
  nodes: ReactFlowNodeType[];
  edges: ReactFlowEdgeType[];
}

export interface LineageResponse {
  nodes: LineageNodeData[];
  relationships: LineageEdgeData[];
  metadata: {
    queryDepth: number;
    direction: 'upstream' | 'downstream' | 'both';
    rootEntityId: string;
    totalNodes: number;
    totalRelationships: number;
    timestamp: string;
  };
}

// Additional lineage types for React Flow integration
export interface TableNodeData {
  id: string;
  name: string;
  type: 'table' | 'view' | 'procedure' | 'function';
  schema?: string;
  database?: string;
  columns?: Array<{
    name: string;
    type: string;
    primaryKey?: boolean;
    nullable?: boolean;
  }>;
  description?: string;
  metadata?: Record<string, any>;
}

export interface LineageOptions {
  direction?: 'upstream' | 'downstream' | 'both';
  depth?: number;
  includeColumns?: boolean;
  excludeSystemTables?: boolean;
}
