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
  baseURL: 'http://3.1.127.253/',
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
    const response = await lineageApiClient.get(`/processor/lineage/${entityId.split(".")}`);
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

  // Mock data for React Flow format - Complex Supply Chain Control Tower lineage
  private async getMockReactFlowLineage(
    _entityId: string,
    _options: any
  ): Promise<ReactFlowResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockResponse: ReactFlowResponse = {
      nodes: [
        // Core inventory management
        {
          id: "entity_material_inventory_at_location",
          type: "table",
          data: {
            label: "Material Inventory at Location",
            columns: [
              { name: "inventory_id", type: "string", classification: "IDENTIFIER" },
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "inventory_volume", type: "decimal", classification: "NUMERIC" },
              { name: "target_inventory_volume", type: "decimal", classification: "NUMERIC" },
              { name: "is_below_zero", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "is_below_target", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "country_code", type: "string", classification: "DESCRIPTIVE" },
              { name: "country_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "affiliate_plant_number", type: "string", classification: "DESCRIPTIVE" },
              { name: "sold_to_number", type: "string", classification: "IDENTIFIER" },
              { name: "bucket_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "week_number", type: "int", classification: "NUMERIC" },
              { name: "horizon", type: "string", classification: "DESCRIPTIVE" },
              { name: "goods_receipt_processing_time_in_days", type: "int", classification: "NUMERIC" },
              { name: "customer_po_numbers", type: "string", classification: "DESCRIPTIVE" },
              { name: "ufinc", type: "string", classification: "IDENTIFIER" },
              { name: "created_at", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "updated_at", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Supply Chain Team",
              description: "Central inventory tracking across all locations and plants",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 19
            }
          },
          position: { x: 400, y: 100 }
        },
        
        // Sales order management
        {
          id: "entity_sales_order_item",
          type: "table",
          data: {
            label: "Sales Order Item",
            columns: [
              { name: "sales_order_id", type: "string", classification: "IDENTIFIER" },
              { name: "item_number", type: "string", classification: "IDENTIFIER" },
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "sold_to_number", type: "string", classification: "IDENTIFIER" },
              { name: "ship_to_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "order_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "confirmed_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "unit_price", type: "decimal", classification: "NUMERIC" },
              { name: "currency", type: "string", classification: "DESCRIPTIVE" },
              { name: "delivery_date", type: "date", classification: "DESCRIPTIVE" },
              { name: "requested_delivery_date", type: "date", classification: "DESCRIPTIVE" },
              { name: "order_status", type: "string", classification: "DESCRIPTIVE" },
              { name: "reason_for_rejection", type: "string", classification: "DESCRIPTIVE" },
              { name: "sales_organization", type: "string", classification: "DESCRIPTIVE" },
              { name: "distribution_channel", type: "string", classification: "DESCRIPTIVE" },
              { name: "created_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "last_modified_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Sales Operations",
              description: "Individual line items within sales orders",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 220
            }
          },
          position: { x: 100, y: 300 }
        },

        // Purchase order management
        {
          id: "entity_purchase_order_item",
          type: "table",
          data: {
            label: "Purchase Order Item",
            columns: [
              { name: "purchase_order_id", type: "string", classification: "IDENTIFIER" },
              { name: "item_number", type: "string", classification: "IDENTIFIER" },
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "vendor_number", type: "string", classification: "IDENTIFIER" },
              { name: "order_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "delivered_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "net_price", type: "decimal", classification: "NUMERIC" },
              { name: "price_unit", type: "decimal", classification: "NUMERIC" },
              { name: "delivery_date", type: "date", classification: "DESCRIPTIVE" },
              { name: "gr_processing_time", type: "int", classification: "NUMERIC" },
              { name: "purchase_group", type: "string", classification: "DESCRIPTIVE" },
              { name: "purchasing_organization", type: "string", classification: "DESCRIPTIVE" },
              { name: "order_status", type: "string", classification: "DESCRIPTIVE" },
              { name: "deletion_indicator", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "created_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "changed_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Procurement Team",
              description: "Purchase order line items for material procurement",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 87
            }
          },
          position: { x: 700, y: 300 }
        },

        // Process order manufacturing
        {
          id: "entity_process_order",
          type: "table",
          data: {
            label: "Process Order",
            columns: [
              { name: "process_order_id", type: "string", classification: "IDENTIFIER" },
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "production_version", type: "string", classification: "IDENTIFIER" },
              { name: "planned_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "confirmed_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "scrap_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "planned_start_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "planned_finish_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "actual_start_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "actual_finish_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "order_status", type: "string", classification: "DESCRIPTIVE" },
              { name: "priority", type: "int", classification: "NUMERIC" },
              { name: "production_line", type: "string", classification: "DESCRIPTIVE" },
              { name: "batch_number", type: "string", classification: "IDENTIFIER" },
              { name: "quality_status", type: "string", classification: "DESCRIPTIVE" },
              { name: "created_by", type: "string", classification: "AUDIT_TIMESTAMP" },
              { name: "created_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "changed_by", type: "string", classification: "AUDIT_TIMESTAMP" },
              { name: "changed_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Manufacturing Operations",
              description: "Production orders for manufacturing processes",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 105
            }
          },
          position: { x: 400, y: 500 }
        },

        // Goods movement tracking
        {
          id: "entity_goods_movement",
          type: "table",
          data: {
            label: "Goods Movement",
            columns: [
              { name: "movement_id", type: "string", classification: "IDENTIFIER" },
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "storage_location", type: "string", classification: "IDENTIFIER" },
              { name: "movement_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "quantity", type: "decimal", classification: "NUMERIC" },
              { name: "unit_of_measure", type: "string", classification: "DESCRIPTIVE" },
              { name: "posting_date", type: "date", classification: "AUDIT_TIMESTAMP" },
              { name: "document_date", type: "date", classification: "AUDIT_TIMESTAMP" },
              { name: "reference_document", type: "string", classification: "IDENTIFIER" },
              { name: "cost_center", type: "string", classification: "IDENTIFIER" }
            ],
            metadata: {
              businessOwner: "Warehouse Operations",
              description: "All material movements and stock changes",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 11
            }
          },
          position: { x: 100, y: 100 }
        },

        // Shipping and logistics
        {
          id: "entity_shipping_event",
          type: "table",
          data: {
            label: "Shipping Event",
            columns: [
              { name: "shipment_id", type: "string", classification: "IDENTIFIER" },
              { name: "delivery_number", type: "string", classification: "IDENTIFIER" },
              { name: "tracking_number", type: "string", classification: "IDENTIFIER" },
              { name: "carrier_code", type: "string", classification: "DESCRIPTIVE" },
              { name: "ship_from_location", type: "string", classification: "DESCRIPTIVE" },
              { name: "ship_to_location", type: "string", classification: "DESCRIPTIVE" },
              { name: "event_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "event_timestamp", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "location_code", type: "string", classification: "DESCRIPTIVE" },
              { name: "status", type: "string", classification: "DESCRIPTIVE" },
              { name: "estimated_delivery", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "actual_delivery", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Logistics Team",
              description: "Shipping and delivery tracking events",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 12
            }
          },
          position: { x: 700, y: 100 }
        },

        // Material Master Data
        {
          id: "entity_material_master",
          type: "table",
          data: {
            label: "Material Master",
            columns: [
              { name: "material_number", type: "string", classification: "IDENTIFIER" },
              { name: "material_description", type: "string", classification: "DESCRIPTIVE" },
              { name: "material_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "base_unit_of_measure", type: "string", classification: "DESCRIPTIVE" },
              { name: "material_group", type: "string", classification: "DESCRIPTIVE" },
              { name: "product_hierarchy", type: "string", classification: "DESCRIPTIVE" },
              { name: "gross_weight", type: "decimal", classification: "NUMERIC" },
              { name: "net_weight", type: "decimal", classification: "NUMERIC" },
              { name: "weight_unit", type: "string", classification: "DESCRIPTIVE" },
              { name: "shelf_life_expiration_date", type: "int", classification: "NUMERIC" },
              { name: "abc_indicator", type: "string", classification: "DESCRIPTIVE" },
              { name: "procurement_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "mrp_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "safety_stock", type: "decimal", classification: "NUMERIC" },
              { name: "reorder_point", type: "decimal", classification: "NUMERIC" },
              { name: "maximum_stock_level", type: "decimal", classification: "NUMERIC" },
              { name: "created_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" },
              { name: "changed_on", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
            ],
            metadata: {
              businessOwner: "Product Management",
              description: "Master data for all materials including specifications and planning parameters",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 18
            }
          },
          position: { x: 100, y: 700 }
        },

        // Plant Master Data
        {
          id: "entity_plant_master",
          type: "table",
          data: {
            label: "Plant Master",
            columns: [
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "plant_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "company_code", type: "string", classification: "IDENTIFIER" },
              { name: "country_key", type: "string", classification: "DESCRIPTIVE" },
              { name: "country_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "region", type: "string", classification: "DESCRIPTIVE" },
              { name: "time_zone", type: "string", classification: "DESCRIPTIVE" },
              { name: "plant_category", type: "string", classification: "DESCRIPTIVE" },
              { name: "planning_plant", type: "string", classification: "IDENTIFIER" },
              { name: "distribution_channel", type: "string", classification: "DESCRIPTIVE" },
              { name: "sales_organization", type: "string", classification: "DESCRIPTIVE" },
              { name: "factory_calendar", type: "string", classification: "DESCRIPTIVE" },
              { name: "address_number", type: "string", classification: "IDENTIFIER" },
              { name: "purchasing_organization", type: "string", classification: "DESCRIPTIVE" }
            ],
            metadata: {
              businessOwner: "Operations Management",
              description: "Master data for all manufacturing and distribution plants",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 14
            }
          },
          position: { x: 700, y: 700 }
        },

        // Customer Master Data
        {
          id: "entity_customer_master",
          type: "table",
          data: {
            label: "Customer Master",
            columns: [
              { name: "customer_number", type: "string", classification: "IDENTIFIER" },
              { name: "customer_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "customer_group", type: "string", classification: "DESCRIPTIVE" },
              { name: "country_key", type: "string", classification: "DESCRIPTIVE" },
              { name: "region", type: "string", classification: "DESCRIPTIVE" },
              { name: "industry_key", type: "string", classification: "DESCRIPTIVE" },
              { name: "currency", type: "string", classification: "DESCRIPTIVE" },
              { name: "payment_terms", type: "string", classification: "DESCRIPTIVE" },
              { name: "credit_limit", type: "decimal", classification: "NUMERIC" },
              { name: "risk_category", type: "string", classification: "DESCRIPTIVE" },
              { name: "abc_classification", type: "string", classification: "DESCRIPTIVE" },
              { name: "sales_district", type: "string", classification: "DESCRIPTIVE" },
              { name: "delivery_priority", type: "string", classification: "DESCRIPTIVE" },
              { name: "tax_number", type: "string", classification: "IDENTIFIER" }
            ],
            metadata: {
              businessOwner: "Sales Operations",
              description: "Master data for all customers including commercial and risk information",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 14
            }
          },
          position: { x: 100, y: 900 }
        },

        // Vendor Master Data
        {
          id: "entity_vendor_master",
          type: "table",
          data: {
            label: "Vendor Master",
            columns: [
              { name: "vendor_number", type: "string", classification: "IDENTIFIER" },
              { name: "vendor_name", type: "string", classification: "DESCRIPTIVE" },
              { name: "vendor_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "country_key", type: "string", classification: "DESCRIPTIVE" },
              { name: "currency", type: "string", classification: "DESCRIPTIVE" },
              { name: "payment_terms", type: "string", classification: "DESCRIPTIVE" },
              { name: "purchasing_group", type: "string", classification: "DESCRIPTIVE" },
              { name: "abc_indicator", type: "string", classification: "DESCRIPTIVE" },
              { name: "delivery_terms", type: "string", classification: "DESCRIPTIVE" },
              { name: "lead_time_days", type: "int", classification: "NUMERIC" },
              { name: "minimum_order_quantity", type: "decimal", classification: "NUMERIC" },
              { name: "quality_rating", type: "string", classification: "DESCRIPTIVE" },
              { name: "delivery_performance", type: "decimal", classification: "NUMERIC" },
              { name: "tax_number", type: "string", classification: "IDENTIFIER" }
            ],
            metadata: {
              businessOwner: "Procurement Team",
              description: "Master data for all suppliers and vendors",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 14
            }
          },
          position: { x: 700, y: 900 }
        },

        // Storage Location Master
        {
          id: "entity_storage_location_master",
          type: "table",
          data: {
            label: "Storage Location Master",
            columns: [
              { name: "plant_number", type: "string", classification: "IDENTIFIER" },
              { name: "storage_location", type: "string", classification: "IDENTIFIER" },
              { name: "description", type: "string", classification: "DESCRIPTIVE" },
              { name: "storage_type", type: "string", classification: "DESCRIPTIVE" },
              { name: "warehouse_number", type: "string", classification: "IDENTIFIER" },
              { name: "capacity_total", type: "decimal", classification: "NUMERIC" },
              { name: "capacity_used", type: "decimal", classification: "NUMERIC" },
              { name: "temperature_controlled", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "hazmat_approved", type: "boolean", classification: "DESCRIPTIVE" },
              { name: "picking_area", type: "string", classification: "DESCRIPTIVE" }
            ],
            metadata: {
              businessOwner: "Warehouse Operations",
              description: "Master data for storage locations and warehouse configuration",
              system: "Supply Chain Control Tower",
              tableType: "EXTERNAL_TABLE",
              totalColumns: 10
            }
          },
          position: { x: 400, y: 900 }
        }
      ],
      edges: [
        // Material Master relationships - Central hub
        {
          id: "material-master-to-inventory",
          source: "entity_material_master",
          target: "entity_material_inventory_at_location",
          type: "smoothstep",
          label: "material_number → material_number"
        },
        {
          id: "material-master-to-sales",
          source: "entity_material_master",
          target: "entity_sales_order_item",
          type: "smoothstep",
          label: "material_number → material_number"
        },
        {
          id: "material-master-to-purchase",
          source: "entity_material_master",
          target: "entity_purchase_order_item",
          type: "smoothstep",
          label: "material_number → material_number"
        },
        {
          id: "material-master-to-process",
          source: "entity_material_master",
          target: "entity_process_order",
          type: "smoothstep",
          label: "material_number → material_number"
        },
        {
          id: "material-master-to-goods",
          source: "entity_material_master",
          target: "entity_goods_movement",
          type: "smoothstep",
          label: "material_number → material_number"
        },

        // Plant Master relationships
        {
          id: "plant-master-to-inventory",
          source: "entity_plant_master",
          target: "entity_material_inventory_at_location",
          type: "default",
          label: "plant_number → plant_number"
        },
        {
          id: "plant-master-to-sales",
          source: "entity_plant_master",
          target: "entity_sales_order_item",
          type: "default",
          label: "plant_number → plant_number"
        },
        {
          id: "plant-master-to-purchase",
          source: "entity_plant_master",
          target: "entity_purchase_order_item",
          type: "default",
          label: "plant_number → plant_number"
        },
        {
          id: "plant-master-to-process",
          source: "entity_plant_master",
          target: "entity_process_order",
          type: "default",
          label: "plant_number → plant_number"
        },
        {
          id: "plant-master-to-goods",
          source: "entity_plant_master",
          target: "entity_goods_movement",
          type: "default",
          label: "plant_number → plant_number"
        },

        // Customer Master relationships
        {
          id: "customer-master-to-sales",
          source: "entity_customer_master",
          target: "entity_sales_order_item",
          type: "step",
          label: "customer_number → sold_to_number"
        },
        {
          id: "customer-master-to-inventory",
          source: "entity_customer_master",
          target: "entity_material_inventory_at_location",
          type: "step",
          label: "customer_number → sold_to_number"
        },
        {
          id: "customer-master-to-shipping",
          source: "entity_customer_master",
          target: "entity_shipping_event",
          type: "step",
          label: "customer_number → ship_to_location"
        },

        // Vendor Master relationships
        {
          id: "vendor-master-to-purchase",
          source: "entity_vendor_master",
          target: "entity_purchase_order_item",
          type: "step",
          label: "vendor_number → vendor_number"
        },

        // Storage Location Master relationships
        {
          id: "storage-master-to-goods",
          source: "entity_storage_location_master",
          target: "entity_goods_movement",
          type: "bezier",
          label: "storage_location → storage_location"
        },
        {
          id: "storage-master-to-inventory",
          source: "entity_storage_location_master",
          target: "entity_material_inventory_at_location",
          type: "bezier",
          label: "plant_number → plant_number"
        },

        // Transactional data relationships (original complex flows)
        {
          id: "sales-to-inventory",
          source: "entity_sales_order_item",
          target: "entity_material_inventory_at_location",
          type: "smoothstep",
          label: "demand impact"
        },
        {
          id: "purchase-to-inventory",
          source: "entity_purchase_order_item",
          target: "entity_material_inventory_at_location",
          type: "smoothstep",
          label: "supply replenishment"
        },
        {
          id: "process-to-inventory",
          source: "entity_process_order",
          target: "entity_material_inventory_at_location",
          type: "smoothstep",
          label: "production output"
        },

        // Goods movement relationships
        {
          id: "goods-to-inventory",
          source: "entity_goods_movement",
          target: "entity_material_inventory_at_location",
          type: "step",
          label: "stock movements"
        },
        {
          id: "goods-to-process",
          source: "entity_goods_movement",
          target: "entity_process_order",
          type: "step",
          label: "material consumption"
        },

        // Shipping relationships
        {
          id: "sales-to-shipping",
          source: "entity_sales_order_item",
          target: "entity_shipping_event",
          type: "smoothstep",
          label: "order fulfillment"
        },

        // Process order to purchase order (component requirements)
        {
          id: "process-to-purchase",
          source: "entity_process_order",
          target: "entity_purchase_order_item",
          type: "bezier",
          label: "component requirements"
        },

        // Cross-entity business flows
        {
          id: "purchase-to-goods-receipt",
          source: "entity_purchase_order_item",
          target: "entity_goods_movement",
          type: "smoothstep",
          label: "goods receipt"
        },
        {
          id: "process-to-goods-issue",
          source: "entity_process_order",
          target: "entity_goods_movement",
          type: "smoothstep",
          label: "material issue"
        },
        {
          id: "shipping-to-goods-issue",
          source: "entity_shipping_event",
          target: "entity_goods_movement",
          type: "step",
          label: "delivery goods issue"
        }
      ]
    };

    return mockResponse;
  }
}

export const mockLineageReactFlowData: ReactFlowResponse = {
  nodes: [
    {
      id: "entity_material_inventory_at_location",
      type: "tableNode",
      data: {
        label: "Material Inventory at Location",
        nodeType: "table",
        columns: [
          { name: "inventory_id", type: "string", classification: "IDENTIFIER" },
          { name: "material_number", type: "string", classification: "IDENTIFIER" },
          { name: "plant_number", type: "string", classification: "IDENTIFIER" },
          { name: "inventory_volume", type: "decimal", classification: "NUMERIC" },
          { name: "target_inventory_volume", type: "decimal", classification: "NUMERIC" },
          { name: "is_below_zero", type: "boolean", classification: "DESCRIPTIVE" },
          { name: "is_below_target", type: "boolean", classification: "DESCRIPTIVE" },
          { name: "country_code", type: "string", classification: "DESCRIPTIVE" },
          { name: "sold_to_number", type: "string", classification: "IDENTIFIER" },
          { name: "bucket_date", type: "timestamp", classification: "AUDIT_TIMESTAMP" }
        ],
        metadata: {
          businessOwner: "Supply Chain Team",
          description: "Central inventory tracking across all locations and plants",
          system: "Supply Chain Control Tower"
        }
      },
      position: { x: 400, y: 100 }
    },
    {
      id: "entity_material_master",
      type: "tableNode",
      data: {
        label: "Material Master",
        nodeType: "table",
        columns: [
          { name: "material_number", type: "string", classification: "IDENTIFIER" },
          { name: "material_description", type: "string", classification: "DESCRIPTIVE" },
          { name: "material_type", type: "string", classification: "DESCRIPTIVE" },
          { name: "material_group", type: "string", classification: "DESCRIPTIVE" },
          { name: "procurement_type", type: "string", classification: "DESCRIPTIVE" },
          { name: "safety_stock", type: "decimal", classification: "NUMERIC" },
          { name: "reorder_point", type: "decimal", classification: "NUMERIC" }
        ],
        metadata: {
          businessOwner: "Product Management",
          description: "Master data for all materials including specifications",
          system: "Supply Chain Control Tower"
        }
      },
      position: { x: 100, y: 700 }
    },
    {
      id: "entity_sales_order_item",
      type: "tableNode",
      data: {
        label: "Sales Order Item",
        nodeType: "table",
        columns: [
          { name: "sales_order_id", type: "string", classification: "IDENTIFIER" },
          { name: "material_number", type: "string", classification: "IDENTIFIER" },
          { name: "sold_to_number", type: "string", classification: "IDENTIFIER" },
          { name: "plant_number", type: "string", classification: "IDENTIFIER" },
          { name: "order_quantity", type: "decimal", classification: "NUMERIC" },
          { name: "delivery_date", type: "date", classification: "DESCRIPTIVE" },
          { name: "order_status", type: "string", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Sales Operations",
          description: "Individual line items within sales orders",
          system: "Supply Chain Control Tower"
        }
      },
      position: { x: 100, y: 300 }
    },
    {
      id: "entity_customer_master",
      type: "tableNode",
      data: {
        label: "Customer Master",
        nodeType: "table",
        columns: [
          { name: "customer_number", type: "string", classification: "IDENTIFIER" },
          { name: "customer_name", type: "string", classification: "DESCRIPTIVE" },
          { name: "customer_group", type: "string", classification: "DESCRIPTIVE" },
          { name: "country_key", type: "string", classification: "DESCRIPTIVE" },
          { name: "payment_terms", type: "string", classification: "DESCRIPTIVE" },
          { name: "abc_classification", type: "string", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Sales Operations",
          description: "Master data for all customers",
          system: "Supply Chain Control Tower"
        }
      },
      position: { x: 100, y: 900 }
    },
    {
      id: "entity_plant_master",
      type: "tableNode",
      data: {
        label: "Plant Master",
        nodeType: "table",
        columns: [
          { name: "plant_number", type: "string", classification: "IDENTIFIER" },
          { name: "plant_name", type: "string", classification: "DESCRIPTIVE" },
          { name: "country_key", type: "string", classification: "DESCRIPTIVE" },
          { name: "plant_category", type: "string", classification: "DESCRIPTIVE" },
          { name: "sales_organization", type: "string", classification: "DESCRIPTIVE" }
        ],
        metadata: {
          businessOwner: "Operations Management",
          description: "Master data for all manufacturing plants",
          system: "Supply Chain Control Tower"
        }
      },
      position: { x: 700, y: 700 }
    }
  ],
  edges: [
    {
      id: "material-master-to-inventory",
      source: "entity_material_master",
      target: "entity_material_inventory_at_location",
      type: "smoothstep",
      label: "material_number → material_number"
    },
    {
      id: "material-master-to-sales",
      source: "entity_material_master",
      target: "entity_sales_order_item",
      type: "smoothstep",
      label: "material_number → material_number"
    },
    {
      id: "customer-master-to-sales",
      source: "entity_customer_master",
      target: "entity_sales_order_item",
      type: "step",
      label: "customer_number → sold_to_number"
    },
    {
      id: "plant-master-to-inventory",
      source: "entity_plant_master",
      target: "entity_material_inventory_at_location",
      type: "default",
      label: "plant_number → plant_number"
    },
    {
      id: "sales-to-inventory",
      source: "entity_sales_order_item",
      target: "entity_material_inventory_at_location",
      type: "smoothstep",
      label: "demand impact"
    }
  ]
};

// Export singleton instance
export const lineageService = new LineageService();
