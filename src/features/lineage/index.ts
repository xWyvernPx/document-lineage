export { DataLineageViewer } from './components/DataLineageViewer';
// export { LineageGraphView } from './components/LineageGraphView'; // Deprecated - use ReactFlowLineage
export { ReactFlowLineage as LineageGraphView } from './components/ReactFlowLineage'; // New default
export { LineageDetailPanel } from './components/LineageDetailPanel';
export { NAPASLineageViewer } from './components/NAPASLineageViewer';
export { ReactFlowLineage, convertToReactFlowFormat } from './components/ReactFlowLineage';
export { TableNodeComponent as TableNode } from './components/TableNode';
export { ReactFlowLineageDemo } from './components/ReactFlowLineageDemo';

// Export services and utilities
export { lineageService } from '../../services/lineageService';
export {
  transformServerToReactFlow,
  transformLegacyToReactFlow,
  generateAutoLayout,
  getEdgeStyle,
  validateLineageData,
} from '../../utils/lineageTransformers';

// Export hooks
export {
  useLineage,
  useMultipleLineage,
  useLineageRaw,
  useUpdateNodePosition,
  useRefreshLineage,
  usePrefetchLineage,
} from '../../hooks/useLineage';

// Export types
export type {
  LineageNode,
  LineageEdge,
  LineageGraph,
  LineageResponse,
  TableNodeData,
  LineageOptions,
} from '../../lib/types';