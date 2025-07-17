export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processingProgress?: number;
  extractedText?: string;
  classification?: DocumentClassification;
  terms?: Term[];
}

export interface DocumentClassification {
  type: 'BRD' | 'Policy' | 'SRS' | 'Regulatory' | 'Contract' | 'Other';
  domain: 'Risk' | 'Lending' | 'Tech' | 'Compliance' | 'Legal';
  sections: string[];
  confidence: number;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  sourceSection: string;
  category: string;
  tags: string[];
  usage: string;
  confidence: number;
  status: 'auto' | 'flagged' | 'reviewed' | 'overridden';
  documentId: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  relationships?: TermRelationship[];
  mappings?: TermMapping[];
}

export interface TermRelationship {
  id: string;
  type: 'synonym' | 'child-of' | 'related-to' | 'opposite-of';
  targetTermId: string;
  targetTerm: string;
  confidence: number;
}

export interface TermMapping {
  id: string;
  type: 'maps-to' | 'derived-from';
  schemaName: string;
  tableName: string;
  columnName: string;
  confidence: number;
  verified: boolean;
}

export interface SearchResult {
  terms: Term[];
  documents: Document[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'steward' | 'analyst' | 'viewer';
  department: string;
}