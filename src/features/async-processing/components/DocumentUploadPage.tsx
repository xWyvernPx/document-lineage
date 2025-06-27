import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface DocumentUploadPageProps {
  onUploadComplete: (files: UploadFile[]) => void;
}

export function DocumentUploadPage({ onUploadComplete }: DocumentUploadPageProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const uploadFile = async (uploadFile: UploadFile) => {
    setUploadFiles(prev =>
      prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
    );

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setUploadFiles(prev =>
          prev.map(f => f.id === uploadFile.id ? { ...f, progress } : f)
        );
      }

      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f)
      );
    } catch (error) {
      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: 'Upload failed' 
        } : f)
      );
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadAll = async () => {
    setIsUploading(true);
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    // Upload files in parallel
    await Promise.all(pendingFiles.map(uploadFile));
    
    setIsUploading(false);
    
    // Redirect to dashboard after all uploads complete
    setTimeout(() => {
      onUploadComplete(uploadFiles);
    }, 1000);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return FileText;
    if (file.type.includes('image')) return Image;
    return File;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const allCompleted = uploadFiles.length > 0 && completedFiles === uploadFiles.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">
            Upload your business documents for automated term extraction and processing
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
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
              {isDragActive ? 'Drop your documents here' : 'Drag & drop documents here'}
            </h3>
            <p className="text-gray-600 mb-4">
              or click to browse files
            </p>
            <div className="flex justify-center space-x-4 mb-4">
              <Badge variant="default">PDF</Badge>
              <Badge variant="default">DOCX</Badge>
              <Badge variant="default">Images</Badge>
            </div>
            <p className="text-sm text-gray-500">
              Maximum file size: 50MB per file
            </p>
          </div>
        </Card>

        {/* File List */}
        {uploadFiles.length > 0 && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upload Queue ({uploadFiles.length} files)
                </h3>
                <div className="flex items-center space-x-3">
                  {allCompleted && (
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">All files uploaded successfully!</span>
                    </div>
                  )}
                  <Button
                    onClick={uploadAll}
                    disabled={!uploadFiles.some(f => f.status === 'pending') || isUploading}
                    loading={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload All'}
                  </Button>
                </div>
              </div>
              
              {uploadFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm text-gray-600">
                      {completedFiles} of {uploadFiles.length} completed
                    </span>
                  </div>
                  <ProgressBar 
                    value={(completedFiles / uploadFiles.length) * 100}
                    color="emerald"
                  />
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              {uploadFiles.map(uploadFile => {
                const Icon = getFileIcon(uploadFile.file);
                
                return (
                  <div key={uploadFile.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <p className="font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                        {getStatusIcon(uploadFile.status)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'completed') && (
                        <ProgressBar
                          value={uploadFile.progress}
                          color={uploadFile.status === 'completed' ? 'emerald' : 'blue'}
                          showLabel
                          className="mb-2"
                        />
                      )}
                      
                      {uploadFile.status === 'error' && (
                        <p className="text-sm text-red-600">{uploadFile.error}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => uploadFile(uploadFile)}
                        >
                          Upload
                        </Button>
                      )}
                      {uploadFile.status === 'error' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => uploadFile(uploadFile)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={X}
                        onClick={() => removeFile(uploadFile.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {allCompleted && (
              <div className="p-6 border-t border-gray-200 bg-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <div>
                      <h4 className="font-medium text-emerald-900">Upload Complete!</h4>
                      <p className="text-sm text-emerald-700">
                        Your documents are now being processed. You'll be redirected to the dashboard shortly.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => onUploadComplete(uploadFiles)}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}