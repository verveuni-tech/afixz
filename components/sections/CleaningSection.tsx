import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  image: string;
  rating: number;
  price: string;
};

const CLEANING_SERVICES: Service[] = [
  {
    id: 1,
    title: "Deep Home Cleaning",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    rating: 4.8,
    price: "₹799",
  },
  {
    id: 2,
    title: "Bathroom Cleaning",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    rating: 4.7,
    price: "₹399",
  },
  {
    id: 3,
    title: "Kitchen Cleaning",
    image: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c",
    rating: 4.6,
    price: "₹499",
  },
  {
    id: 4,
    title: "Sofa & Upholstery Cleaning",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
    rating: 4.9,
    price: "₹699",
  },
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
          {CLEANING_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

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
