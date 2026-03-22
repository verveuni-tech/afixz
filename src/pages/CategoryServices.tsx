import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { ArrowRight, ChevronRight, Loader2, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useLocationContext } from "../context/LocationContext";
import {
  isServiceAvailableInLocation,
  normalizeService,
  resolveServiceForLocation,
  ServiceEntry,
} from "../lib/services";

const PAGE_SIZE = 12;
const BATCH_SIZE = 24;
const MIN_LIMIT = 0;
const MAX_LIMIT = 10000;

const CategoryServices: React.FC = () => {
  const { categorySlug } = useParams();
  const { selectedLocation } = useLocationContext();

  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [minPrice, setMinPrice] = useState(MIN_LIMIT);
  const [maxPrice, setMaxPrice] = useState(MAX_LIMIT);
  const [sortOption, setSortOption] = useState("price-asc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const formattedCategory = categorySlug?.replace(/-/g, " ");

  const fetchServices = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let cursor = loadMore ? lastDoc : null;
      const collected: ServiceEntry[] = [];
      let keepLoading = true;

      while (keepLoading && collected.length < PAGE_SIZE) {
        const snapshot = await getDocs(
          cursor
            ? query(
                collection(db, "services"),
                where("categorySlug", "==", categorySlug),
                orderBy("createdAt", "desc"),
                startAfter(cursor),
                limit(BATCH_SIZE)
              )
            : query(
                collection(db, "services"),
                where("categorySlug", "==", categorySlug),
                orderBy("createdAt", "desc"),
                limit(BATCH_SIZE)
              )
        );

        const batch = snapshot.docs
          .map((entry) => normalizeService(entry.id, entry.data() as Record<string, any>))
          .filter((service) => isServiceAvailableInLocation(service, selectedLocation))
          .map((service) => resolveServiceForLocation(service, selectedLocation))
          .filter((service) => service.price >= minPrice && service.price <= maxPrice);

        collected.push(...batch);
        cursor = snapshot.docs[snapshot.docs.length - 1] || cursor;
        keepLoading = snapshot.docs.length === BATCH_SIZE;
      }

      const sorted = [...collected]
        .sort((left, right) =>
          sortOption === "price-desc" ? right.price - left.price : left.price - right.price
        )
        .slice(0, PAGE_SIZE);

      if (loadMore) {
        setServices((prev) =>
          [...prev, ...sorted].sort((left, right) =>
            sortOption === "price-desc" ? right.price - left.price : left.price - right.price
          )
        );
      } else {
        setServices(sorted);
      }

      setLastDoc(cursor);
      setHasMore(keepLoading);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setServices([]);
    setLastDoc(null);
    setHasMore(true);
    void fetchServices(false);
  }, [categorySlug, minPrice, maxPrice, selectedLocation, sortOption]);

  const activeFilterCount =
    (minPrice > MIN_LIMIT ? 1 : 0) + (maxPrice < MAX_LIMIT ? 1 : 0);

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">Home</Link>
          <ChevronRight size={13} />
          <Link to="/services" className="transition hover:text-slate-600">Services</Link>
          <ChevronRight size={13} />
          <span className="font-medium capitalize text-slate-700">
            {formattedCategory}
          </span>
        </nav>

        {/* Header */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold capitalize tracking-tight text-slate-900">
              {formattedCategory}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Explore and compare services available in your area.
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 self-start rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              sortOption={sortOption}
              setSortOption={setSortOption}
              resultCount={services.length}
              loading={loading}
            />
          </div>

          {/* Service Grid */}
          <div>
            {loading && services.length === 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                    <div className="space-y-2.5 p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Search size={22} className="text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">No services found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your filters or changing your location.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      setMinPrice(MIN_LIMIT);
                      setMaxPrice(MAX_LIMIT);
                    }}
                    className="mt-4 text-sm font-medium text-accent transition hover:text-accent-hover"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results count bar */}
                <div className="mb-5 hidden items-center justify-between lg:flex">
                  <span className="text-xs text-slate-400">
                    {services.length} service{services.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {services.map((service) => (
                    <CategoryServiceCard key={service.id} service={service} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => void fetchServices(true)}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileFilters(false);
          }}
        >
          <div className="w-full rounded-t-2xl border-t border-slate-200 bg-white px-5 pb-6 pt-4">
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              sortOption={sortOption}
              setSortOption={setSortOption}
              resultCount={services.length}
              loading={loading}
              isMobile
            />

            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Show {services.length} result{services.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryServices;

/* ---- Service Card ---- */

const CategoryServiceCard: React.FC<{ service: ServiceEntry }> = ({ service }) => {
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

          <div className="flex items-center gap-3">
            {service.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Star size={11} fill="currentColor" className="text-amber-400" />
                {service.rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-slate-600">
              View
              <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ---- Filter Sidebar ---- */

function FilterSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sortOption,
  setSortOption,
  resultCount,
  loading,
  isMobile,
}: {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
  sortOption: string;
  setSortOption: (v: string) => void;
  resultCount: number;
  loading: boolean;
  isMobile?: boolean;
}) {
  const hasActiveFilters = minPrice > MIN_LIMIT || maxPrice < MAX_LIMIT;

  const wrapperClass = isMobile
    ? "space-y-5"
    : "sticky top-28 space-y-5 rounded-xl border border-slate-200 bg-white p-5";

  return (
    <div className={wrapperClass}>
      {/* Header (desktop only) */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <span className="text-[11px] text-slate-400">
            {loading ? "…" : `${resultCount} found`}
          </span>
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          Sort by
        </label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
        >
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-3 block text-xs font-medium text-slate-500">
          Price range
        </label>

        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-[11px] text-slate-400">
              <span>Min</span>
              <span>₹{minPrice}</span>
            </div>
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="100"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[11px] text-slate-400">
              <span>Max</span>
              <span>₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={MIN_LIMIT}
              max={MAX_LIMIT}
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            setMinPrice(MIN_LIMIT);
            setMaxPrice(MAX_LIMIT);
          }}
          className="text-xs font-medium text-red-500 transition hover:text-red-600"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
