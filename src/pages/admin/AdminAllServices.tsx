import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  getCountFromServer,
  orderBy,
  query,
  limit,
  startAfter,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { Search, X, ChevronRight, ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import AdminHeader from "../../components/admin/AdminHeader";
import { db } from "../../firebase";

const PAGE_SIZE = 25;

interface Service {
  id: string;
  title: string;
  slug: string;
  price: number;
  duration: string;
  categoryId?: string;
  categoryName?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function AdminAllServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const catMapRef = useRef<Map<string, string>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      const categoriesSnap = await getDocs(collection(db, "categories"));
      const cats: Category[] = [];
      const map = new Map<string, string>();

      for (const d of categoriesSnap.docs) {
        const data = d.data();
        map.set(d.id, data.name || "Unnamed");
        // Get count per category
        const countSnap = await getCountFromServer(
          query(collection(db, "services"), where("categoryId", "==", d.id))
        );
        cats.push({
          id: d.id,
          name: data.name || "Unnamed",
          slug: data.slug || "",
          count: countSnap.data().count,
        });
      }

      catMapRef.current = map;
      setCategories(cats.sort((a, b) => a.name.localeCompare(b.name)));

      // Total services count
      const totalSnap = await getCountFromServer(collection(db, "services"));
      setTotalCount(totalSnap.data().count);
    }

    loadCategories();
  }, []);

  // Load services (paginated, filtered by category)
  const loadServices = useCallback(
    async (reset: boolean) => {
      if (reset) {
        setLoading(true);
        setServices([]);
        lastDocRef.current = null;
      } else {
        setLoadingMore(true);
      }

      try {
        const constraints = [
          collection(db, "services"),
          ...(selectedCategory !== "all"
            ? [where("categoryId", "==", selectedCategory)]
            : []),
          orderBy("createdAt", "desc"),
          ...(lastDocRef.current && !reset ? [startAfter(lastDocRef.current)] : []),
          limit(PAGE_SIZE),
        ] as Parameters<typeof query>;

        const snap = await getDocs(query(...constraints));

        const newServices: Service[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "Untitled",
            slug: data.slug || "",
            price: data.price || 0,
            duration: data.duration || "",
            categoryId: data.categoryId || "",
            categoryName: catMapRef.current.get(data.categoryId) || "Uncategorized",
          };
        });

        if (snap.docs.length > 0) {
          lastDocRef.current = snap.docs[snap.docs.length - 1];
        }

        setHasMore(snap.docs.length === PAGE_SIZE);
        setServices((prev) => (reset ? newServices : [...prev, ...newServices]));
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedCategory]
  );

  // Reload when category filter changes
  useEffect(() => {
    loadServices(true);
  }, [loadServices]);

  // Client-side search on loaded data
  const displayedServices = useMemo(() => {
    if (!debouncedSearch) return services;

    const q = debouncedSearch.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [services, debouncedSearch]);

  // Group by category (only when "all" is selected and no search)
  const groupedByCategory = useMemo(() => {
    if (selectedCategory !== "all" || debouncedSearch) return null;

    const groups = new Map<string, { name: string; services: Service[] }>();

    for (const service of displayedServices) {
      const catId = service.categoryId || "uncategorized";
      const catName = service.categoryName || "Uncategorized";

      if (!groups.has(catId)) {
        groups.set(catId, { name: catName, services: [] });
      }
      groups.get(catId)!.services.push(service);
    }

    return Array.from(groups.entries()).map(([id, data]) => ({
      categoryId: id,
      categoryName: data.name,
      services: data.services,
    }));
  }, [displayedServices, selectedCategory, debouncedSearch]);

  const selectedCategoryName =
    selectedCategory === "all"
      ? "All Categories"
      : categories.find((c) => c.id === selectedCategory)?.name || "Unknown";

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
              All Services
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalCount} service{totalCount !== 1 ? "s" : ""} across{" "}
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </p>
          </div>

          <Link
            to="/admin/services?tab=services"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + New Service
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search loaded services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCategoryDropdownOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              <ChevronsUpDown size={14} className="text-slate-400" />
              {selectedCategoryName}
              {selectedCategory !== "all" && (
                <span className="rounded bg-slate-900 px-1.5 py-px text-[10px] font-semibold text-white">
                  {categories.find((c) => c.id === selectedCategory)?.count || 0}
                </span>
              )}
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform ${
                  categoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 z-30 mt-1.5 max-h-72 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setCategoryDropdownOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    selectedCategory === "all"
                      ? "bg-slate-50 font-semibold text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="rounded bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-500">
                    {totalCount}
                  </span>
                </button>

                <div className="mx-3 my-1 border-t border-slate-100" />

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-slate-50 font-semibold text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-3">{cat.name}</span>
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-500">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active filter indicator */}
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="inline-flex items-center gap-1 text-xs text-slate-500 transition hover:text-slate-700"
            >
              <X size={12} />
              Clear filter
            </button>
          )}
        </div>

        {/* Loaded indicator */}
        {!loading && services.length > 0 && (
          <p className="mt-3 text-xs text-slate-400">
            Showing {displayedServices.length} of{" "}
            {selectedCategory === "all"
              ? `${totalCount} total`
              : `${categories.find((c) => c.id === selectedCategory)?.count || "?"} in category`}
            {debouncedSearch ? ` (filtered by "${debouncedSearch}")` : ""}
          </p>
        )}

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Loading services...
            </div>
          ) : displayedServices.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
              <p className="text-sm text-slate-500">No services found.</p>
              {(debouncedSearch || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : groupedByCategory ? (
            /* Grouped by category — default "all" view */
            <div className="space-y-5">
              {groupedByCategory.map((group) => (
                <div
                  key={group.categoryId}
                  className="rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {group.categoryName}
                      </h3>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {group.services.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(group.categoryId)}
                      className="text-xs text-slate-400 transition hover:text-slate-600"
                    >
                      Filter this category
                    </button>
                  </div>
                  <ServiceTable services={group.services} />
                </div>
              ))}
            </div>
          ) : (
            /* Flat list when filtering */
            <div className="rounded-xl border border-slate-200 bg-white">
              <ServiceTable services={displayedServices} />
            </div>
          )}

          {/* Load More */}
          {hasMore && !debouncedSearch && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadServices(false)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load more services`
                )}
              </button>
            </div>
          )}

          {!hasMore && services.length > 0 && !debouncedSearch && (
            <p className="mt-6 text-center text-xs text-slate-400">
              All services loaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function ServiceTable({ services }: { services: Service[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-5 py-2.5 font-medium">Title</th>
              <th className="px-3 py-2.5 font-medium">Price</th>
              <th className="px-3 py-2.5 font-medium">Duration</th>
              <th className="px-3 py-2.5 font-medium">Slug</th>
              <th className="px-5 py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {services.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-700">{s.title}</td>
                <td className="px-3 py-3 font-semibold text-slate-800">₹{s.price}</td>
                <td className="px-3 py-3">
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {s.duration}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="font-mono text-xs text-slate-400">{s.slug}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/admin/services?tab=services&editService=${s.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    Edit <ChevronRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-slate-100 md:hidden">
        {services.map((s) => (
          <div key={s.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{s.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">₹{s.price}</p>
              </div>
              <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {s.duration}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-400">{s.slug}</span>
              <Link
                to={`/admin/services?tab=services&editService=${s.id}`}
                className="text-xs font-medium text-blue-600"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
