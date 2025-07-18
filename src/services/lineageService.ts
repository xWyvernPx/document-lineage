import { apiClient, isMockMode } from '../lib/apiClient';
import axios from 'axios';
import { 
  ApiResponse, 
  LineageResponse, 
  LineageNodeData, 
  LineageEdgeData,
  LineageNode,
  LineageEdge,
  LineageGraph,
  ReactFlowResponse
} from '../lib/types';

// Create separate axios instance for lineage API
const lineageApiClient = axios.create({
  baseURL: 'http://52.77.38.199/',
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false,
});

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

    // Use the new lineage API endpoint
    const response = await lineageApiClient.get(`/processor/lineage/${entityId}`);
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
    _entityId: string,
    _options: any
  ): Promise<ReactFlowResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResponse: ReactFlowResponse = {
      nodes: [
        {
          id: "tbl_material_inventory_at_location",
          type: "table",
          data: {
            label: "Material Inventory at Location",
            columns: [
              { name: "ufinc", type: "string", classification: "DESCRIPTIVE" },
              { name: "inventory_volume", type: "number", classification: "DESCRIPTIVE" },
              { name: "affiliate_plant_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "is_below_zero", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "goods_receipt_processing_time_in_days", type: "number", classification: "DESCRIPTIVE" },
              { name: "material_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "country_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "is_below_target", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "country_code", type: "string", classification: "DESCRIPTIVE" },
              { name: "bucket_date", type: "date", classification: "DESCRIPTIVE" },
              { name: "target_inventory_volume", type: "number", classification: "DESCRIPTIVE" },
              { name: "plant_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "sold_to_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "customer_po_numbers", type: "string", classification: "DESCRIPTIVE" },
              { name: "week_number", type: "number", classification: "DESCRIPTIVE" },
              { name: "horizon", type: "string", classification: "DESCRIPTIVE" }
            ],
            metadata: {
              businessOwner: "Unknown",
              description: "The entity created based on the ECAS (OMP) data"
            }
          },
          position: { x: 0, y: 0 }
        },
        {
          id: "tbl_sales_order",
          type: "table",
          data: {
            label: "Sales Order",
            columns: [
              { name: "est_available", type: "date", classification: "DESCRIPTIVE" },
              { name: "record_deleted", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "material_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "sold_to_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "active_stage", type: "string", classification: "DESCRIPTIVE" },
              { name: "ufinc", type: "string", classification: "DESCRIPTIVE" },
              { name: "ship_to_country_code", type: "string", classification: "DESCRIPTIVE" },
              { name: "below_zero_impact_date", type: "date", classification: "DESCRIPTIVE" },
              { name: "sales_organization", type: "number", classification: "DESCRIPTIVE" },
              { name: "gr_recipe_processing_time_in_days", type: "number", classification: "DESCRIPTIVE" },
              { name: "affiliate_plant_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "shipping_point", type: "number", classification: "DESCRIPTIVE" },
              { name: "product_family_code", type: "number", classification: "DESCRIPTIVE" },
              { name: "reason_for_rejection", type: "string", classification: "DESCRIPTIVE" },
              { name: "material_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "below_target_impact_date", type: "date", classification: "DESCRIPTIVE" }
            ],
            metadata: {
              businessOwner: "Unknown",
              description: "No description available"
            }
          },
          position: { x: 800, y: 0 }
        }
      ],
      edges: [
        {
          id: "tbl_sales_order-sold_to_number-tbl_material_inventory_at_location-sold_to_number",
          source: "tbl_sales_order",
          target: "tbl_material_inventory_at_location",
          type: "smoothstep",
          label: "sold_to_number → sold_to_number"
        },
        {
          id: "tbl_material_inventory_at_location-ufinc-tbl_sales_order-ufinc",
          source: "tbl_material_inventory_at_location",
          target: "tbl_sales_order",
          type: "smoothstep",
          label: "ufinc → ufinc"
        }
      ]
    };

    return mockResponse;
  }
}

export const mockLineageReactFlowData: ReactFlowResponse = {
  nodes: [
    {
      id: "tbl_material_inventory_at_location",
      type: "tableNode",
      data: {
        label: "Material Inventory at Location",
        nodeType: "table",
        columns: [
          { name: "ufinc", type: "string", classification: "DESCRIPTIVE" },
          { name: "inventory_volume", type: "number", classification: "DESCRIPTIVE" },
          { name: "affiliate_plant_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "is_below_zero", type: "boolean", classification: "DESCRIPTIVE" },
          { name: "goods_receipt_processing_time_in_days", type: "number", classification: "DESCRIPTIVE" },
          { name: "material_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "country_name", type: "string", classification: "DESCRIPTIVE" },
          { name: "is_below_target", type: "boolean", classification: "DESCRIPTIVE" },
          { name: "country_code", type: "string", classification: "DESCRIPTIVE" },
          { name: "bucket_date", type: "date", classification: "DESCRIPTIVE" },
          { name: "target_inventory_volume", type: "number", classification: "DESCRIPTIVE" },
          { name: "plant_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "sold_to_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "customer_po_numbers", type: "string", classification: "DESCRIPTIVE" },
          { name: "week_number", type: "number", classification: "DESCRIPTIVE" },
          { name: "horizon", type: "string", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Unknown",
          description: "The entity created based on the ECAS (OMP) data"
        }
      },
      position: { x: 0, y: 0 }
    },
    {
      id: "tbl_sales_order",
      type: "tableNode",
      data: {
        label: "Sales Order",
        nodeType: "table",
        columns: [
          { name: "est_available", type: "date", classification: "DESCRIPTIVE" },
          { name: "record_deleted", type: "boolean", classification: "DESCRIPTIVE" },
          { name: "material_type", type: "string", classification: "DESCRIPTIVE" },
          { name: "sold_to_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "active_stage", type: "string", classification: "DESCRIPTIVE" },
          { name: "ufinc", type: "string", classification: "DESCRIPTIVE" },
          { name: "ship_to_country_code", type: "string", classification: "DESCRIPTIVE" },
          { name: "below_zero_impact_date", type: "date", classification: "DESCRIPTIVE" },
          { name: "sales_organization", type: "number", classification: "DESCRIPTIVE" },
          { name: "gr_recipe_processing_time_in_days", type: "number", classification: "DESCRIPTIVE" },
          { name: "affiliate_plant_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "shipping_point", type: "number", classification: "DESCRIPTIVE" },
          { name: "product_family_code", type: "number", classification: "DESCRIPTIVE" },
          { name: "reason_for_rejection", type: "string", classification: "DESCRIPTIVE" },
          { name: "material_number", type: "string", classification: "DESCRIPTIVE" },
          { name: "below_target_impact_date", type: "date", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Unknown",
          description: "No description available"
        }
      },
      position: { x: 800, y: 0 }
    }
  ],
  edges: [
    {
      id: "tbl_sales_order-sold_to_number-tbl_material_inventory_at_location-sold_to_number",
      source: "tbl_sales_order",
      target: "tbl_material_inventory_at_location",
      type: "smoothstep",
      label: "sold_to_number → sold_to_number"
    },
    {
      id: "tbl_material_inventory_at_location-ufinc-tbl_sales_order-ufinc",
      source: "tbl_material_inventory_at_location",
      target: "tbl_sales_order",
      type: "smoothstep",
      label: "ufinc → ufinc"
    }
  ]
};

// Export singleton instance
export const lineageService = new LineageService();
