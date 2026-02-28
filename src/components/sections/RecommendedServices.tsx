import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

type Service = {
  id: string;
  title: string;
  slug: string;
  rating?: number;
  price: number;
};

const RecommendedServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("isRecommended", "==", true),
          limit(6)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];

        setServices(data);
      } catch (error) {
        console.error("Error fetching recommended services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="py-28 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Recommended Services
          </h2>
          <p className="mt-4 text-slate-600">
            Handpicked services to get you started.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* SKELETON STATE */}
          {(loading || services.length === 0) &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            ))}

          {/* REAL DATA */}
          {!loading &&
            services.length > 0 &&
            services.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.slug}`}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-md transition p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition">
                  {service.title}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                  {service.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={14} />
                      <span>{service.rating}</span>
                    </div>
                  )}

                  <span className="font-medium text-slate-900">
                    ₹{service.price}
                  </span>
                </div>

                <div className="mt-6 text-sm font-medium text-blue-600">
                  View Details →
                </div>
              </Link>
            ))}

        </div>
      </div>
    </section>
  );
};

export default RecommendedServicesSection;