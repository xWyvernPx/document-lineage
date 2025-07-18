import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  AsyncProcessingApp,
  ExtractionWorkflow,
  ClassificationWorkflow,
  EnrichmentWorkflow,
  PublishingWorkflow,
  ConsumptionWorkflow,
  DocumentsPage,
  UploadPage,
  TermsPage,
  SearchPage,
  DataLineageViewer,
  ReactFlowLineagePage,
  NAPASLineageViewer,
  SchemaIngestionPageMigrated,
  ApiTestingPage
} from '../pages';
import { ReactFlowLineageDemo } from '../features/lineage';
import { ClassificationStage, DocumentUploadPage, EnrichmentStage, ProcessingDocument } from '../features/async-processing';
import { useState } from 'react';
import { ProcessingJob } from '../lib/types';

export function AppRouter() {
   const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
  const nav = useNavigate();
    const handleViewResults = (job: ProcessingJob) => {
      setSelectedJob(job);
      nav('/results');
    };
  
    const handleViewClassification = (job: ProcessingJob) => {
      setSelectedJob(job);
      console.log('Selected Job:', job);
      nav('/classification');
    };
  
    const handleViewEnrichment = (job: ProcessingJob) => {
      setSelectedJob(job);
      nav('/enrichment');
    };
    const handleUploadComplete = () => {
    // setCurrentView('document');
    nav('/documents');
  };
 
    const handleBackToDocument = () => {
      setSelectedJob(null);
      nav('/documents');
    };
  
    const handleClassificationToEnrichment = () => {
      nav('/enrichment');
    };
  
    const handleEnrichmentToResults = () => {
      nav('/results');
    };
  
    const handlePublishComplete = (job: ProcessingJob) => {
      // Update job status and redirect to document view
      setSelectedJob(null);
      nav('documents');
    };
  
  return (
    <Routes>
      {/* Default route - redirect to documents */}
      <Route path="/" element={<Navigate to="/documents" replace />} />
      
      {/* Async Processing App */}
      <Route path="/async-processing" element={<AsyncProcessingApp />} />
      
      {/* Document Pipeline */}
      <Route path="/extraction" element={<DocumentUploadPage onUploadComplete={handleUploadComplete} />} />
      <Route path="/classification" element={selectedJob ? (
                <ClassificationStage 
                  job={selectedJob} 
                  onBack={handleBackToDocument}
                  onNext={handleClassificationToEnrichment}
                />
              ) : null} />
      <Route path="/enrichment" element={selectedJob ? (
                <EnrichmentStage 
                  job={selectedJob} 
                  onBack={() => nav('classification')}
                  onNext={handleEnrichmentToResults}
                />
              ) : null} />
      <Route path="/review" element={<PublishingWorkflow />} />
      <Route path="/consumption" element={<ConsumptionWorkflow />} />
      
      {/* Document Management */}
      <Route path="/documents" element={<ProcessingDocument 
                  onViewResults={handleViewResults}
                  onViewClassification={handleViewClassification}
                  onViewEnrichment={handleViewEnrichment}
                />} />
      <Route path="/upload" element={<DocumentUploadPage onUploadComplete={handleUploadComplete} />} />
      
      {/* Terms & Dictionary */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/search" element={<SearchPage />} />
      
      {/* Lineage & Data Flow */}
      <Route path="/lineage" element={<ReactFlowLineageDemo />} />
      <Route path="/reactflow-lineage" element={<ReactFlowLineageDemo />} />
      <Route path="/napas-lineage" element={<NAPASLineageViewer />} />
      
      {/* Schema & Configuration */}
      <Route path="/schema-ingestion" element={<SchemaIngestionPageMigrated />} />
      
      {/* Testing & API */}
      <Route path="/api-testing" element={<ApiTestingPage />} />
      
      {/* Catch all - redirect to documents */}
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
}
