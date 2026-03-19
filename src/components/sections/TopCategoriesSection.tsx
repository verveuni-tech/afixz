import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Wrench,
  BrushCleaning,
  Flower2,
  Hammer,
  Zap,
  Paintbrush2,
  ArrowRight,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

type Category = {
  id: string;
  name: string;
  slug: string;
};

const CATEGORY_LIMIT = 8;

const palette = [
  "from-blue-50 via-white to-cyan-50 border-blue-100 text-blue-700",
  "from-emerald-50 via-white to-lime-50 border-emerald-100 text-emerald-700",
  "from-amber-50 via-white to-orange-50 border-amber-100 text-amber-700",
  "from-rose-50 via-white to-pink-50 border-rose-100 text-rose-700",
];

const TopCategoriesSection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "categories"));

        const data = snapshot.docs
          .map((doc) => {
            const raw = doc.data() as Partial<Category>;
            const name = (raw.name || "").trim();

            if (!name) {
              return null;
            }

            return {
              id: doc.id,
              name,
              slug: raw.slug?.trim() || slugify(name),
            };
          })
          .filter((category): category is Category => Boolean(category))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, CATEGORY_LIMIT);

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-blue-600">
              Top Categories
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900">
              Start with the service category you need most.
            </h2>
            <p className="mt-3 text-slate-600 leading-8">
              Browse the main categories available on AfixZ and jump straight to the
              services listed inside each one.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Explore all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 animate-pulse"
                >
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="mt-6 h-5 w-2/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-full rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
                </div>
              ))
            : categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className={`group rounded-[1.75rem] border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${palette[index % palette.length]}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    {getCategoryIcon(category.name)}
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-base leading-8 text-slate-600">
                    Explore services available under {category.name.toLowerCase()} and
                    compare the options that fit your needs.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    View services
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
        </div>

        {!loading && categories.length === 0 ? (
          <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-600">
            Categories will appear here once they are added from the admin dashboard.
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default TopCategoriesSection;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("clean")) {
    return <BrushCleaning className="h-5 w-5 text-blue-600" />;
  }

  if (normalized.includes("beauty") || normalized.includes("salon")) {
    return <Sparkles className="h-5 w-5 text-rose-600" />;
  }

  if (normalized.includes("plant") || normalized.includes("garden")) {
    return <Flower2 className="h-5 w-5 text-emerald-600" />;
  }

  if (normalized.includes("paint")) {
    return <Paintbrush2 className="h-5 w-5 text-amber-600" />;
  }

  if (normalized.includes("electric")) {
    return <Zap className="h-5 w-5 text-amber-600" />;
  }

  if (normalized.includes("repair")) {
    return <Hammer className="h-5 w-5 text-slate-700" />;
  }

  return <Wrench className="h-5 w-5 text-blue-600" />;
}
