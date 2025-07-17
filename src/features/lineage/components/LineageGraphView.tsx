import React, { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '../../../components/Button';

interface GraphNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'dashboard' | 'notebook';
  position: { x: number; y: number };
  metadata?: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'join' | 'transformation' | 'reference';
  label?: string;
}

interface LineageGraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode?: string;
  onNodeSelect: (nodeId: string) => void;
  className?: string;
}

export function LineageGraphView({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  className = ''
}: LineageGraphViewProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const getNodeColor = (type: string, isSelected: boolean) => {
    const colors = {
      table: isSelected ? 'bg-blue-600' : 'bg-blue-500',
      view: isSelected ? 'bg-emerald-600' : 'bg-emerald-500',
      dashboard: isSelected ? 'bg-purple-600' : 'bg-purple-500',
      notebook: isSelected ? 'bg-amber-600' : 'bg-amber-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className={`relative bg-gray-50 ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
        <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
        <span className="text-sm text-gray-600 min-w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
        <Button variant="ghost" size="sm" icon={Maximize2} />
      </div>

      {/* Graph Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const sourceX = (sourceNode.position.x + 96) * zoomLevel + panOffset.x;
            const sourceY = (sourceNode.position.y + 40) * zoomLevel + panOffset.y;
            const targetX = (targetNode.position.x + 96) * zoomLevel + panOffset.x;
            const targetY = (targetNode.position.y + 40) * zoomLevel + panOffset.y;

            return (
              <g key={edge.id}>
                <defs>
                  <marker
                    id={`arrow-${edge.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                  </marker>
                </defs>
                <path
                  d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY - 50} ${targetX} ${targetY}`}
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  markerEnd={`url(#arrow-${edge.id})`}
                />
                {edge.label && (
                  <text
                    x={(sourceX + targetX) / 2}
                    y={(sourceY + targetY) / 2 - 25}
                    className="text-xs fill-gray-600"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const isSelected = selectedNode === node.id;
          
          return (
            <div
              key={node.id}
              className="absolute cursor-pointer transition-all duration-200"
              style={{
                left: node.position.x * zoomLevel + panOffset.x,
                top: node.position.y * zoomLevel + panOffset.y,
                transform: `scale(${zoomLevel})`
              }}
              onClick={() => onNodeSelect(node.id)}
            >
              <div className={`
                min-w-48 p-4 rounded-lg border-2 shadow-lg bg-white
                ${isSelected ? 'ring-2 ring-blue-400 border-blue-500' : 'border-gray-200'}
                hover:shadow-xl transition-shadow
              `}>
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getNodeColor(node.type, isSelected)}`} />
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {node.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 capitalize">{node.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}