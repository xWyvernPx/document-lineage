# Document Lineage Platform

A comprehensive term extraction and schema mapping platform for business documents, with a focus on NAPAS ACH (Automated Clearing House) integration with banking services.

## Overview

This platform provides advanced document processing capabilities for extracting business terms, mapping them to database schemas, and tracking their lineage across various banking services and systems.

## Features

- **Document Processing**: Upload and process various document types (PDF, DOCX, etc.)
- **Term Extraction**: AI-powered extraction of business terms and definitions
- **Schema Mapping**: Automatic mapping of extracted terms to database schemas
- **Lineage Tracking**: Visual representation of data lineage across systems
- **Real-time Processing**: Live monitoring of document processing status
- **Multi-service Support**: Integration with various banking services

## NAPAS ACH Business Documents

The platform includes a comprehensive collection of realistic business documents for simulating NAPAS ACH integration with banking services. These documents cover:

### Document Categories

1. **Technical Documents**
   - DPG Middleware Integration Specifications
   - NAPAS API Integration Guides
   - Core Banking Settlement Integration
   - System Performance Monitoring

2. **Business Requirements Documents (BRD)**
   - ACH Payment Orchestration Requirements
   - Business User Portal Requirements
   - Customer Onboarding Guides

3. **Process Documents**
   - ACH Transaction Processing Operations Manual
   - Settlement and Reconciliation Procedures
   - Customer Onboarding and Setup Guides

4. **Policy Documents**
   - Risk Management and Fraud Prevention Policies
   - Compliance and Regulatory Requirements

5. **API Documentation**
   - NAPAS API Integration Guides
   - Third-party Provider Integration

### Banking Services Covered

- **DPG (Data Processing Gateway)**: Middleware integration and message routing
- **Transaction Payment**: Payment orchestration and processing
- **Internal Portal**: Business user interfaces and monitoring
- **Core Banking**: Settlement processing and account management
- **NAPAS Gateway**: Direct NAPAS integration and compliance

### Key Business Terms Extracted

The platform extracts and maps hundreds of business terms including:

- **System Components**: Message Routing Engine, Settlement Engine, Payment Orchestration Engine
- **Transaction Types**: PPD (Prearranged Payment and Deposit), CCD (Corporate Credit or Debit)
- **Operational Processes**: Processing Cutoff Times, Exception Handling, Reconciliation
- **Risk Management**: Fraud Scoring, Velocity Limits, Account Validation
- **Compliance**: BSA/AML Requirements, OFAC Screening, Data Retention
- **Performance Metrics**: Processing Latency, Throughput Capacity, SLA Requirements

### Document Statistics

- **Total Documents**: 15+ comprehensive business documents
- **Total Terms**: 100+ extracted business terms
- **Document Types**: Technical, BRD, Process, Policy, API, Regulatory
- **Services**: 5 major banking service areas
- **Average Confidence**: 90%+ extraction accuracy

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Upload Documents**
   - Navigate to the document upload interface
   - Select NAPAS ACH business documents
   - Monitor processing status in real-time

4. **View Results**
   - Explore extracted terms and definitions
   - Review schema mappings
   - Analyze data lineage across services

## Document Processing Workflow

1. **Upload**: Documents are uploaded and queued for processing
2. **Classification**: AI classifies documents by type and domain
3. **Extraction**: Business terms are extracted with definitions and context
4. **Mapping**: Terms are automatically mapped to database schemas
5. **Review**: Results can be reviewed and refined by users
6. **Publishing**: Finalized terms and mappings are published to the system

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Document Processing**: Custom AI-powered extraction
- **Data Management**: TypeScript interfaces and data structures
- **Real-time Updates**: WebSocket-like simulation for live status

## Contributing

This platform is designed for banking and financial services organizations implementing NAPAS ACH integration. The document collection provides realistic examples for:

- System integration planning
- Business process documentation
- Compliance and regulatory requirements
- Operational procedures
- Risk management frameworks

## License

This project is designed for internal banking use and contains realistic business documents for NAPAS ACH integration simulation.

# Document Lineage System

A comprehensive document processing and lineage tracking system for business documents, with a focus on NAPAS ACH (Automated Clearing House) integration.

## Features

### Core Workflows
- **Document Upload & Processing**: Upload and process business documents
- **Term Extraction**: Extract business terms from documents
- **Classification**: Classify documents and terms
- **Enrichment**: Enrich extracted terms with additional metadata
- **Publishing**: Publish processed terms and documents
- **Consumption**: Consume and search through processed data

### Data Lineage
- **General Data Lineage**: Visualize relationships between data entities
- **NAPAS ACH Data Lineage**: Specialized lineage viewer for NAPAS ACH documents and schemas

## NAPAS ACH Data Lineage Viewer

The NAPAS ACH Data Lineage Viewer is a specialized component designed to map and visualize the relationships between NAPAS ACH documents, extracted terms, database schemas, and services. It provides a comprehensive view of how business documents flow through the system and map to technical implementations.

### Key Features

1. **Document-to-Term Mapping**: Tracks how terms are extracted from specific document sections
2. **Term-to-Schema Mapping**: Shows how business terms map to database schemas and tables
3. **Service Dependencies**: Visualizes how services depend on database tables and configurations
4. **Confidence Scoring**: Displays confidence levels for mappings and extractions
5. **Status Tracking**: Shows the status of various components (active, deprecated, pending, review)

### Data Structure

The viewer organizes data into several categories:

- **Documents**: Source documents (PDFs, Word docs) containing business requirements
- **Terms**: Business terms extracted from documents with definitions and metadata
- **Schemas**: Database schemas that implement the business concepts
- **Database Tables**: Specific tables within schemas
- **Services**: Microservices that consume the data

### Usage

To use the NAPAS ACH Data Lineage Viewer:

1. Navigate to the lineage section in the application
2. Select "NAPAS Lineage" from the available options
3. Browse through different categories using the filter buttons
4. Click on any item to view detailed information including:
   - Description and metadata
   - Source document information
   - Schema mappings
   - Confidence scores
   - Tags and relationships

### Example Data Flow

```
Document (DPG Middleware Integration Specification)
    ↓ extracts-to
Term (Message Routing Engine)
    ↓ maps-to
Schema (dpg_middleware)
    ↓ contains
Table (message_routing)
    ↓ depends-on
Service (DPG Service)
```

### Integration with Original Data

The component is designed to work with the original NAPAS ACH data records, including:
- Document metadata from `napas-documents.ts`
- Term definitions from `napas-ach-terms.json`
- Schema mappings and confidence scores
- Service dependencies and relationships

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to the application and explore the different workflows

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-specific components
│   ├── lineage/       # Data lineage components
│   │   └── components/
│   │       ├── DataLineageViewer.tsx
│   │       └── NAPASLineageViewer.tsx
│   └── ...
├── data/              # Mock data and data structures
│   ├── napas-documents.ts
│   └── napas-ach-terms.json
└── types/             # TypeScript type definitions
```
