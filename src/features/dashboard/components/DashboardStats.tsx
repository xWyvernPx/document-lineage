import React from 'react';
import { FileText, BookOpen, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { Card } from '../../../components/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-emerald-600 mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Documents"
        value={248}
        change="+12% from last month"
        icon={FileText}
        color="blue"
      />
      <StatCard
        title="Extracted Terms"
        value="1,847"
        change="+8% from last month"
        icon={BookOpen}
        color="purple"
      />
      <StatCard
        title="Reviewed Terms"
        value="1,203"
        change="+15% from last month"
        icon={CheckCircle}
        color="emerald"
      />
      <StatCard
        title="Pending Review"
        value={644}
        change="+5% from last month"
        icon={Clock}
        color="amber"
      />
    </div>
  );
}