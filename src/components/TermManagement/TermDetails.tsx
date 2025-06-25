import React, { useState } from 'react';
import { Edit3, Check, X, Flag, MessageSquare, Star, Database, Brain, FileText } from 'lucide-react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';

interface Term {
  id: string;
  term: string;
  definition: string;
  sourceSection: string;
  category: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  context: string;
  relatedTerms: string[];
  schemaMapping?: {
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
    isApproved?: boolean;
    isRejected?: boolean;
  };
  alternativeMappings?: Array<{
    schemaName: string;
    tableName: string;
    columnName: string;
    dataType: string;
    confidence: number;
    llmReasoning: string;
  }>;
  isPreferred?: boolean;
}

interface TermDetailsProps {
  term: Term | null;
  onTermUpdate: (termId: string, updates: Partial<Term>) => void;
  showSchemaMapping?: boolean;
  showLLMReasoning?: boolean;
  allowEditing?: boolean;
}

export function TermDetails({
  term,
  onTermUpdate,
  showSchemaMapping = false,
  showLLMReasoning = false,
  allowEditing = true
}: TermDetailsProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedDefinition, setEditedDefinition] = useState('');
  const [reviewNote, setReviewNote] = useState('');

  if (!term) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Term</h3>
          <p className="text-gray-500">Choose a term from the list to view and edit its details</p>
        </div>
      </Card>
    );
  }

  const getStatusBadge = (status: Term['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'flagged':
        return <Badge variant="warning">Flagged</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getMappingConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'emerald';
    if (confidence >= 0.8) return 'blue';
    if (confidence >= 0.7) return 'amber';
    return 'red';
  };

  const handleApprove = () => {
    const updates: Partial<Term> = { 
      status: 'approved' as const
    };
    if (term.schemaMapping) {
      updates.schemaMapping = { 
        ...term.schemaMapping, 
        isApproved: true 
      };
    }
    onTermUpdate(term.id, updates);
    setReviewNote('');
  };

  const handleReject = () => {
    const updates: Partial<Term> = { 
      status: 'rejected' as const
    };
    if (term.schemaMapping) {
      updates.schemaMapping = { 
        ...term.schemaMapping, 
        isRejected: true 
      };
    }
    onTermUpdate(term.id, updates);
    setReviewNote('');
  };

  const handleFlag = () => {
    onTermUpdate(term.id, { status: 'flagged' });
    setReviewNote('');
  };

  const handleTogglePreferred = () => {
    onTermUpdate(term.id, { isPreferred: !term.isPreferred });
  };

  const startEditing = (field: string) => {
    if (field === 'definition') {
      setEditingField(field);
      setEditedDefinition(term.definition);
    }
  };

  const saveEdit = () => {
    if (editingField === 'definition') {
      onTermUpdate(term.id, { definition: editedDefinition });
      setEditingField(null);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditedDefinition('');
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Term Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Term Details</h2>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(term.confidence)}`}>
              {Math.round(term.confidence * 100)}%
            </span>
            {getStatusBadge(term.status)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900">{term.term}</h1>
          {term.isPreferred && (
            <Star className="w-6 h-6 text-amber-500 fill-current" />
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Definition */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Definition</label>
            {allowEditing && editingField !== 'definition' && (
              <Button
                variant="ghost"
                size="sm"
                icon={Edit3}
                onClick={() => startEditing('definition')}
              />
            )}
          </div>
          {editingField === 'definition' ? (
            <div className="space-y-2">
              <textarea
                value={editedDefinition}
                onChange={(e) => setEditedDefinition(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={saveEdit}>Save</Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
              {term.definition}
            </p>
          )}
        </div>

        {/* Source Context */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Source Context
          </label>
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm text-gray-600 leading-relaxed italic">
              "{term.context}"
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Section: {term.sourceSection}
            </div>
          </div>
        </div>

        {/* Schema Mapping Section */}
        {showSchemaMapping && term.schemaMapping && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Suggested Schema Mapping
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <code className="text-lg font-mono text-gray-800">
                  {term.schemaMapping.schemaName}.
                  {term.schemaMapping.tableName}.
                  {term.schemaMapping.columnName}
                </code>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" size="sm">
                    {term.schemaMapping.dataType}
                  </Badge>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(term.schemaMapping.confidence)}`}>
                    {Math.round(term.schemaMapping.confidence * 100)}%
                  </span>
                </div>
              </div>
              <ProgressBar 
                value={term.schemaMapping.confidence * 100}
                color={getMappingConfidenceColor(term.schemaMapping.confidence)}
                className="mb-3"
              />
            </div>

            {/* LLM Reasoning */}
            {showLLMReasoning && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  LLM Reasoning
                </h4>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {term.schemaMapping.llmReasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Alternative Mappings */}
            {term.alternativeMappings && term.alternativeMappings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Alternative Mappings</h4>
                <div className="space-y-2">
                  {term.alternativeMappings.map((mapping, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-800">
                          {mapping.schemaName}.{mapping.tableName}.{mapping.columnName}
                        </code>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {Math.round(mapping.confidence * 100)}%
                          </span>
                          <Button variant="ghost" size="sm">
                            Select
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Related Terms */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Related Terms</h3>
          <div className="flex flex-wrap gap-2">
            {term.relatedTerms.map(relatedTerm => (
              <button
                key={relatedTerm}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                {relatedTerm}
              </button>
            ))}
          </div>
        </div>

        {/* Review Notes */}
        {allowEditing && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Add Review Note</h3>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add notes about this term or mapping decision..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Action Panel */}
      {allowEditing && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={term.isPreferred || false}
                  onChange={handleTogglePreferred}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Mark as Preferred</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                icon={Flag}
                onClick={handleFlag}
                className="text-amber-600 hover:text-amber-700"
              >
                Flag
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={X}
                onClick={handleReject}
                disabled={term.status === 'approved'}
              >
                Reject
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={Check}
                onClick={handleApprove}
                disabled={term.status === 'approved'}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}