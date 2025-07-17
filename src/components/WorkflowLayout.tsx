import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface WorkflowLayoutProps {
  children: React.ReactNode;
  currentStep: string;
  steps: WorkflowStep[];
  onStepChange: (stepId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export function WorkflowLayout({
  children,
  currentStep,
  steps,
  onStepChange,
  onNext,
  onPrevious,
  nextDisabled = false,
  nextLabel = 'Next',
  previousLabel = 'Previous'
}: WorkflowLayoutProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header with Progress */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentStepData?.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentStepData?.description}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onStepChange(step.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    step.current
                      ? 'bg-blue-100 text-blue-700'
                      : step.completed
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  disabled={!step.completed && !step.current && index > currentStepIndex + 1}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.current
                      ? 'bg-blue-600 text-white'
                      : step.completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className="hidden sm:block">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 ${
                    steps[index + 1].completed || steps[index + 1].current
                      ? 'bg-emerald-300'
                      : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 z-40">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={ChevronLeft}
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-2"
          >
            {previousLabel}
          </Button>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {currentStepIndex + 1} of {steps.length}
            </span>
            {currentStepIndex < steps.length - 1 && (
              <Button
                variant="primary"
                icon={ChevronRight}
                iconPosition="right"
                onClick={onNext}
                disabled={nextDisabled}
                className="flex items-center space-x-2"
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}