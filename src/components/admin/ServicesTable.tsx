import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { db } from "../../firebase";

export default function ServicesTable() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(
        query(collection(db, "services"), orderBy("createdAt", "desc"), limit(10))
      );

      setServices(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...entry.data(),
        }))
      );
    }

    void load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Recent Services</h2>
          <p className="mt-0.5 text-xs text-slate-400">Latest 10</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/all-services"
            className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            View All
            <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/admin/services?tab=services"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={13} />
            New
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">No services found.</div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Duration</th>
                  <th className="px-3 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-700">{service.title}</td>
                    <td className="px-3 py-3.5 font-semibold text-slate-800">₹{service.price}</td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        {service.duration}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-mono text-xs text-slate-400">
                        {service.slug}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/services?tab=services&editService=${service.id}`}
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
            {services.map((service) => (
              <div key={service.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{service.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      ₹{service.price}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {service.duration}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">{service.slug}</span>
                  <Link
                    to={`/admin/services?tab=services&editService=${service.id}`}
                    className="text-xs font-medium text-blue-600"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
