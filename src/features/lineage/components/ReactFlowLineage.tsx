import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TableNodeComponent from './TableNode';

// React Flow compatible node and edge types
export interface ReactFlowNode extends Node {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: 'table' | 'view' | 'dashboard' | 'notebook';
    columns?: Array<{
      name: string;
      type: string;
      classification?: string;
    }>;
    metadata?: any;
  };
}

export interface ReactFlowEdge extends Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    relationship: 'join' | 'transformation' | 'reference';
    properties?: any;
  };
}

interface ReactFlowLineageProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  onNodeClick?: (node: ReactFlowNode) => void;
  onEdgeClick?: (edge: ReactFlowEdge) => void;
  className?: string;
}

export function ReactFlowLineage({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  onEdgeClick,
  className = '',
}: ReactFlowLineageProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      tableNode: TableNodeComponent,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node as ReactFlowNode);
      }
    },
    [onNodeClick]
  );

  const onEdgeClickHandler = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge as ReactFlowEdge);
      }
    },
    [onEdgeClick]
  );

  return (
    <div className={`w-full h-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        onEdgeClick={onEdgeClickHandler}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

// Helper function to convert existing lineage data to React Flow format
export function convertToReactFlowFormat(
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
): { nodes: ReactFlowNode[]; edges: ReactFlowEdge[] } {
  const reactFlowNodes: ReactFlowNode[] = legacyNodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: {
      label: node.name,
      nodeType: node.type,
      metadata: node.metadata,
    },
    type: 'tableNode', // Use our custom table node
  }));

  const reactFlowEdges: ReactFlowEdge[] = legacyEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: {
      relationship: edge.type,
    },
    type: 'default', // Use default edge type for now
  }));

  return {
    nodes: reactFlowNodes,
    edges: reactFlowEdges,
  };
}
