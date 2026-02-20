import AdminHeader from "../../components/admin/AdminHeader";
import DashboardStats from "../../components/admin/DashboardStats";
import ServicesTable from "../../components/admin/ServicesTable";

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
            Monitor services and platform activity.
          </p>
        </div>

        {/* Stats Section */}
        <section className="mb-12">
          <DashboardStats />
        </section>

        {/* Table Section */}
        <section>
          <ServicesTable />
        </section>

      </div>
    </div>
    </div>
  );
}