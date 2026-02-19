import React from "react";
import { ArrowRight } from "lucide-react";
import { Service } from "../types";

interface Props {
  service: Service;
}

const ServiceCard: React.FC<Props> = ({ service }) => {
  const Icon = service.icon;

  return (
    <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      
      <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-xl mb-6">
        <Icon className="text-blue-600" size={26} />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        {service.title}
      </h3>

      <p className="text-slate-600 text-sm leading-relaxed mb-6">
        {service.description}
      </p>

      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:gap-3 gap-2 transition-all">
        Book Service
        <ArrowRight size={16} />
      </div>
    </div>
  );
};

export default ServiceCard;
