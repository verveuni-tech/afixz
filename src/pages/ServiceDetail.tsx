import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

import ServiceGalleryCard from "../components/service/ServiceGalleryCard";
import ServiceBookingCard from "../components/service/ServiceBookingCard";
import ServiceOverviewCard from "../components/service/ServiceOverviewCard";
import ServiceReviewsCard from "../components/service/ServiceReviewsCard";

const ServiceDetail: React.FC = () => {
  const { slug } = useParams();
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    const fetchService = async () => {
      const q = query(
        collection(db, "services"),
        where("slug", "==", slug)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setService(snapshot.docs[0].data());
      }
    };

    fetchService();
  }, [slug]);

  if (!service) {
    return <div className="pt-32 text-center">Loading...</div>;
  }

  const formattedCategory =
    service.categorySlug?.replace(/-/g, " ");

  return (
    <div className="bg-offwhite min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/category/${service.categorySlug}`}
            className="hover:text-blue-600 transition capitalize"
          >
            {formattedCategory}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 font-medium">
            {service.title}
          </span>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
            {service.title}
          </h1>
          <p className="mt-2 text-slate-600 capitalize">
            4.7 (1,248 reviews) · {formattedCategory}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <ServiceGalleryCard images={service.images} />
            <div className="mt-8">
              <ServiceOverviewCard
                overview={service.overview}
                included={service.included}
                duration={service.duration}
                warranty={service.warranty}
                professionals={service.professionals}
              />
            </div>
          </div>

          <div>
            <ServiceBookingCard price={service.price} />
          </div>

        </div>

        <div className="mt-12">
          <ServiceReviewsCard />
        </div>

      </div>
    </div>
  );
};

export default ServiceDetail;