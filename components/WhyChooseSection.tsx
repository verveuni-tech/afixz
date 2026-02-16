import React from 'react';
import { TRUST_PILLARS } from '../constants';
import FeatureCard from './FeatureCard';

const WhyChooseSection: React.FC = () => {
  return (
    <section id="why-choose" className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Why Homeowners Trust  <span className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent whitespace-nowrap">
AfixZ
  </span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We don't just send anyone to your home. We send professionals who care about their craft and your satisfaction. Quality and safety are our non-negotiables.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRUST_PILLARS.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-slate-100 rounded-[2rem] -z-10 rotate-3" />
            <img 
              src="https://picsum.photos/800/800?random=10" 
              alt="Professional at work" 
              className="rounded-2xl shadow-2xl object-cover w-full h-[500px] grayscale-[20%]"
            />
            
            {/* Float Card */}
            <div className="absolute bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl max-w-xs hidden md:block animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">98%</div>
                <div>
                  <p className="font-bold text-slate-900">Satisfaction Rate</p>
                  <p className="text-xs text-slate-500">Based on 10k+ services</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;