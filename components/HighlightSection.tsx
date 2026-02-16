import React from 'react';
import Button from './Button';
import { Star } from 'lucide-react';

const HighlightSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Angled background shape */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-900/20 -skew-x-12 translate-x-32" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://picsum.photos/400/500?random=20" 
                alt="Clean Living Room" 
                className="rounded-lg shadow-lg translate-y-8 object-cover h-64 w-full"
              />
              <img 
                src="https://picsum.photos/400/500?random=21" 
                alt="Plumber Working" 
                className="rounded-lg shadow-lg object-cover h-64 w-full"
              />
            </div>
            
            {/* Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 px-6 py-4 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap">
               <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
               <span className="font-bold">#1 Rated Service App</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Premium Service. <br/>
              <span className="text-blue-400">Guaranteed.</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Experience the difference with AfixZ. We bring the salon, the workshop, and the cleaning crew to your doorstep with a single tap.
            </p>
            <ul className="space-y-4 mb-8 text-slate-300">
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400" />
                 Instant booking confirmation
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400" />
                 Post-service cleanup included
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-400" />
                 24/7 Customer Support
               </li>
            </ul>
            <Button variant="secondary" size="lg">Explore Our Guarantee</Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HighlightSection;