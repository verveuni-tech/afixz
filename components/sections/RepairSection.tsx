import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  image: string;
  rating: number;
  price: string;
};

const REPAIR_SERVICES: Service[] = [
  {
    id: 1,
    title: "AC Service & Repair",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4",
    rating: 4.7,
    price: "₹499",
  },
  {
    id: 2,
    title: "Plumbing Repair",
    image: "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0",
    rating: 4.6,
    price: "₹299",
  },
  {
    id: 3,
    title: "Electrical Fixing",
    image: "https://images.unsplash.com/photo-1581092160607-ee22731d9c52",
    rating: 4.8,
    price: "₹349",
  },
  {
    id: 4,
    title: "Geyser Installation & Repair",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    rating: 4.5,
    price: "₹399",
  },
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
          {REPAIR_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-44 object-cover"
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
