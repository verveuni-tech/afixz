import React from 'react';
import { Step } from '../types';

interface StepCardProps {
  step: Step;
  isLast: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, isLast }) => {
  const Icon = step.icon;
  
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector Line (Desktop only) */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-1/2 w-full h-[2px] bg-slate-200 -z-10" />
      )}
      
      <div className="w-20 h-20 rounded-full bg-white border-4 border-slate-50 shadow-lg flex items-center justify-center mb-6 z-10">
        <Icon className="text-blue-600 w-8 h-8" />
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm w-full max-w-sm hover:shadow-md transition-shadow">
        <span className="block text-blue-600 font-bold text-sm mb-2 uppercase tracking-wider">Step 0{step.id}</span>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
        <p className="text-slate-600">{step.description}</p>
      </div>
    </div>
  );
};

export default StepCard;