import React, { useEffect, useState } from "react";
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
import { CalendarDays, Clock3, ArrowRight } from "lucide-react";
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

const PAGE_SIZE = 9;
const BATCH_SIZE = 18;

const BlogsPage: React.FC = () => {
  const { selectedLocation } = useLocationContext();
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  useEffect(() => {
    setBlogs([]);
    setLastDoc(null);
    setHasMore(false);
    void loadBlogs(false);
  }, [selectedLocation]);

  async function loadBlogs(loadMore: boolean) {
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
          .map((entry) => normalizeBlog(entry.id, entry.data() as Record<string, any>))
          .filter((blog) => isBlogAvailableInLocation(blog, selectedLocation))
          .map((blog) => resolveBlogForLocation(blog, selectedLocation));

        collected.push(...batch.slice(0, PAGE_SIZE - collected.length));
        cursor = snapshot.docs[snapshot.docs.length - 1] || cursor;
        keepLoading = snapshot.docs.length === BATCH_SIZE;
      }

      setBlogs((prev) => (loadMore ? [...prev, ...collected] : collected));
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
  }

  const featuredBlog = blogs[0];
  const spotlightBlogs = blogs.slice(1, 3);
  const gridBlogs = blogs.slice(3);

  useSeo({
    title: "AfixZ Blog | Home Service Tips, Guides, and Updates",
    description:
      "Explore the latest AfixZ blogs for home service guides, maintenance tips, cleaning advice, repairs, and platform updates.",
    canonicalUrl: `${window.location.origin}/blogs`,
    type: "website",
    keywords: ["afixz blog", "home services", "cleaning tips", "repair guides"],
  });

  return (
    <section className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.14),_transparent_38%)]" />

          <div className="relative max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
              AfixZ Blog
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Helpful reads for smarter home services.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Published articles appear here automatically and can optionally be tailored by
              service location too.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="h-[420px] animate-pulse rounded-[32px] bg-slate-200" />
            <div className="space-y-6">
              <div className="h-48 animate-pulse rounded-[28px] bg-slate-200" />
              <div className="h-48 animate-pulse rounded-[28px] bg-slate-200" />
            </div>
          </div>
        ) : error ? (
          <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        ) : blogs.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No blogs published yet
            </h2>
            <p className="mt-3 text-slate-600">
              As soon as your admin panel adds blog entries to Firestore, they
              will show up here automatically.
            </p>
          </div>
        ) : (
          <>
            {featuredBlog && (
              <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <Link
                  to={getBlogPath(featuredBlog)}
                  className="group overflow-hidden rounded-[32px] bg-slate-900 text-white shadow-xl"
                >
                  <div className="relative h-full min-h-[420px]">
                    <img
                      src={featuredBlog.coverImage}
                      alt={featuredBlog.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/75 to-slate-900/20" />

                    <div className="relative flex h-full flex-col justify-end p-8 sm:p-10">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
                        <span className="rounded-full bg-white/12 px-3 py-1">
                          {featuredBlog.category}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={16} />
                          {formatBlogDate(featuredBlog.publishedAt)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3 size={16} />
                          {featuredBlog.readTime}
                        </span>
                      </div>

                      <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                        {featuredBlog.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                        {featuredBlog.excerpt}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-200">
                        Read article
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>

                {spotlightBlogs.length > 0 && (
                  <div className="space-y-6">
                    {spotlightBlogs.map((blog) => (
                      <Link
                        key={blog.id}
                        to={getBlogPath(blog)}
                        className="group flex h-full flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div>
                          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-700">
                            <span>{blog.category}</span>
                          </div>
                          <h3 className="mt-4 text-2xl font-semibold leading-tight text-slate-900 group-hover:text-blue-700">
                            {blog.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {blog.excerpt}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />
                            {formatBlogDate(blog.publishedAt)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock3 size={15} />
                            {blog.readTime}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(gridBlogs.length > 0 || hasMore) && (
              <div className="mt-14">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900">
                      Latest articles
                    </h2>
                    <p className="mt-2 text-slate-600">
                      Browse the rest of the published blog archive.
                    </p>
                  </div>
                  <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    Showing {blogs.length} article{blogs.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {gridBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      to={getBlogPath(blog)}
                      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-700">
                          <span>{blog.category}</span>
                          {blog.tags.slice(0, 1).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-blue-50 px-3 py-1 text-[11px] tracking-[0.12em]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="mt-4 text-2xl font-semibold leading-tight text-slate-900 group-hover:text-blue-700">
                          {blog.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {blog.excerpt}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5 text-sm text-slate-500">
                          <span>{blog.author}</span>
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="inline-flex items-center gap-2">
                              <CalendarDays size={15} />
                              {formatBlogDate(blog.publishedAt)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Clock3 size={15} />
                              {blog.readTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      type="button"
                      onClick={() => void loadBlogs(true)}
                      disabled={loadingMore}
                      className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                      {loadingMore ? "Loading more..." : "Load More Articles"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BlogsPage;
