import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, MapPin, Search, ArrowRight } from "lucide-react";
import { useLocationContext } from "../context/LocationContext";
import { getLocationLabel } from "../lib/locations";
import {
  isServiceAvailableInLocation,
  resolveServiceForLocation,
  ServiceEntry,
} from "../lib/services";
import { getAllServices } from "../lib/serviceCache";
import useSeo from "../hooks/useSeo";

const ServicesPage: React.FC = () => {
  useSeo({
    title: "All Home Services | Book Verified Professionals — AfixZ",
    description: "Browse and book all home services on AfixZ — gardening, mechanic, interior, fabrication, and more. Verified professionals at your doorstep.",
    canonicalUrl: `${import.meta.env.VITE_SITE_URL || "https://afixz.com"}/services`,
    keywords: ["home services", "book home services", "verified professionals", "doorstep services", "AfixZ"],
  });

  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const { selectedLocation } = useLocationContext();

  const [allServices, setAllServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const services = await getAllServices();
        if (active) {
          setAllServices(services);
          setError("");
        }
      } catch (err) {
        console.error(err);
        if (active) setError("We couldn't load services right now. Please try again shortly.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  // Client-side filtering: location + search
  const services = useMemo(() => {
    let filtered = allServices
      .filter((s) => isServiceAvailableInLocation(s, selectedLocation))
      .map((s) => resolveServiceForLocation(s, selectedLocation));

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.slug.toLowerCase().includes(search) ||
          s.categorySlug.toLowerCase().includes(search) ||
          s.searchKeywords.some((k) => k.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [allServices, selectedLocation, search]);

  return (
    <section className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">Home</Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">
            {search ? "Search Results" : "Services"}
          </span>
        </nav>

        {/* Header */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {search ? (
                <>
                  Results for <span className="text-slate-500">"{search}"</span>
                </>
              ) : (
                "All Services"
              )}
            </h1>
            {selectedLocation && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={13} className="text-slate-400" />
                Showing for {getLocationLabel(selectedLocation)}
              </div>
            )}
          </div>

          {!loading && services.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              {services.length} service{services.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                  <div className="space-y-2.5 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <Search size={22} className="text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">No services found</p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search term or change your location."
                  : "No services are available for your current location."}
              </p>
              <Link
                to="/"
                className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;

/* ---- Sub-components ---- */

const ServiceCard: React.FC<{ service: ServiceEntry }> = ({ service }) => {
  const hasImage = service.images && service.images.length > 0 && service.images[0];

  return (
    <Link
      to={`/services/${service.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
    >
      {/* Image / Placeholder */}
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {hasImage ? (
          <img
            src={service.images![0]}
            alt={service.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-2xl font-bold tracking-tight text-primary/25">afixz</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-800 transition group-hover:text-slate-900">
          {service.title}
        </h3>

        {service.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
            {service.shortDescription}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-accent">₹{service.price}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-slate-600">
            View
            <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
