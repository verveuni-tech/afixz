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
import { useToast } from "../ui/Toast";

export default function DashboardStats() {
  const [services, setServices] = useState(0);
  const [categories, setCategories] = useState(0);
  const [blogs, setBlogs] = useState(0);
  const [latestService, setLatestService] = useState("No services yet");
  const [latestBlog, setLatestBlog] = useState("No blogs yet");
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
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
      } catch {
        showToast("Failed to load dashboard stats.", "error");
      }
    }

    load();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
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
      accent: "bg-blue-500",
      icon: "bg-blue-50 text-blue-600",
    },
    emerald: {
      accent: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-600",
    },
    amber: {
      accent: "bg-amber-500",
      icon: "bg-amber-50 text-amber-700",
    },
    violet: {
      accent: "bg-violet-500",
      icon: "bg-violet-50 text-violet-600",
    },
    slate: {
      accent: "bg-slate-500",
      icon: "bg-slate-100 text-slate-700",
    },
  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${colorMap[color].accent}`}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">{title}</div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorMap[color].icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="break-words text-2xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}
