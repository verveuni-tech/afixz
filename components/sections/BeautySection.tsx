import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  image: string;
  rating: number;
  price: string;
};

const BEAUTY_SERVICES: Service[] = [
  {
    id: 1,
    title: "Haircut for Women",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e",
    rating: 4.9,
    price: "₹699",
  },
  {
    id: 2,
    title: "Facial & Cleanup",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
    rating: 4.8,
    price: "₹899",
  },
  {
    id: 3,
    title: "Manicure & Pedicure",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371",
    rating: 4.7,
    price: "₹599",
  },
  {
    id: 4,
    title: "Bridal Makeup",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    rating: 4.9,
    price: "₹4,999",
  },
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
          {BEAUTY_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

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
