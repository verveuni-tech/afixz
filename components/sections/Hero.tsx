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
    <section className="pt-32 pb-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto text-center">

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight text-slate-900">
          Book{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Trusted Local Experts
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Fast, verified professionals for repairs, cleaning, and home services — all in one place.
        </p>

        {/* Search Bar */}
        <div className="mt-10 bg-white shadow-xl rounded-2xl p-3 flex flex-col md:flex-row items-stretch gap-3 border border-slate-200">
          
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl md:w-1/3 border border-blue-100">
            <MapPin size={18} className="text-blue-600" />
            <input
              type="text"
              placeholder="Enter your location"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50 rounded-xl md:flex-1 border border-indigo-100">
            <Search size={18} className="text-indigo-600" />
            <input
              type="text"
              placeholder="What service do you need?"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400"
            />
          </div>

          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white px-8 py-3 rounded-xl font-medium transition shadow-md">
            Search
          </button>
        </div>

        {/* Quick Services */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {services.map((service, index) => (
            <button
              key={service}
              className={`
                px-4 py-2 rounded-full text-sm font-medium border transition
                ${
                  index % 3 === 0
                    ? "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                    : index % 3 === 1
                    ? "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                }
              `}
            >
              {service}
            </button>
          ))}
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative">
          <img
            src="https://res.cloudinary.com/du4ner2ab/image/upload/f_auto,q_auto,c_fill,w_1400/v1771517484/photo-1581578731548-c64695cc6952_v9wedm.jpg"
            alt="Professional providing home service"
            width={1400}
            height={800}
            fetchPriority="high"
            decoding="async"
            className="rounded-3xl shadow-2xl w-full h-[400px] object-cover border border-slate-200"
          />

          {/* Floating Badge */}
          <div className="absolute bottom-6 left-6 bg-white shadow-lg rounded-xl px-5 py-3 text-sm font-medium border border-blue-100">
            ⭐ <span className="text-blue-600 font-semibold">4.8 Rated Professionals</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
