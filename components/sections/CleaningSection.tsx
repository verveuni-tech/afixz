import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  rating: number;
  price: string;
};

const CLEANING_SERVICES: Service[] = [
  {
    id: 1,
    title: "Deep Home Cleaning",
    rating: 4.8,
    price: "₹799",
  },
  {
    id: 2,
    title: "Bathroom Cleaning",
    rating: 4.7,
    price: "₹399",
  },
  {
    id: 3,
    title: "Kitchen Cleaning",
    rating: 4.6,
    price: "₹499",
  },
  {
    id: 4,
    title: "Sofa & Upholstery Cleaning",
    rating: 4.9,
    price: "₹699",
  },
];

const gradients = [
  "from-blue-100 to-blue-300",
  "from-cyan-100 to-cyan-300",
  "from-sky-100 to-sky-300",
  "from-teal-100 to-teal-300",
];

const CleaningSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Cleaning Services
            </h2>
            <p className="mt-3 text-slate-600">
              Professional cleaning solutions for a spotless and hygienic home.
            </p>
          </div>

          <button className="hidden md:block text-blue-600 font-medium hover:underline">
            View All →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLEANING_SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Gradient Placeholder */}
              <div
                className={`w-full h-48 bg-gradient-to-br ${gradients[index % gradients.length]} group-hover:scale-105 transition duration-500`}
              />

              {/* Content */}
              <div className="p-5">
                <h3 className="font-medium text-slate-900 mb-3">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star size={14} fill="currentColor" />
                    {service.rating}
                  </div>

                  <span className="font-semibold text-slate-900">
                    {service.price}
                  </span>
                </div>

                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition">
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

export default CleaningSection;
