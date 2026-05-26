import AdminHeader from "../components/AdminHeader";
import DashboardStats from "../components/DashboardStats";
import RecentBlogsTable from "../components/RecentBlogsTable";
import ServicesTable from "../components/ServicesTable";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of services, orders, users, and blog activity.
          </p>
        </div>

        <section className="mb-10">
          <DashboardStats />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <ServicesTable />
          <RecentBlogsTable />
        </section>

      </div>
    </div>
  );
}
