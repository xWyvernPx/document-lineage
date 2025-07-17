# Product Requirements Document (PRD)

| Section | Field | Description |
|--------|-------|-------------|
| **1. Metadata** | Project Name | React Flow Lineage Migration |
|  | Author | AI Senior Software Engineer |
|  | Stakeholders | Development Team, Product Owner |
|  | Created On | 2025-07-17 |
|  | Last Updated | 2025-07-17 |
|  | Version | v0.1 |

| **2. Problem Statement** | Description | Current lineage viewer uses custom D3/SVG implementation that lacks modern UX features like draggable nodes. Server contract needs updating to support richer metadata and relationships for better lineage representation. |

| **3. Goals & Objectives** | Business Goals | Improve user experience for data lineage exploration with intuitive node manipulation |
|  | User Goals | Enable users to interactively explore data relationships with drag-and-drop nodes |
|  | Technical Goals | Modernize codebase with React Flow, standardize server contracts, improve maintainability |

| **4. Success Metrics** | Primary KPIs | Successful migration to React Flow with draggable nodes |
|  | Secondary KPIs | Reduced code complexity, improved UX responsiveness |

| **5. Scope** | In Scope | React Flow integration, new server contract implementation, draggable node functionality, basic lineage visualization |
|  | Out of Scope | Advanced layout algorithms, performance optimization for massive graphs, real-time collaboration |

| **6. User Personas** | Persona 1 | **Name:** Data Analyst <br> **Role:** Business User <br> **Needs:** Intuitive data lineage exploration |
|  | Persona 2 | **Name:** Data Engineer <br> **Role:** Technical User <br> **Needs:** Detailed relationship information and metadata |

| **7. Key Use Cases / User Stories** | US-01 | As a data analyst, I want to drag nodes around the canvas, so that I can organize the lineage view according to my mental model |
|  | US-02 | As a data engineer, I want to see detailed column-level relationships, so that I can understand data transformations |
|  | US-03 | As a user, I want to see table metadata and column information, so that I can understand data structure |

| **8. High-Level Requirements** | Functional | React Flow integration, draggable nodes, column details, relationship visualization |
|  | Non-Functional | Responsive UI, maintained performance, clean code architecture |

| **9. API Contract** | Nodes Format | React Flow node structure with id, type, data (label, columns, metadata), position |
|  | Edges Format | React Flow edge structure with id, source, target, type, label |
|  | Server Schema | Lineage_node & Lineage_relationship tables as specified |

| **10. Dependencies & Risks** | Dependencies | @xyflow/react library installation |
|  | Risks | Migration complexity, potential performance impact |
