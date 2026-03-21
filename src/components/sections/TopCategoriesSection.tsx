import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ArrowRight, BrushCleaning, Scissors, Sprout, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
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

const iconMap = {
  cleaning: BrushCleaning,
  gardening: Sprout,
  beauty: Scissors,
  repair: Wrench,
};

const categoryStyles = [
  {
    icon: "bg-slate-100 text-slate-600",
    card: "border-slate-150 hover:border-slate-200 hover:bg-slate-50/50",
    label: "text-slate-800",
  },
  {
    icon: "bg-stone-100 text-stone-600",
    card: "border-stone-150 hover:border-stone-200 hover:bg-stone-50/50",
    label: "text-stone-800",
  },
  {
    icon: "bg-zinc-100 text-zinc-600",
    card: "border-zinc-150 hover:border-zinc-200 hover:bg-zinc-50/50",
    label: "text-zinc-800",
  },
  {
    icon: "bg-neutral-100 text-neutral-600",
    card: "border-neutral-150 hover:border-neutral-200 hover:bg-neutral-50/50",
    label: "text-neutral-800",
  },
];

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
          snapshot.docs.map((entry) => normalizeCategory(entry.id, entry.data() as Record<string, any>))
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
    if (content.featuredCategorySlugs.length === 0) {
      return categories.slice(0, 4);
    }

    const prioritized = content.featuredCategorySlugs
      .map((featuredSlug) => categories.find((category) => matchesCategory(category, featuredSlug)) || null)
      .filter((category, index, current): category is CategoryEntry =>
        Boolean(category) && current.findIndex((entry) => entry?.id === category.id) === index
      );

    const remainder = categories.filter((category) => !prioritized.some((entry) => entry.id === category.id));

    return [...prioritized, ...remainder].slice(0, 4);
  }, [categories, content.featuredCategorySlugs]);

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{content.title}</h2>
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            {content.ctaText}
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : orderedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center text-sm text-slate-500">
            No categories are available yet. Add them from the admin panel and they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {orderedCategories.map((category, index) => {
              const sectionKey = inferCategorySectionKey(category.slug, category.name) || "repair";
              const Icon = iconMap[sectionKey];
              const style = categoryStyles[index % categoryStyles.length];

              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className={`flex items-center gap-3 rounded-2xl border bg-white p-4 transition hover:shadow-md ${style.card}`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-sm font-semibold ${style.label}`}>
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
