import React, { useState, useEffect } from 'react';
import { TermList } from '../../../components/TermManagement/TermList';
import { TermDetails } from '../../../components/TermManagement/TermDetails';
import { Card } from '../../../components/Card';

interface EnrichmentStepProps {
  documentData: any;
  classificationData: any;
  onEnrichmentComplete: (data: any) => void;
  enrichmentData: any;
}

interface ExtractedTerm {
  id: string;
  term: string;
  definition: string;
  sourceSection: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  context: string;
  relatedTerms: string[];
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
    isApproved?: boolean;
    isRejected?: boolean;
  };
  isPreferred?: boolean;
}

export function EnrichmentStep({
  documentData,
  classificationData,
  onEnrichmentComplete,
  enrichmentData
}: EnrichmentStepProps) {
  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<ExtractedTerm | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (classificationData && !extractedTerms.length) {
      setIsProcessing(true);
      
      // Simulate term extraction
      setTimeout(() => {
        const mockTerms: ExtractedTerm[] = [
          {
            id: '1',
            term: 'Business Requirements',
            definition: 'Documented needs and expectations that a business solution must fulfill to achieve organizational objectives.',
            sourceSection: 'Business Requirements',
            category: 'Process',
            confidence: 0.95,
            status: 'pending',
            context: 'The business requirements section outlines the functional and non-functional needs...',
            relatedTerms: ['Functional Requirements', 'User Stories', 'Acceptance Criteria'],
            schemaMapping: {
              schemaName: 'project_mgmt',
              tableName: 'requirements',
              columnName: 'business_req',
              dataType: 'TEXT',
              confidence: 0.88,
              llmReasoning: 'Business requirements are typically stored as text documents in project management systems.'
            }
          },
          {
            id: '2',
            term: 'Risk Assessment',
            definition: 'Systematic process of evaluating potential risks that could negatively impact business operations.',
            sourceSection: 'Risk Assessment',
            category: 'Risk Management',
            confidence: 0.92,
            status: 'pending',
            context: 'Risk assessment involves identifying, analyzing, and evaluating risks...',
            relatedTerms: ['Risk Mitigation', 'Risk Matrix', 'Impact Analysis'],
            schemaMapping: {
              schemaName: 'risk_mgmt',
              tableName: 'assessments',
              columnName: 'risk_level',
              dataType: 'VARCHAR(50)',
              confidence: 0.91,
              llmReasoning: 'Risk assessments are commonly stored with categorical risk levels in risk management systems.'
            }
          },
          {
            id: '3',
            term: 'Implementation Plan',
            definition: 'Detailed roadmap outlining the steps, timeline, and resources required to execute a project.',
            sourceSection: 'Implementation Plan',
            category: 'Project Management',
            confidence: 0.89,
            status: 'pending',
            context: 'The implementation plan provides a structured approach to project delivery...',
            relatedTerms: ['Project Timeline', 'Resource Allocation', 'Milestone'],
            schemaMapping: {
              schemaName: 'project_mgmt',
              tableName: 'plans',
              columnName: 'implementation',
              dataType: 'TEXT',
              confidence: 0.85,
              llmReasoning: 'Implementation plans are typically stored as detailed text documents in project management databases.'
            }
          }
        ];
        
        setExtractedTerms(mockTerms);
        setSelectedTerm(mockTerms[0]);
        setIsProcessing(false);
        onEnrichmentComplete({ terms: mockTerms });
      }, 3000);
    }
  }, [classificationData, extractedTerms.length, onEnrichmentComplete]);

  const handleTermUpdate = (termId: string, updates: Partial<ExtractedTerm>) => {
    setExtractedTerms(prev => prev.map(term => 
      term.id === termId ? { ...term, ...updates } : term
    ));
    if (selectedTerm?.id === termId) {
      setSelectedTerm(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  if (isProcessing) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Extracting Terms
        </h3>
        <p className="text-gray-600">
          AI is extracting business terms and establishing relationships...
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-6 h-[calc(100vh-200px)]">
      {/* Left Column (40%) - Terms List */}
      <div className="col-span-2">
        <TermList
          terms={extractedTerms}
          selectedTerm={selectedTerm}
          onTermSelect={setSelectedTerm}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categoryFilter={filterCategory}
          onCategoryFilterChange={setFilterCategory}
          showSchemaPreview={false}
        />
      </div>

      {/* Right Column (60%) - Term Details */}
      <div className="col-span-3">
        <TermDetails
          term={selectedTerm}
          onTermUpdate={handleTermUpdate}
          showSchemaMapping={true}
          showLLMReasoning={false}
          allowEditing={true}
        />
      </div>
    </div>
  );
}