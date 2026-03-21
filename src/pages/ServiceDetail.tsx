import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";

import ServiceGalleryCard from "../components/service/ServiceGalleryCard";
import ServiceOverviewCard from "../components/service/ServiceOverviewCard";
import ServiceFAQCard from "../components/service/ServiceFAQCard";
import AddToCartBlock from "../components/service/AddToCartBlock";
import { useLocationContext } from "../context/LocationContext";
import {
  isServiceAvailableInLocation,
  normalizeService,
  resolveServiceForLocation,
  ServiceEntry,
} from "../lib/services";

const ServiceDetail: React.FC = () => {
  const { slug } = useParams();
  const { selectedLocation } = useLocationContext();

  const [service, setService] = useState<ServiceEntry | null>(null);
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
          setService(normalizeService(doc.id, doc.data() as Record<string, any>));
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchService();
  }, [slug]);

  const resolvedService = useMemo(() => {
    if (!service) {
      return null;
    }

    return resolveServiceForLocation(service, selectedLocation);
  }, [selectedLocation, service]);

  const availableInLocation = resolvedService
    ? isServiceAvailableInLocation(resolvedService, selectedLocation)
    : false;

  if (loading) {
    return (
      <div className="pt-40 text-center text-slate-500">
        Loading service...
      </div>
    );
  }

  if (notFound || !resolvedService) {
    return (
      <div className="pt-40 text-center text-slate-600">
        Service not found.
      </div>
    );
  }

  const formattedCategory =
    resolvedService.categorySlug?.replace(/-/g, " ");

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/category/${resolvedService.categorySlug}`}
            className="hover:text-blue-600 transition capitalize"
          >
            {formattedCategory}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">
            {resolvedService.title}
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {resolvedService.title}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            {resolvedService.shortDescription || formattedCategory}
          </p>
        </div>

        {!availableInLocation && selectedLocation && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
            This service is not currently available in your selected location. You can switch the
            location from the header to see availability in another city.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <ServiceGalleryCard images={resolvedService.images} />

            <ServiceOverviewCard
              overview={resolvedService.overview}
              included={resolvedService.included}
              duration={resolvedService.duration}
              warranty={resolvedService.warranty}
              professionals={resolvedService.professionals}
            />
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <AddToCartBlock
              serviceId={resolvedService.id}
              title={resolvedService.title}
              price={resolvedService.price}
              slug={resolvedService.slug}
              availableInLocation={availableInLocation}
            />
          </div>
        </div>

        <ServiceFAQCard />
      </div>
    </div>
  );
};

export default ServiceDetail;
