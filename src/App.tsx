import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ExtractionWorkflow } from './features/extraction/components/ExtractionWorkflow';
import { ClassificationWorkflow } from './features/classification/components/ClassificationWorkflow';
import { EnrichmentWorkflow } from './features/enrichment/components/EnrichmentWorkflow';
import { PublishingWorkflow } from './features/publishing/components/PublishingWorkflow';
import { ConsumptionWorkflow } from './features/consumption/components/ConsumptionWorkflow';
import { DocumentLibrary } from './features/documents/components/DocumentLibrary';
import { DocumentUpload } from './features/documents/components/DocumentUpload';
import { TermDictionary } from './features/terms/components/TermDictionary';
import { PublishedTermsDashboard } from './features/publishing/components/PublishedTermsDashboard';
import { DataLineageViewer } from './features/lineage/components/DataLineageViewer';
import { SchemaIngestionPage } from './features/schema/components/SchemaIngestionPage';
import { AsyncProcessingApp } from './features/async-processing';
import { useAlert } from './hooks/useAlert';

function App() {
  const [currentPage, setCurrentPage] = useState('async-processing');
  const { AlertModal } = useAlert();

  const renderContent = () => {
    switch (currentPage) {
      case 'async-processing':
        return <AsyncProcessingApp />;
      case 'extraction':
        return <ExtractionWorkflow />;
      case 'classification':
        return <ClassificationWorkflow />;
      case 'enrichment':
        return <EnrichmentWorkflow />;
      case 'review':
        return (
          <PublishingWorkflow 
            onPublishComplete={(documentName) => {
              console.log(`Published terms from ${documentName}`);
            }}
            onNavigateToTermDictionary={() => setCurrentPage('terms')}
          />
        );
      case 'consumption':
        return <ConsumptionWorkflow />;
      case 'documents':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Library</h1>
              <p className="text-gray-600">
                View and manage all uploaded business documents and their processing status.
              </p>
            </div>
            <DocumentLibrary 
              onViewDocument={(doc) => console.log('View document:', doc)}
              onEditDocument={(doc) => console.log('Edit document:', doc)}
              onDeleteDocument={(doc) => console.log('Delete document:', doc)}
              onReprocessDocument={(doc) => console.log('Reprocess document:', doc)}
            />
          </div>
        );
      case 'upload':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
              <p className="text-gray-600">
                Upload new business documents for processing and term extraction.
              </p>
            </div>
            <DocumentUpload />
          </div>
        );
      case 'terms':
        return (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Term Dictionary</h1>
              <p className="text-gray-600">
                Browse, search, and manage business terms with their definitions, relationships, and data lineage.
              </p>
            </div>
            <TermDictionary 
              onEditTerm={(term) => console.log('Edit term:', term)}
              onViewLineage={(term) => {
                console.log('View lineage:', term);
                setCurrentPage('lineage');
              }}
            />
          </div>
        );
      case 'published-terms':
        return (
          <div>
            <PublishedTermsDashboard />
          </div>
        );
      case 'lineage':
        return <DataLineageViewer />;
      case 'schema-ingestion':
        return <SchemaIngestionPage />;
      case 'search':
        return (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Advanced Search</h1>
            <p className="text-gray-600 mb-8">
              Search functionality will be implemented here.
            </p>
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search terms, documents, or definitions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        );
      default:
        return <TermDictionary />;
    }
  };

  // If we're showing the async processing app, render it without the layout
  if (currentPage === 'async-processing') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderContent()}
        <AlertModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderContent()}
      </Layout>
      <AlertModal />
    </div>
  );
}

export default App;