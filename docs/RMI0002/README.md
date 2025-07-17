# React Flow Lineage Migration Documentation

## Overview

This document provides comprehensive documentation for the React Flow lineage migration (RMI0002), which replaced the custom D3/SVG lineage visualization with a modern React Flow-based implementation featuring draggable nodes, enhanced user experience, and improved maintainability.

## Architecture

### Core Components

#### ReactFlowLineage
The main lineage visualization component built on React Flow.

**Props:**
```typescript
interface ReactFlowLineageProps {
  nodes: LineageNode[];
  edges: LineageEdge[];
  className?: string;
  onNodeClick?: (node: LineageNode) => void;
  onEdgeClick?: (edge: LineageEdge) => void;
}
```

**Features:**
- Draggable nodes with real-time position updates
- Zoom, pan, and fit-to-view controls
- Minimap for navigation
- Background patterns (dots/lines)
- Custom node types (TableNode)
- Edge styling based on relationship types

**Usage:**
```tsx
import { ReactFlowLineage } from '@/features/lineage';

<ReactFlowLineage
  nodes={lineageData.nodes}
  edges={lineageData.edges}
  onNodeClick={(node) => console.log('Clicked:', node)}
/>
```

#### TableNode
Custom React Flow node component for displaying table information.

**Data Structure:**
```typescript
interface TableNodeData {
  id: string;
  name: string;
  type: 'table' | 'view' | 'procedure' | 'function';
  schema?: string;
  database?: string;
  columns?: Array<{
    name: string;
    type: string;
    primaryKey?: boolean;
    nullable?: boolean;
  }>;
  description?: string;
  metadata?: Record<string, any>;
}
```

**Features:**
- Displays table name, schema, and database
- Shows column information with types
- Icon indicators for different entity types
- Connection handles for edges
- Responsive design with hover effects

### Data Layer

#### lineageService
API service layer following existing application patterns.

**Methods:**
```typescript
// Get lineage for single entity
getLineage(entityId: string, options?: LineageOptions): Promise<ApiResponse<LineageResponse>>

// Get lineage for multiple entities
getMultipleLineage(entityIds: string[], options?: LineageOptions): Promise<ApiResponse<LineageResponse>>

// Mock data generation
generateMockLineage(entityId: string, options?: LineageOptions): LineageResponse
```

**Configuration:**
- Supports both mock and real API modes
- Environment-based URL configuration
- Error handling and retry logic
- Request/response logging

#### lineageTransformers
Utility functions for data transformation between different lineage formats.

**Functions:**
```typescript
// Transform server response to React Flow format
transformServerToReactFlow(response: LineageResponse): LineageGraph

// Transform legacy D3 format to React Flow
transformLegacyToReactFlow(legacyData: any): LineageGraph

// Generate automatic layout positioning
generateAutoLayout(index: number, totalNodes: number): { x: number; y: number }

// Get edge styling based on relationship type
getEdgeStyle(relationshipType: string): Record<string, any>

// Validate lineage data integrity
validateLineageData(data: LineageGraph): { isValid: boolean; errors: string[] }
```

### React Query Integration

#### useLineage Hook
Primary hook for fetching lineage data with caching and real-time updates.

```typescript
const {
  data: lineageData,
  isLoading,
  isError,
  error,
  refetch
} = useLineage(entityId, {
  direction: 'both',
  depth: 3,
  enabled: true
});
```

**Features:**
- Automatic data transformation to React Flow format
- 5-minute stale time with 10-minute garbage collection
- Prefetching support for smooth navigation
- Error handling and retry logic
- Integration with existing query client

#### Additional Hooks
- `useMultipleLineage`: Fetch lineage for multiple entities
- `useLineageRaw`: Get raw server response without transformation
- `useUpdateNodePosition`: Mutation for position updates
- `useRefreshLineage`: Force refresh lineage data
- `usePrefetchLineage`: Preload lineage data

## Type System

### Core Types

```typescript
// React Flow compatible node
interface LineageNode {
  id: string;
  type: 'tableNode';
  position: { x: number; y: number };
  data: TableNodeData;
}

// React Flow compatible edge
interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  label?: string;
  data?: {
    relationshipType: string;
    transformationLogic?: string;
    metadata?: Record<string, any>;
  };
}

// Complete lineage graph
interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
}

// Server response format
interface LineageResponse {
  nodes: LineageNodeData[];
  relationships: LineageEdgeData[];
  metadata: {
    queryDepth: number;
    direction: 'upstream' | 'downstream' | 'both';
    rootEntityId: string;
    totalNodes: number;
    totalRelationships: number;
    timestamp: string;
  };
}
```

## Migration Guide

### From Legacy D3/SVG Implementation

1. **Replace Component Imports**
   ```typescript
   // Old
   import { DataLineageViewer } from '@/features/lineage';
   
   // New
   import { ReactFlowLineage } from '@/features/lineage';
   ```

2. **Update Data Format**
   ```typescript
   // Transform legacy data
   const reactFlowData = transformLegacyToReactFlow(legacyLineageData);
   
   // Use with React Flow
   <ReactFlowLineage nodes={reactFlowData.nodes} edges={reactFlowData.edges} />
   ```

3. **Update Event Handlers**
   ```typescript
   // Old D3 click handlers
   onNodeClick: (d3Node) => { ... }
   
   // New React Flow handlers
   onNodeClick: (reactFlowNode) => { ... }
   ```

### Integration with Existing Components

The new React Flow components are designed to integrate seamlessly with existing lineage viewers:

```typescript
// Enhanced NAPASLineageViewer with React Flow
export function NAPASLineageViewer({ entityId }: { entityId: string }) {
  const { data, isLoading } = useLineage(entityId);
  
  if (isLoading) return <ProgressBar />;
  
  return (
    <ReactFlowProvider>
      <ReactFlowLineage 
        nodes={data.nodes} 
        edges={data.edges}
        onNodeClick={handleNodeDetails}
      />
    </ReactFlowProvider>
  );
}
```

## Performance Considerations

### Optimization Strategies

1. **Node Virtualization**: For large graphs (>1000 nodes), consider implementing virtualization
2. **Edge Bundling**: Group similar edges to reduce visual complexity
3. **Lazy Loading**: Load lineage data progressively based on viewport
4. **Memoization**: Use React.memo for node components to prevent unnecessary re-renders

### Memory Management

```typescript
// Proper cleanup in useEffect
useEffect(() => {
  return () => {
    // Clear React Flow instance
    reactFlowInstance?.destroy();
  };
}, []);
```

## Testing

### Unit Tests
Test coverage includes:
- Data transformation functions
- React Flow node rendering
- API service methods
- React Query hook behavior

### Integration Tests
- Complete lineage workflow
- User interactions (drag, zoom, click)
- Error handling scenarios
- Performance under load

## Deployment

### Production Considerations

1. **Bundle Size**: React Flow adds ~200KB to bundle (gzipped)
2. **Browser Support**: Requires modern browsers with SVG support
3. **Performance**: Optimized for graphs up to 500 nodes
4. **Accessibility**: ARIA labels and keyboard navigation

### Environment Configuration

```typescript
// production config
const LINEAGE_CONFIG = {
  maxNodes: 500,
  enableMinimap: true,
  enableControls: true,
  autoLayout: true,
  cacheTimeout: 300000, // 5 minutes
};
```

## Troubleshooting

### Common Issues

1. **Nodes Not Draggable**
   - Ensure `nodesDraggable={true}` prop is set
   - Check if nodes have valid position coordinates

2. **Edges Not Connecting**
   - Verify source and target node IDs exist
   - Check handle IDs match edge connections

3. **Performance Issues**
   - Reduce number of simultaneous nodes
   - Implement virtualization for large datasets
   - Use memo for expensive calculations

### Debug Mode

```typescript
// Enable React Flow debug logging
<ReactFlowLineage
  nodes={nodes}
  edges={edges}
  onError={(error) => console.error('React Flow Error:', error)}
/>
```

## Future Enhancements

### Roadmap

1. **Real-time Updates**: WebSocket integration for live lineage changes
2. **Advanced Filtering**: Multi-criteria node/edge filtering
3. **Export Functionality**: PDF, PNG, SVG export options
4. **Collaborative Features**: Multi-user editing and annotations
5. **Performance Optimization**: Virtual scrolling for large graphs
6. **Accessibility**: Enhanced keyboard navigation and screen reader support

### API Enhancements

1. **Position Persistence**: Save node positions to backend
2. **Incremental Loading**: Load lineage data on-demand
3. **Real-time Notifications**: Push updates for lineage changes
4. **Advanced Analytics**: Lineage impact analysis and metrics

## Conclusion

The React Flow lineage migration provides a modern, maintainable, and user-friendly lineage visualization solution. The component architecture follows existing application patterns while leveraging React Flow's powerful features for enhanced user experience.

For questions or contributions, refer to the component documentation and existing code examples in the demo components.
