import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { db } from "../../../lib/firebase";

interface Product {
  id: string;
  name: string;
  stock: number;
  inStock: boolean;
}

const LOW_STOCK_THRESHOLD = 5;

export default function LowStockProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      // Firestore doesn't support <= on one field + orderBy on another easily,
      // so fetch all products and filter client-side for low stock
      const snapshot = await getDocs(
        query(collection(db, "products"), orderBy("stock", "asc"))
      );

      const lowStock: Product[] = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        const stock = data.stock ?? 0;
        if (stock <= LOW_STOCK_THRESHOLD) {
          lowStock.push({
            id: d.id,
            name: data.name || "Untitled",
            stock,
            inStock: data.inStock !== false,
          });
        }
      }

      setProducts(lowStock.slice(0, 10));
    }

    void load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <AlertTriangle size={15} className="text-amber-500" />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Low Stock Alert</h2>
          <p className="mt-0.5 text-xs text-slate-400">Products with {LOW_STOCK_THRESHOLD} or fewer units</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          All products well-stocked.
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                    p.stock <= 0
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {p.stock}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{p.name}</p>
                  <p className={`text-xs ${p.inStock ? "text-amber-500" : "text-red-500"}`}>
                    {p.stock <= 0 ? "Out of stock" : "Low stock"}
                  </p>
                </div>
              </div>
              <Link
                to={`/admin/store?tab=products&editProduct=${p.id}`}
                className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
              >
                Restock
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
