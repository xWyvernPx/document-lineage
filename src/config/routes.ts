import { 
  Home, 
  Upload, 
  BookOpen, 
  Database, 
  GitBranch, 
  Search, 
  Zap,
  Network,
  TestTube
} from 'lucide-react';

// Route definitions for the application
export interface RouteConfig {
  path: string;
  name: string;
  icon: typeof Home;
  description: string;
  component: string; // Component name to render
  section: string; // Navigation section
  isDefault?: boolean;
}

export const routes: RouteConfig[] = [
  // Default redirect to documents
  {
    path: '/',
    name: 'Home',
    icon: Home,
    description: 'Redirects to document management',
    component: 'Redirect',
    section: 'documents'
  },
  
  // Async Processing
  {
    path: '/async-processing',
    name: 'Async Processing',
    icon: Zap,
    description: 'Modern async document processing dashboard',
    component: 'AsyncProcessingApp',
    section: 'async-processing'
  },
  
  // Document Management (Default Section)
  {
    path: '/documents',
    name: 'Document Library',
    icon: Database,
    description: 'View and manage uploaded documents',
    component: 'DocumentLibrary',
    section: 'documents',
    isDefault: true
  },
  {
    path: '/upload',
    name: 'Upload Documents',
    icon: Upload,
    description: 'Upload new business documents',
    component: 'DocumentUpload',
    section: 'documents'
  },
  
  // Document Pipeline
  {
    path: '/extraction',
    name: 'Document Extraction',
    icon: GitBranch,
    description: 'Extract terms and data from documents',
    component: 'ExtractionWorkflow',
    section: 'pipeline'
  },
  {
    path: '/classification',
    name: 'Smart Classification',
    icon: GitBranch,
    description: 'Classify and categorize extracted terms',
    component: 'ClassificationWorkflow',
    section: 'pipeline'
  },
  {
    path: '/enrichment',
    name: 'Term Enrichment',
    icon: GitBranch,
    description: 'Enrich and map business terms',
    component: 'EnrichmentWorkflow',
    section: 'pipeline'
  },
  {
    path: '/review',
    name: 'Publishing & Review',
    icon: GitBranch,
    description: 'Review and approve processed terms',
    component: 'PublishingWorkflow',
    section: 'pipeline'
  },
  {
    path: '/consumption',
    name: 'Data Consumption',
    icon: GitBranch,
    description: 'Consume and use processed data',
    component: 'ConsumptionWorkflow',
    section: 'pipeline'
  },
  
  // Terms & Dictionary
  {
    path: '/terms',
    name: 'Term Dictionary',
    icon: BookOpen,
    description: 'Browse and manage business terms',
    component: 'TermDictionary',
    section: 'terms'
  },
  {
    path: '/search',
    name: 'Advanced Search',
    icon: Search,
    description: 'Search terms, documents, and definitions',
    component: 'SearchPage',
    section: 'terms'
  },
  
  // Lineage & Data Flow
  {
    path: '/lineage',
    name: 'Data Lineage',
    icon: Network,
    description: 'View data relationships and lineage',
    component: 'DataLineageViewer',
    section: 'lineage'
  },
  {
    path: '/reactflow-lineage',
    name: 'React Flow Lineage',
    icon: Network,
    description: 'New React Flow lineage with draggable nodes',
    component: 'ReactFlowLineageDemo',
    section: 'lineage'
  },
  {
    path: '/napas-lineage',
    name: 'NAPAS Lineage',
    icon: Network,
    description: 'NAPAS-specific lineage viewer',
    component: 'NAPASLineageViewer',
    section: 'lineage'
  },
  
  // Schema & Configuration
  {
    path: '/schema-ingestion',
    name: 'Schema Ingestion',
    icon: Database,
    description: 'Import database schemas and metadata',
    component: 'SchemaIngestionPageMigrated',
    section: 'schema'
  },
  
  // Testing & API
  {
    path: '/api-testing',
    name: 'API Testing',
    icon: TestTube,
    description: 'Test AWS API integration',
    component: 'ApiTestingPage',
    section: 'api-testing'
  }
];

// Navigation sections for the sidebar
export const navigationSections = [
  {
    id: 'documents',
    name: 'Document Management',
    icon: Database,
    description: 'Upload, manage, and view document metadata'
  },
  {
    id: 'pipeline',
    name: 'Document Pipeline',
    icon: GitBranch,
    description: 'Track extraction → classification → enrichment → validation flow'
  },
  {
    id: 'terms',
    name: 'Term Dictionary',
    icon: BookOpen,
    description: 'Browse, search, and review business terms'
  },
  {
    id: 'lineage',
    name: 'Data Lineage',
    icon: Network,
    description: 'View data relationships and flow'
  },
  {
    id: 'schema',
    name: 'Schema Ingestion',
    icon: Database,
    description: 'Import database schemas and metadata'
  },
  // {
  //   id: 'async-processing',
  //   name: 'Async Processing',
  //   icon: Zap,
  //   description: 'Modern async document processing dashboard'
  // },
  {
    id: 'api-testing',
    name: 'API Testing',
    icon: TestTube,
    description: 'Test real AWS API integration'
  }
];

// Helper functions
export const getRoutesBySection = (section: string) => {
  return routes.filter(route => route.section === section);
};

export const getRouteByPath = (path: string) => {
  return routes.find(route => route.path === path);
};

export const getCurrentSection = (pathname: string) => {
  const route = getRouteByPath(pathname);
  return route?.section || 'async-processing';
};
