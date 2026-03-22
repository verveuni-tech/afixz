import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { ArrowRight, Star } from "lucide-react";
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

function formatPrice(price: unknown) {
  if (typeof price === "number") {
    return price.toLocaleString("en-IN");
  }

  if (typeof price === "string" && price.trim().length > 0) {
    return price;
  }

  return "—";
}

function PlaceholderImage() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(31,41,51,0.08),rgba(243,107,33,0.18))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,107,33,0.16),transparent_35%)]" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#1f2933]/10 bg-white/80 shadow-sm backdrop-blur">
        <span className="font-['Raleway'] text-2xl font-extrabold tracking-[0.18em] text-[#1f2933]">
          AZ
        </span>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#1f2933]/10 bg-white shadow-[0_18px_40px_-28px_rgba(31,41,51,0.28)]">
      <div className="aspect-[4/3] animate-pulse bg-[#1f2933]/8" />
      <div className="space-y-4 p-5">
        <div className="h-6 w-3/4 animate-pulse rounded-full bg-[#1f2933]/10" />
        <div className="h-px w-14 bg-[#f36b21]/25" />
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded-full bg-[#1f2933]/10" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-[#f36b21]/15" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-full bg-[#f36b21]/15" />
        </div>
      </div>
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
            content.featuredServiceIds.map((serviceId) =>
              getDoc(doc(db, "services", serviceId))
            )
          );

          resolvedServices = snapshots
            .filter((snapshot) => snapshot.exists())
            .map((snapshot) =>
              normalizeService(snapshot.id, snapshot.data() as Record<string, any>)
            );
        } else {
          const recommendedSnapshot = await getDocs(
            query(
              collection(db, "services"),
              where("isRecommended", "==", true),
              limit(8)
            )
          );

          resolvedServices = recommendedSnapshot.docs.map((entry) =>
            normalizeService(entry.id, entry.data() as Record<string, any>)
          );

          if (resolvedServices.length === 0) {
            const latestSnapshot = await getDocs(
              query(
                collection(db, "services"),
                orderBy("createdAt", "desc"),
                limit(8)
              )
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
    <section className="relative overflow-hidden bg-[#f9fafb] py-14 sm:py-16 lg:py-20">
      {/* <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f36b21]/40 to-transparent" /> */}
      <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#ffb37d]/25 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[#1f2933]/[0.05] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-['Cormorant_Garamond'] text-2xl italic leading-none text-[#f36b21] sm:text-3xl">
              Curated for everyday living
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-10 bg-[#f36b21]" />
              <span className="font-['Roboto_Condensed'] text-[11px] uppercase tracking-[0.24em] text-[#1f2933]/60 sm:text-xs">
                Recommended services
              </span>
            </div>

            <h2 className="mt-4 font-['Raleway'] text-3xl font-bold tracking-tight text-[#1f2933] sm:text-4xl">
              {content.title}
            </h2>

            <p className="mt-3 max-w-xl font-['Roboto_Condensed'] text-sm leading-6 text-[#1f2933]/75 sm:text-base">
              Trusted, location-aware essentials with a cleaner premium layout and
              stronger brand presence.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#1f2933]/12 bg-white px-5 py-3 font-['Roboto_Condensed'] text-sm font-semibold uppercase tracking-[0.08em] text-[#1f2933] transition hover:border-[#f36b21] hover:text-[#f36b21] hover:shadow-[0_14px_32px_-22px_rgba(31,41,51,0.35)]"
          >
            {content.ctaText}
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: MAX_VISIBLE_SERVICES }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#1f2933]/18 bg-white px-6 py-12 text-center shadow-[0_18px_40px_-28px_rgba(31,41,51,0.22)]">
            <p className="font-['Cormorant_Garamond'] text-2xl italic text-[#f36b21]">
              Nothing here yet
            </p>
            <p className="mt-3 font-['Roboto_Condensed'] text-sm tracking-[0.03em] text-[#1f2933]/70">
              No recommended services are available for the selected location yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group overflow-hidden rounded-[28px] border border-[#1f2933]/10 bg-white shadow-[0_18px_40px_-28px_rgba(31,41,51,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#f36b21]/35 hover:shadow-[0_28px_60px_-32px_rgba(31,41,51,0.35)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f9fafb]">
                  {service.images[0] ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <PlaceholderImage />
                  )}

                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/70 bg-white/85 px-3 py-1 font-['Roboto_Condensed'] text-[11px] uppercase tracking-[0.18em] text-[#1f2933] backdrop-blur">
                    Top pick
                  </span>

                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-[#1f2933]/88 px-3 py-1.5 font-['Roboto_Condensed'] text-xs font-medium text-white shadow-lg backdrop-blur">
                    <Star size={12} fill="currentColor" className="text-[#ffb37d]" />
                    {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
                  </span>
                </div>

                <div className="p-5">
                  <div>
                    <h3 className="font-['Raleway'] text-lg font-semibold leading-snug text-[#1f2933] transition-colors group-hover:text-[#f36b21]">
                      {service.title}
                    </h3>
                    <div className="mt-3 h-px w-12 bg-[#f36b21]/35 transition-all duration-300 group-hover:w-20 group-hover:bg-[#f36b21]" />
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-['Roboto_Condensed'] text-[11px] uppercase tracking-[0.22em] text-[#1f2933]/55">
                        Starting at
                      </p>
                      <p className="mt-1 font-['Raleway'] text-2xl font-bold text-[#f36b21]">
                        ₹{formatPrice(service.price)}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#f36b21] bg-[#f36b21] px-4 py-2 font-['Roboto_Condensed'] text-sm font-semibold uppercase tracking-[0.08em] text-white transition group-hover:border-[#d95a18] group-hover:bg-[#d95a18]">
                      Book now
                      <ArrowRight size={16} />
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