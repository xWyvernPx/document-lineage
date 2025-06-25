import React, { useState } from 'react';
import { TermList } from '../../../components/TermManagement/TermList';
import { TermDetails } from '../../../components/TermManagement/TermDetails';
import { TermProgressSummary } from '../../../components/TermManagement/TermProgressSummary';

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
  alternativeMappings?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
  }[];
  isPreferred?: boolean;
}

const mockTerms: ExtractedTerm[] = [
  {
    id: '1',
    term: 'Annual Percentage Rate',
    definition: 'The yearly cost of a loan expressed as a percentage, including interest and fees.',
    sourceSection: 'Loan Terms',
    category: 'Financial',
    confidence: 0.95,
    status: 'pending',
    context: 'The APR must be clearly disclosed to borrowers and calculated according to regulatory requirements.',
    relatedTerms: ['Interest Rate', 'Loan Cost', 'APR'],
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_products',
      columnName: 'annual_percentage_rate',
      dataType: 'DECIMAL(5,4)',
      confidence: 0.94,
      llmReasoning: 'Strong semantic match between "Annual Percentage Rate" and column name "annual_percentage_rate". Context mentions loan terms and regulatory requirements, which aligns with lending schema.'
    },
    alternativeMappings: [
      {
        schemaName: 'lending',
        tableName: 'interest_rates',
        columnName: 'rate_value',
        dataType: 'DECIMAL(5,4)',
        confidence: 0.72,
        llmReasoning: 'Alternative mapping to general rate field. Lower confidence due to less specific column naming.'
      }
    ]
  },
  {
    id: '2',
    term: 'Credit Score',
    definition: 'A numerical expression of creditworthiness based on credit history analysis.',
    sourceSection: 'Underwriting Criteria',
    category: 'Risk Assessment',
    confidence: 0.92,
    status: 'approved',
    context: 'Minimum credit score requirements vary by loan product and risk tolerance.',
    relatedTerms: ['FICO Score', 'Creditworthiness', 'Risk Assessment'],
    schemaMapping: {
      schemaName: 'customer',
      tableName: 'credit_profiles',
      columnName: 'fico_score',
      dataType: 'INTEGER',
      confidence: 0.89,
      llmReasoning: 'Credit score commonly stored as FICO score in credit profiles. Context about underwriting aligns with customer credit assessment.',
      isApproved: true
    }
  },
  {
    id: '3',
    term: 'Principal Balance',
    definition: 'The outstanding amount of money owed on a loan, excluding interest.',
    sourceSection: 'Loan Servicing',
    category: 'Financial',
    confidence: 0.89,
    status: 'pending',
    context: 'Principal balance decreases with each payment according to the amortization schedule.',
    relatedTerms: ['Outstanding Balance', 'Loan Amount', 'Amortization'],
    schemaMapping: {
      schemaName: 'lending',
      tableName: 'loan_accounts',
      columnName: 'current_principal_balance',
      dataType: 'DECIMAL(12,2)',
      confidence: 0.96,
      llmReasoning: 'Excellent match for principal balance in loan accounts. Context about payments and amortization confirms this tracks outstanding loan amounts.'
    }
  },
  {
    id: '4',
    term: 'Business Day',
    definition: 'A day on which business is conducted, typically Monday through Friday excluding holidays.',
    sourceSection: 'Processing Times',
    category: 'Operational',
    confidence: 0.87,
    status: 'flagged',
    context: 'All processing timelines are calculated in business days.',
    relatedTerms: ['Working Day', 'Processing Time', 'Calendar'],
    schemaMapping: {
      schemaName: 'operations',
      tableName: 'calendar',
      columnName: 'is_business_day',
      dataType: 'BOOLEAN',
      confidence: 0.67,
      llmReasoning: 'Low confidence mapping to calendar table. Business day is more of a concept than a stored value.'
    }
  }
];

interface TermEnrichmentMappingInterfaceProps {
  onEnrichmentComplete?: (data: any) => void;
}

export function TermEnrichmentMappingInterface({ onEnrichmentComplete }: TermEnrichmentMappingInterfaceProps) {
  const [terms, setTerms] = useState<ExtractedTerm[]>(mockTerms);
  const [selectedTerm, setSelectedTerm] = useState<ExtractedTerm | null>(terms[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleTermUpdate = (termId: string, updates: Partial<ExtractedTerm>) => {
    setTerms(prev => prev.map(term => 
      term.id === termId ? { ...term, ...updates } : term
    ));
    if (selectedTerm?.id === termId) {
      setSelectedTerm(prev => prev ? { ...prev, ...updates } : null);
    }
    if (onEnrichmentComplete) {
      onEnrichmentComplete({ terms });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <TermProgressSummary terms={terms} />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-5 gap-6 h-[calc(100vh-300px)]">
        {/* Left Column (35%) - Terms List */}
        <div className="col-span-2">
          <TermList
            terms={terms}
            selectedTerm={selectedTerm}
            onTermSelect={setSelectedTerm}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            showSchemaPreview={true}
          />
        </div>

        {/* Right Column (65%) - Term Details */}
        <div className="col-span-3">
          <TermDetails
            term={selectedTerm}
            onTermUpdate={handleTermUpdate}
            showSchemaMapping={true}
            showLLMReasoning={true}
            allowEditing={true}
          />
        </div>
      </div>
    </div>
  );
}