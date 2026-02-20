import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  rating: number;
  price: string;
  highlight?: boolean;
};

const MOST_BOOKED: Service[] = [
  {
    id: 1,
    title: "Intense Bathroom Cleaning",
    rating: 4.8,
    price: "₹399",
    highlight: true,
  },
  {
    id: 2,
    title: "AC Service & Repair",
    rating: 4.7,
    price: "₹499",
  },
  {
    id: 3,
    title: "Haircut for Men",
    rating: 4.9,
    price: "₹259",
  },
  {
    id: 4,
    title: "Plumbing Repair",
    rating: 4.6,
    price: "₹299",
  },
  {
    id: 5,
    title: "Deep Home Cleaning",
    rating: 4.8,
    price: "₹799",
  },
];

const gradients = [
  "from-slate-400 to-slate-600",
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-indigo-400 to-indigo-600",
  "from-purple-400 to-purple-600",
];

const MostBookedSection: React.FC = () => {
  return (
    <section className="py-28 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Most Booked Services
          </h2>
          <p className="mt-4 text-slate-600">
            Popular services trusted by thousands of customers.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[260px]">

          {MOST_BOOKED.map((service, index) => (
            <div
              key={service.id}
              className={`relative rounded-3xl overflow-hidden group cursor-pointer 
                ${service.highlight ? "md:col-span-2 md:row-span-2" : ""}
              `}
            >
              {/* Gradient Placeholder */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} group-hover:scale-105 transition duration-500`}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  {service.title}
                </h3>

                <div className="flex items-center gap-3 text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} fill="white" />
                    <span>{service.rating}</span>
                  </div>
                  <span>{service.price}</span>
                </div>

                <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition">
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

export default MostBookedSection;
