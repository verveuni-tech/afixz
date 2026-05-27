import StoreDashboardStats from "../components/StoreDashboardStats";
import RecentProductsTable from "../components/RecentProductsTable";
import LowStockProductsTable from "../components/LowStockProductsTable";

export default function StoreDashboard() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Store Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of products, categories, and inventory.
          </p>
        </div>

        <section className="mb-10">
          <StoreDashboardStats />
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <RecentProductsTable />
          <LowStockProductsTable />
        </section>
      </div>
    </div>
  );
}
