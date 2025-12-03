import { CheckCircle, FileText, Mic, Sparkles } from 'lucide-react';

import { AppStep } from '../types';
import React from 'react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { icon: FileText, label: 'قالب گزارش' },
    { icon: Mic, label: 'ضبط صدا' },
    { icon: Sparkles, label: 'پردازش' },
    { icon: CheckCircle, label: 'نتیجه' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-1 bg-teal-500 transition-all duration-500 -z-10 rounded-full"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center  px-2 z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-300 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-teal-100 scale-110' : ''}
                `}
              >
                <Icon size={18} />
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive ? 'text-teal-700' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;