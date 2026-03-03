import React, { useEffect, useState } from "react";
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
  price: number;
  images?: string[];
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
          limit(8)
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
    <section className="py-24 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-14">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Recommended Services
          </h2>
          <p className="mt-3 text-slate-600">
            Handpicked services to get you started.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">

          {/* Skeleton */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}

          {/* Real Services */}
          {!loading &&
            services.map((service) => (
              <Link
                key={service.id}
                to={`/service/${service.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
  <img
    src={
      service.images?.[0] ||
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952"
    }
    alt={service.title}
    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
    loading="lazy"
  />
</div>
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition">
                    {service.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-900">
                      ₹{service.price}
                    </span>

                    <span className="text-sm font-medium text-blue-600 group-hover:underline">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedServicesSection;