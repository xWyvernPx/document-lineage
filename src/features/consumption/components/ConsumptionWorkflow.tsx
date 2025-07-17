import React from 'react';
import { StepInstructions } from '../../../components/StepInstructions';

export function ConsumptionWorkflow() {
  return (
    <div className="max-w-7xl mx-auto">
      <StepInstructions
        title="Data Consumption & Integration"
        description="Expose enriched terms and mappings to teams, tools, and lineage viewers. Configure APIs, exports, and integrations for organizational data consumption."
        tips={[
          "Configure API endpoints for system integrations",
          "Set up automated exports for data catalogs",
          "Enable lineage tracking for downstream systems",
          "Monitor usage and adoption across teams"
        ]}
        helpContent="Data consumption makes your business glossary actionable by exposing terms and relationships through APIs, exports, and integrations. This enables data governance tools, lineage systems, and business applications to leverage your curated business terminology."
        variant="blue"
      />

      <div className="text-center py-12">
        <p className="text-gray-500">Consumption workflow will be implemented here.</p>
      </div>
    </div>
  );
}