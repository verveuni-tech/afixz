import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Recent Blogs</h2>
          <p className="mt-1 text-xs text-slate-500">Showing latest 10</p>
        </div>

        <Link
          to="/admin/services?tab=blogs"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">No blogs found.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 font-medium">Title</th>
                  <th className="font-medium">Author</th>
                  <th className="font-medium">Category</th>
                  <th className="font-medium">Status</th>
                  <th className="text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="py-4 font-medium text-slate-700">{blog.title}</td>
                    <td>{blog.author || "AfixZ Team"}</td>
                    <td>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {blog.category || "Insights"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          blog.status === "published"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {blog.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/services?tab=blogs&editBlog=${blog.id}`}
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">{blog.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {blog.author || "AfixZ Team"}
                    </p>
                  </div>

                  <Link
                    to={`/admin/services?tab=blogs&editBlog=${blog.id}`}
                    className="text-sm font-medium text-blue-600"
                  >
                    Edit
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {blog.category || "Insights"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      blog.status === "published"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
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
