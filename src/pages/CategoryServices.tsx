import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { Star } from "lucide-react";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
};

const CategoryServices: React.FC = () => {
  const { categorySlug } = useParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("categorySlug", "==", categorySlug),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];

        setServices(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categorySlug]);

  if (loading) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 capitalize">
            {categorySlug} Services
          </h1>
          <p className="mt-3 text-slate-600">
            Explore all available services in this category.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center text-slate-500">
            No services found.
          </div>
        ) : (
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
        )}

      </div>
    </div>
  );
};

export default CategoryServices;