// Page components
export { DocumentsPage } from './DocumentsPage';
export { UploadPage } from './UploadPage';
export { TermsPage } from './TermsPage';
export { SearchPage } from './SearchPage';
export { ReactFlowLineagePage } from './ReactFlowLineagePage';

// Feature components (re-exported for router)
export { AsyncProcessingApp } from '../features/async-processing';
export { ExtractionWorkflow } from '../features/extraction/components/ExtractionWorkflow';
export { ClassificationWorkflow } from '../features/classification/components/ClassificationWorkflow';
export { EnrichmentWorkflow } from '../features/enrichment/components/EnrichmentWorkflow';
export { PublishingWorkflow } from '../features/publishing/components/PublishingWorkflow';
export { ConsumptionWorkflow } from '../features/consumption/components/ConsumptionWorkflow';
export { DataLineageViewer } from '../features/lineage/components/DataLineageViewer';
export { NAPASLineageViewer } from '../features/lineage/components/NAPASLineageViewer';
export { SchemaIngestionPageMigrated } from '../features/schema/components/SchemaIngestionPageMigrated';
export { ApiTestingPage } from '../features/api-testing/ApiTestingPage';
