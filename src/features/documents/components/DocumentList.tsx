import React, { useState } from 'react';
import { FileText, Calendar, User, Eye, Download, MoreHorizontal } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { Document } from '../../../types';

interface DocumentListProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Lending Policy v2.1.pdf',
    type: 'pdf',
    size: 2457600,
    uploadedAt: '2024-01-15T10:30:00Z',
    uploadedBy: 'Sarah Johnson',
    status: 'completed',
    classification: {
      type: 'Policy',
      domain: 'Lending',
      sections: ['Interest Rates', 'Risk Assessment', 'Compliance Requirements'],
      confidence: 0.95,
    },
  },
  {
    id: '2',
    name: 'Business Requirements Document.docx',
    type: 'docx',
    size: 1048576,
    uploadedAt: '2024-01-14T14:22:00Z',
    uploadedBy: 'Michael Chen',
    status: 'processing',
    processingProgress: 65,
  },
  {
    id: '3',
    name: 'Regulatory Compliance Framework.pdf',
    type: 'pdf',
    size: 3145728,
    uploadedAt: '2024-01-13T09:15:00Z',
    uploadedBy: 'Emily Rodriguez',
    status: 'completed',
    classification: {
      type: 'Regulatory',
      domain: 'Compliance',
      sections: ['Data Protection', 'Financial Regulations', 'Audit Requirements'],
      confidence: 0.88,
    },
  },
];

export function DocumentList({ documents = mockDocuments, onViewDocument }: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'processing':
        return <Badge variant="warning">Processing</Badge>;
      case 'uploading':
        return <Badge variant="info">Uploading</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {documents.map(document => (
        <Card key={document.id} hover className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {document.name}
                  </h3>
                  {getStatusBadge(document.status)}
                  {document.classification && (
                    <Badge variant="info">{document.classification.type}</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(document.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{document.uploadedBy}</span>
                  </div>
                  <span>{formatFileSize(document.size)}</span>
                </div>

                {document.status === 'processing' && document.processingProgress && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Processing</span>
                      <span className="text-sm text-gray-600">{document.processingProgress}%</span>
                    </div>
                    <ProgressBar 
                      value={document.processingProgress} 
                      color="amber"
                    />
                  </div>
                )}

                {document.classification && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Domain:</span>
                      <Badge variant="default">{document.classification.domain}</Badge>
                      <span className="text-sm text-gray-500">
                        ({Math.round(document.classification.confidence * 100)}% confidence)
                      </span>
                    </div>
                    {document.classification.sections.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Sections:</span>
                        <div className="flex flex-wrap gap-1">
                          {document.classification.sections.map(section => (
                            <Badge key={section} size="sm" variant="default">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                onClick={() => onViewDocument(document)}
              >
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Download}
                disabled={document.status !== 'completed'}
              >
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={MoreHorizontal}
                onClick={() => setSelectedDocument(
                  selectedDocument === document.id ? null : document.id
                )}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}