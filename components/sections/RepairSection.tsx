import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  rating: number;
  price: string;
};

const REPAIR_SERVICES: Service[] = [
  {
    id: 1,
    title: "AC Service & Repair",
    rating: 4.7,
    price: "₹499",
  },
  {
    id: 2,
    title: "Plumbing Repair",
    rating: 4.6,
    price: "₹299",
  },
  {
    id: 3,
    title: "Electrical Fixing",
    rating: 4.8,
    price: "₹349",
  },
  {
    id: 4,
    title: "Geyser Installation & Repair",
    rating: 4.5,
    price: "₹399",
  },
];

const gradients = [
  "from-slate-700 to-slate-900",
  "from-blue-900 to-slate-800",
  "from-indigo-900 to-slate-800",
  "from-slate-800 to-slate-950",
];

const RepairSection: React.FC = () => {
  return (
    <section className="py-28 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Repair & Maintenance
            </h2>
            <p className="mt-3 text-slate-400">
              Fast response repairs handled by skilled professionals.
            </p>
          </div>

          <button className="hidden md:block text-blue-400 font-medium hover:underline">
            View All →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {REPAIR_SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300"
            >
              {/* Gradient Placeholder Instead of Image */}
              <div className="relative">
                <div
                  className={`w-full h-44 bg-gradient-to-br ${gradients[index % gradients.length]}`}
                />

                <div className="absolute top-4 left-4 bg-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                  Instant Service
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-sm mb-5 text-slate-300">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    {service.rating}
                  </div>

                  <span className="font-semibold text-white">
                    {service.price}
                  </span>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition">
                  Book Repair
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default RepairSection;
