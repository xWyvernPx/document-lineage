import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

interface ExtractedTermsProps {
  termsCount: number;
}

export function ExtractedTerms({ termsCount }: ExtractedTermsProps) {
  return (
    <Card className="h-fit">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Terms</h3>
      
      <div className="text-center py-12">
        <p className="text-gray-600 mb-6">{termsCount} terms extracted</p>
        
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 mb-6">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">
            {termsCount === 0 ? 'No terms extracted' : `${termsCount} terms ready for review`}
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button variant="secondary">Save</Button>
          <Button variant="ghost">Skip</Button>
        </div>
      </div>
    </Card>
  );
}