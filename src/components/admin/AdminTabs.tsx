export type AdminTab = "services" | "categories" | "blogs" | "homepage";

interface Props {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const AdminTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
      <button
        onClick={() => setActiveTab("services")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
          activeTab === "services"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Services
      </button>

      <button
        onClick={() => setActiveTab("categories")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
          activeTab === "categories"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Categories
      </button>

      <button
        onClick={() => setActiveTab("blogs")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
          activeTab === "blogs"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Blogs
      </button>

      <button
        onClick={() => setActiveTab("homepage")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
          activeTab === "homepage"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Homepage
      </button>
    </div>
  );
};

export default AdminTabs;
