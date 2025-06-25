import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface StepInstructionsProps {
  title: string;
  description: string;
  tips?: string[];
  helpContent?: string;
  variant?: 'default' | 'blue' | 'green' | 'amber';
}

export function StepInstructions({ 
  title, 
  description, 
  tips = [], 
  helpContent,
  variant = 'blue' 
}: StepInstructionsProps) {
  const [showHelp, setShowHelp] = useState(false);

  const variants = {
    default: 'bg-gray-50 border-gray-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
  };

  const iconVariants = {
    default: 'text-gray-500',
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    amber: 'text-amber-500',
  };

  return (
    <div className={`rounded-lg border p-4 mb-6 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Info className={`w-5 h-5 ${iconVariants[variant]}`} />
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{description}</p>
          
          {tips.length > 0 && (
            <div className="mt-3">
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-blue-500 mt-1 text-xs">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {helpContent && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="ml-4 flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>What is this?</span>
            {showHelp ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      
      {showHelp && helpContent && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 leading-relaxed">
            {helpContent}
          </div>
        </div>
      )}
    </div>
  );
}