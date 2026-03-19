import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { db } from "../firebase";
import useSeo from "../hooks/useSeo";
import {
  BlogEntry,
  formatBlogDate,
  isBlogPublished,
  normalizeBlog,
} from "../lib/blogs";

const BlogDetail: React.FC = () => {
  const { blogId } = useParams();

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

  const fallbackTitle = loading
    ? "Loading Blog | AfixZ Blog"
    : error
    ? "Blog Unavailable | AfixZ Blog"
    : "AfixZ Blog";
  const seoPageTitle = blog
    ? /afixz/i.test(blog.seoTitle)
      ? blog.seoTitle
      : `${blog.seoTitle} | AfixZ Blog`
    : fallbackTitle;
  const seoDescription =
    blog?.seoDescription || blog?.excerpt || "Read the latest updates from the AfixZ blog.";
  const seoCanonicalUrl = blog
    ? blog.canonicalUrl || `${window.location.origin}/blogs/${blog.slug || blog.id}`
    : `${window.location.origin}${blogId ? `/blogs/${blogId}` : "/blogs"}`;

  useSeo({
    title: seoPageTitle,
    description: seoDescription,
    canonicalUrl: seoCanonicalUrl,
    image: blog?.ogImage || blog?.coverImage,
    type: "article",
    keywords: blog?.tags || ["afixz blog", "home services"],
    publishedTime: blog?.publishedAt?.toISOString(),
    author: blog?.author,
  });

  if (!blogId) {
    return <Navigate to="/blogs" replace />;
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50 pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-8 h-16 animate-pulse rounded-3xl bg-slate-200" />
          <div className="mt-6 h-[420px] animate-pulse rounded-[32px] bg-slate-200" />
          <div className="mt-8 space-y-4">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-50 pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to blogs
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        </div>
      </section>
    );
  }

  if (!blog) {
    return <Navigate to="/blogs" replace />;
  }

  const paragraphs = blog.content
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to blogs
        </Link>

        <article className="mt-8 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-blue-100">
                <span className="rounded-full bg-white/12 px-3 py-1">
                  {blog.category}
                </span>
                {blog.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/12 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
                {blog.title}
              </h1>
            </div>
          </div>

          <div className="border-b border-slate-100 px-6 py-5 sm:px-10">
            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="font-medium text-slate-800">{blog.author}</span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={16} />
                {formatBlogDate(blog.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 size={16} />
                {blog.readTime}
              </span>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <p className="text-lg leading-8 text-slate-600">{blog.excerpt}</p>

            <div className="mt-8">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p
                    key={`${blog.id}-${index}`}
                    className="mb-6 mt-0 text-base leading-8 text-slate-700"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-base leading-8 text-slate-700">
                  Full article content will appear here once it is added from the
                  admin workflow.
                </p>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default BlogDetail;
