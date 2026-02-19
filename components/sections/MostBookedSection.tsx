import React from "react";
import { Star } from "lucide-react";

type Service = {
  id: number;
  title: string;
  image: string;
  rating: number;
  price: string;
  highlight?: boolean;
};

const MOST_BOOKED: Service[] = [
  {
    id: 1,
    title: "Intense Bathroom Cleaning",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
    rating: 4.8,
    price: "₹399",
    highlight: true,
  },
  {
    id: 2,
    title: "AC Service & Repair",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4",
    rating: 4.7,
    price: "₹499",
  },
  {
    id: 3,
    title: "Haircut for Men",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    rating: 4.9,
    price: "₹259",
  },
  {
    id: 4,
    title: "Plumbing Repair",
    image:
      "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0",
    rating: 4.6,
    price: "₹299",
  },
  {
    id: 5,
    title: "Deep Home Cleaning",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    rating: 4.8,
    price: "₹799",
  },
];

const MostBookedSection: React.FC = () => {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
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

          {MOST_BOOKED.map((service) => (
            <div
              key={service.id}
              className={`relative rounded-3xl overflow-hidden group cursor-pointer 
                ${service.highlight ? "md:col-span-2 md:row-span-2" : ""}
              `}
            >
              {/* Background Image */}
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

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
