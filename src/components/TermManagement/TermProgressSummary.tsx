import React from 'react';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';

interface Term {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
}

interface TermProgressSummaryProps {
  terms: Term[];
}

export function TermProgressSummary({ terms }: TermProgressSummaryProps) {
  const stats = {
    total: terms.length,
    approved: terms.filter(t => t.status === 'approved').length,
    pending: terms.filter(t => t.status === 'pending').length,
    flagged: terms.filter(t => t.status === 'flagged').length,
    rejected: terms.filter(t => t.status === 'rejected').length
  };

  const progressPercentage = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Enrichment Progress</h3>
          <p className="text-sm text-gray-600">
            {stats.approved} of {stats.total} terms approved
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>
      <ProgressBar 
        value={progressPercentage} 
        color="emerald" 
        className="mb-4"
      />
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-emerald-600">{stats.approved}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-amber-600">{stats.flagged}</div>
          <div className="text-xs text-gray-500">Flagged</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-red-600">{stats.rejected}</div>
          <div className="text-xs text-gray-500">Rejected</div>
        </div>
      </div>
    </Card>
  );
}