import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  activeTab: "services" | "categories";
}

const ServicesListCard = ({ activeTab }: Props) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const collectionName =
      activeTab === "services" ? "services" : "categories";

    const q = query(
      collection(db, collectionName),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    const collectionName =
      activeTab === "services" ? "services" : "categories";

    await deleteDoc(doc(db, collectionName, id));
  };

  const filtered = items.filter((item) =>
    (item.title || item.name)
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="font-semibold text-lg text-slate-800">
          {activeTab === "services"
            ? "All Services"
            : "All Categories"}
        </h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
        />
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">
            No {activeTab} found.
          </div>
        )}

        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-6 hover:bg-slate-50 transition"
          >
            {/* Left Side */}
            <div className="flex items-center gap-4">

              {/* Thumbnail (services only) */}
              {activeTab === "services" && (
                <img
                  src={item.images?.[0] || "/placeholder.jpg"}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
              )}

              <div>
                <p className="font-medium text-slate-800">
                  {item.title || item.name}
                </p>

                {activeTab === "services" && (
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                      {item.categorySlug}
                    </span>

                    {item.duration && (
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md">
                        {item.duration}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-6">

              {activeTab === "services" && (
                <span className="text-blue-600 font-semibold">
                  ₹{item.price}
                </span>
              )}

              <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition">
                <Pencil size={14} />
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition"
              >
                <Trash2 size={14} />
                Delete
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesListCard;