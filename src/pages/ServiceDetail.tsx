import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

import ServiceGalleryCard from "../components/service/ServiceGalleryCard";
import ServiceOverviewCard from "../components/service/ServiceOverviewCard";
import ServiceFAQCard from "../components/service/ServiceFAQCard";
import AddToCartBlock from "../components/service/AddToCartBlock";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  overview: string;
  included: string[];
  duration: string;
  warranty: string;
  professionals: number;
  categorySlug: string;
};

const ServiceDetail: React.FC = () => {
  const { slug } = useParams();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const q = query(
          collection(db, "services"),
          where("slug", "==", slug),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setService({
            id: doc.id,
            ...doc.data(),
          } as Service);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 text-center text-slate-500">
        Loading service...
      </div>
    );
  }

  if (notFound || !service) {
    return (
      <div className="pt-40 text-center text-slate-600">
        Service not found.
      </div>
    );
  }

  const formattedCategory =
    service.categorySlug?.replace(/-/g, " ");

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 space-y-12">

        {/* Breadcrumb */}
        <div className="text-sm text-slate-500">
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
          <span className="text-slate-800 font-medium">
            {service.title}
          </span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {service.title}
          </h1>
          <p className="mt-3 text-slate-600 capitalize">
            {formattedCategory}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Content */}
          <div className="lg:col-span-2 space-y-10">
            <ServiceGalleryCard images={service.images} />

            <ServiceOverviewCard
              overview={service.overview}
              included={service.included}
              duration={service.duration}
              warranty={service.warranty}
              professionals={service.professionals}
            />
          </div>

          {/* Sticky Add To Cart Block */}
          <div className="lg:sticky lg:top-32 h-fit">
            <AddToCartBlock
              serviceId={service.id}
              title={service.title}
              price={service.price}
              slug={service.slug}
            />
          </div>

        </div>

        <ServiceFAQCard />

      </div>
    </div>
  );
};

export default ServiceDetail;