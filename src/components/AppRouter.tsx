import { Routes, Route, Navigate } from 'react-router-dom';
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

export function AppRouter() {
  return (
    <Routes>
      {/* Default route - redirect to documents */}
      <Route path="/" element={<Navigate to="/documents" replace />} />
      
      {/* Async Processing App */}
      <Route path="/async-processing" element={<AsyncProcessingApp />} />
      
      {/* Document Pipeline */}
      <Route path="/extraction" element={<ExtractionWorkflow />} />
      <Route path="/classification" element={<ClassificationWorkflow />} />
      <Route path="/enrichment" element={<EnrichmentWorkflow />} />
      <Route path="/review" element={<PublishingWorkflow />} />
      <Route path="/consumption" element={<ConsumptionWorkflow />} />
      
      {/* Document Management */}
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/upload" element={<UploadPage />} />
      
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
