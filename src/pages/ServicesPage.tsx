import React, { useEffect, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { useSearchParams, Link } from "react-router-dom";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
};

const PAGE_SIZE = 12;

const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setServices([]);
    setLastDoc(null);
    setHasMore(false);
    void loadCount(search);
    void fetchServices(search, false);
  }, [search]);

  async function loadCount(searchTerm: string) {
    try {
      const countQuery = searchTerm
        ? query(
            collection(db, "services"),
            where("searchKeywords", "array-contains", searchTerm)
          )
        : collection(db, "services");

      const snapshot = await getCountFromServer(countQuery);
      setTotalCount(snapshot.data().count);
    } catch (countError) {
      console.error(countError);
    }
  }

  async function fetchServices(searchTerm: string, loadMore: boolean) {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const baseQuery = searchTerm
        ? buildSearchQuery(searchTerm, loadMore ? lastDoc : null)
        : buildBrowseQuery(loadMore ? lastDoc : null);

      const snapshot = await getDocs(baseQuery);
      const data = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      })) as Service[];

      setServices((prev) => (loadMore ? [...prev, ...data] : data));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
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
              {search
                ? "Matched using optimized search keywords."
                : "Browse the latest services without loading the whole catalog at once."}
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            Showing {services.length} of {totalCount || services.length}
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
            No services found.
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

                    <p className="mt-3 text-lg font-semibold">Rs {service.price}</p>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => void fetchServices(search, true)}
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
        limit(PAGE_SIZE)
      )
    : query(collection(db, "services"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
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
        limit(PAGE_SIZE)
      )
    : query(
        collection(db, "services"),
        where("searchKeywords", "array-contains", searchTerm),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
}
