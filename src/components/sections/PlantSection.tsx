import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  rating: number;
  price: string;
};

const PLANT_SERVICES: Service[] = [
  { id: 1, title: "Home Garden Setup", rating: 4.9, price: "₹1,499" },
  { id: 2, title: "Balcony Plant Styling", rating: 4.8, price: "₹999" },
  { id: 3, title: "Lawn Maintenance", rating: 4.7, price: "₹1,299" },
  { id: 4, title: "Indoor Plant Care", rating: 4.9, price: "₹799" },
];

const PlantSection: React.FC = () => {
  return (
    <section id="plants" className="py-24 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Plant & Gardening Services
            </h2>
            <p className="mt-3 text-slate-600">
              Green solutions to beautify and maintain your home spaces.
            </p>
          </div>

          <button className="hidden md:block text-emerald-600 font-medium hover:underline">
            View All →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PLANT_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden border border-emerald-100 hover:shadow-lg transition-all duration-300"
            >
              {/* Placeholder Image */}
              <div className="h-48 bg-gradient-to-br from-emerald-200 to-emerald-400" />

              {/* Content */}
              <div className="p-5">
                <h3 className="font-medium text-slate-900 mb-3">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star size={14} fill="currentColor" />
                    {service.rating}
                  </div>

                  <span className="font-semibold text-slate-900">
                    {service.price}
                  </span>
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PlantSection;