import React from 'react';
import { SERVICES } from '../constants';
import ServiceCard from './ServiceCard';

const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Expert Services for <span className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent whitespace-nowrap">
Every Need  </span>
          </h2>
          <p className="text-lg text-slate-600">
            Professional help is just a click away. Explore our wide range of premium home services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;