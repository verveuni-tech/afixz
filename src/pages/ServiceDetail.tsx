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
import { ChevronRight, Loader2 } from "lucide-react";

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
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          Loading service...
        </div>
      </div>
    );
  }

  if (notFound || !resolvedService) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-32">
        <p className="text-lg font-medium text-slate-700">Service not found</p>
        <p className="mt-2 text-sm text-slate-500">
          The service you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/services"
          className="mt-5 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Browse all services
        </Link>
      </div>
    );
  }

  const formattedCategory =
    resolvedService.categorySlug?.replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link
            to={`/category/${resolvedService.categorySlug}`}
            className="capitalize transition hover:text-slate-600"
          >
            {formattedCategory}
          </Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">
            {resolvedService.title}
          </span>
        </nav>

        {/* Title Section */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {resolvedService.title}
          </h1>
          {resolvedService.shortDescription && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {resolvedService.shortDescription}
            </p>
          )}
        </div>

        {/* Availability Warning */}
        {!availableInLocation && selectedLocation && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>
              This service is not currently available in your selected location.
              Switch your location from the header to check other cities.
            </span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="space-y-8">
            <ServiceGalleryCard images={resolvedService.images} />

            <ServiceOverviewCard
              overview={resolvedService.overview}
              included={resolvedService.included}
              duration={resolvedService.duration}
              warranty={resolvedService.warranty}
              professionals={resolvedService.professionals}
            />

            <ServiceFAQCard />
          </div>

          {/* Right Column — Sticky Cart */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <AddToCartBlock
              serviceId={resolvedService.id}
              title={resolvedService.title}
              price={resolvedService.price}
              slug={resolvedService.slug}
              availableInLocation={availableInLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
