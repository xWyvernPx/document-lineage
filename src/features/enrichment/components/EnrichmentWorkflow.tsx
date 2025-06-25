import React from 'react';
import { StepInstructions } from '../../../components/StepInstructions';
import { TermEnrichmentMappingInterface } from './TermEnrichmentMappingInterface';

export function EnrichmentWorkflow() {
  return (
    <div className="max-w-7xl mx-auto">
      <StepInstructions
        title="Term Enrichment & Mapping"
        description="Review extracted terms, validate definitions, and confirm schema mappings to ensure accurate data lineage. Use filters and inline controls to streamline validation."
        tips={[
          "Click on any term in the left panel to view and edit its details",
          "Review schema mappings with confidence scores and LLM reasoning",
          "Use inline approve/reject actions for efficient processing",
          "Mark important terms as 'Preferred' for organizational standards"
        ]}
        helpContent="This combined step extracts business terms from documents and maps them to your database schema fields. The AI provides confidence scores and reasoning for each mapping, enabling efficient human-in-the-loop validation for accurate data lineage and governance."
        variant="amber"
      />
      
      <TermEnrichmentMappingInterface />
    </div>
  );
}