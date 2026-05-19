import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  ArrowRight,
  BrushCleaning,
  Scissors,
  Sprout,
  Wrench,
  Bike,
  Home,
  Hammer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../lib/firebase";
import {
  CategoryEntry,
  inferCategorySectionKey,
  matchesCategory,
  normalizeCategory,
} from "../../lib/categories";
import { HomepageContent } from "../../lib/homepageFallbackContent";

type Props = {
  content: HomepageContent["topCategories"];
};

const iconMap: Record<string, typeof Wrench> = {
  cleaning: BrushCleaning,
  gardening: Sprout,
  beauty: Scissors,
  repair: Wrench,
  mechanic: Bike,
  interior: Home,
  fabrication: Hammer,
};

const categoryStyles = [
  {
    icon: "bg-primary text-white",
    arrow: "text-slate-300 group-hover:text-primary",
  },
  {
    icon: "bg-primary text-white",
    arrow: "text-slate-300 group-hover:text-primary",
  },
  {
    icon: "bg-primary text-white",
    arrow: "text-slate-300 group-hover:text-primary",
  },
  {
    icon: "bg-primary text-white",
    arrow: "text-slate-300 group-hover:text-primary",
  },
  {
    icon: "bg-primary text-white",
    arrow: "text-slate-300 group-hover:text-primary",
  },
];

const hiddenCategorySlugs = new Set([
  "cleaning",
  "home-cleaning",
  "cleaning-services",
  "deep-cleaning",
]);

export default function TopCategoriesSection({ content }: Props) {
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const snapshot = await getDocs(collection(db, "categories"));

        if (!active) {
          return;
        }

        setCategories(
          snapshot.docs.map((entry) =>
            normalizeCategory(entry.id, entry.data() as Record<string, any>)
          )
        );
      } catch (error) {
        console.error("Failed to load categories:", error);

        if (active) {
          setCategories([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const orderedCategories = useMemo(() => {
    const visibleCategories = categories.filter(
      (category) => !hiddenCategorySlugs.has(category.slug)
    );

    if (content.featuredCategorySlugs.length === 0) {
      return visibleCategories.slice(0, 5);
    }

    const prioritized = content.featuredCategorySlugs
      .map(
        (featuredSlug) =>
          visibleCategories.find((category) =>
            matchesCategory(category, featuredSlug)
          ) || null
      )
      .filter(
        (category): category is CategoryEntry => category !== null
      )
      .filter(
        (category, index, current) =>
          current.findIndex((entry) => entry.id === category.id) === index
      );

    const remainder = visibleCategories.filter(
      (category) =>
        !prioritized.some((entry) => entry.id === category.id)
    );

    return [...prioritized, ...remainder].slice(0, 5);
  }, [categories, content.featuredCategorySlugs]);

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">
            {content.title}
          </h2>

          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover"
          >
            {content.ctaText}
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex shrink-0 w-[148px] sm:w-auto items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
              >
                <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 shrink-0" />
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : orderedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">
            No categories are available yet. Add them from the admin panel and
            they will appear here.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible lg:grid-cols-5">
            {orderedCategories.map((category, index) => {
              const sectionKey =
                inferCategorySectionKey(
                  category.slug,
                  category.name
                ) || "repair";

              const Icon = iconMap[sectionKey] || Wrench;

              const style =
                categoryStyles[index % categoryStyles.length];

              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group flex shrink-0 w-[148px] sm:w-auto items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3.5 sm:px-4 sm:py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/10"
                >
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${style.icon}`}
                  >
                    <Icon size={17} />
                  </div>

                  <span className="flex-1 text-xs sm:text-sm font-semibold text-primary line-clamp-2 leading-snug">
                    {category.name}
                  </span>

                  <ArrowRight
                    size={13}
                    className={`shrink-0 transition ${style.arrow}`}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}