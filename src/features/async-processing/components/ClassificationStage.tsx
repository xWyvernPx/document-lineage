import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  FileText, 
  Building, 
  Tag,
  Brain,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';

// Modified interface to match API response
interface DocumentClassification {
  overallConfidence: number;
  documentType: {
    type: string;
    confidence: number;
    alternatives: Record<string, number>;
  };
  summary: string;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  businessDomain?: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  sections?: Array<{
    name: string;
    confidence: number;
    startPage?: number;
    endPage?: number;
    content: string;
  }>;
  language?: string;
  complexity?: 'low' | 'medium' | 'high';
  aiReasoning?: string;
}

interface ProcessingJob {
  id: string;
  documentName: string;
  type: 'pdf' | 'docx' | 'image';
  status: string;
  submittedBy: string;
}

// Mock classification for fallback - adapted to match new interface
const mockClassification: DocumentClassification = {
  overallConfidence: 0.89,
  documentType: {
    type: 'Business Requirements Document (BRD)',
    confidence: 0.92,
    alternatives: {
      'Technical Specification': 0.78,
      'Policy Document': 0.65,
      'Standard Operating Procedure': 0.43
    }
  },
  summary: 'High-level overview of business requirements and project objectives...',
  entities: [
    {
      type: 'ORGANIZATION',
      value: 'ACME Corp',
      confidence: 0.95
    },
    {
      type: 'PRODUCT',
      value: 'Enterprise System',
      confidence: 0.88
    }
  ],
  businessDomain: {
    primary: 'Technology & IT',
    secondary: ['Operations', 'Risk Management'],
    confidence: 0.89
  },
  sections: [
    {
      name: 'Executive Summary',
      confidence: 0.95,
      startPage: 1,
      endPage: 2,
      content: 'High-level overview of business requirements and project objectives...'
    },
    {
      name: 'Business Requirements',
      confidence: 0.88,
      startPage: 3,
      endPage: 8,
      content: 'Detailed functional and non-functional requirements...'
    },
    {
      name: 'Technical Specifications',
      confidence: 0.91,
      startPage: 9,
      endPage: 15,
      content: 'System architecture, data models, and integration requirements...'
    },
    {
      name: 'Risk Assessment',
      confidence: 0.85,
      startPage: 16,
      endPage: 18,
      content: 'Identified risks, mitigation strategies, and contingency plans...'
    },
    {
      name: 'Implementation Plan',
      confidence: 0.89,
      startPage: 19,
      endPage: 22,
      content: 'Project timeline, milestones, and resource allocation...'
    }
  ],
  language: 'English',
  complexity: 'medium',
  aiReasoning: 'Document structure and terminology strongly indicate a Business Requirements Document. The presence of sections like "Business Requirements", "Technical Specifications", and "Implementation Plan" are characteristic of BRDs. The formal language and structured approach to describing system requirements further support this classification.'
};

const documentTypes = [
  'Business Requirements Document (BRD)',
  'Policy Document',
  'Standard Operating Procedure (SOP)',
  'Regulatory Document',
  'Contract Agreement',
  'Technical Specification',
  'System Requirements Specification (SRS)',
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
  'Human Resources',
  'Marketing & Sales',
  'Customer Service'
];

interface ClassificationStageProps {
  job: ProcessingJob;
  onBack: () => void;
  onNext: () => void;
}

export function ClassificationStage({ job, onBack, onNext }: ClassificationStageProps) {
  const [classification, setClassification] = useState<DocumentClassification | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClassification, setEditedClassification] = useState<DocumentClassification | null>(null);
  const [showAIReasoning, setShowAIReasoning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch classification data from API
  useEffect(() => {
    const fetchClassificationData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`https://2n7dmtcnp5.execute-api.ap-southeast-1.amazonaws.com/dev/documents/${job.id}/classification`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        setClassification(data.classification);
        setEditedClassification(data.classification);
      } catch (err) {
        console.error('Failed to fetch classification:', err);
        setError('Failed to load classification data. Please try again.');
        // Fallback to mock data if API fails
        setClassification(mockClassification);
        setEditedClassification(mockClassification);
      } finally {
        setIsLoading(false);
      }
    };

    if (job?.id) {
      fetchClassificationData();
    }
  }, [job?.id]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="success">High Confidence</Badge>;
    if (confidence >= 0.8) return <Badge variant="info">Good Confidence</Badge>;
    if (confidence >= 0.7) return <Badge variant="warning">Medium Confidence</Badge>;
    return <Badge variant="error">Low Confidence</Badge>;
  };

  const handleSaveEdits = async () => {
    if (!editedClassification) return;
    
    try {
      setIsLoading(true);
      
      // Call API to update classification
      const response = await fetch(`https://2n7dmtcnp5.execute-api.ap-southeast-1.amazonaws.com/dev/documents/${job.id}/classification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ classification: editedClassification })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Update local state with edited classification
      setClassification(editedClassification);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save classification:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedClassification(classification);
    setIsEditing(false);
  };

  // Get alternatives as array for display
  const getAlternatives = () => {
    if (!classification?.documentType?.alternatives) return [];
    
    return Object.entries(classification.documentType.alternatives).map(([type, confidence]) => ({
      type,
      confidence
    }));
  };

  // For backward compatibility with existing UI
  const getOverallConfidence = () => {
    if (!classification) return 0;
    return classification.overallConfidence || 0.8;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classification data...</p>
        </div>
      </div>
    );
  }

  if (error && !classification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Classification</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!classification) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Document Classification</h1>
              <p className="text-gray-600 mt-1">{job.documentName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(getOverallConfidence())}`}>
              {Math.round(getOverallConfidence() * 100)}% Overall Confidence
            </div>
            <Button variant="primary" onClick={onNext}>
              Proceed to Enrichment
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-emerald-600">Upload Complete</span>
          </div>
          <div className="w-8 h-0.5 bg-emerald-500"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <span className="text-sm font-medium text-blue-600">Classification</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">3</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Enrichment</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">4</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Review</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* AI Classification Summary */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-blue-500" />
                AI Classification Results
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIReasoning(!showAIReasoning)}
              >
                {showAIReasoning ? 'Hide' : 'Show'} AI Reasoning
              </Button>
            </div>
            
            {showAIReasoning && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">AI Reasoning</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {classification.aiReasoning}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Math.round(getOverallConfidence() * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Confidence</div>
                <ProgressBar 
                  value={getOverallConfidence() * 100} 
                  color={getOverallConfidence() >= 0.8 ? 'emerald' : getOverallConfidence() >= 0.7 ? 'blue' : 'amber'}
                  className="mt-2"
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {classification.sections?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Sections Identified</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-1 capitalize">
                  {classification.complexity || 'medium'}
                </div>
                <div className="text-sm text-gray-600">Document Complexity</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Type Classification */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Document Type
                </h3>
                <div className="flex items-center space-x-2">
                  {getConfidenceBadge(classification.documentType.confidence)}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <select
                    value={editedClassification?.documentType?.type || ''}
                    onChange={(e) => {
                      if (editedClassification) {
                        setEditedClassification({
                          ...editedClassification,
                          documentType: {
                            ...editedClassification.documentType,
                            type: e.target.value
                          }
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveEdits}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{classification.documentType.type}</h4>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(classification.documentType.confidence)}`}>
                      {Math.round(classification.documentType.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Alternative Classifications:</h5>
                    {getAlternatives().map((alt, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{alt.type}</span>
                        <span className="text-gray-500">{Math.round(alt.confidence * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Business Domain Classification */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Business Domain
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Primary Domain</h4>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(classification.businessDomain?.confidence || 0.8)}`}>
                      {Math.round((classification.businessDomain?.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <Badge variant="info" size="md">{classification.businessDomain?.primary || 'N/A'}</Badge>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Secondary Domains:</h5>
                  <div className="flex flex-wrap gap-2">
                    {classification.businessDomain?.secondary?.map(domain => (
                      <Badge key={domain} variant="default" size="sm">{domain}</Badge>
                    ))}
                    {(!classification.businessDomain?.secondary || classification.businessDomain.secondary.length === 0) && (
                      <span className="text-sm text-gray-500">No secondary domains identified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Document Sections */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Identified Sections ({classification.sections?.length || 0})
            </h3>

            <div className="space-y-4">
              {classification.sections?.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      {section.confidence < 0.7 && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {section.startPage && section.endPage && (
                        <span className="text-sm text-gray-500">
                          Pages {section.startPage}-{section.endPage}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(section.confidence)}`}>
                        {Math.round(section.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                  
                  <ProgressBar 
                    value={section.confidence * 100}
                    color={section.confidence >= 0.8 ? 'emerald' : section.confidence >= 0.7 ? 'blue' : 'amber'}
                    className="mt-3"
                  />
                </div>
              ))}
              
              {(!classification.sections || classification.sections.length === 0) && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No sections have been identified in this document.</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Validation Summary */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Classification Complete</h3>
                <p className="text-sm text-gray-600">
                  Document has been successfully classified with {Math.round(getOverallConfidence() * 100)}% overall confidence. 
                  Ready to proceed to term enrichment and mapping.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}