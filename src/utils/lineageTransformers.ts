import { 
  LineageResponse, 
  LineageNodeData, 
  LineageEdgeData,
  LineageNode,
  LineageEdge,
  LineageGraph,
  LineageServerResponse,
  ReactFlowResponse,
  ReactFlowNodeType,
  ReactFlowEdgeType
} from '../lib/types';

/**
 * Utility functions for transforming lineage data between different formats
 */

// Transform server response to React Flow format
export function transformServerToReactFlow(lineageResponse: LineageResponse): LineageGraph {
  const nodes: LineageNode[] = lineageResponse.nodes.map((nodeData: LineageNodeData, index: number) => ({
    id: nodeData.id,
    type: 'tableNode',
    position: nodeData.position || generateAutoLayout(index, lineageResponse.nodes.length),
    data: {
      label: nodeData.name,
      nodeType: nodeData.type as any,
      metadata: {
        schema: nodeData.schema,
        database: nodeData.database,
        ...nodeData.metadata,
      },
      columns: nodeData.columns,
    },
    draggable: true,
    selectable: true,
  }));

  const edges: LineageEdge[] = lineageResponse.relationships.map((edgeData: LineageEdgeData) => ({
    id: edgeData.id,
    source: edgeData.sourceNodeId,
    target: edgeData.targetNodeId,
    type: 'default',
    label: edgeData.relationshipType,
    data: {
      relationship: edgeData.relationshipType,
      properties: {
        sourceColumns: edgeData.sourceColumns,
        targetColumns: edgeData.targetColumns,
        transformationLogic: edgeData.transformationLogic,
        ...edgeData.metadata,
      },
    },
    animated: edgeData.relationshipType === 'transformation',
    style: getEdgeStyle(edgeData.relationshipType),
  }));

  return {
    nodes,
    edges,
    metadata: {
      depth: lineageResponse.metadata.queryDepth,
      direction: lineageResponse.metadata.direction,
      rootEntity: lineageResponse.metadata.rootEntityId,
    },
  };
}

// Transform legacy format to React Flow format
export function transformLegacyToReactFlow(
  legacyNodes: Array<{
    id: string;
    name: string;
    type: 'table' | 'view' | 'dashboard' | 'notebook';
    position: { x: number; y: number };
    metadata?: any;
  }>,
  legacyEdges: Array<{
    id: string;
    source: string;
    target: string;
    type: 'join' | 'transformation' | 'reference';
    label?: string;
  }>
): LineageGraph {
  const nodes: LineageNode[] = legacyNodes.map((node) => ({
    id: node.id,
    type: 'tableNode',
    position: node.position,
    data: {
      label: node.name,
      nodeType: node.type,
      metadata: node.metadata,
    },
    draggable: true,
    selectable: true,
  }));

  const edges: LineageEdge[] = legacyEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'default',
    label: edge.label,
    data: {
      relationship: edge.type,
    },
    animated: edge.type === 'transformation',
    style: getEdgeStyle(edge.type),
  }));

  return {
    nodes,
    edges,
    metadata: {
      depth: 3,
      direction: 'both',
      rootEntity: nodes[0]?.id || '',
    },
  };
}

// Generate automatic layout for nodes when positions aren't provided
export function generateAutoLayout(index: number, totalNodes: number): { x: number; y: number } {
  const nodesPerRow = Math.ceil(Math.sqrt(totalNodes));
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;
  
  return {
    x: col * 300 + 100,
    y: row * 200 + 100,
  };
}

// Get edge styling based on relationship type
export function getEdgeStyle(relationshipType: string): Record<string, any> {
  switch (relationshipType) {
    case 'join':
      return {
        stroke: '#3b82f6', // blue
        strokeWidth: 2,
      };
    case 'transformation':
      return {
        stroke: '#10b981', // green
        strokeWidth: 2,
        strokeDasharray: '5,5',
      };
    case 'reference':
      return {
        stroke: '#6b7280', // gray
        strokeWidth: 1,
      };
    default:
      return {
        stroke: '#6b7280',
        strokeWidth: 1,
      };
  }
}

// Helper to extract node IDs for API calls
export function extractNodeIds(lineageGraph: LineageGraph): string[] {
  return lineageGraph.nodes.map(node => node.id);
}

// Helper to validate lineage data integrity
export function validateLineageData(lineageGraph: LineageGraph): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeIds = new Set(lineageGraph.nodes.map(n => n.id));

  // Check for duplicate node IDs
  if (nodeIds.size !== lineageGraph.nodes.length) {
    errors.push('Duplicate node IDs detected');
  }

  // Check edge references
  lineageGraph.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source node ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target node ${edge.target}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// NEW: Transform server data with new contract to React Flow format
export function transformNewServerToReactFlow(
  serverResponse: LineageServerResponse
): ReactFlowResponse {
  const nodes: ReactFlowNodeType[] = serverResponse.nodes.map((serverNode, index) => {
    // Extract columns from metadata if available
    const columns = serverNode.metadata?.columns || [];
    
    return {
      id: serverNode.id,
      type: serverNode.node_type,
      data: {
        label: serverNode.node_name,
        nodeType: serverNode.node_type as 'table' | 'view' | 'dashboard' | 'notebook',
        columns: columns.map((col: any) => ({
          name: col.name || col.column_name,
          type: col.type || col.data_type,
          classification: col.classification || 'UNKNOWN'
        })),
        metadata: {
          qualifiedName: serverNode.qualified_name,
          system: serverNode.system,
          jobId: serverNode.jobId,
          ...serverNode.metadata
        }
      },
      position: generateAutoLayout(index, serverResponse.nodes.length)
    };
  });

  const edges: ReactFlowEdgeType[] = serverResponse.edges.map((serverEdge) => {
    // Generate label from relationship type and metadata
    const sourceCol = serverEdge.source_meta?.column_name || '';
    const targetCol = serverEdge.target_meta?.column_name || '';
    const label = sourceCol && targetCol 
      ? `${sourceCol} → ${targetCol}`
      : serverEdge.relationship_type;

    return {
      id: serverEdge.relationship_id,
      source: serverEdge.source_node_id,
      target: serverEdge.target_node_id,
      type: 'smoothstep',
      label: label
    };
  });

  return {
    nodes,
    edges
  };
}
