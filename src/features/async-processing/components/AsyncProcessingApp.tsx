import React, { useState } from 'react';
import { DocumentUploadPage } from './DocumentUploadPage';
import { ProcessingDashboard } from './ProcessingDashboard';
import { ResultViewer } from './ResultViewer';
import { NotificationSystem } from './NotificationSystem';

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  progress: number;
  submittedAt: string;
  submittedBy: string;
  completedAt?: string;
  estimatedCompletion?: string;
  extractedTerms?: number;
  error?: string;
  size: number;
}

type AppView = 'upload' | 'dashboard' | 'results';

export function AsyncProcessingApp() {
  const [currentView, setCurrentView] = useState<AppView>('upload');
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);

  const handleUploadComplete = () => {
    setCurrentView('dashboard');
  };

  const handleViewResults = (job: ProcessingJob) => {
    setSelectedJob(job);
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setSelectedJob(null);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return <DocumentUploadPage onUploadComplete={handleUploadComplete} />;
      case 'dashboard':
        return <ProcessingDashboard onViewResults={handleViewResults} />;
      case 'results':
        return selectedJob ? (
          <ResultViewer job={selectedJob} onBack={handleBackToDashboard} />
        ) : null;
      default:
        return <DocumentUploadPage onUploadComplete={handleUploadComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
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
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
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