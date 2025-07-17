import { apiClient, isMockMode } from '../lib/apiClient';
import { 
  ApiResponse, 
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
 * Lineage service for managing data lineage API calls
 */
export class LineageService {
  // Get lineage data for a specific entity
  async getLineage(
    entityId: string, 
    options: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
    } = {}
  ): Promise<ApiResponse<LineageResponse>> {
    if (isMockMode()) {
      return this.getMockLineage(entityId, options);
    }

    const params = {
      entityId,
      direction: options.direction || 'both',
      depth: options.depth || 3,
    };

    const response = await apiClient.get('/lineage', { params });
    return response.data;
  }

  // Get lineage for multiple entities
  async getMultipleLineage(
    entityIds: string[],
    options: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
    } = {}
  ): Promise<ApiResponse<LineageResponse>> {
    if (isMockMode()) {
      return this.getMockMultipleLineage(entityIds, options);
    }

    const body = {
      entityIds,
      direction: options.direction || 'both', 
      depth: options.depth || 3,
    };

    const response = await apiClient.post('/lineage/batch', body);
    return response.data;
  }

  // NEW: Get lineage in React Flow format
  async getLineageReactFlow(
    entityId: string,
    options: {
      direction?: 'upstream' | 'downstream' | 'both';
      depth?: number;
    } = {}
  ): Promise<ReactFlowResponse> {
    if (isMockMode()) {
      return this.getMockReactFlowLineage(entityId, options);
    }

    const params = {
      entityId,
      direction: options.direction || 'both',
      depth: options.depth || 3,
      format: 'reactflow' // Request React Flow format
    };

    const response = await apiClient.get('/lineage/reactflow', { params });
    return response.data;
  }

  // Transform server response to React Flow format
  transformToReactFlow(lineageResponse: LineageResponse): LineageGraph {
    const nodes: LineageNode[] = lineageResponse.nodes.map((nodeData: LineageNodeData) => ({
      id: nodeData.id,
      type: 'tableNode',
      position: nodeData.position || { x: Math.random() * 500, y: Math.random() * 300 },
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

  // Mock data for development
  private async getMockLineage(
    entityId: string,
    options: any
  ): Promise<ApiResponse<LineageResponse>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResponse: LineageResponse = {
      nodes: [
        {
          id: entityId,
          name: 'users',
          type: 'table',
          schema: 'public',
          database: 'main_db',
          columns: [
            { name: 'id', type: 'int', isPrimaryKey: true },
            { name: 'name', type: 'varchar(255)' },
            { name: 'email', type: 'varchar(255)' },
            { name: 'created_at', type: 'timestamp' }
          ],
          position: { x: 250, y: 100 }
        },
        {
          id: 'orders',
          name: 'orders',
          type: 'table',
          schema: 'public',
          database: 'main_db', 
          columns: [
            { name: 'id', type: 'int', isPrimaryKey: true },
            { name: 'user_id', type: 'int', isForeignKey: true },
            { name: 'total', type: 'decimal(10,2)' },
            { name: 'status', type: 'varchar(50)' }
          ],
          position: { x: 100, y: 250 }
        },
        {
          id: 'user_analytics',
          name: 'user_analytics',
          type: 'view',
          schema: 'analytics',
          database: 'warehouse_db',
          columns: [
            { name: 'user_id', type: 'int' },
            { name: 'total_orders', type: 'int' },
            { name: 'total_spent', type: 'decimal(12,2)' },
            { name: 'last_order_date', type: 'date' }
          ],
          position: { x: 400, y: 200 }
        }
      ],
      relationships: [
        {
          id: 'rel1',
          sourceNodeId: entityId,
          targetNodeId: 'orders',
          relationshipType: 'join',
          sourceColumns: ['id'],
          targetColumns: ['user_id']
        },
        {
          id: 'rel2',
          sourceNodeId: entityId,
          targetNodeId: 'user_analytics',
          relationshipType: 'transformation',
          sourceColumns: ['id'],
          targetColumns: ['user_id'],
          transformationLogic: 'JOIN with orders and aggregate'
        },
        {
          id: 'rel3',
          sourceNodeId: 'orders',
          targetNodeId: 'user_analytics',
          relationshipType: 'transformation',
          sourceColumns: ['user_id', 'total'],
          targetColumns: ['user_id', 'total_spent'],
          transformationLogic: 'GROUP BY user_id, SUM(total)'
        }
      ],
      metadata: {
        queryDepth: options.depth || 3,
        direction: options.direction || 'both',
        rootEntityId: entityId,
        totalNodes: 3,
        totalRelationships: 3,
        timestamp: new Date().toISOString()
      }
    };

    return {
      data: mockResponse,
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  private async getMockMultipleLineage(
    entityIds: string[],
    options: any
  ): Promise<ApiResponse<LineageResponse>> {
    // For simplicity, just return the first entity's lineage
    return this.getMockLineage(entityIds[0], options);
  }

  // Mock data for React Flow format
  private async getMockReactFlowLineage(
    entityId: string,
    options: any
  ): Promise<ReactFlowResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResponse: ReactFlowResponse = {
      nodes: [
        {
          id: "tbl_account",
          type: "table",
          data: {
            label: "account",
            nodeType: "table",
            columns: [
              { name: "id", type: "bigint", classification: "IDENTIFIER" },
              { name: "full_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "email", type: "string", classification: "SENSITIVE" },
              { name: "created_at", type: "timestamp", classification: "METADATA" }
            ],
            metadata: { 
              businessOwner: "xWyvernPx", 
              description: "Main production database for customer data",
              schema: "public",
              database: "main_db"
            }
          },
          position: { x: 0, y: 0 }
        },
        {
          id: "tbl_payment",
          type: "table",
          data: {
            label: "payment",
            nodeType: "table",
            columns: [
              { name: "user_id", type: "int", classification: "IDENTIFIER" },
              { name: "transaction_id", type: "string", classification: "IDENTIFIER" },
              { name: "amount", type: "decimal", classification: "SENSITIVE" },
              { name: "created_at", type: "timestamp", classification: "METADATA" }
            ],
            metadata: { 
              businessOwner: "xWyvernPx", 
              description: "Payment transaction records",
              schema: "public", 
              database: "main_db"
            }
          },
          position: { x: 400, y: 0 }
        },
        {
          id: "tbl_order",
          type: "table", 
          data: {
            label: "order",
            nodeType: "table",
            columns: [
              { name: "id", type: "bigint", classification: "IDENTIFIER" },
              { name: "user_id", type: "int", classification: "IDENTIFIER" },
              { name: "status", type: "string", classification: "DESCRIPTIVE" },
              { name: "total", type: "decimal", classification: "SENSITIVE" }
            ],
            metadata: {
              businessOwner: "xWyvernPx",
              description: "Customer order information",
              schema: "public",
              database: "main_db"
            }
          },
          position: { x: 200, y: 200 }
        }
      ],
      edges: [
        {
          id: "tbl_payment-user_id-tbl_account-id",
          source: "tbl_payment",
          target: "tbl_account", 
          type: "smoothstep",
          label: "user_id → id"
        },
        {
          id: "tbl_order-user_id-tbl_account-id",
          source: "tbl_order",
          target: "tbl_account",
          type: "smoothstep", 
          label: "user_id → id"
        }
      ]
    };

    return mockResponse;
  }
}

export const mockLineageReactFlowData: ReactFlowResponse = {
  nodes: [
    {
      id: "tbl_account",
      type: "tableNode",
      data: {
        label: "account", 
        nodeType: "table",
        columns: [
          { name: "id", type: "bigint", classification: "IDENTIFIER" },
          { name: "full_name", type: "string", classification: "DESCRIPTIVE" },
          { name: "email", type: "string", classification: "PII" },
          { name: "role", type: "string", classification: "DESCRIPTIVE" },
          { name: "created_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
          { name: "last_modified_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
          { name: "enabled", type: "boolean", classification: "STATUS_FLAG" }
        ],
        metadata: { 
          businessOwner: "xWyvernPx", 
          description: "Main production database for customer data",
          system: "postgresql",
          databaseType: "postgresql",
          tableType: "EXTERNAL_TABLE"
        }
      },
      position: { x: 0, y: 0 }
    },
    {
      id: "tbl_payment",
      type: "tableNode", 
      data: {
        label: "payment",
        nodeType: "table",
        columns: [
          { name: "id", type: "bigint", classification: "IDENTIFIER" },
          { name: "user_id", type: "bigint", classification: "IDENTIFIER" },
          { name: "transaction_id", type: "string", classification: "IDENTIFIER" },
          { name: "amount", type: "decimal", classification: "DESCRIPTIVE" },
          { name: "currency", type: "string", classification: "DESCRIPTIVE" },
          { name: "payment_method", type: "string", classification: "DESCRIPTIVE" },
          { name: "status", type: "string", classification: "STATUS_FLAG" },
          { name: "created_at", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
        ],
        metadata: { 
          businessOwner: "Finance Team", 
          description: "Payment transactions table",
          system: "mysql",
          databaseType: "mysql",
          tableType: "EXTERNAL_TABLE"
        }
      },
      position: { x: 400, y: 0 }
    },
    {
      id: "view_customer_summary",
      type: "tableNode",
      data: {
        label: "customer_summary",
        nodeType: "view",
        columns: [
          { name: "customer_id", type: "bigint", classification: "IDENTIFIER" },
          { name: "customer_name", type: "string", classification: "DESCRIPTIVE" },
          { name: "total_payments", type: "decimal", classification: "DESCRIPTIVE" },
          { name: "payment_count", type: "bigint", classification: "DESCRIPTIVE" },
          { name: "last_payment_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
        ],
        metadata: { 
          businessOwner: "Analytics Team", 
          description: "Aggregated customer payment summary view",
          system: "snowflake",
          databaseType: "snowflake",
          tableType: "VIEW"
        }
      },
      position: { x: 200, y: 200 }
    },
    {
      id: "tbl_customer_events",
      type: "tableNode",
      data: {
        label: "customer_events",
        nodeType: "table",
        columns: [
          { name: "event_id", type: "string", classification: "IDENTIFIER" },
          { name: "customer_id", type: "bigint", classification: "IDENTIFIER" },
          { name: "event_type", type: "string", classification: "DESCRIPTIVE" },
          { name: "event_timestamp", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
          { name: "event_data", type: "string", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Product Team",
          description: "Customer interaction events and analytics",
          system: "bigquery",
          databaseType: "bigquery",
          tableType: "EXTERNAL_TABLE"
        }
      },
      position: { x: -200, y: 100 }
    }
  ],
  edges: [
    {
      id: "tbl_payment-user_id-tbl_account-id",
      source: "tbl_payment",
      target: "tbl_account", 
      type: "smoothstep",
      label: "user_id → id"
    },
    {
      id: "view_customer_summary-customer_id-tbl_account-id",
      source: "view_customer_summary",
      target: "tbl_account",
      type: "smoothstep", 
      label: "customer_id → id"
    },
    {
      id: "view_customer_summary-payment-tbl_payment",
      source: "view_customer_summary",
      target: "tbl_payment",
      type: "smoothstep",
      label: "aggregates payments"
    },
    {
      id: "tbl_customer_events-customer_id-tbl_account-id",
      source: "tbl_customer_events",
      target: "tbl_account",
      type: "smoothstep",
      label: "customer_id → id"
    },
    {
      id: "view_customer_summary-events-tbl_customer_events",
      source: "view_customer_summary",
      target: "tbl_customer_events",
      type: "smoothstep",
      label: "includes event data"
    }
  ]
};

// Export singleton instance
export const lineageService = new LineageService();
