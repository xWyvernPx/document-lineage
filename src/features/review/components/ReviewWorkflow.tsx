import React from 'react';
import { StepInstructions } from '../../../components/StepInstructions';

export function ReviewWorkflow() {
  return (
    <div className="max-w-7xl mx-auto">
      <StepInstructions
        title="Publishing & Approval & Validation"
        description="Human-in-the-loop review and approval for extracted terms and relationships. Validate definitions, approve terms, and ensure quality before publishing to the business glossary."
        tips={[
          "Use bulk actions to efficiently review multiple terms",
          "Flag terms that need additional discussion or clarification",
          "Add review notes to provide context for future users",
          "Focus on high-impact terms that affect business operations"
        ]}
        helpContent="The review step ensures the quality and accuracy of your business glossary. Subject matter experts validate definitions, approve terms, and provide additional context before terms are published to the organization. This human oversight is crucial for maintaining glossary quality and organizational trust."
        variant="default"
      />

      <div className="text-center py-12">
        <p className="text-gray-500">Review workflow will be implemented here.</p>
      </div>
    </div>
  );
}