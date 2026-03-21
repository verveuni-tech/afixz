import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Recent Services</h2>
          <p className="mt-1 text-xs text-slate-500">Showing latest 10</p>
        </div>

        <Link
          to="/admin/services?tab=services"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">No services found.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 font-medium">Title</th>
                  <th className="font-medium">Price</th>
                  <th className="font-medium">Duration</th>
                  <th className="font-medium">Slug</th>
                  <th className="font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className="py-4 font-medium text-slate-700">{service.title}</td>
                    <td className="font-semibold text-blue-600">Rs {service.price}</td>
                    <td>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        {service.duration}
                      </span>
                    </td>
                    <td>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {service.slug}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/admin/services?tab=services&editService=${service.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
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
            {services.map((service) => (
              <div
                key={service.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-800">{service.title}</p>
                    <p className="mt-1 text-sm font-semibold text-blue-600">
                      Rs {service.price}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    {service.duration}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {service.slug}
                  </span>

                  <Link
                    to={`/admin/services?tab=services&editService=${service.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
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
