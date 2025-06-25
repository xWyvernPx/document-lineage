import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, File, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { Badge } from '../../../components/Badge';

interface DocumentUploadStepProps {
  onDocumentProcessed: (data: any) => void;
  documentData: any;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  metadata?: {
    pages: number;
    size: string;
    type: string;
  };
}

export function DocumentUploadStep({ onDocumentProcessed, documentData }: DocumentUploadStepProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const newFile: UploadedFile = {
      file,
      progress: 0,
      status: 'uploading',
    };

    setUploadedFile(newFile);

    // Simulate upload and processing
    const uploadInterval = setInterval(() => {
      setUploadedFile(prev => {
        if (!prev) return null;
        const newProgress = prev.progress + 10;
        
        if (newProgress >= 100) {
          clearInterval(uploadInterval);
          
          // Simulate processing
          setTimeout(() => {
            const processedData = {
              name: file.name,
              size: file.size,
              type: file.type,
              extractedText: 'Sample extracted text from the document...',
              metadata: {
                pages: Math.floor(Math.random() * 20) + 1,
                size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                type: file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'DOCX' : 'Image',
              }
            };
            
            setUploadedFile(prev => prev ? {
              ...prev,
              status: 'completed',
              extractedText: processedData.extractedText,
              metadata: processedData.metadata
            } : null);
            
            onDocumentProcessed(processedData);
          }, 1500);
          
          return { ...prev, progress: 100, status: 'processing' };
        }
        
        return { ...prev, progress: newProgress };
      });
    }, 200);
  }, [onDocumentProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return FileText;
    if (file.type.includes('image')) return Image;
    return File;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="info">Uploading</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {!uploadedFile ? (
        <Card className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
              isDragActive
                ? 'border-blue-400 bg-blue-50 scale-105'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your document here' : 'Upload Document'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="flex justify-center space-x-4 mb-4">
              <Badge variant="default">PDF</Badge>
              <Badge variant="default">DOCX</Badge>
              <Badge variant="default">Images</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Maximum file size: 50MB
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* File Status Card */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {React.createElement(getFileIcon(uploadedFile.file), {
                    className: "w-6 h-6 text-blue-600"
                  })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {uploadedFile.file.name}
                    </h3>
                    {getStatusIcon(uploadedFile.status)}
                    {getStatusBadge(uploadedFile.status)}
                  </div>
                  {uploadedFile.metadata && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{uploadedFile.metadata.size}</span>
                      <span>{uploadedFile.metadata.pages} pages</span>
                      <span>{uploadedFile.metadata.type}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFile(null)}
              >
                Remove
              </Button>
            </div>

            {/* Progress Bar */}
            {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {uploadedFile.status === 'uploading' ? 'Uploading...' : 'Processing document...'}
                  </span>
                  <span className="text-sm text-gray-600">{uploadedFile.progress}%</span>
                </div>
                <ProgressBar
                  value={uploadedFile.progress}
                  color={uploadedFile.status === 'processing' ? 'amber' : 'blue'}
                />
              </div>
            )}

            {/* Extracted Text Preview */}
            {uploadedFile.extractedText && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Extracted Text Preview</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                </div>
                {showPreview && (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {uploadedFile.extractedText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Document Validation */}
          {uploadedFile.status === 'completed' && (
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Document Ready</h3>
                  <p className="text-sm text-gray-600">
                    Document has been successfully processed and is ready for classification.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}