import { ReactNode, useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { Grid, Layers, Newspaper, Sparkles } from "lucide-react";
import { db } from "../../firebase";

export default function DashboardStats() {
  const [services, setServices] = useState(0);
  const [categories, setCategories] = useState(0);
  const [blogs, setBlogs] = useState(0);
  const [latestService, setLatestService] = useState("No services yet");
  const [latestBlog, setLatestBlog] = useState("No blogs yet");

  useEffect(() => {
    async function load() {
      const [servicesCount, categoriesCount, blogsCount, latestServiceSnapshot, latestBlogSnapshot] =
        await Promise.all([
          getCountFromServer(collection(db, "services")),
          getCountFromServer(collection(db, "categories")),
          getCountFromServer(collection(db, "blogs")),
          getDocs(query(collection(db, "services"), orderBy("createdAt", "desc"), limit(1))),
          getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc"), limit(1))),
        ]);

      setServices(servicesCount.data().count);
      setCategories(categoriesCount.data().count);
      setBlogs(blogsCount.data().count);

      if (!latestServiceSnapshot.empty) {
        setLatestService(String(latestServiceSnapshot.docs[0].data().title || "Untitled"));
      }

      if (!latestBlogSnapshot.empty) {
        setLatestBlog(String(latestBlogSnapshot.docs[0].data().title || "Untitled"));
      }
    }

    load();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        title="Total Blogs"
        value={blogs}
        icon={<Newspaper size={18} />}
        color="amber"
      />

      <StatCard
        title="Latest Service"
        value={latestService}
        icon={<Sparkles size={18} />}
        color="violet"
      />

      <StatCard
        title="Latest Blog"
        value={latestBlog}
        icon={<Newspaper size={18} />}
        color="slate"
      />
    </div>
  );
}

interface CardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "emerald" | "amber" | "violet" | "slate";
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
    amber: {
      bg: "bg-amber-50/80",
      icon: "text-amber-600",
      value: "text-amber-700",
      border: "border-amber-100",
    },
    violet: {
      bg: "bg-violet-50/80",
      icon: "text-violet-600",
      value: "text-violet-700",
      border: "border-violet-100",
    },
    slate: {
      bg: "bg-slate-50",
      icon: "text-slate-600",
      value: "text-slate-700",
      border: "border-slate-200",
    },
  };

  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 transition-shadow hover:shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
        <span className={c.icon}>{icon}</span>
      </div>

      <div className={`mt-3 break-words text-2xl font-bold ${c.value}`}>
        {value}
      </div>
    </div>
  );
}
