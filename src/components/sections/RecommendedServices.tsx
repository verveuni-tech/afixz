import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { useLocationContext } from "../../context/LocationContext";
import { HomepageContent } from "../../lib/homepageFallbackContent";
import {
  isServiceAvailableInLocation,
  normalizeService,
  resolveServiceForLocation,
  ServiceEntry,
} from "../../lib/services";

type Props = {
  content: HomepageContent["recommended"];
};

const MAX_VISIBLE_SERVICES = 6;

function PlaceholderImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50">
      <span className="text-xl font-black tracking-tight text-stone-300">afixz</span>
    </div>
  );
}

const RecommendedServicesSection: React.FC<Props> = ({ content }) => {
  const { selectedLocation } = useLocationContext();
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchServices() {
      try {
        let resolvedServices: ServiceEntry[] = [];

        if (content.featuredServiceIds.length > 0) {
          const snapshots = await Promise.all(
            content.featuredServiceIds.map((serviceId) => getDoc(doc(db, "services", serviceId)))
          );

          resolvedServices = snapshots
            .filter((snapshot) => snapshot.exists())
            .map((snapshot) => normalizeService(snapshot.id, snapshot.data() as Record<string, any>));
        } else {
          const recommendedSnapshot = await getDocs(
            query(collection(db, "services"), where("isRecommended", "==", true), limit(8))
          );

          resolvedServices = recommendedSnapshot.docs.map((entry) =>
            normalizeService(entry.id, entry.data() as Record<string, any>)
          );

          if (resolvedServices.length === 0) {
            const latestSnapshot = await getDocs(
              query(collection(db, "services"), orderBy("createdAt", "desc"), limit(8))
            );

            resolvedServices = latestSnapshot.docs.map((entry) =>
              normalizeService(entry.id, entry.data() as Record<string, any>)
            );
          }
        }

        if (!active) {
          return;
        }

        const filteredServices = resolvedServices
          .filter((service) => isServiceAvailableInLocation(service, selectedLocation))
          .map((service) => resolveServiceForLocation(service, selectedLocation))
          .slice(0, MAX_VISIBLE_SERVICES);

        setServices(filteredServices);
      } catch (error) {
        console.error("Error fetching recommended services:", error);
        if (active) {
          setServices([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchServices();

    return () => {
      active = false;
    };
  }, [content.featuredServiceIds, selectedLocation]);

  return (
    <section className="bg-stone-50/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900">{content.title}</h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            {content.ctaText}
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: MAX_VISIBLE_SERVICES }).map((_, index) => (
              <div
                key={index}
                className="w-44 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="aspect-square animate-pulse bg-slate-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            No recommended services are available for the selected location yet.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group w-44 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-lg hover:shadow-stone-100"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {service.images[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <PlaceholderImage />
                  )}
                  <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                    <Star size={10} fill="currentColor" className="text-amber-400" />
                    {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
                  </span>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-tight text-slate-900 line-clamp-2 group-hover:text-slate-600">
                    {service.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Rs {service.price}</span>
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white">
                      Book
                    </span>
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
