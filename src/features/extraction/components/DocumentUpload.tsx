import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Card } from '../../../components/Card';

interface DocumentUploadProps {
  onTermsExtracted: (count: number) => void;
}

export function DocumentUpload({ onTermsExtracted }: DocumentUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Simulate term extraction
    setTimeout(() => {
      const extractedCount = Math.floor(Math.random() * 50) + 10;
      onTermsExtracted(extractedCount);
    }, 2000);
  }, [onTermsExtracted]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <Card className="h-fit">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag and drop file here
        </p>
        <p className="text-blue-600 hover:text-blue-700 font-medium">
          or browse files
        </p>
      </div>
    </Card>
  );
}