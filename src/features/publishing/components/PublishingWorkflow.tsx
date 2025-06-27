import React from 'react';
import { SimplifiedPublishingWorkflow } from './SimplifiedPublishingWorkflow';

interface PublishingWorkflowProps {
  onPublishComplete?: (documentName: string) => void;
  onNavigateToTermDictionary?: () => void;
}

export function PublishingWorkflow({ 
  onPublishComplete,
  onNavigateToTermDictionary 
}: PublishingWorkflowProps) {
  return (
    <SimplifiedPublishingWorkflow 
      onPublishComplete={onPublishComplete}
      onNavigateToTermDictionary={onNavigateToTermDictionary}
    />
  );
}