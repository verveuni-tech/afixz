import React from "react";
import { Search, MapPin } from "lucide-react";

const services = [
  "Plumbing",
  "Electrical",
  "AC Repair",
  "Cleaning",
  "Painting",
  "Carpentry",
];

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900 leading-tight">
          Book Trusted Local Experts
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Fast, verified professionals for repairs, cleaning, and home services — all in one place.
        </p>

        {/* Search Bar */}
        <div className="mt-10 bg-white shadow-lg rounded-2xl p-3 flex flex-col md:flex-row items-stretch gap-3 border border-gray-100">
          
          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl md:w-1/3">
            <MapPin size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Enter your location"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          {/* Service Search */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl md:flex-1">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="What service do you need?"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition">
            Search
          </button>
        </div>

        {/* Quick Services */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {services.map((service) => (
            <button
              key={service}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              {service}
            </button>
          ))}
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative">
          <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
            alt="Home service professional"
            className="rounded-3xl shadow-2xl w-full object-cover h-[400px]"
          />

          {/* Floating Trust Badge */}
          <div className="absolute bottom-6 left-6 bg-white shadow-md rounded-xl px-5 py-3 text-sm font-medium">
            ⭐ 4.8 Rated Professionals
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
