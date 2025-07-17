import { TermEnrichmentMappingInterface } from './TermEnrichmentMappingInterface';

interface EnrichmentWorkflowProps {
  onEnrichmentComplete?: (data: any) => void;
}

export function EnrichmentWorkflow({ onEnrichmentComplete }: EnrichmentWorkflowProps) {
  return (
    <div>
      <TermEnrichmentMappingInterface onEnrichmentComplete={onEnrichmentComplete} />
    </div>
  );
}