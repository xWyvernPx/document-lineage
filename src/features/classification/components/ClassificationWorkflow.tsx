import React from 'react';
import { StepInstructions } from '../../../components/StepInstructions';

export function ClassificationWorkflow() {
  return (
    <div className="max-w-7xl mx-auto">
      <StepInstructions
        title="Smart Document Classification"
        description="Our AI automatically analyzes uploaded documents to identify their type, business domain, and key sections. Review and refine the classifications to ensure accuracy."
        tips={[
          "Review auto-detected document types and domains",
          "Edit classifications if the AI needs correction",
          "Higher confidence scores indicate more reliable classifications",
          "Proper classification improves term extraction quality"
        ]}
        helpContent="Document classification is the foundation for effective term extraction. By understanding document structure and business context, we can better identify and categorize business terms, improving the overall quality of your business glossary."
        variant="green"
      />

      <div className="text-center py-12">
        <p className="text-gray-500">Classification workflow will be implemented here.</p>
      </div>
    </div>
  );
}