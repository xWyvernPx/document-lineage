import React from 'react';
import { FileText, BookOpen, CheckCircle, Flag, Clock } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';

interface ActivityItem {
  id: string;
  type: 'document_uploaded' | 'term_extracted' | 'term_reviewed' | 'term_flagged';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'document_uploaded',
    title: 'New document uploaded',
    description: 'Credit Policy v3.2.pdf',
    timestamp: '2 minutes ago',
    user: 'Sarah Johnson',
  },
  {
    id: '2',
    type: 'term_reviewed',
    title: 'Term reviewed and approved',
    description: 'Credit Score definition approved',
    timestamp: '15 minutes ago',
    user: 'Michael Chen',
  },
  {
    id: '3',
    type: 'term_flagged',
    title: 'Term flagged for review',
    description: 'Risk Assessment needs clarification',
    timestamp: '1 hour ago',
    user: 'System',
  },
  {
    id: '4',
    type: 'term_extracted',
    title: 'Terms extracted',
    description: '23 new terms from Compliance Framework.pdf',
    timestamp: '2 hours ago',
    user: 'System',
  },
  {
    id: '5',
    type: 'document_uploaded',
    title: 'Document processing completed',
    description: 'Business Requirements v1.5.docx',
    timestamp: '3 hours ago',
    user: 'Emily Rodriguez',
  },
];

export function RecentActivity() {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'document_uploaded':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'term_extracted':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'term_reviewed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'term_flagged':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'document_uploaded':
        return <Badge variant="info">Document</Badge>;
      case 'term_extracted':
        return <Badge variant="default">Extraction</Badge>;
      case 'term_reviewed':
        return <Badge variant="success">Review</Badge>;
      case 'term_flagged':
        return <Badge variant="error">Flagged</Badge>;
      default:
        return <Badge>Activity</Badge>;
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                {getActivityBadge(activity.type)}
              </div>
              <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{activity.timestamp}</span>
                <span>•</span>
                <span>{activity.user}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}