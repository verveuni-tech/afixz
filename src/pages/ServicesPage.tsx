import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronRight, MapPin, Search, ArrowRight, X, ChevronDown } from "lucide-react";
import { useLocationContext } from "../context/LocationContext";
import { getLocationLabel } from "../lib/locations";
import {
  isServiceAvailableInLocation,
  resolveServiceForLocation,
  ServiceEntry,
} from "../lib/services";
import { getAllServices } from "../lib/serviceCache";
import useSeo from "../hooks/useSeo";

type SortOption = "default" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "Recommended",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
};

const ServicesPage: React.FC = () => {
  useSeo({
    title: "All Home Services | Book Verified Professionals — AfixZ",
    description:
      "Browse and book all home services on AfixZ — gardening, mechanic, interior, fabrication, and more. Verified professionals at your doorstep.",
    canonicalUrl: `${import.meta.env.VITE_SITE_URL || "https://afixz.com"}/services`,
    keywords: [
      "home services",
      "book home services",
      "verified professionals",
      "doorstep services",
      "AfixZ",
    ],
  });

  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const { selectedLocation } = useLocationContext();

  const [allServices, setAllServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [localSearch, setLocalSearch] = useState(search);

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
        if (active)
          setError(
            "We couldn't load services right now. Please try again shortly."
          );
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  // Derive unique categories from available services for this location
  const categories = useMemo(() => {
    const locationServices = allServices.filter((s) =>
      isServiceAvailableInLocation(s, selectedLocation)
    );
    const seen = new Set<string>();
    const result: { slug: string; label: string }[] = [];
    for (const s of locationServices) {
      if (s.categorySlug && !seen.has(s.categorySlug)) {
        seen.add(s.categorySlug);
        result.push({
          slug: s.categorySlug,
          label: s.categorySlug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        });
      }
    }
    return result;
  }, [allServices, selectedLocation]);

  // Reset category when location changes and it's no longer available
  useEffect(() => {
    if (
      selectedCategory &&
      !categories.some((c) => c.slug === selectedCategory)
    ) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  const services = useMemo(() => {
    const query = localSearch.trim().toLowerCase();

    let filtered = allServices
      .filter((s) => isServiceAvailableInLocation(s, selectedLocation))
      .map((s) => resolveServiceForLocation(s, selectedLocation));

    if (selectedCategory) {
      filtered = filtered.filter((s) => s.categorySlug === selectedCategory);
    }

    if (query) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.slug.toLowerCase().includes(query) ||
          s.categorySlug.toLowerCase().includes(query) ||
          s.searchKeywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    if (sortBy === "price-asc") {
      filtered = [...filtered].sort(
        (a, b) => (a.price as number) - (b.price as number)
      );
    } else if (sortBy === "price-desc") {
      filtered = [...filtered].sort(
        (a, b) => (b.price as number) - (a.price as number)
      );
    }

    return filtered;
  }, [allServices, selectedLocation, selectedCategory, localSearch, sortBy]);

  const hasActiveFilters =
    selectedCategory !== null || sortBy !== "default" || localSearch.trim().length > 0;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSortBy("default");
    setLocalSearch("");
  };

  return (
    <section className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 pt-5 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">Services</span>
        </nav>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              All Services
            </h1>
            {selectedLocation && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin size={13} className="text-slate-400" />
                {getLocationLabel(selectedLocation)}
              </div>
            )}
          </div>

          {!loading && services.length > 0 && (
            <span className="text-xs font-medium text-slate-400">
              {services.length} service{services.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {/* ── Filter bar ── */}
        <div className="mt-5 space-y-3">
          {/* Search + Sort row */}
          <div className="flex gap-2.5">
            {/* Inline search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                aria-label="Filter services"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search services…"
                className={`w-full pl-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#f36b21] focus:border-transparent outline-none transition ${localSearch ? "pr-9" : "pr-4"}`}
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort services"
                className="appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#f36b21] focus:border-transparent outline-none cursor-pointer transition"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Category chips — horizontal scroll on mobile */}
          {categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all min-h-[36px] ${
                  selectedCategory === null
                    ? "bg-[#1f2933] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() =>
                    setSelectedCategory(
                      cat.slug === selectedCategory ? null : cat.slug
                    )
                  }
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all min-h-[36px] ${
                    selectedCategory === cat.slug
                      ? "bg-[#f36b21] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#f36b21]/50 hover:text-[#f36b21]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Active filter summary + clear */}
          {hasActiveFilters && !loading && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {services.length} result{services.length === 1 ? "" : "s"}
                {selectedCategory && (
                  <>
                    {" "}
                    in{" "}
                    <span className="font-semibold text-[#f36b21]">
                      {categories.find((c) => c.slug === selectedCategory)?.label}
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-slate-400 underline hover:text-slate-700 transition"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
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
              <p className="mt-4 text-sm font-medium text-slate-700">
                No services found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {localSearch || selectedCategory
                  ? "Try different filters or clear them."
                  : "No services available for your current location."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
                >
                  Clear filters
                </button>
              )}
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
  const hasImage =
    service.images && service.images.length > 0 && service.images[0];

  return (
    <Link
      to={`/services/${service.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
    >
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
            <span className="text-2xl font-bold tracking-tight text-primary/25">
              afixz
            </span>
          </div>
        )}
      </div>

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
          <span className="text-base font-bold text-accent">
            ₹{service.price}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-slate-600">
            View
            <ArrowRight
              size={12}
              className="transition group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
};
