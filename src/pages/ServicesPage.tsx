import React, { useEffect, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useSearchParams, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useLocationContext } from "../context/LocationContext";
import { getLocationLabel } from "../lib/locations";
import {
  isServiceAvailableInLocation,
  normalizeService,
  resolveServiceForLocation,
  ServiceEntry,
} from "../lib/services";

const PAGE_SIZE = 12;
const BATCH_SIZE = 24;

const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const { selectedLocation } = useLocationContext();

  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setServices([]);
    setLastDoc(null);
    setHasMore(false);
    void fetchServices(false);
  }, [search, selectedLocation]);

  async function fetchServices(loadMore: boolean) {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const results: ServiceEntry[] = [];
      let cursor = loadMore ? lastDoc : null;
      let keepLoading = true;

      while (keepLoading && results.length < PAGE_SIZE) {
        const baseQuery = search
          ? buildSearchQuery(search, cursor)
          : buildBrowseQuery(cursor);

        const snapshot = await getDocs(baseQuery);
        const batch = snapshot.docs
          .map((entry) => normalizeService(entry.id, entry.data() as Record<string, any>))
          .filter((service) => isServiceAvailableInLocation(service, selectedLocation))
          .map((service) => resolveServiceForLocation(service, selectedLocation));

        results.push(...batch.slice(0, PAGE_SIZE - results.length));
        cursor = snapshot.docs[snapshot.docs.length - 1] || cursor;
        keepLoading = snapshot.docs.length === BATCH_SIZE;
      }

      setServices((prev) => (loadMore ? [...prev, ...results] : results));
      setLastDoc(cursor);
      setHasMore(keepLoading);
      setError("");
    } catch (fetchError) {
      console.error(fetchError);
      setError("We couldn't load services right now. Please try again shortly.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {search ? `Results for "${search}"` : "All Services"}
            </h1>
            <p className="mt-2 text-slate-600">
              {selectedLocation
                ? `Showing services available in ${getLocationLabel(selectedLocation)}.`
                : "Browse services across all currently supported locations."}
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Showing {services.length} service{services.length === 1 ? "" : "s"}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center text-slate-500 shadow-sm">
            No services found for this search and location combination.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={service.images?.[0]}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {service.shortDescription}
                    </p>
                    <p className="mt-3 text-lg font-semibold">Rs {service.price}</p>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchServices(true)}
                  disabled={loadingMore}
                  className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {loadingMore ? "Loading more..." : "Load More Services"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ServicesPage;

function buildBrowseQuery(lastDoc: QueryDocumentSnapshot<DocumentData> | null) {
  return lastDoc
    ? query(
        collection(db, "services"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(BATCH_SIZE)
      )
    : query(collection(db, "services"), orderBy("createdAt", "desc"), limit(BATCH_SIZE));
}

function buildSearchQuery(
  searchTerm: string,
  lastDoc: QueryDocumentSnapshot<DocumentData> | null
) {
  return lastDoc
    ? query(
        collection(db, "services"),
        where("searchKeywords", "array-contains", searchTerm),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(BATCH_SIZE)
      )
    : query(
        collection(db, "services"),
        where("searchKeywords", "array-contains", searchTerm),
        orderBy("createdAt", "desc"),
        limit(BATCH_SIZE)
      );
}
