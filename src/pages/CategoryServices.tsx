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
import { SlidersHorizontal, Star, X } from "lucide-react";
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
  const [minPrice, setMinPrice] = useState(MIN_LIMIT);
  const [maxPrice, setMaxPrice] = useState(MAX_LIMIT);
  const [sortOption, setSortOption] = useState("price-asc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const formattedCategory = categorySlug?.replace(/-/g, " ");

  const fetchServices = async (loadMore = false) => {
    setLoading(true);

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
    }
  };

  useEffect(() => {
    setServices([]);
    setLastDoc(null);
    setHasMore(true);
    void fetchServices(false);
  }, [categorySlug, minPrice, maxPrice, selectedLocation, sortOption]);

  if (loading && services.length === 0) {
    return (
      <div className="pt-32 text-center text-slate-500">
        Loading services...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6 text-sm text-slate-500">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="capitalize text-slate-700 font-medium">
            {formattedCategory}
          </span>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-semibold capitalize">
            {formattedCategory} Services
          </h1>
          <p className="mt-2 text-slate-600">
            Explore and compare services available in your selected location.
          </p>
        </div>

        <div className="lg:hidden flex justify-between items-center mb-6">
          <p className="text-sm text-slate-600">
            {services.length} services
          </p>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 bg-white border px-4 py-2 rounded-xl shadow-sm"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="hidden lg:block">
            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              sortOption={sortOption}
              setSortOption={setSortOption}
              resultCount={services.length}
            />
          </div>

          <div className="lg:col-span-3">
            {services.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No services found.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={`/services/${service.slug}`}
                      className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="h-52 overflow-hidden">
                        <img
                          src={service.images?.[0] || "/placeholder.jpg"}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>

                      <div className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg">
                          {service.title}
                        </h3>
                        <p className="text-sm leading-6 text-slate-600">{service.shortDescription}</p>

                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Star size={14} fill="currentColor" />
                            {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
                          </div>

                          <span className="font-semibold">
                            Rs {service.price}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={() => void fetchServices(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 lg:hidden">
          <div className="bg-white w-full rounded-t-3xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <X />
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
            />

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-2xl"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryServices;

function FilterSidebar({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  sortOption,
  setSortOption,
  resultCount,
}: any) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8 sticky top-28 h-fit">
      <div>
        <h3 className="text-xl font-semibold">Filters</h3>
        <p className="text-sm text-slate-500 mt-1">
          {resultCount} services found
        </p>
      </div>

      <div>
        <label className="text-xs uppercase text-slate-500">
          Price Range
        </label>

        <div className="mt-6 space-y-4">
          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step="100"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="w-full"
          />

          <input
            type="range"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between text-sm text-slate-600">
            <span>Rs {minPrice}</span>
            <span>Rs {maxPrice}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase text-slate-500">
          Sort By
        </label>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full mt-2 bg-slate-50 rounded-2xl px-4 py-3 outline-none"
        >
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <button
        onClick={() => {
          setMinPrice(MIN_LIMIT);
          setMaxPrice(MAX_LIMIT);
        }}
        className="text-sm text-blue-600 hover:underline"
      >
        Reset Filters
      </button>
    </div>
  );
}
