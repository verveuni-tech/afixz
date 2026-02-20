import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Layers, Grid, Sparkles } from "lucide-react";

export default function DashboardStats() {
  const [services, setServices] = useState(0);
  const [categories, setCategories] = useState(0);
  const [latest, setLatest] = useState<string>("—");

  useEffect(() => {
    async function load() {
      const servicesCount = await getCountFromServer(
        collection(db, "services")
      );
      const categoriesCount = await getCountFromServer(
        collection(db, "categories")
      );

      const latestQuery = query(
        collection(db, "services"),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(latestQuery);

      setServices(servicesCount.data().count);
      setCategories(categoriesCount.data().count);

      if (!snapshot.empty) {
        setLatest(snapshot.docs[0].data().title);
      }
    }

    load();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Services"
        value={services}
        icon={<Layers size={18} />}
        color="blue"
      />

      <StatCard
        title="Total Categories"
        value={categories}
        icon={<Grid size={18} />}
        color="emerald"
      />

      <StatCard
        title="Latest Service"
        value={latest}
        icon={<Sparkles size={18} />}
        color="violet"
      />
    </div>
  );
}
import { ReactNode } from "react";

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "emerald" | "violet";
}

function StatCard({ title, value, icon, color }: CardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6">

      {/* Accent strip */}
      <div
        className={`absolute top-0 left-0 h-full w-1 rounded-l-2xl ${
          color === "blue"
            ? "bg-blue-500"
            : color === "emerald"
            ? "bg-emerald-500"
            : "bg-violet-500"
        }`}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-500">{title}</div>

        <div
          className={`w-8 h-8 flex items-center justify-center rounded-lg ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>

      <div className="text-2xl font-semibold text-slate-800 break-words">
        {value}
      </div>
    </div>
  );
}