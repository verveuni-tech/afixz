import React from "react";
import { SERVICES } from "../../constants";
import ServiceCard from "../ServiceCard";

const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="py-28 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Book Verified Experts for
            <span className="text-blue-600"> Every Home Need</span>
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            Fast response. Transparent pricing. Trusted local professionals.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
