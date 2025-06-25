import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  CheckCircle, 
  Star, 
  Flag, 
  Clock, 
  Download, 
  FileText, 
  Users, 
  Calendar,
  ArrowLeft,
  Upload,
  Database,
  Eye,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { ProgressBar } from '../../../components/ProgressBar';
import { StepInstructions } from '../../../components/StepInstructions';

interface PublishingTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  status: 'approved' | 'preferred' | 'flagged' | 'pending';
  confidence: number;
  sourceSection: string;
  reviewedBy?: string;
  reviewedAt?: string;
  mappingCount: number;
  selected: boolean;
}

const mockTerms: PublishingTerm[] = [
  {
    id: '1',
    term: 'Business Requirements',
    definition: 'Documented needs and expectations that a business solution must fulfill to achieve organizational objectives.',
    category: 'Process',
    status: 'approved',
    confidence: 0.95,
    sourceSection: 'Business Requirements',
    reviewedBy: 'Sarah Johnson',
    reviewedAt: '2024-01-16T10:30:00Z',
    mappingCount: 3,
    selected: true
  },
  {
    id: '2',
    term: 'Risk Assessment',
    definition: 'Systematic process of evaluating potential risks that could negatively impact business operations.',
    category: 'Risk Management',
    status: 'preferred',
    confidence: 0.92,
    sourceSection: 'Risk Assessment',
    reviewedBy: 'Michael Chen',
    reviewedAt: '2024-01-16T09:15:00Z',
    mappingCount: 2,
    selected: true
  },
  {
    id: '3',
    term: 'Implementation Plan',
    definition: 'Detailed roadmap outlining the steps, timeline, and resources required to execute a project.',
    category: 'Project Management',
    status: 'approved',
    confidence: 0.89,
    sourceSection: 'Implementation Plan',
    reviewedBy: 'Emily Rodriguez',
    reviewedAt: '2024-01-15T16:45:00Z',
    mappingCount: 1,
    selected: true
  },
  {
    id: '4',
    term: 'Data Governance',
    definition: 'Framework of policies, procedures, and controls that ensure data quality, security, and compliance.',
    category: 'Data Management',
    status: 'flagged',
    confidence: 0.87,
    sourceSection: 'Data Strategy',
    reviewedBy: 'David Kim',
    reviewedAt: '2024-01-15T14:20:00Z',
    mappingCount: 4,
    selected: false
  },
  {
    id: '5',
    term: 'Stakeholder Engagement',
    definition: 'Process of involving individuals or groups who may be affected by or have influence over project outcomes.',
    category: 'Project Management',
    status: 'pending',
    confidence: 0.84,
    sourceSection: 'Stakeholder Analysis',
    mappingCount: 1,
    selected: false
  },
  {
    id: '6',
    term: 'Quality Assurance',
    definition: 'Systematic activities implemented to ensure that quality requirements are fulfilled.',
    category: 'Process',
    status: 'approved',
    confidence: 0.91,
    sourceSection: 'Quality Management',
    reviewedBy: 'Lisa Wang',
    reviewedAt: '2024-01-15T11:30:00Z',
    mappingCount: 2,
    selected: true
  }
];

export function PublishingWorkflow() {
  const [terms, setTerms] = useState<PublishingTerm[]>(mockTerms);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTerms, setSelectedTerms] = useState<string[]>(
    terms.filter(term => term.selected).map(term => term.id)
  );

  const categories = Array.from(new Set(terms.map(term => term.category)));
  const statuses = ['approved', 'preferred', 'flagged', 'pending'];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || term.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || term.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: PublishingTerm['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'preferred':
        return <Star className="w-4 h-4 text-amber-500 fill-current" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: PublishingTerm['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'preferred':
        return <Badge variant="warning">Preferred</Badge>;
      case 'flagged':
        return <Badge variant="error">Flagged</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const getStatusTooltip = (status: PublishingTerm['status']) => {
    switch (status) {
      case 'approved':
        return 'Term has been reviewed and approved for publication';
      case 'preferred':
        return 'Term is marked as the preferred definition for this concept';
      case 'flagged':
        return 'Term requires additional review before publication';
      default:
        return 'Term is awaiting review and approval';
    }
  };

  const handleTermSelection = (termId: string) => {
    setSelectedTerms(prev => 
      prev.includes(termId) 
        ? prev.filter(id => id !== termId)
        : [...prev, termId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredTerms.map(term => term.id);
    if (selectedTerms.length === allFilteredIds.length) {
      setSelectedTerms([]);
    } else {
      setSelectedTerms(allFilteredIds);
    }
  };

  const handleSetPreferred = (termId: string) => {
    setTerms(prev => prev.map(term => 
      term.id === termId 
        ? { ...term, status: 'preferred' as const }
        : term
    ));
  };

  const getPublishingStats = () => {
    const selectedTermsData = terms.filter(term => selectedTerms.includes(term.id));
    return {
      total: selectedTermsData.length,
      approved: selectedTermsData.filter(t => t.status === 'approved').length,
      preferred: selectedTermsData.filter(t => t.status === 'preferred').length,
      flagged: selectedTermsData.filter(t => t.status === 'flagged').length,
      pending: selectedTermsData.filter(t => t.status === 'pending').length
    };
  };

  const stats = getPublishingStats();
  const reviewProgress = terms.filter(t => t.status !== 'pending').length / terms.length * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <StepInstructions
        title="Publishing & Approval"
        description="Review and finalize enriched business terms before publishing to the business glossary. Select terms for publication and ensure all definitions meet quality standards."
        tips={[
          "Review all flagged terms before publishing",
          "Use batch selection for efficient approval workflows",
          "Mark important terms as 'Preferred' for organizational standards",
          "Export approved terms for external review if needed"
        ]}
        helpContent="This final step allows you to review all extracted and enriched terms before they are published to your business glossary. You can approve terms, mark preferred definitions, and ensure quality before making them available to your organization."
        variant="blue"
      />

      <div className="grid grid-cols-5 gap-6 h-[calc(100vh-300px)]">
        {/* Left Panel (60%) - Terms Pending Approval */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Terms Pending Approval
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" icon={Download}>
                    Export
                  </Button>
                  <Button variant="ghost" size="sm" icon={MoreHorizontal} />
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Review terms pending approval before publishing into the business glossary.
              </p>

              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Batch Selection */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTerms.length === filteredTerms.length && filteredTerms.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {selectedTerms.length} of {filteredTerms.length} terms selected
                    </span>
                  </div>
                  {selectedTerms.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        Approve All
                      </Button>
                      <Button variant="ghost" size="sm">
                        Flag All
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Terms List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3">
                {filteredTerms.map(term => (
                  <div
                    key={term.id}
                    className={`p-4 rounded-lg border transition-all duration-200 ${
                      selectedTerms.includes(term.id)
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedTerms.includes(term.id)}
                        onChange={() => handleTermSelection(term.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(term.status)}
                            <h3 className="font-medium text-gray-900">{term.term}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(term.status)}
                            <span className="text-sm text-gray-500">
                              {Math.round(term.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-2">
                          <Badge variant="info" size="sm">{term.category}</Badge>
                          <span className="text-xs text-gray-500">
                            {term.mappingCount} schema mapping{term.mappingCount !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {term.definition}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Section: {term.sourceSection}</span>
                            {term.reviewedBy && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{term.reviewedBy}</span>
                                </div>
                              </>
                            )}
                            {term.reviewedAt && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(term.reviewedAt)}</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            {term.status !== 'preferred' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Star}
                                onClick={() => handleSetPreferred(term.id)}
                                className="text-amber-600 hover:text-amber-700"
                                title="Set as Preferred"
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              title="View Details"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel (40%) - Publish Overview */}
        <div className="col-span-2">
          <Card className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Publish Overview
              </h2>
              <p className="text-gray-600">
                {stats.total} of {terms.length} terms ready for publishing
              </p>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {/* Progress Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Review Progress</h3>
                  <span className="text-sm text-gray-600">
                    {Math.round(reviewProgress)}% Complete
                  </span>
                </div>
                <ProgressBar 
                  value={reviewProgress} 
                  color="emerald" 
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  {terms.filter(t => t.status !== 'pending').length} of {terms.length} terms reviewed
                </p>
              </div>

              {/* Summary Counts */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Selected for Publishing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-gray-900">Approved Terms</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{stats.approved}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium text-gray-900">Preferred Terms</span>
                    </div>
                    <span className="text-lg font-bold text-amber-600">{stats.preferred}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Flag className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-900">Flagged Terms</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{stats.flagged}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">Pending Terms</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">{stats.pending}</span>
                  </div>
                </div>
              </div>

              {/* Total Selected */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Total Selected</h4>
                    <p className="text-sm text-blue-700">Ready for publication</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
                </div>
              </div>

              {/* Export Options */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" icon={FileText} className="w-full justify-start">
                    Export as CSV
                  </Button>
                  <Button variant="ghost" size="sm" icon={Database} className="w-full justify-start">
                    Export as JSON
                  </Button>
                  <Button variant="ghost" size="sm" icon={Download} className="w-full justify-start">
                    Download Report
                  </Button>
                </div>
              </div>

              {/* Publishing Destination */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Publishing Destination</h4>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Business Glossary</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Terms will be published to the main business glossary and made available to all users.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Upload}
                  disabled={stats.total === 0 || stats.flagged > 0}
                  className="w-full"
                >
                  Publish {stats.total} Terms
                </Button>
                
                {stats.flagged > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600">
                    <Flag className="w-4 h-4" />
                    <span>Resolve flagged terms before publishing</span>
                  </div>
                )}
                
                <Button variant="ghost" size="sm" className="w-full">
                  Save as Draft
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          className="flex items-center space-x-2"
        >
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          Step 4 of 4 • Publishing & Approval
        </div>
      </div>
    </div>
  );
}