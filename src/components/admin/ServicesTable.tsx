import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function ServicesTable() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "services"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setServices(data);
    }

    load();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Recent Services
        </h2>
        <span className="text-xs text-slate-500">
          Showing latest 10
        </span>
      </div>

      {services.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          No services found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 font-medium">Title</th>
                <th className="font-medium">Price</th>
                <th className="font-medium">Duration</th>
                <th className="font-medium">Slug</th>
              </tr>
            </thead>

            <tbody>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-4 font-medium text-slate-700">
                    {service.title}
                  </td>

                  <td className="text-blue-600 font-semibold">
                    ₹{service.price}
                  </td>

                  <td>
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-600 font-medium">
                      {service.duration}
                    </span>
                  </td>

                  <td>
                    <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600">
                      {service.slug}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}