import React from 'react';
import { Feature } from '../types';

interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const Icon = feature.icon;
  
  return (
    <div className="flex flex-col items-start p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300">
      <div className="p-3 rounded-lg bg-blue-100/50 text-blue-700 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
      <p className="text-slate-600 text-sm">{feature.description}</p>
    </div>
  );
};

export default FeatureCard;