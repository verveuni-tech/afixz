import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { db } from "../../firebase";

export default function RecentBlogsTable() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(
        query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(10))
      );

      setBlogs(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
      );
    }

    load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Recent Blogs</h2>
          <p className="mt-0.5 text-xs text-slate-400">Latest 10</p>
        </div>

        <Link
          to="/admin/services?tab=blogs"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
        >
          <Plus size={13} />
          New
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">No blogs found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Author</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-700">{blog.title}</td>
                    <td className="px-3 py-3.5 text-slate-500">{blog.author || "AfixZ Team"}</td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {blog.category || "Insights"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          blog.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/services?tab=blogs&editBlog=${blog.id}`}
                        className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {blogs.map((blog) => (
              <div key={blog.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{blog.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {blog.author || "AfixZ Team"}
                    </p>
                  </div>
                  <Link
                    to={`/admin/services?tab=blogs&editBlog=${blog.id}`}
                    className="shrink-0 text-xs font-medium text-blue-600"
                  >
                    Edit
                  </Link>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {blog.category || "Insights"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                      blog.status === "published"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      blog.status === "published" ? "bg-emerald-500" : "bg-amber-500"
                    }`} />
                    {blog.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
