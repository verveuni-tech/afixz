import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { ArrowRight, CalendarDays, Clock3, Loader2, Search } from "lucide-react";
import { db } from "../firebase";
import useSeo from "../hooks/useSeo";
import {
  BlogEntry,
  formatBlogDate,
  getBlogPath,
  isBlogAvailableInLocation,
  normalizeBlog,
  resolveBlogForLocation,
} from "../lib/blogs";
import { useLocationContext } from "../context/LocationContext";

const PAGE_SIZE = 12;
const BATCH_SIZE = 24;
const ALL_CATEGORY = "All";

const BlogsPage: React.FC = () => {
  const { selectedLocation } = useLocationContext();
  const [allBlogs, setAllBlogs] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBlogs = useCallback(
    async (loadMore: boolean) => {
      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const collected: BlogEntry[] = [];
        let cursor = loadMore ? lastDoc : null;
        let keepLoading = true;

        while (keepLoading && collected.length < PAGE_SIZE) {
          const baseQuery = cursor
            ? query(
                collection(db, "blogs"),
                where("published", "==", true),
                orderBy("publishedAt", "desc"),
                startAfter(cursor),
                limit(BATCH_SIZE)
              )
            : query(
                collection(db, "blogs"),
                where("published", "==", true),
                orderBy("publishedAt", "desc"),
                limit(BATCH_SIZE)
              );

          const snapshot = await getDocs(baseQuery);
          const batch = snapshot.docs
            .map((entry) =>
              normalizeBlog(entry.id, entry.data() as Record<string, any>)
            )
            .filter((blog) => isBlogAvailableInLocation(blog, selectedLocation))
            .map((blog) => resolveBlogForLocation(blog, selectedLocation));

          collected.push(...batch.slice(0, PAGE_SIZE - collected.length));
          cursor = snapshot.docs[snapshot.docs.length - 1] || cursor;
          keepLoading = snapshot.docs.length === BATCH_SIZE;
        }

        setAllBlogs((prev) => (loadMore ? [...prev, ...collected] : collected));
        setLastDoc(cursor);
        setHasMore(keepLoading);
        setError("");
      } catch (fetchError) {
        console.error(fetchError);
        setError("We couldn't load blogs right now. Please try again shortly.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [lastDoc, selectedLocation]
  );

  useEffect(() => {
    setAllBlogs([]);
    setLastDoc(null);
    setHasMore(false);
    setActiveCategory(ALL_CATEGORY);
    setSearchQuery("");
    void loadBlogs(false);
  }, [selectedLocation]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allBlogs.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return [ALL_CATEGORY, ...Array.from(cats).sort()];
  }, [allBlogs]);

  // Client-side filter by category + search
  const filteredBlogs = useMemo(() => {
    let result = allBlogs;

    if (activeCategory !== ALL_CATEGORY) {
      result = result.filter((b) => b.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allBlogs, activeCategory, searchQuery]);

  useSeo({
    title: "AfixZ Blog | Home Service Tips, Guides, and Updates",
    description:
      "Explore the latest AfixZ blogs for home service guides, maintenance tips, cleaning advice, repairs, and platform updates.",
    canonicalUrl: `${window.location.origin}/blogs`,
    type: "website",
    keywords: ["afixz blog", "home services", "cleaning tips", "repair guides"],
  });

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Blog
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Helpful reads for smarter home services
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Tips, guides, and updates from the AfixZ team.
          </p>
        </div>

        {/* Toolbar: Search + Category Tabs */}
        <div className="sticky top-[64px] z-10 -mx-4 border-b border-slate-100 bg-white/95 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Tabs */}
            <div className="scrollbar-hide flex gap-1 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    activeCategory === cat
                      ? "bg-primary text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-100">
                <div className="aspect-[16/10] animate-pulse bg-slate-100" />
                <div className="space-y-2.5 p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Search size={22} className="text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              {allBlogs.length === 0
                ? "No articles yet"
                : "No articles match your filters"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {allBlogs.length === 0
                ? "Blog posts published from the admin panel will appear here."
                : "Try a different category or search term."}
            </p>
            {(activeCategory !== ALL_CATEGORY || searchQuery) && (
              <button
                onClick={() => {
                  setActiveCategory(ALL_CATEGORY);
                  setSearchQuery("");
                }}
                className="mt-4 text-sm font-medium text-accent transition hover:text-accent-hover"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mt-6 text-xs text-slate-400">
              {filteredBlogs.length} article
              {filteredBlogs.length === 1 ? "" : "s"}
              {activeCategory !== ALL_CATEGORY && (
                <span>
                  {" "}
                  in <span className="font-medium text-slate-500">{activeCategory}</span>
                </span>
              )}
            </div>

            {/* Blog Grid */}
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && activeCategory === ALL_CATEGORY && !searchQuery && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadBlogs(true)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load more articles
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;

/* ---- Blog Card ---- */

const BlogCard: React.FC<{ blog: BlogEntry }> = ({ blog }) => {
  return (
    <Link
      to={getBlogPath(blog)}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
    >
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <span className="text-2xl font-bold tracking-tight text-slate-200">
              afixz
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {blog.category}
          </span>
          {blog.tags.length > 0 && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-[11px] text-slate-400">{blog.tags[0]}</span>
            </>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition group-hover:text-slate-600">
          {blog.title}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
          {blog.excerpt}
        </p>

        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          <span className="font-medium text-slate-500">{blog.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <CalendarDays size={10} />
            {formatBlogDate(blog.publishedAt)}
          </span>
          <span>·</span>
          <span>{blog.readTime}</span>
        </div>
      </div>
    </Link>
  );
};
