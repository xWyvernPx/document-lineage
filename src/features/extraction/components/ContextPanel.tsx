import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';

interface ContextPanelProps {
  currentStep: string;
  documentData: any;
  classificationData: any;
  enrichmentData: any;
}

export function ContextPanel({ 
  currentStep, 
  documentData, 
  classificationData, 
  enrichmentData 
}: ContextPanelProps) {
  const getStepDescription = () => {
    switch (currentStep) {
      case 'upload':
        return {
          title: 'Document Upload',
          description: 'Upload your business document to begin the extraction process. Supported formats include PDF, DOCX, and images.',
          tips: [
            'Ensure document quality is good for better text extraction',
            'Maximum file size is 50MB',
            'Scanned documents will be processed with OCR'
          ]
        };
      case 'classification':
        return {
          title: 'Smart Classification',
          description: 'AI automatically analyzes your document to identify its type, business domain, and key sections.',
          tips: [
            'Review auto-detected classifications for accuracy',
            'Edit classifications if needed',
            'Higher confidence scores indicate better accuracy'
          ]
        };
      case 'enrichment':
        return {
          title: 'Term Enrichment',
          description: 'Extract business terms and establish relationships with existing data schemas and related concepts.',
          tips: [
            'Review extracted terms for relevance',
            'Check schema mappings for accuracy',
            'Explore term relationships and dependencies'
          ]
        };
      case 'review':
        return {
          title: 'Publishing & Approval',
          description: 'Human validation and approval of extracted terms before they are added to the business glossary.',
          tips: [
            'Use bulk actions for efficient review',
            'Flag terms that need further discussion',
            'Add review notes for context'
          ]
        };
      default:
        return {
          title: 'Workflow Step',
          description: 'Complete this step to continue.',
          tips: []
        };
    }
  };

  const stepInfo = getStepDescription();

  return (
    <div className="space-y-6">
      {/* Step Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{stepInfo.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{stepInfo.description}</p>
        
        {stepInfo.tips.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Tips</h4>
            <ul className="space-y-1">
              {stepInfo.tips.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Document Information */}
      {documentData && (
        <Card>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Document Info</span>
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900 truncate ml-2">{documentData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="text-gray-900">{documentData.metadata?.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pages:</span>
              <span className="text-gray-900">{documentData.metadata?.pages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <Badge variant="info" size="sm">{documentData.metadata?.type}</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Classification Results */}
      {classificationData && (
        <Card>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Classification</span>
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Document Type:</span>
              <p className="font-medium text-gray-900 text-sm mt-1">
                {classificationData.documentType?.type}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round((classificationData.documentType?.confidence || 0) * 100)}% confidence
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Domains:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {classificationData.businessDomain?.map((domain: string) => (
                  <Badge key={domain} variant="default" size="sm">{domain}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Sections:</span>
              <p className="text-sm text-gray-900 mt-1">
                {classificationData.sections?.length || 0} identified
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Enrichment Results */}
      {enrichmentData && (
        <Card>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Enrichment</span>
          </h4>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Extracted Terms:</span>
              <p className="text-lg font-semibold text-gray-900">
                {enrichmentData.terms?.length || 0}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Categories:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.from(new Set(enrichmentData.terms?.map((t: any) => t.category) || [])).map((category: string) => (
                  <Badge key={category} variant="default" size="sm">{category}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <h4 className="font-medium text-gray-900 mb-3">Progress Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Upload</span>
            {documentData ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Classification</span>
            {classificationData ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Enrichment</span>
            {enrichmentData ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Review</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </Card>
    </div>
  );
}