import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
  categorySlug?: string;
  isRecommended?: boolean;
};

const DISPLAY_LIMIT = 5;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80";

const RecommendedServicesSection = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"recommended" | "latest">("recommended");

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        const recommendedQuery = query(
          collection(db, "services"),
          where("isRecommended", "==", true),
          orderBy("createdAt", "desc"),
          limit(DISPLAY_LIMIT)
        );

        const recommendedSnapshot = await getDocs(recommendedQuery);
        const recommendedData = recommendedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];

        if (isMounted && recommendedData.length > 0) {
          setServices(recommendedData);
          setSource("recommended");
          return;
        }

        const latestQuery = query(
          collection(db, "services"),
          orderBy("createdAt", "desc"),
          limit(DISPLAY_LIMIT)
        );

        const latestSnapshot = await getDocs(latestQuery);
        const latestData = latestSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];

        if (isMounted) {
          setServices(latestData);
          setSource("latest");
        }
      } catch (error) {
        console.error("Error fetching recommended services:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_48%,#f8fafc_100%)] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Recommended Services
            </div>
            <h2 className="mt-5 text-2xl md:text-3xl font-semibold text-slate-900">
              Trusted service picks to get customers started faster.
            </h2>
            <p className="mt-3 text-slate-600 leading-8">
              {source === "recommended"
                ? "Hand-selected services that deserve extra visibility on the home page."
                : "No services are marked as recommended yet, so this section is showing the latest additions instead."}
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                <div className="space-y-4 p-6">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-12 rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              No services available yet
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Add services from the admin dashboard and mark the best ones as recommended
              to feature them here.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className={`group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)] ${
                  index === 0 ? "xl:col-span-2" : ""
                }`}
              >
                <div className={`grid h-full ${index === 0 ? "xl:grid-cols-[1.1fr_0.9fr]" : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={service.images?.[0] || FALLBACK_IMAGE}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />

                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                      <BadgeCheck className="h-4 w-4 text-blue-600" />
                      {source === "recommended" ? "Recommended" : "Latest"}
                    </div>
                  </div>

                  <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {formatCategory(service.categorySlug)}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        4.8
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-slate-900 transition group-hover:text-blue-600">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Book a reliable professional for {service.title.toLowerCase()} with
                      clear pricing and a fast path to checkout.
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            Starting from
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-slate-900">
                            Rs {service.price}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                          View details
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedServicesSection;

function formatCategory(categorySlug?: string) {
  if (!categorySlug) {
    return "Service";
  }

  return categorySlug.replace(/-/g, " ");
}
