import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Database, 
  Table, 
  BarChart3, 
  GitBranch, 
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Code,
  Activity
} from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';

interface LineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'column' | 'dashboard' | 'notebook' | 'transformation';
  system: string;
  schema?: string;
  columns?: {
    name: string;
    type: string;
    description?: string;
  }[];
  metadata?: {
    description?: string;
    owner?: string;
    lastModified?: string;
    tags?: string[];
  };
  position: { x: number; y: number };
}

interface LineageEdge {
  id: string;
  source: string;
  target: string;
  type: 'join' | 'transformation' | 'reference' | 'aggregation';
  description?: string;
  transformationLogic?: string;
}

interface LineageData {
  nodes: LineageNode[];
  edges: LineageEdge[];
  focusNode: string;
}

const mockLineageData: LineageData = {
  focusNode: 'sales_prod.fact_orders',
  nodes: [
    {
      id: 'sales_prod.customers',
      name: 'customers',
      type: 'table',
      system: 'Snowflake',
      schema: 'sales_prod',
      columns: [
        { name: 'contact_number', type: 'VARCHAR', description: 'Customer contact number' },
        { name: 'customer_id', type: 'INT', description: 'Unique customer identifier' },
        { name: 'first_name', type: 'VARCHAR' },
        { name: 'last_name', type: 'VARCHAR' },
        { name: 'email', type: 'VARCHAR' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ],
      metadata: {
        description: 'Customer master data table',
        owner: 'Data Team',
        lastModified: '2024-01-15',
        tags: ['customer', 'master-data']
      },
      position: { x: 100, y: 200 }
    },
    {
      id: 'sales_prod.orders',
      name: 'orders',
      type: 'table',
      system: 'Snowflake',
      schema: 'sales_prod',
      columns: [
        { name: 'order_id', type: 'INT', description: 'Unique order identifier' },
        { name: 'customer_id', type: 'INT', description: 'Foreign key to customers' },
        { name: 'order_date', type: 'DATE' },
        { name: 'status', type: 'VARCHAR' },
        { name: 'total_amount', type: 'DECIMAL' }
      ],
      metadata: {
        description: 'Order transaction data',
        owner: 'Sales Team',
        lastModified: '2024-01-16',
        tags: ['orders', 'transactions']
      },
      position: { x: 100, y: 400 }
    },
    {
      id: 'sales_prod.fact_orders',
      name: 'fact_orders',
      type: 'view',
      system: 'Snowflake',
      schema: 'sales_prod',
      columns: [
        { name: 'FULL_CUSTOMER_NAME', type: 'VARCHAR', description: 'Concatenated customer name' },
        { name: 'order_id', type: 'INT' },
        { name: 'price', type: 'DECIMAL' }
      ],
      metadata: {
        description: 'Fact table for order analytics',
        owner: 'Analytics Team',
        lastModified: '2024-01-16',
        tags: ['fact', 'analytics', 'orders']
      },
      position: { x: 400, y: 300 }
    },
    {
      id: 'sales_prod.order_items',
      name: 'order_items',
      type: 'table',
      system: 'Snowflake',
      schema: 'sales_prod',
      columns: [
        { name: 'order_id', type: 'INT' },
        { name: 'product_id', type: 'INT' },
        { name: 'price', type: 'DECIMAL', description: 'Item price' },
        { name: 'quantity', type: 'INT' }
      ],
      metadata: {
        description: 'Order line items',
        owner: 'Sales Team',
        lastModified: '2024-01-15',
        tags: ['order-items', 'products']
      },
      position: { x: 100, y: 600 }
    },
    {
      id: 'dashboard.sales_kpi',
      name: 'Sales KPI Dashboard',
      type: 'dashboard',
      system: 'Tableau',
      metadata: {
        description: 'Executive sales performance dashboard',
        owner: 'BI Team',
        lastModified: '2024-01-16',
        tags: ['dashboard', 'kpi', 'sales']
      },
      position: { x: 700, y: 200 }
    },
    {
      id: 'notebook.fin_lineage',
      name: 'Fin Data Lineage',
      type: 'notebook',
      system: 'Databricks',
      metadata: {
        description: 'Financial data lineage analysis notebook',
        owner: 'Data Science Team',
        lastModified: '2024-01-14',
        tags: ['notebook', 'analysis', 'finance']
      },
      position: { x: 700, y: 400 }
    }
  ],
  edges: [
    {
      id: 'edge1',
      source: 'sales_prod.customers',
      target: 'sales_prod.fact_orders',
      type: 'join',
      description: 'JOIN on customer_id',
      transformationLogic: 'LEFT JOIN customers c ON o.customer_id = c.customer_id'
    },
    {
      id: 'edge2',
      source: 'sales_prod.orders',
      target: 'sales_prod.fact_orders',
      type: 'join',
      description: 'JOIN on order_id',
      transformationLogic: 'INNER JOIN orders o ON f.order_id = o.order_id'
    },
    {
      id: 'edge3',
      source: 'sales_prod.order_items',
      target: 'sales_prod.fact_orders',
      type: 'aggregation',
      description: 'SUM(price) aggregation',
      transformationLogic: 'SUM(oi.price * oi.quantity) as total_price'
    },
    {
      id: 'edge4',
      source: 'sales_prod.fact_orders',
      target: 'dashboard.sales_kpi',
      type: 'reference',
      description: 'Dashboard data source'
    },
    {
      id: 'edge5',
      source: 'sales_prod.fact_orders',
      target: 'notebook.fin_lineage',
      type: 'reference',
      description: 'Analysis data source'
    }
  ]
};

export function DataLineageViewer() {
  const [lineageData] = useState<LineageData>(mockLineageData);
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(
    lineageData.nodes.find(n => n.id === lineageData.focusNode) || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'data' | 'columns' | 'lineage'>('columns');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    notebooks: true,
    dashboards: true,
    transformations: true,
    accitions: true
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getNodeIcon = (type: LineageNode['type']) => {
    switch (type) {
      case 'table':
        return <Database className="w-4 h-4" />;
      case 'view':
        return <Table className="w-4 h-4" />;
      case 'dashboard':
        return <BarChart3 className="w-4 h-4" />;
      case 'notebook':
        return <Code className="w-4 h-4" />;
      case 'transformation':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: LineageNode['type'], isSelected: boolean) => {
    const baseColors = {
      table: isSelected ? 'bg-blue-600 border-blue-700' : 'bg-blue-500 border-blue-600',
      view: isSelected ? 'bg-emerald-600 border-emerald-700' : 'bg-emerald-500 border-emerald-600',
      dashboard: isSelected ? 'bg-purple-600 border-purple-700' : 'bg-purple-500 border-purple-600',
      notebook: isSelected ? 'bg-amber-600 border-amber-700' : 'bg-amber-500 border-amber-600',
      transformation: isSelected ? 'bg-gray-600 border-gray-700' : 'bg-gray-500 border-gray-600',
      column: isSelected ? 'bg-indigo-600 border-indigo-700' : 'bg-indigo-500 border-indigo-600'
    };
    return baseColors[type];
  };

  const getEdgeColor = (type: LineageEdge['type']) => {
    switch (type) {
      case 'join':
        return 'stroke-blue-500';
      case 'transformation':
        return 'stroke-emerald-500';
      case 'reference':
        return 'stroke-gray-400';
      case 'aggregation':
        return 'stroke-purple-500';
      default:
        return 'stroke-gray-400';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderNode = (node: LineageNode) => {
    const isSelected = selectedNode?.id === node.id;
    const isFocus = node.id === lineageData.focusNode;
    
    return (
      <div
        key={node.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isFocus ? 'ring-4 ring-blue-300 ring-opacity-50' : ''
        }`}
        style={{
          left: node.position.x * zoomLevel + panOffset.x,
          top: node.position.y * zoomLevel + panOffset.y,
          transform: `scale(${zoomLevel})`
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div className={`
          min-w-48 p-4 rounded-lg border-2 shadow-lg bg-white
          ${isSelected ? 'ring-2 ring-blue-400' : ''}
          hover:shadow-xl transition-shadow
        `}>
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1.5 rounded text-white ${getNodeColor(node.type, isSelected)}`}>
              {getNodeIcon(node.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {node.schema ? `${node.schema}.${node.name}` : node.name}
              </h3>
              <p className="text-xs text-gray-500">{node.system}</p>
            </div>
          </div>
          
          {node.columns && node.columns.length > 0 && (
            <div className="space-y-1">
              {node.columns.slice(0, 2).map(column => (
                <div key={column.name} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-700">{column.name}</span>
                  <span className="text-gray-500 uppercase">{column.type}</span>
                </div>
              ))}
              {node.columns.length > 2 && (
                <div className="text-xs text-gray-500 text-center py-1">
                  Show {node.columns.length - 2} more columns
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEdge = (edge: LineageEdge) => {
    const sourceNode = lineageData.nodes.find(n => n.id === edge.source);
    const targetNode = lineageData.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;

    const sourceX = (sourceNode.position.x + 96) * zoomLevel + panOffset.x; // 96 = half node width
    const sourceY = (sourceNode.position.y + 40) * zoomLevel + panOffset.y; // 40 = half node height
    const targetX = (targetNode.position.x + 96) * zoomLevel + panOffset.x;
    const targetY = (targetNode.position.y + 40) * zoomLevel + panOffset.y;

    return (
      <g key={edge.id}>
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className={getEdgeColor(edge.type)}
              fill="currentColor"
            />
          </marker>
        </defs>
        <path
          d={`M ${sourceX} ${sourceY} Q ${(sourceX + targetX) / 2} ${sourceY - 50} ${targetX} ${targetY}`}
          fill="none"
          className={`${getEdgeColor(edge.type)} stroke-2`}
          markerEnd={`url(#arrowhead-${edge.id})`}
        />
        {edge.description && (
          <text
            x={(sourceX + targetX) / 2}
            y={(sourceY + targetY) / 2 - 25}
            className="text-xs fill-gray-600"
            textAnchor="middle"
          >
            {edge.description}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 p-4">

        {/* Controls */}
        {/* <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables, columns, or dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" icon={ZoomOut} onClick={handleZoomOut} />
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button variant="ghost" size="sm" icon={ZoomIn} onClick={handleZoomIn} />
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={handleResetView} />
            <Button variant="ghost" size="sm" icon={Maximize2} />
          </div>
        </div> */}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Sources
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Sources</option>
                  <option>Snowflake</option>
                  <option>Tableau</option>
                  <option>Databricks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Types
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Types</option>
                  <option>Tables</option>
                  <option>Views</option>
                  <option>Dashboards</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lineage Depth
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>Full Path</option>
                  <option>2 Hops</option>
                  <option>1 Hop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Tags</option>
                  <option>Critical</option>
                  <option>PII</option>
                  <option>Finance</option>
                </select>
              </div>
            </div>
          </div>
        )}
      {/* </div> */} 

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Graph Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {lineageData.edges.map(renderEdge)}
            </svg>
            
            {/* Nodes */}
            {lineageData.nodes.map(renderNode)}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {selectedNode ? (
            <>
              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedNode.schema ? `${selectedNode.schema}.${selectedNode.name}` : selectedNode.name}
                  </h2>
                  <Button variant="ghost" size="sm" icon={ExternalLink} />
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{selectedNode.system}</Badge>
                  <Badge variant="default">{selectedNode.type}</Badge>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                  {[
                    { id: 'data', label: 'Data' },
                    { id: 'columns', label: 'Columns' },
                    { id: 'lineage', label: 'Lineage' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'data' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm">
                        {selectedNode.metadata?.description || 'No description available'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Metadata</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Owner:</span>
                          <span className="text-gray-900">{selectedNode.metadata?.owner || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Modified:</span>
                          <span className="text-gray-900">{selectedNode.metadata?.lastModified || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    {selectedNode.metadata?.tags && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-1">
                          {selectedNode.metadata.tags.map(tag => (
                            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'columns' && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">FULL_CUSTOMER_NAME</h3>
                    <div className="space-y-3 text-sm">
                      {[
                        { name: 'contact_number', system: 'Snowflake' },
                        { name: 'order_id', system: 'Snowflake' },
                        { name: 'price', system: 'Snowflake' }
                      ].map(column => (
                        <div key={column.name} className="flex justify-between items-center">
                          <span className="text-gray-900">{column.name}</span>
                          <span className="text-gray-500">{column.system}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expandable Sections */}
                    <div className="space-y-2 mt-6">
                      {[
                        { key: 'notebooks', label: 'Notebooks', count: 2 },
                        { key: 'dashboards', label: 'Dashboards', count: 2 },
                        { key: 'transformations', label: 'Transformations', count: 0 },
                        { key: 'accitions', label: 'Accitions', count: 1 }
                      ].map(section => (
                        <div key={section.key}>
                          <button
                            onClick={() => toggleSection(section.key)}
                            className="flex items-center justify-between w-full py-2 text-left"
                          >
                            <span className="font-medium text-gray-900">{section.label}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{section.count}</span>
                              {expandedSections[section.key] ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </button>
                          
                          {expandedSections[section.key] && section.count > 0 && (
                            <div className="pl-4 space-y-2">
                              {section.key === 'notebooks' && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Code className="w-4 h-4 text-gray-400" />
                                      <span>Sales KPI Dashboard</span>
                                    </div>
                                    <span className="text-gray-500">2</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <Code className="w-4 h-4 text-gray-400" />
                                      <span>Fin Data Lineage</span>
                                    </div>
                                    <span className="text-gray-500">2</span>
                                  </div>
                                </>
                              )}
                              {section.key === 'dashboards' && (
                                <>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="w-4 h-4 text-gray-400" />
                                      <span>Sales KPI Dashboard</span>
                                    </div>
                                    <span className="text-gray-500">2</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="w-4 h-4 text-gray-400" />
                                      <span>Fin Data Lineage</span>
                                    </div>
                                    <span className="text-gray-500">2</span>
                                  </div>
                                </>
                              )}
                              {section.key === 'accitions' && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                    <span>JOIN on order_id</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'lineage' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Upstream Dependencies</h3>
                      <div className="space-y-2">
                        {lineageData.edges
                          .filter(edge => edge.target === selectedNode.id)
                          .map(edge => {
                            const sourceNode = lineageData.nodes.find(n => n.id === edge.source);
                            return (
                              <div key={edge.id} className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{sourceNode?.name}</span>
                                  <Badge variant="info" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                                {edge.transformationLogic && (
                                  <code className="text-xs text-gray-700 bg-gray-100 p-1 rounded mt-1 block">
                                    {edge.transformationLogic}
                                  </code>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Downstream Dependencies</h3>
                      <div className="space-y-2">
                        {lineageData.edges
                          .filter(edge => edge.source === selectedNode.id)
                          .map(edge => {
                            const targetNode = lineageData.nodes.find(n => n.id === edge.target);
                            return (
                              <div key={edge.id} className="p-3 bg-emerald-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{targetNode?.name}</span>
                                  <Badge variant="success" size="sm">{edge.type}</Badge>
                                </div>
                                <p className="text-xs text-gray-600">{edge.description}</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Node</h3>
                <p className="text-gray-500 max-w-sm">
                  Click on any table, view, or dashboard in the lineage graph to view its details and relationships.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}