import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../../../components/Card';

const processingData = [
  { name: 'Mon', documents: 12, terms: 156 },
  { name: 'Tue', documents: 19, terms: 243 },
  { name: 'Wed', documents: 8, terms: 89 },
  { name: 'Thu', documents: 23, terms: 287 },
  { name: 'Fri', documents: 15, terms: 195 },
  { name: 'Sat', documents: 6, terms: 67 },
  { name: 'Sun', documents: 4, terms: 45 },
];

const documentTypeData = [
  { name: 'Policy', value: 35, color: '#3B82F6' },
  { name: 'BRD', value: 28, color: '#10B981' },
  { name: 'Regulatory', value: 20, color: '#F59E0B' },
  { name: 'Contract', value: 12, color: '#8B5CF6' },
  { name: 'Other', value: 5, color: '#6B7280' },
];

export function ProcessingChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Processing Activity
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="documents" fill="#3B82F6" name="Documents" />
              <Bar dataKey="terms" fill="#10B981" name="Terms" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Document Types Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={documentTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {documentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {documentTypeData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}