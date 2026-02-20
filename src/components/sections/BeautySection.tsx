import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  rating: number;
  price: string;
};

const BEAUTY_SERVICES: Service[] = [
  {
    id: 1,
    title: "Haircut for Women",
    rating: 4.9,
    price: "₹699",
  },
  {
    id: 2,
    title: "Facial & Cleanup",
    rating: 4.8,
    price: "₹899",
  },
  {
    id: 3,
    title: "Manicure & Pedicure",
    rating: 4.7,
    price: "₹599",
  },
  {
    id: 4,
    title: "Bridal Makeup",
    rating: 4.9,
    price: "₹4,999",
  },
];

const gradients = [
  "from-rose-100 to-rose-300",
  "from-pink-100 to-pink-300",
  "from-fuchsia-100 to-fuchsia-300",
  "from-purple-100 to-purple-300",
];

const BeautySection: React.FC = () => {
  return (
    <section className="py-28 bg-[#FFF7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Beauty & Personal Care
            </h2>
            <p className="mt-3 text-slate-600">
              Premium salon services delivered to your home.
            </p>
          </div>

          <button className="hidden md:block text-rose-500 font-medium hover:underline">
            View All →
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BEAUTY_SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Soft Gradient Placeholder */}
              <div
                className={`w-full h-52 bg-gradient-to-br ${gradients[index % gradients.length]} group-hover:scale-105 transition duration-500`}
              />

              {/* Content */}
              <div className="p-6">
                <h3 className="font-medium text-slate-900 mb-3">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-sm mb-5">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star size={14} fill="currentColor" />
                    {service.rating}
                  </div>

                  <span className="font-semibold text-slate-900">
                    {service.price}
                  </span>
                </div>

                <button className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl text-sm font-medium transition">
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

export default BeautySection;
