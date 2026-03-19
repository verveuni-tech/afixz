import AdminHeader from "../../components/admin/AdminHeader";
import DashboardStats from "../../components/admin/DashboardStats";
import RecentBlogsTable from "../../components/admin/RecentBlogsTable";
import ServicesTable from "../../components/admin/ServicesTable";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div> 
      <AdminHeader/>
    <div className="min-h-screen bg-[#f4f6f8]">
      
      {/* Page Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Page Title */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Monitor services, categories, and blog publishing activity.
          </p>
        </div>

        {/* Stats Section */}
        <section className="mb-12">
          <DashboardStats />
        </section>

        <section className="mb-12">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Blog Publishing
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create, edit, and publish SEO-ready blogs from the content manager.
                </p>
              </div>

              <Link
                to="/admin/services"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Open Content Manager
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-2">
          <ServicesTable />
          <RecentBlogsTable />
        </section>

      </div>
    </div>
    </div>
  );
}
