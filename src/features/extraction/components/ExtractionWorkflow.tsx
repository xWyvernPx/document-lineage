import React, { useState } from 'react';
import { WorkflowLayout } from '../../../components/WorkflowLayout';
import { DocumentUploadStep } from './DocumentUploadStep';
import { ClassificationStep } from './ClassificationStep';
import { EnrichmentWorkflow as EnrichmentStep } from '../../enrichment/components/EnrichmentWorkflow';
import { PublishingWorkflow as ReviewStep } from '../../publishing/components/PublishingWorkflow';
import { StepInstructions } from '../../../components/StepInstructions';

const workflowSteps = [
  {
    id: 'upload',
    name: 'Document Upload',
    description: 'Upload and process business documents',
    completed: false,
    current: true,
  },
  {
    id: 'classification',
    name: 'Smart Classification',
    description: 'Auto-detect document type and sections',
    completed: false,
    current: false,
  },
  {
    id: 'enrichment',
    name: 'Term Enrichment',
    description: 'Extract and map business terms',
    completed: false,
    current: false,
  },
  {
    id: 'review',
    name: 'Publishing & Approval',
    description: 'Human validation and approval',
    completed: false,
    current: false,
  },
];

export function ExtractionWorkflow() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [steps, setSteps] = useState(workflowSteps);
  const [documentData, setDocumentData] = useState<any>(null);
  const [classificationData, setClassificationData] = useState<any>(null);
  const [enrichmentData, setEnrichmentData] = useState<any>(null);

  const updateStepCompletion = (stepId: string, completed: boolean) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      completed: step.id === stepId ? completed : step.completed,
      current: step.id === stepId ? !completed : false
    })));
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1].id;
      updateStepCompletion(currentStep, true);
      setCurrentStep(nextStepId);
      setSteps(prev => prev.map(step => ({
        ...step,
        current: step.id === nextStepId
      })));
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1].id;
      setCurrentStep(prevStepId);
      setSteps(prev => prev.map(step => ({
        ...step,
        current: step.id === prevStepId
      })));
    }
  };

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
    setSteps(prev => prev.map(step => ({
      ...step,
      current: step.id === stepId
    })));
  };

  const getStepInstructions = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <StepInstructions
            title="Upload Your Document"
            description="Start by uploading a business document to extract terms and definitions. We support PDF, DOCX, and image files."
            tips={[
              "Ensure document quality is good for better text extraction",
              "Maximum file size is 50MB",
              "Scanned documents will be processed with OCR"
            ]}
            helpContent="This step processes your document and extracts text content using advanced OCR and text parsing technologies. The extracted content will be used in subsequent steps for classification and term extraction."
            variant="blue"
          />
        );
      case 'classification':
        return (
          <StepInstructions
            title="Smart Document Classification"
            description="Our AI automatically analyzes your document to identify its type, business domain, and key sections. Review and edit the classifications as needed."
            tips={[
              "Review auto-detected classifications for accuracy",
              "Edit classifications if the AI missed something",
              "Higher confidence scores indicate better accuracy"
            ]}
            helpContent="Document classification helps organize and categorize your content for better term extraction. The AI analyzes document structure, content patterns, and business terminology to make intelligent classifications."
            variant="green"
          />
        );
      case 'enrichment':
        return (
          <StepInstructions
            title="Term Extraction & Enrichment"
            description="Review extracted business terms, validate definitions, and establish relationships with existing data schemas and related concepts."
            tips={[
              "Review extracted terms for relevance and accuracy",
              "Check schema mappings for data lineage",
              "Explore term relationships and dependencies",
              "Use bulk actions for efficient processing"
            ]}
            helpContent="Term enrichment creates a comprehensive business glossary by extracting key terms, establishing relationships, and mapping to your data schemas. This enables better data governance and lineage tracking."
            variant="amber"
          />
        );
      case 'review':
        return (
          <StepInstructions
            title="Publishing & Approval"
            description="Review and finalize enriched business terms before publishing to the business glossary. Select terms for publication and ensure all definitions meet quality standards."
            tips={[
              "Review all flagged terms before publishing",
              "Use batch selection for efficient approval workflows",
              "Mark important terms as 'Preferred' for organizational standards",
              "Export approved terms for external review if needed"
            ]}
            helpContent="This final step allows you to review all extracted and enriched terms before they are published to your business glossary. You can approve terms, mark preferred definitions, and ensure quality before making them available to your organization."
            variant="blue"
          />
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <DocumentUploadStep
            onDocumentProcessed={setDocumentData}
            documentData={documentData}
          />
        );
      case 'classification':
        return (
          <ClassificationStep
            documentData={documentData}
            onClassificationComplete={setClassificationData}
            classificationData={classificationData}
          />
        );
      case 'enrichment':
        return (
          <EnrichmentStep onEnrichmentComplete={setEnrichmentData} />
        );
      case 'review':
        return (
          <ReviewStep />
        );
      default:
        return null;
    }
  };

  const getNextDisabled = () => {
    switch (currentStep) {
      case 'upload':
        return !documentData;
      case 'classification':
        return !classificationData;
      case 'enrichment':
        return !enrichmentData;
      default:
        return false;
    }
  };

  return (
    <WorkflowLayout
      currentStep={currentStep}
      steps={steps}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextDisabled={getNextDisabled()}
    >
      <div className="max-w-7xl mx-auto">
        {getStepInstructions()}
        {renderStepContent()}
      </div>
    </WorkflowLayout>
  );
}