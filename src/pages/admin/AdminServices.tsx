import { useState } from "react";
import AdminTabs from "../../components/admin/AdminTabs";
import ServiceFormCard from "../../components/admin/ServiceFormCard";
import CategoryFormCard from "../../components/admin/CategoryFormCard";
import ServicesListCard from "../../components/admin/ServicesListCard";
import AdminHeader from "../../components/admin/AdminHeader";

const AdminServices = () => {
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services");

  return (
    <div> 
    <AdminHeader/>
    <div className="min-h-screen bg-slate-100 py-10 px-6">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">
            Manage Platform
          </h1>
        </div>

        {/* Tabs */}
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Workspace */}
        <div className="grid grid-cols-12 gap-8">

          <div className="col-span-4">
            {activeTab === "services" ? (
              <ServiceFormCard />
            ) : (
              <CategoryFormCard />
            )}
          </div>

          <div className="col-span-8">
            <ServicesListCard activeTab={activeTab} />
          </div>

        </div>

      </div>

    </div>
    </div>
  );
};

export default AdminServices;