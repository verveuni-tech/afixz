import AdminHeader from "../../components/admin/AdminHeader";
import DashboardStats from "../../components/admin/DashboardStats";
import RecentBlogsTable from "../../components/admin/RecentBlogsTable";
import ServicesTable from "../../components/admin/ServicesTable";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of services, categories, and blog activity.
          </p>
        </div>

        {/* Stats Section */}
        <section className="mb-8">
          <DashboardStats />
        </section>

        {/* Quick Action */}
        <section className="mb-8">
          <Link
            to="/admin/services"
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Content Manager
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Create services, publish blogs, and manage homepage copy.
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
          </Link>
        </section>

        {/* Tables */}
        <section className="grid gap-6 xl:grid-cols-2">
          <ServicesTable />
          <RecentBlogsTable />
        </section>

      </div>
    </div>
  );
}
