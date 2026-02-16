import React from 'react';
import Button from './Button';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden shadow-2xl">
        {/* Background Gradient & Pattern */}
        <div className="absolute inset-0 bg-accent-gradient"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        {/* Diagonal Cut Effect */}
        <div className="absolute top-0 right-0 w-full h-full bg-white/5 skew-x-12 origin-top-right transform translate-x-1/2"></div>

        <div className="relative z-10 px-8 py-16 md:py-24 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Be First to Experience AfixZ
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            We are launching soon in your city. Join our early access list to get exclusive discounts and priority booking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative max-w-sm w-full">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-6 py-4 rounded-full text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
              />
            </div>
            <Button size="lg" className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 shadow-xl border border-transparent">
              Get Early Access
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-blue-200 opacity-80">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;