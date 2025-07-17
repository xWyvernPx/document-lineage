import { 
  ApiResponse, 
  DocumentDetails, 
  DocumentUploadRequest, 
  DocumentProcessingJob,
  ExtractedTerm,
  TermEnrichmentRequest,
  DocumentClassification,
  LineageGraph,
  SchemaConnection,
  SchemaTable,
  DocumentFilters,
  TermFilters,
  PaginatedRequest
} from './types';

// Import existing mock data
import napasTermsData from '../data/napas-ach-terms.json';
import { allNapasDocuments } from '../data/napas-documents';

/**
 * Mock API service that simulates real API responses using existing mock data
 * This allows development to continue while the real backend is being built
 */
export class MockApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      data,
      success: true,
      timestamp: new Date().toISOString(),
      message,
    };
  }

  // Document methods
  async uploadDocument(request: DocumentUploadRequest): Promise<ApiResponse<DocumentDetails>> {
    await this.delay(1000); // Simulate upload time
    
    const document: DocumentDetails = {
      id: this.generateId(),
      name: request.file.name,
      type: request.file.name.endsWith('.pdf') ? 'pdf' : 
            request.file.name.endsWith('.docx') ? 'docx' : 'image',
      size: request.file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'current-user',
      status: 'processing',
    };

    return this.createSuccessResponse(document, 'Document uploaded successfully');
  }

  async getDocuments(filters?: DocumentFilters, pagination?: PaginatedRequest): Promise<ApiResponse<DocumentDetails[]>> {
    await this.delay();
    
    // Convert NAPAS documents to DocumentDetails format
    const documents: DocumentDetails[] = allNapasDocuments.map((doc, index) => ({
      id: `doc-${index + 1}`,
      name: doc.name,
      type: 'pdf',
      size: Math.floor(Math.random() * 10000000) + 1000000,
      uploadedAt: doc.lastModified || new Date().toISOString(),
      uploadedBy: doc.author || 'system',
      status: 'completed',
      downloadUrl: `/mock/documents/doc-${index + 1}/download`,
      thumbnailUrl: `/mock/documents/doc-${index + 1}/thumbnail`,
    }));

    // Apply filters (simplified)
    let filteredDocs = documents;
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const start = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(start, start + limit);

    return this.createSuccessResponse(paginatedDocs);
  }

  async getDocument(id: string): Promise<ApiResponse<DocumentDetails>> {
    await this.delay();
    
    const index = parseInt(id.replace('doc-', '')) - 1;
    const doc = allNapasDocuments[index];
    
    if (!doc) {
      throw new Error('Document not found');
    }

    const document: DocumentDetails = {
      id,
      name: doc.name,
      type: 'pdf',
      size: Math.floor(Math.random() * 10000000) + 1000000,
      uploadedAt: doc.lastModified || new Date().toISOString(),
      uploadedBy: doc.author || 'system',
      status: 'completed',
      extractedText: `Extracted text content from ${doc.name}...`,
      downloadUrl: `/mock/documents/${id}/download`,
      thumbnailUrl: `/mock/documents/${id}/thumbnail`,
    };

    return this.createSuccessResponse(document);
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    return this.createSuccessResponse(undefined, 'Document deleted successfully');
  }

  // Processing job methods
  async getProcessingJobs(): Promise<ApiResponse<DocumentProcessingJob[]>> {
    await this.delay();
    
    const jobs: DocumentProcessingJob[] = allNapasDocuments.slice(0, 5).map((doc, index) => ({
      id: `job-${index + 1}`,
      documentId: `doc-${index + 1}`,
      documentName: doc.name,
      type: 'pdf',
      status: ['completed', 'processing', 'queued', 'failed'][index % 4] as any,
      progress: index === 1 ? 65 : 100,
      submittedAt: new Date(Date.now() - index * 3600000).toISOString(),
      submittedBy: doc.author || 'system',
      completedAt: index !== 1 ? new Date(Date.now() - index * 1800000).toISOString() : undefined,
      extractedTerms: Math.floor(Math.random() * 50) + 10,
      size: Math.floor(Math.random() * 10000000) + 1000000,
      currentStage: index === 1 ? 'enrichment' : 'completed',
    }));

    return this.createSuccessResponse(jobs);
  }

  async getProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    await this.delay();
    
    const jobs = await this.getProcessingJobs();
    const job = jobs.data.find(j => j.id === id);
    
    if (!job) {
      throw new Error('Processing job not found');
    }

    return this.createSuccessResponse(job);
  }

  async pauseProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    await this.delay();
    const job = (await this.getProcessingJob(id)).data;
    job.status = 'paused';
    return this.createSuccessResponse(job, 'Job paused successfully');
  }

  async resumeProcessingJob(id: string): Promise<ApiResponse<DocumentProcessingJob>> {
    await this.delay();
    const job = (await this.getProcessingJob(id)).data;
    job.status = 'processing';
    return this.createSuccessResponse(job, 'Job resumed successfully');
  }

  async cancelProcessingJob(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    return this.createSuccessResponse(undefined, 'Job cancelled successfully');
  }

  // Terms methods
  async getTerms(filters?: TermFilters, pagination?: PaginatedRequest): Promise<ApiResponse<ExtractedTerm[]>> {
    await this.delay();
    
    // Convert NAPAS terms data to ExtractedTerm format
    const allTerms = napasTermsData.flatMap((section, sectionIndex) => 
      section.terms.map((term, termIndex) => ({
        id: `term-${sectionIndex}-${termIndex}`,
        term: term.term,
        definition: term.definition,
        sourceSection: term.sourceSection,
        category: term.relatedTerms?.[0] || 'Business',
        confidence: term.confidence,
        status: (['pending', 'approved', 'rejected', 'flagged'] as const)[Math.floor(Math.random() * 4)],
        context: `Context for ${term.term} from document analysis`,
        relatedTerms: term.relatedTerms || [],
        documentId: `doc-${(sectionIndex % 5) + 1}`,
        extractedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        schemaMapping: term.schemaMapping ? {
          schemaName: term.schemaMapping.schemaName,
          tableName: 'unknown',
          columnName: term.schemaMapping.field,
          dataType: 'varchar',
          confidence: term.schemaMapping.matchConfidence,
          llmReasoning: `Mapped based on term similarity and context analysis`,
        } : undefined,
      }))
    );

    // Apply filters
    let filteredTerms = allTerms;
    if (filters?.status?.length) {
      filteredTerms = filteredTerms.filter(term => filters.status!.includes(term.status));
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredTerms = filteredTerms.filter(term => 
        term.term.toLowerCase().includes(search) ||
        term.definition.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const start = (page - 1) * limit;
    const paginatedTerms = filteredTerms.slice(start, start + limit);

    return this.createSuccessResponse(paginatedTerms);
  }

  async getTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    await this.delay();
    
    const terms = await this.getTerms();
    const term = terms.data.find(t => t.id === id);
    
    if (!term) {
      throw new Error('Term not found');
    }

    return this.createSuccessResponse(term);
  }

  async updateTerm(id: string, request: TermEnrichmentRequest): Promise<ApiResponse<ExtractedTerm>> {
    await this.delay();
    
    const term = (await this.getTerm(id)).data;
    
    // Apply updates
    if (request.updates.definition) term.definition = request.updates.definition;
    if (request.updates.category) term.category = request.updates.category;
    if (request.updates.relatedTerms) term.relatedTerms = request.updates.relatedTerms;
    if (request.updates.status) term.status = request.updates.status;
    if (request.schemaMapping) term.schemaMapping = request.schemaMapping;
    
    term.reviewedAt = new Date().toISOString();
    term.reviewedBy = 'current-user';

    return this.createSuccessResponse(term, 'Term updated successfully');
  }

  async approveTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    await this.delay();
    
    const term = (await this.getTerm(id)).data;
    term.status = 'approved';
    term.reviewedAt = new Date().toISOString();
    term.reviewedBy = 'current-user';

    return this.createSuccessResponse(term, 'Term approved successfully');
  }

  async rejectTerm(id: string, reason?: string): Promise<ApiResponse<ExtractedTerm>> {
    await this.delay();
    
    const term = (await this.getTerm(id)).data;
    term.status = 'rejected';
    term.reviewedAt = new Date().toISOString();
    term.reviewedBy = 'current-user';

    return this.createSuccessResponse(term, 'Term rejected successfully');
  }

  async publishTerm(id: string): Promise<ApiResponse<ExtractedTerm>> {
    await this.delay();
    
    const term = (await this.getTerm(id)).data;
    term.status = 'approved';
    term.isPreferred = true;

    return this.createSuccessResponse(term, 'Term published successfully');
  }

  // Classification methods
  async getDocumentClassification(documentId: string): Promise<ApiResponse<DocumentClassification>> {
    await this.delay();
    
    const classification: DocumentClassification = {
      id: `classification-${documentId}`,
      documentId,
      documentType: {
        type: 'Business Requirements Document (BRD)',
        confidence: 0.92,
      },
      businessDomain: ['Risk Management', 'Compliance & Regulatory'],
      sections: [
        { name: 'Executive Summary', confidence: 0.95 },
        { name: 'Business Requirements', confidence: 0.88 },
        { name: 'Technical Specifications', confidence: 0.82 },
      ],
      confidence: 0.89,
      createdAt: new Date().toISOString(),
    };

    return this.createSuccessResponse(classification);
  }

  async updateDocumentClassification(
    documentId: string, 
    updates: Partial<DocumentClassification>
  ): Promise<ApiResponse<DocumentClassification>> {
    await this.delay();
    
    const classification = (await this.getDocumentClassification(documentId)).data;
    Object.assign(classification, updates);
    classification.reviewedAt = new Date().toISOString();
    classification.reviewedBy = 'current-user';

    return this.createSuccessResponse(classification, 'Classification updated successfully');
  }

  async approveClassification(documentId: string): Promise<ApiResponse<DocumentClassification>> {
    await this.delay();
    
    const classification = (await this.getDocumentClassification(documentId)).data;
    classification.isApproved = true;
    classification.reviewedAt = new Date().toISOString();
    classification.reviewedBy = 'current-user';

    return this.createSuccessResponse(classification, 'Classification approved successfully');
  }

  // Lineage methods (simplified mock)
  async getLineageGraph(entityId: string, direction: string, depth: number): Promise<ApiResponse<LineageGraph>> {
    await this.delay();
    
    const graph: LineageGraph = {
      nodes: [
        {
          id: entityId,
          name: 'Customer Data',
          type: 'table',
          system: 'PostgreSQL',
          schema: 'public',
        },
        {
          id: 'table-2',
          name: 'Transaction Records',
          type: 'table',
          system: 'PostgreSQL',
          schema: 'public',
        },
      ],
      edges: [
        {
          id: 'edge-1',
          source: entityId,
          target: 'table-2',
          type: 'join',
          description: 'Customer ID relationship',
        },
      ],
      rootNodeId: entityId,
      depth,
      direction: direction as any,
    };

    return this.createSuccessResponse(graph);
  }

  // Schema methods (simplified)
  async getSchemaConnections(): Promise<ApiResponse<SchemaConnection[]>> {
    await this.delay();
    
    const connections: SchemaConnection[] = [
      {
        id: 'conn-1',
        name: 'Production Database',
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        database: 'prod_db',
        username: 'readonly_user',
        isActive: true,
        lastSync: new Date().toISOString(),
        tableCount: 45,
      },
    ];

    return this.createSuccessResponse(connections);
  }

  async getSchemaConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    await this.delay();
    
    const connections = await this.getSchemaConnections();
    const connection = connections.data.find(c => c.id === id);
    
    if (!connection) {
      throw new Error('Schema connection not found');
    }

    return this.createSuccessResponse(connection);
  }

  async getSchemaTables(connectionId: string): Promise<ApiResponse<SchemaTable[]>> {
    await this.delay();
    
    const tables: SchemaTable[] = [
      {
        name: 'customers',
        schema: 'public',
        columns: [
          {
            name: 'id',
            dataType: 'integer',
            isNullable: false,
            isPrimaryKey: true,
            isForeignKey: false,
          },
          {
            name: 'name',
            dataType: 'varchar(255)',
            isNullable: false,
            isPrimaryKey: false,
            isForeignKey: false,
          },
        ],
        rowCount: 10000,
        description: 'Customer master data',
      },
    ];

    return this.createSuccessResponse(tables);
  }

  async testSchemaConnection(connection: any): Promise<ApiResponse<{ success: boolean; message: string }>> {
    await this.delay(2000); // Simulate connection test
    
    return this.createSuccessResponse({
      success: true,
      message: 'Connection successful',
    });
  }

  async syncSchemaConnection(id: string): Promise<ApiResponse<SchemaConnection>> {
    await this.delay(3000); // Simulate sync operation
    
    const connection = (await this.getSchemaConnection(id)).data;
    connection.lastSync = new Date().toISOString();

    return this.createSuccessResponse(connection, 'Schema synchronized successfully');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string; version: string }>> {
    await this.delay(100);
    
    return this.createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0-mock',
    });
  }

  // Batch operations
  async bulkUpdateTerms(updates: Array<{ id: string; updates: TermEnrichmentRequest }>): Promise<ApiResponse<ExtractedTerm[]>> {
    await this.delay(1500);
    
    const updatedTerms: ExtractedTerm[] = [];
    for (const update of updates) {
      const term = (await this.updateTerm(update.id, update.updates)).data;
      updatedTerms.push(term);
    }

    return this.createSuccessResponse(updatedTerms, `${updates.length} terms updated successfully`);
  }

  async bulkApproveTerms(termIds: string[]): Promise<ApiResponse<ExtractedTerm[]>> {
    await this.delay(1000);
    
    const approvedTerms: ExtractedTerm[] = [];
    for (const id of termIds) {
      const term = (await this.approveTerm(id)).data;
      approvedTerms.push(term);
    }

    return this.createSuccessResponse(approvedTerms, `${termIds.length} terms approved successfully`);
  }
}

// Create and export the singleton instance
export const mockApiService = new MockApiService();
