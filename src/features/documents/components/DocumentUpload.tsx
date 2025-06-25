import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, File, X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { useAlert } from '../../../hooks/useAlert';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function DocumentUpload() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { showError, showSuccess, AlertModal } = useAlert();

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
  });

  const uploadFile = async (uploadFile: UploadFile) => {
    setUploadFiles(prev =>
      prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
    );

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadFiles(prev =>
          prev.map(f => f.id === uploadFile.id ? { ...f, progress } : f)
        );
      }

      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f)
      );
      
      showSuccess(`Successfully uploaded ${uploadFile.file.name}`);
    } catch (error) {
      setUploadFiles(prev =>
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: 'Upload failed' 
        } : f)
      );
      showError(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadAll = () => {
    uploadFiles
      .filter(f => f.status === 'pending')
      .forEach(uploadFile);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return FileText;
    if (file.type.includes('image')) return Image;
    return File;
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop documents here to upload
        </h3>
        <p className="text-gray-500 mb-4">
          Support for PDF, DOCX, and image files up to 50MB
        </p>
        <Button variant="secondary">
          Choose Files
        </Button>
      </div>

      {uploadFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Upload Queue ({uploadFiles.length})
            </h3>
            <Button
              onClick={uploadAll}
              disabled={!uploadFiles.some(f => f.status === 'pending')}
            >
              Upload All
            </Button>
          </div>

          <div className="space-y-3">
            {uploadFiles.map(uploadFile => {
              const Icon = getFileIcon(uploadFile.file);
              
              return (
                <div key={uploadFile.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadFile.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={X}
                        onClick={() => removeFile(uploadFile.id)}
                      />
                    </div>
                  </div>
                  
                  {(uploadFile.status === 'uploading' || uploadFile.status === 'completed') && (
                    <ProgressBar
                      value={uploadFile.progress}
                      color={uploadFile.status === 'completed' ? 'emerald' : 'blue'}
                      showLabel
                    />
                  )}
                  
                  {uploadFile.status === 'error' && (
                    <p className="text-sm text-red-600 mt-2">{uploadFile.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AlertModal />
    </div>
  );
}