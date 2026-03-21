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

type AccentColor = "blue" | "emerald" | "rose" | "violet";

type Props = {
  content: HomepageSectionContent;
  backgroundClassName?: string;
  sectionKey?: CategorySectionKey;
  accentColor?: AccentColor;
  layout?: "grid" | "list";
};

const accentMap: Record<AccentColor, {
  bg: string;
  border: string;
  hoverShadow: string;
  heading: string;
  cta: string;
  badge: string;
  bookBtn: string;
  titleHover: string;
  placeholder: string;
}> = {
  blue: {
    bg: "bg-slate-50/50",
    border: "border-slate-200",
    hoverShadow: "hover:shadow-slate-100",
    heading: "text-slate-800",
    cta: "text-slate-500 hover:text-slate-700",
    badge: "bg-slate-600",
    bookBtn: "bg-slate-700 group-hover:bg-slate-800",
    titleHover: "group-hover:text-slate-600",
    placeholder: "from-slate-100 to-slate-50 text-slate-300",
  },
  emerald: {
    bg: "bg-stone-50/50",
    border: "border-stone-200",
    hoverShadow: "hover:shadow-stone-100",
    heading: "text-stone-800",
    cta: "text-stone-500 hover:text-stone-700",
    badge: "bg-stone-600",
    bookBtn: "bg-stone-700 group-hover:bg-stone-800",
    titleHover: "group-hover:text-stone-600",
    placeholder: "from-stone-100 to-stone-50 text-stone-300",
  },
  rose: {
    bg: "bg-neutral-50/50",
    border: "border-neutral-200",
    hoverShadow: "hover:shadow-neutral-100",
    heading: "text-neutral-800",
    cta: "text-neutral-500 hover:text-neutral-700",
    badge: "bg-neutral-600",
    bookBtn: "bg-neutral-700 group-hover:bg-neutral-800",
    titleHover: "group-hover:text-neutral-600",
    placeholder: "from-neutral-100 to-neutral-50 text-neutral-300",
  },
  violet: {
    bg: "bg-zinc-50/50",
    border: "border-zinc-200",
    hoverShadow: "hover:shadow-zinc-100",
    heading: "text-zinc-800",
    cta: "text-zinc-500 hover:text-zinc-700",
    badge: "bg-zinc-600",
    bookBtn: "bg-zinc-700 group-hover:bg-zinc-800",
    titleHover: "group-hover:text-zinc-600",
    placeholder: "from-zinc-100 to-zinc-50 text-zinc-300",
  },
};

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

export default function ServiceCategorySection({
  content,
  backgroundClassName = "bg-slate-50",
  sectionKey,
  accentColor = "blue",
  layout = "grid",
}: Props) {
  const { selectedLocation } = useLocationContext();
  const [services, setServices] = useState<ServiceEntry[]>([]);
  const [resolvedCategory, setResolvedCategory] = useState<CategoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const accent = accentMap[accentColor];

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

  const renderPlaceholder = () => (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${accent.placeholder}`}>
      <span className="text-xl font-black tracking-tight">afixz</span>
    </div>
  );

  const renderGridCard = (service: ServiceEntry) => (
    <Link
      key={service.id}
      to={`/services/${service.slug}`}
      className={`group overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg ${accent.border} ${accent.hoverShadow}`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
        {service.images[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          renderPlaceholder()
        )}
        <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-sm">
          <Star size={10} fill="currentColor" className="text-amber-400" />
          {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
        </span>
      </div>

      <div className="p-3">
        <h3 className={`text-sm font-semibold leading-tight text-slate-900 line-clamp-2 ${accent.titleHover}`}>
          {service.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">Rs {service.price}</span>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${accent.bookBtn}`}>
            Book
          </span>
        </div>
      </div>
    </Link>
  );

  const renderListCard = (service: ServiceEntry) => (
    <Link
      key={service.id}
      to={`/services/${service.slug}`}
      className={`group flex overflow-hidden rounded-2xl border bg-white transition hover:shadow-lg ${accent.border} ${accent.hoverShadow}`}
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden bg-slate-100 sm:h-32 sm:w-32">
        {service.images[0] ? (
          <img
            src={service.images[0]}
            alt={service.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          renderPlaceholder()
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h3 className={`text-sm font-semibold leading-tight text-slate-900 line-clamp-2 ${accent.titleHover}`}>
            {service.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {service.shortDescription || "Professional at-home service"}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={10} fill="currentColor" className="text-amber-400" />
            <span className="text-xs font-medium text-slate-600">
              {service.rating > 0 ? service.rating.toFixed(1) : "4.8"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Rs {service.price}</span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${accent.bookBtn}`}>
              Book
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <section className={`py-10 ${backgroundClassName}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className={`text-lg font-bold ${accent.heading}`}>{content.title}</h2>
          <Link
            to={categoryHref}
            className={`inline-flex items-center gap-1 text-xs font-semibold ${accent.cta}`}
          >
            {content.ctaText}
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          layout === "list" ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`flex overflow-hidden rounded-2xl border bg-white ${accent.border}`}>
                  <div className="h-28 w-28 shrink-0 animate-pulse bg-slate-200 sm:h-32 sm:w-32" />
                  <div className="flex-1 space-y-2 p-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-1/4 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`overflow-hidden rounded-2xl border bg-white ${accent.border}`}>
                  <div className="aspect-[3/2] animate-pulse bg-slate-200" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : services.length === 0 ? (
          <div className={`rounded-2xl border border-dashed bg-white px-6 py-10 text-center text-sm text-slate-500 ${accent.border}`}>
            No services are available in this category for the selected location yet.
          </div>
        ) : layout === "list" ? (
          <div className="space-y-3">
            {services.map(renderListCard)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {services.map(renderGridCard)}
          </div>
        )}
      </div>
    </section>
  );
}
