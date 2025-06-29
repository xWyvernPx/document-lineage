import React, { useState } from 'react';
import { DocumentUploadPage } from './DocumentUploadPage';
import { ProcessingDocument } from './ProcessingDashboard';
import { ClassificationStage } from './ClassificationStage';
import { EnrichmentStage } from './EnrichmentStage';
import { ResultViewer } from './ResultViewer';
import { TermDictionary } from './PublishedTermsDashboard';
import { SchemaIngestionPage } from '../../schema/components/SchemaIngestionPage';
import { ACHNapasDataGenerator } from '../../data-generator/components/ACHNapasDataGenerator';
import { NotificationSystem } from './NotificationSystem';

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused' | 'published';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
}

type AppView = 'upload' | 'document' | 'classification' | 'enrichment' | 'results' | 'term-dictionary' | 'schema-ingestion' | 'data-generator';

export function AsyncProcessingApp() {
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);

  const handleUploadComplete = () => {
    setCurrentView('document');
  };

  const handleViewResults = (job: ProcessingJob) => {
    setSelectedJob(job);
    setCurrentView('results');
  };

  const handleViewClassification = (job: ProcessingJob) => {
    setSelectedJob(job);
    setCurrentView('classification');
  };

  const handleViewEnrichment = (job: ProcessingJob) => {
    setSelectedJob(job);
    setCurrentView('enrichment');
  };

  const handleBackToDocument = () => {
    setSelectedJob(null);
    setCurrentView('document');
  };

  const handleClassificationToEnrichment = () => {
    setCurrentView('enrichment');
  };

  const handleEnrichmentToResults = () => {
    setCurrentView('results');
  };

  const handlePublishComplete = (job: ProcessingJob) => {
    // Update job status and redirect to document view
    setSelectedJob(null);
    setCurrentView('document');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return <DocumentUploadPage onUploadComplete={handleUploadComplete} />;
      case 'document':
        return (
          <ProcessingDocument 
            onViewResults={handleViewResults}
            onViewClassification={handleViewClassification}
            onViewEnrichment={handleViewEnrichment}
          />
        );
      case 'classification':
        return selectedJob ? (
          <ClassificationStage 
            job={selectedJob} 
            onBack={handleBackToDocument}
            onNext={handleClassificationToEnrichment}
          />
        ) : null;
      case 'enrichment':
        return selectedJob ? (
          <EnrichmentStage 
            job={selectedJob} 
            onBack={() => setCurrentView('classification')}
            onNext={handleEnrichmentToResults}
          />
        ) : null;
      case 'results':
        return selectedJob ? (
          <ResultViewer 
            job={selectedJob} 
            onBack={handleBackToDocument}
            onPublishComplete={handlePublishComplete}
            onTermDictionary={() => setCurrentView('term-dictionary')}
          />
        ) : null;
      case 'term-dictionary':
        return <TermDictionary />;
      case 'schema-ingestion':
        return <SchemaIngestionPage />;
      case 'data-generator':
        return <ACHNapasDataGenerator />;
      default:
        return <DocumentUploadPage onUploadComplete={handleUploadComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mx-auto h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DP</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Document Processor</span>
              </div>
              
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setCurrentView('upload')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'upload'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setCurrentView('document')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'document'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Document Processing
                </button>
                <button
                  onClick={() => setCurrentView('schema-ingestion')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'schema-ingestion'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Schema Ingestion
                </button>
                <button
                  onClick={() => setCurrentView('term-dictionary')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'term-dictionary'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Term Dictionary
                </button>
                <button
                  onClick={() => setCurrentView('data-generator')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'data-generator'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Data Generator
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationSystem />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">U</span>
                </div>
                <span className="text-sm font-medium text-gray-700">User</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
}