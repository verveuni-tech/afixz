import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import { useLocationContext } from "../../context/LocationContext";
import {
  CategoryEntry,
  CategorySectionKey,
  matchesCategory,
  normalizeCategory,
  resolveCategoryMatch,
} from "../../lib/categories";
import { HomepageSectionContent } from "../../lib/homepageFallbackContent";
import {
  isServiceAvailableInLocation,
  normalizeService,
  resolveServiceForLocation,
  ServiceEntry,
} from "../../lib/services";

type Props = {
  content: HomepageSectionContent;
  backgroundClassName?: string;
  sectionKey?: CategorySectionKey;
  layout?: "grid" | "list";
};

function formatPrice(price: unknown) {
  if (typeof price === "number") {
    return price.toLocaleString("en-IN");
  }

  if (typeof price === "string" && price.trim().length > 0) {
    return price;
  }

  return "—";
}

function getCreatedAtValue(value: unknown) {
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  return 0;
}

function PlaceholderImage() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,rgba(31,41,51,0.08),rgba(243,107,33,0.18))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,107,33,0.16),transparent_35%)]" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[#1f2933]/10 bg-white/80 shadow-sm backdrop-blur">
        <span className="font-['Raleway'] text-xl font-extrabold tracking-[0.18em] text-[#1f2933]">
          AZ
        </span>
      </div>
    </div>
  );
}

function LoadingCardGrid() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#1f2933]/10 bg-white shadow-[0_14px_34px_-24px_rgba(31,41,51,0.22)]">
      <div className="aspect-[4/3] animate-pulse bg-[#1f2933]/8" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#1f2933]/10" />
        <div className="h-px w-10 bg-[#f36b21]/25" />
        <div className="flex items-end justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-[#f36b21]/15" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#1f2933]/10" />
        </div>
      </div>
    </div>
  );
}

function LoadingCardList() {
  return (
    <div className="flex overflow-hidden rounded-[24px] border border-[#1f2933]/10 bg-white shadow-[0_14px_34px_-24px_rgba(31,41,51,0.22)]">
      <div className="h-32 w-32 shrink-0 animate-pulse bg-[#1f2933]/8 sm:h-36 sm:w-36" />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#1f2933]/10" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#1f2933]/8" />
        </div>
        <div className="flex items-end justify-between">
          <div className="h-6 w-20 animate-pulse rounded-full bg-[#f36b21]/15" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-[#1f2933]/10" />
        </div>
      </div>
    </div>
  );
}

export default function ServiceCategorySection({
  content,
  backgroundClassName = "bg-[#f9fafb]",
  sectionKey,
  layout = "grid",
}: Props) {
  const { selectedLocation } = useLocationContext();
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [resolvedCategory, setResolvedCategory] = useState<CategoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categories = categorySnapshot.docs.map((entry) =>
          normalizeCategory(entry.id, entry.data() as Record<string, any>)
        );
        const matchedCategory = resolveCategoryMatch(categories, {
          preferredSlug: content.categorySlug,
          sectionKey,
          hints: [content.title, content.subtitle],
        });

        const snapshot = matchedCategory
          ? await getDocs(query(collection(db, "services"), where("categoryId", "==", matchedCategory.id)))
          : await getDocs(collection(db, "services"));

        if (!active) {
          return;
        }

        const filtered = snapshot.docs
          .map((entry) => ({
            service: normalizeService(entry.id, entry.data() as Record<string, any>),
            createdAt: getCreatedAtValue((entry.data() as Record<string, any>).createdAt),
          }))
          .filter(({ service }) =>
            matchedCategory
              ? service.categoryId === matchedCategory.id || matchesCategory(matchedCategory, service.categorySlug)
              : matchesCategory(
                  {
                    id: service.id,
                    name: service.categorySlug,
                    slug: service.categorySlug,
                  },
                  content.categorySlug,
                  content.title
                )
          )
          .sort((left, right) => right.createdAt - left.createdAt)
          .map(({ service }) => service)
          .filter((service) => isServiceAvailableInLocation(service, selectedLocation))
          .map((service) => resolveServiceForLocation(service, selectedLocation))
          .slice(0, 4);

        setResolvedCategory(matchedCategory);
        setServices(filtered);
      } catch (error) {
        console.error(`Failed to load ${content.categorySlug} services:`, error);
        if (active) {
          setResolvedCategory(null);
          setServices([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, [content.categorySlug, content.subtitle, content.title, sectionKey, selectedLocation]);

  const categoryHref = useMemo(
    () => `/category/${resolvedCategory?.slug || content.categorySlug}`,
    [content.categorySlug, resolvedCategory?.slug]
  );

  const renderGridCard = (service: ServiceEntry) => (
    <Link
      key={service.id}
      to={`/services/${service.slug}`}
      className="group overflow-hidden rounded-[24px] border border-[#1f2933]/10 bg-white shadow-[0_14px_34px_-24px_rgba(31,41,51,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#f36b21]/30 hover:shadow-[0_24px_50px_-28px_rgba(31,41,51,0.32)]"
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

        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#1f2933]/85 px-2.5 py-1 font-['Roboto_Condensed'] text-xs font-medium text-white shadow-lg backdrop-blur">
          <Star size={11} fill="currentColor" className="text-[#ffb37d]" />
          {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-['Raleway'] text-[15px] font-semibold leading-snug text-[#1f2933] transition-colors line-clamp-2 group-hover:text-[#f36b21]">
          {service.title}
        </h3>

        <div className="mt-2.5 h-px w-10 bg-[#f36b21]/30 transition-all duration-300 group-hover:w-16 group-hover:bg-[#f36b21]" />

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="font-['Roboto_Condensed'] text-[10px] uppercase tracking-[0.2em] text-[#1f2933]/50">
              From
            </p>
            <p className="mt-0.5 font-['Raleway'] text-xl font-bold text-[#f36b21]">
              ₹{formatPrice(service.price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f2933] px-3.5 py-2 font-['Roboto_Condensed'] text-xs font-semibold uppercase tracking-[0.06em] text-white transition group-hover:bg-[#323f4b]">
            Book
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );

  const renderListCard = (service: ServiceEntry) => (
    <Link
      key={service.id}
      to={`/services/${service.slug}`}
      className="group flex overflow-hidden rounded-[24px] border border-[#1f2933]/10 bg-white shadow-[0_14px_34px_-24px_rgba(31,41,51,0.22)] transition duration-300 hover:-translate-y-0.5 hover:border-[#f36b21]/30 hover:shadow-[0_24px_50px_-28px_rgba(31,41,51,0.32)]"
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-[#f9fafb] sm:h-36 sm:w-36">
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
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="font-['Raleway'] text-[15px] font-semibold leading-snug text-[#1f2933] transition-colors line-clamp-2 group-hover:text-[#f36b21]">
            {service.title}
          </h3>
          <p className="mt-1.5 font-['Roboto_Condensed'] text-xs leading-5 text-[#1f2933]/55 line-clamp-1">
            {service.shortDescription || "Professional at-home service"}
          </p>
          <div className="mt-2 h-px w-10 bg-[#f36b21]/30 transition-all duration-300 group-hover:w-16 group-hover:bg-[#f36b21]" />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1f2933]/8 px-2 py-0.5 font-['Roboto_Condensed'] text-[11px] text-[#1f2933]/70">
              <Star size={10} fill="currentColor" className="text-[#ffb37d]" />
              {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
            </span>
            <p className="font-['Raleway'] text-lg font-bold text-[#f36b21]">
              ₹{formatPrice(service.price)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f2933] px-3.5 py-2 font-['Roboto_Condensed'] text-xs font-semibold uppercase tracking-[0.06em] text-white transition group-hover:bg-[#323f4b]">
            Book
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <section className={`relative overflow-hidden py-14 sm:py-16 ${backgroundClassName}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1f2933]/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {content.subtitle && (
              <p className="font-['Cormorant_Garamond'] text-xl italic leading-none text-[#f36b21] sm:text-2xl">
                {content.subtitle}
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-3">
              <span className="h-px w-8 bg-[#1f2933]/30" />
              <span className="font-['Roboto_Condensed'] text-[11px] uppercase tracking-[0.22em] text-[#1f2933]/50">
                {content.categorySlug.replace(/-/g, " ")}
              </span>
            </div>

            <h2 className="mt-3 font-['Raleway'] text-2xl font-bold tracking-tight text-[#1f2933] sm:text-3xl">
              {content.title}
            </h2>
          </div>

          <Link
            to={categoryHref}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#1f2933]/12 bg-white px-5 py-2.5 font-['Roboto_Condensed'] text-sm font-semibold uppercase tracking-[0.08em] text-[#1f2933] transition hover:border-[#f36b21] hover:text-[#f36b21] hover:shadow-[0_12px_28px_-18px_rgba(31,41,51,0.3)]"
          >
            {content.ctaText}
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          layout === "list" ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingCardList key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingCardGrid key={index} />
              ))}
            </div>
          )
        ) : services.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#1f2933]/15 bg-white px-6 py-12 text-center shadow-[0_14px_34px_-24px_rgba(31,41,51,0.18)]">
            <p className="font-['Cormorant_Garamond'] text-xl italic text-[#f36b21]">
              Coming soon
            </p>
            <p className="mt-2 font-['Roboto_Condensed'] text-sm tracking-[0.02em] text-[#1f2933]/60">
              No services are available in this category for the selected location yet.
            </p>
          </div>
        ) : layout === "list" ? (
          <div className="space-y-4">
            {services.map(renderListCard)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(renderGridCard)}
          </div>
        )}
      </div>
    </section>
  );
}
