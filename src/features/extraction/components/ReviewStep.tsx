import React, { useState } from 'react';
import { CheckCircle, XCircle, Edit3, Flag, Download } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface ReviewStepProps {
  documentData: any;
  classificationData: any;
  enrichmentData: any;
}

interface ReviewableTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reviewNotes?: string;
}

export function ReviewStep({ enrichmentData }: ReviewStepProps) {
  const [terms, setTerms] = useState<ReviewableTerm[]>(
    enrichmentData?.terms?.map((term: any) => ({
      ...term,
      status: 'pending' as const
    })) || []
  );
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const handleTermReview = (termId: string, status: ReviewableTerm['status'], notes?: string) => {
    setTerms(prev => prev.map(term => 
      term.id === termId 
        ? { ...term, status, reviewNotes: notes }
        : term
    ));
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedTerms.length === 0) return;
    
    setTerms(prev => prev.map(term => 
      selectedTerms.includes(term.id)
        ? { ...term, status: bulkAction as ReviewableTerm['status'] }
        : term
    ));
    
    setSelectedTerms([]);
    setBulkAction('');
  };

  const getStatusBadge = (status: ReviewableTerm['status']) => {
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

  const getStatusIcon = (status: ReviewableTerm['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const stats = {
    total: terms.length,
    pending: terms.filter(t => t.status === 'pending').length,
    approved: terms.filter(t => t.status === 'approved').length,
    rejected: terms.filter(t => t.status === 'rejected').length,
    flagged: terms.filter(t => t.status === 'flagged').length,
  };

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Terms</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.flagged}</div>
          <div className="text-sm text-gray-600">Flagged</div>
        </Card>
      </div>

      {/* Bulk Actions */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedTerms.length} terms selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">Bulk Action</option>
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
                <option value="flagged">Flag</option>
              </select>
              <Button
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedTerms.length === 0}
              >
                Apply
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={Download}>
            Export
          </Button>
        </div>
      </Card>

      {/* Terms Review Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedTerms.length === terms.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTerms(terms.map(t => t.id));
                      } else {
                        setSelectedTerms([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Term</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Definition</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.map(term => (
                <tr key={term.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedTerms.includes(term.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTerms(prev => [...prev, term.id]);
                        } else {
                          setSelectedTerms(prev => prev.filter(id => id !== term.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(term.status)}
                      <span className="font-medium text-gray-900">{term.term}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-sm text-gray-600 truncate" title={term.definition}>
                      {term.definition}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="info" size="sm">{term.category}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(term.status)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleTermReview(term.id, 'approved')}
                        className="text-emerald-600 hover:text-emerald-700"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleTermReview(term.id, 'rejected')}
                        className="text-red-600 hover:text-red-700"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Flag}
                        onClick={() => handleTermReview(term.id, 'flagged')}
                        className="text-amber-600 hover:text-amber-700"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit3}
                        className="text-gray-600 hover:text-gray-700"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}