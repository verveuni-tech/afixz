// src/pages/ServicesPage.tsx

import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
};

const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      const q = query(collection(db, "services"));
      const snapshot = await getDocs(q);

      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      if (search) {
        data = data.filter((service) =>
          service.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      setServices(data);
      setLoading(false);
    };

    fetchServices();
  }, [search]);

  return (
    <section className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-3xl font-semibold text-slate-900 mb-10">
          {search ? `Results for "${search}"` : "All Services"}
        </h1>

        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-slate-500">
            No services found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
              to={`/services/${service.slug}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden transition hover:shadow-xl hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={service.images?.[0]}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-lg font-semibold">
                    ₹{service.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesPage;