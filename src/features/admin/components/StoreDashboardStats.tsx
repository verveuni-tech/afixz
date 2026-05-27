import { ReactNode, useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { Package, Tags, AlertTriangle, Star } from "lucide-react";
import { db } from "../../../lib/firebase";

export default function StoreDashboardStats() {
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [featured, setFeatured] = useState(0);

  useEffect(() => {
    async function load() {
      const [productsCount, categoriesCount, outOfStockCount, featuredCount] =
        await Promise.all([
          getCountFromServer(collection(db, "products")),
          getCountFromServer(collection(db, "productCategories")),
          getCountFromServer(
            query(collection(db, "products"), where("inStock", "==", false))
          ),
          getCountFromServer(
            query(collection(db, "products"), where("featured", "==", true))
          ),
        ]);

      setProducts(productsCount.data().count);
      setCategories(categoriesCount.data().count);
      setOutOfStock(outOfStockCount.data().count);
      setFeatured(featuredCount.data().count);
    }

    load();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Products"
        value={products}
        icon={<Package size={18} />}
        color="blue"
      />
      <StatCard
        title="Categories"
        value={categories}
        icon={<Tags size={18} />}
        color="emerald"
      />
      <StatCard
        title="Out of Stock"
        value={outOfStock}
        icon={<AlertTriangle size={18} />}
        color="orange"
      />
      <StatCard
        title="Featured"
        value={featured}
        icon={<Star size={18} />}
        color="violet"
      />
    </div>
  );
}

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "emerald" | "orange" | "violet";
}

function StatCard({ title, value, icon, color }: CardProps) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50/80",
      icon: "text-blue-600",
      value: "text-blue-700",
      border: "border-blue-100",
    },
    emerald: {
      bg: "bg-emerald-50/80",
      icon: "text-emerald-600",
      value: "text-emerald-700",
      border: "border-emerald-100",
    },
    orange: {
      bg: "bg-orange-50/80",
      icon: "text-orange-600",
      value: "text-orange-700",
      border: "border-orange-100",
    },
    violet: {
      bg: "bg-violet-50/80",
      icon: "text-violet-600",
      value: "text-violet-700",
      border: "border-violet-100",
    },
  };

  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 transition-shadow hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
        <span className={c.icon}>{icon}</span>
      </div>
      <div className={`mt-3 text-2xl font-bold ${c.value}`}>{value}</div>
    </div>
  );
}
