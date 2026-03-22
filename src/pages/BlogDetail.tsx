import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { ArrowLeft, CalendarDays, Clock3, Loader2 } from "lucide-react";
import { db } from "../firebase";
import useSeo from "../hooks/useSeo";
import {
  BlogEntry,
  formatBlogDate,
  isBlogAvailableInLocation,
  isBlogPublished,
  normalizeBlog,
  resolveBlogForLocation,
} from "../lib/blogs";
import { useLocationContext } from "../context/LocationContext";

const BlogDetail: React.FC = () => {
  const { blogId } = useParams();
  const { selectedLocation } = useLocationContext();

  const [blog, setBlog] = useState<BlogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setLoading(false);
        return;
      }

      try {
        let matchedBlog: BlogEntry | null = null;

        const slugSnapshot = await getDocs(
          query(collection(db, "blogs"), where("slug", "==", blogId), limit(1))
        );

        if (!slugSnapshot.empty) {
          const entry = slugSnapshot.docs[0];
          const raw = entry.data() as Record<string, any>;

          if (isBlogPublished(raw)) {
            matchedBlog = normalizeBlog(entry.id, raw);
          }
        }

        if (!matchedBlog) {
          const docSnapshot = await getDoc(doc(db, "blogs", blogId));

          if (docSnapshot.exists()) {
            const raw = docSnapshot.data() as Record<string, any>;

            if (isBlogPublished(raw)) {
              matchedBlog = normalizeBlog(docSnapshot.id, raw);
            }
          }
        }

        setBlog(matchedBlog);
        setError("");
      } catch (fetchError) {
        console.error(fetchError);
        setError("We couldn't load this article right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    void fetchBlog();
  }, [blogId]);

  const resolvedBlog = useMemo(() => {
    if (!blog) {
      return null;
    }

    return resolveBlogForLocation(blog, selectedLocation);
  }, [blog, selectedLocation]);

  const unavailableForLocation = resolvedBlog
    ? !isBlogAvailableInLocation(resolvedBlog, selectedLocation)
    : false;

  const fallbackTitle = loading
    ? "Loading Blog | AfixZ Blog"
    : error
    ? "Blog Unavailable | AfixZ Blog"
    : "AfixZ Blog";
  const seoPageTitle = resolvedBlog
    ? /afixz/i.test(resolvedBlog.seoTitle)
      ? resolvedBlog.seoTitle
      : `${resolvedBlog.seoTitle} | AfixZ Blog`
    : fallbackTitle;
  const seoDescription =
    resolvedBlog?.seoDescription || resolvedBlog?.excerpt || "Read the latest updates from the AfixZ blog.";
  const seoCanonicalUrl = resolvedBlog
    ? resolvedBlog.canonicalUrl || `${window.location.origin}/blogs/${resolvedBlog.slug || resolvedBlog.id}`
    : `${window.location.origin}${blogId ? `/blogs/${blogId}` : "/blogs"}`;

  useSeo({
    title: seoPageTitle,
    description: seoDescription,
    canonicalUrl: seoCanonicalUrl,
    image: resolvedBlog?.ogImage || resolvedBlog?.coverImage,
    type: "article",
    keywords: resolvedBlog?.tags || ["afixz blog", "home services"],
    publishedTime: resolvedBlog?.publishedAt?.toISOString(),
    author: resolvedBlog?.author,
  });

  if (!blogId) {
    return <Navigate to="/blogs" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            Loading article...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pb-20 pt-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft size={14} />
            All articles
          </Link>

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!resolvedBlog) {
    return <Navigate to="/blogs" replace />;
  }

  const paragraphs = resolvedBlog.content
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          to="/blogs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
        >
          <ArrowLeft size={14} />
          All articles
        </Link>

        {/* Location warning */}
        {unavailableForLocation && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>This article is not available for your currently selected location.</span>
          </div>
        )}

        <article className="mt-8">
          {/* Header */}
          <header>
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                {resolvedBlog.category}
              </span>
              {resolvedBlog.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {resolvedBlog.title}
            </h1>

            {/* Author & date bar */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span className="font-medium text-slate-700">{resolvedBlog.author}</span>
              <span className="h-4 w-px bg-slate-200" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatBlogDate(resolvedBlog.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} />
                {resolvedBlog.readTime}
              </span>
            </div>
          </header>

          {/* Cover Image */}
          <div className="mt-8 overflow-hidden rounded-xl bg-slate-100">
            {resolvedBlog.coverImage ? (
              <img
                src={resolvedBlog.coverImage}
                alt={resolvedBlog.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <span className="text-4xl font-bold tracking-tight text-slate-200">afixz</span>
              </div>
            )}
          </div>

          {/* Excerpt / Lede */}
          <div className="mt-8 border-l-2 border-accent/30 pl-5">
            <p className="font-display text-lg leading-8 text-slate-600 italic">{resolvedBlog.excerpt}</p>
          </div>

          {/* Body */}
          <div className="mt-8 border-t border-slate-100 pt-8">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p
                  key={`${resolvedBlog.id}-${index}`}
                  className="mb-6 text-[15px] leading-8 text-slate-700"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-[15px] leading-8 text-slate-500 italic">
                Full article content will appear here once it is added from the admin panel.
              </p>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                Written by{" "}
                <span className="font-medium text-slate-600">{resolvedBlog.author}</span>
              </div>

              <Link
                to="/blogs"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
              >
                <ArrowLeft size={14} />
                Back to all articles
              </Link>
            </div>

            {/* Tags */}
            {resolvedBlog.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {resolvedBlog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </footer>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;
