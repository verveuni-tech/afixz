import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
};

const CleaningSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const q = query(
        collection(db, "services"),
        where("categorySlug", "==", "cleaning"),
        orderBy("createdAt", "desc"),
        limit(4)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      setServices(data);
    };

    fetchServices();
  }, []);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header Row */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Cleaning Services
            </h2>
            <p className="mt-3 text-slate-600">
              Professional cleaning solutions for a spotless and hygienic home.
            </p>
          </div>

          <Link
            to="/category/cleaning"
            className="text-blue-600 font-medium text-sm hover:underline whitespace-nowrap"
          >
            View All →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/services/${service.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 block"
            >
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={service.images?.[0]}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="p-5">
                <h3 className="font-medium text-slate-900 mb-3">
                  {service.title}
                </h3>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Star size={14} fill="currentColor" />
                    4.7
                  </div>

                  <span className="font-semibold text-slate-900">
                    ₹{service.price}
                  </span>
                </div>

                <div className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium text-center">
                  Book Now
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CleaningSection;