import React, { useState, useEffect } from 'react';
import { CheckCircle, Edit3, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface ClassificationStepProps {
  documentData: any;
  onClassificationComplete: (data: any) => void;
  classificationData: any;
}

interface Classification {
  documentType: {
    type: string;
    confidence: number;
  };
  businessDomain: string[];
  sections: {
    name: string;
    confidence: number;
    startPage?: number;
    endPage?: number;
  }[];
}

const documentTypes = [
  'Business Requirements Document (BRD)',
  'Policy Document',
  'Standard Operating Procedure (SOP)',
  'Regulatory Document',
  'Contract Agreement',
  'Technical Specification',
  'Other'
];

const businessDomains = [
  'Risk Management',
  'Lending & Credit',
  'Compliance & Regulatory',
  'Technology & IT',
  'Operations',
  'Legal',
  'Finance & Accounting',
  'Human Resources'
];

export function ClassificationStep({ 
  documentData, 
  onClassificationComplete, 
  classificationData 
}: ClassificationStepProps) {
  const [classification, setClassification] = useState<Classification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClassification, setEditedClassification] = useState<Classification | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (documentData && !classification) {
      setIsProcessing(true);
      
      // Simulate AI classification
      setTimeout(() => {
        const autoClassification: Classification = {
          documentType: {
            type: 'Business Requirements Document (BRD)',
            confidence: 0.92
          },
          businessDomain: ['Technology & IT', 'Operations'],
          sections: [
            { name: 'Executive Summary', confidence: 0.95, startPage: 1, endPage: 2 },
            { name: 'Business Requirements', confidence: 0.88, startPage: 3, endPage: 8 },
            { name: 'Technical Specifications', confidence: 0.91, startPage: 9, endPage: 15 },
            { name: 'Risk Assessment', confidence: 0.85, startPage: 16, endPage: 18 },
            { name: 'Implementation Plan', confidence: 0.89, startPage: 19, endPage: 22 }
          ]
        };
        
        setClassification(autoClassification);
        setEditedClassification(autoClassification);
        setIsProcessing(false);
        onClassificationComplete(autoClassification);
      }, 2000);
    }
  }, [documentData, classification, onClassificationComplete]);

  const handleSaveEdits = () => {
    if (editedClassification) {
      setClassification(editedClassification);
      onClassificationComplete(editedClassification);
      setIsEditing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600';
    if (confidence >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="success">High</Badge>;
    if (confidence >= 0.7) return <Badge variant="warning">Medium</Badge>;
    return <Badge variant="error">Low</Badge>;
  };

  if (isProcessing) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analyzing Document
        </h3>
        <p className="text-gray-600">
          AI is classifying your document type, domain, and sections...
        </p>
      </Card>
    );
  }

  if (!classification) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Please upload a document first.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Type Classification */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Document Type</h3>
          <div className="flex items-center space-x-2">
            {getConfidenceBadge(classification.documentType.confidence)}
            <Button
              variant="ghost"
              size="sm"
              icon={Edit3}
              onClick={() => setIsEditing(!isEditing)}
            >
              Edit
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <select
              value={editedClassification?.documentType.type || ''}
              onChange={(e) => setEditedClassification(prev => prev ? {
                ...prev,
                documentType: { ...prev.documentType, type: e.target.value }
              } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSaveEdits}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{classification.documentType.type}</p>
              <p className="text-sm text-gray-500">
                Confidence: <span className={getConfidenceColor(classification.documentType.confidence)}>
                  {Math.round(classification.documentType.confidence * 100)}%
                </span>
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
        )}
      </Card>

      {/* Business Domain */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Domain</h3>
        <div className="flex flex-wrap gap-2">
          {classification.businessDomain.map(domain => (
            <Badge key={domain} variant="info">{domain}</Badge>
          ))}
        </div>
      </Card>

      {/* Document Sections */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Identified Sections</h3>
        <div className="space-y-3">
          {classification.sections.map((section, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{section.name}</h4>
                  {getConfidenceBadge(section.confidence)}
                </div>
                {section.startPage && section.endPage && (
                  <p className="text-sm text-gray-500 mt-1">
                    Pages {section.startPage}-{section.endPage}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(section.confidence * 100)}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Validation Summary */}
      <Card>
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <div>
            <h3 className="font-semibold text-gray-900">Classification Complete</h3>
            <p className="text-sm text-gray-600">
              Document has been successfully classified and is ready for term enrichment.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}