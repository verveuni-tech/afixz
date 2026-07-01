import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, AlertCircle } from "lucide-react";
import { db } from "../../../lib/firebase";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  inStock: boolean;
  featured: boolean;
}

export default function RecentProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(
        query(collection(db, "products"), orderBy("createdAt", "desc"), limit(10))
      );

      setProducts(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name || "Untitled",
            slug: data.slug || "",
            price: data.price || 0,
            stock: data.stock ?? 0,
            inStock: data.inStock !== false,
            featured: data.featured === true,
          };
        })
      );
    }

    void load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Recent Products</h2>
          <p className="mt-0.5 text-xs text-slate-400">Latest 10</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/store/products"
            className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            View All
            <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/admin/store?tab=products"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            <Plus size={13} />
            New
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">No products yet.</div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{p.name}</span>
                        {p.featured && (
                          <span className="rounded bg-violet-50 px-1.5 py-px text-[10px] font-semibold text-violet-600">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-semibold text-slate-800">₹{p.price}</td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                          p.stock <= 0
                            ? "bg-red-50 text-red-600"
                            : p.stock <= 5
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {p.stock <= 0 && <AlertCircle size={11} />}
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          p.inStock
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/admin/store?tab=products&editProduct=${p.id}`}
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

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-700">{p.name}</p>
                      {p.featured && (
                        <span className="rounded bg-violet-50 px-1.5 py-px text-[10px] font-semibold text-violet-600">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-800">₹{p.price}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                      p.inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {p.inStock ? "In Stock" : "Out"}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                  <Link
                    to={`/admin/store?tab=products&editProduct=${p.id}`}
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
