import React, { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useLineage, usePrefetchLineage } from '../../hooks/useLineage';
import { ReactFlowLineage } from '../lineage/ReactFlowLineage';
import { Button } from '../Button';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';

// Sample entity IDs for demo
const SAMPLE_ENTITIES = [
  { id: 'napas.payments.transactions', name: 'Payment Transactions Table' },
  { id: 'napas.accounts.users', name: 'User Accounts Table' },
  { id: 'napas.ach.settlements', name: 'ACH Settlements Table' },
  { id: 'napas.reports.daily_summary', name: 'Daily Summary Report' },
];

interface LineageIntegrationDemoProps {
  className?: string;
}

export function LineageIntegrationDemo({ className }: LineageIntegrationDemoProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<string>(SAMPLE_ENTITIES[0].id);
  const [direction, setDirection] = useState<'upstream' | 'downstream' | 'both'>('both');
  const [depth, setDepth] = useState<number>(3);
  const [enableRealtime, setEnableRealtime] = useState(false);

  const prefetchLineage = usePrefetchLineage();

  // Main lineage query
  const {
    data: lineageData,
    isLoading,
    isError,
    error,
    refetch,
  } = useLineage(selectedEntityId, {
    direction,
    depth,
    enabled: true,
  });

  // Handle entity selection and prefetch next entity
  const handleEntityChange = (entityId: string) => {
    setSelectedEntityId(entityId);
    
    // Prefetch other entities for smooth transitions
    SAMPLE_ENTITIES.forEach(entity => {
      if (entity.id !== entityId) {
        prefetchLineage(entity.id, { direction, depth });
      }
    });
  };

  const renderControls = () => (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold mb-4">Lineage Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entity Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Entity</label>
          <select
            value={selectedEntityId}
            onChange={(e) => handleEntityChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SAMPLE_ENTITIES.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        {/* Direction Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Direction</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'upstream' | 'downstream' | 'both')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="both">Both</option>
            <option value="upstream">Upstream</option>
            <option value="downstream">Downstream</option>
          </select>
        </div>

        {/* Depth Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Depth</label>
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1 Level</option>
            <option value={2}>2 Levels</option>
            <option value={3}>3 Levels</option>
            <option value={5}>5 Levels</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={enableRealtime}
              onChange={(e) => setEnableRealtime(e.target.checked)}
              className="mr-2"
            />
            Realtime Updates
          </label>
        </div>
      </div>
    </Card>
  );

  const renderStats = () => {
    if (!lineageData) return null;

    const nodeCount = lineageData.nodes.length;
    const edgeCount = lineageData.edges.length;
    const tableNodes = lineageData.nodes.filter(node => node.data.type === 'table').length;
    const viewNodes = lineageData.nodes.filter(node => node.data.type === 'view').length;

    return (
      <Card className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Lineage Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{nodeCount}</div>
            <div className="text-sm text-gray-600">Total Nodes</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{edgeCount}</div>
            <div className="text-sm text-gray-600">Relationships</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{tableNodes}</div>
            <div className="text-sm text-gray-600">Tables</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{viewNodes}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
        </div>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="h-96 flex flex-col items-center justify-center">
          <ProgressBar progress={undefined} />
          <p className="mt-4 text-gray-600">Loading lineage data...</p>
        </Card>
      );
    }

    if (isError) {
      return (
        <Card className="h-96 flex flex-col items-center justify-center text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Error Loading Lineage</h3>
          </div>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Failed to load lineage data'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      );
    }

    if (!lineageData || lineageData.nodes.length === 0) {
      return (
        <Card className="h-96 flex flex-col items-center justify-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-semibold">No Lineage Data</h3>
          </div>
          <p className="text-gray-600">No lineage information found for this entity.</p>
        </Card>
      );
    }

    return (
      <Card className="h-96">
        <ReactFlowProvider>
          <ReactFlowLineage
            nodes={lineageData.nodes}
            edges={lineageData.edges}
            className="w-full h-full"
          />
        </ReactFlowProvider>
      </Card>
    );
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">React Flow Lineage Integration Demo</h2>
        <p className="text-gray-600">
          Interactive demonstration of the new React Flow-based lineage visualization with draggable nodes,
          real-time updates, and enhanced user experience.
        </p>
      </div>

      {renderControls()}
      {renderStats()}
      {renderContent()}

      {/* Migration Info */}
      <Card className="mt-4">
        <h3 className="text-lg font-semibold mb-4">Migration Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">✅ Implemented</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React Flow integration with draggable nodes</li>
              <li>• Custom TableNode component</li>
              <li>• Background patterns and controls</li>
              <li>• Minimap navigation</li>
              <li>• Auto-layout positioning</li>
              <li>• React Query integration</li>
              <li>• Data transformation utilities</li>
              <li>• TypeScript type safety</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-600 mb-2">🔄 In Progress</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Integration with existing lineage viewers</li>
              <li>• Server-side position persistence</li>
              <li>• Advanced filtering options</li>
              <li>• Performance optimization for large graphs</li>
              <li>• Custom edge styling</li>
              <li>• Export functionality</li>
              <li>• Accessibility improvements</li>
              <li>• Unit test coverage</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
