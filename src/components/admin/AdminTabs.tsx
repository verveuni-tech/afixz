interface Props {
  activeTab: "services" | "categories";
  setActiveTab: (tab: "services" | "categories") => void;
}

const AdminTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="bg-white p-2 rounded-2xl shadow-sm inline-flex space-x-2">

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

    </div>
  );
};

export default AdminTabs;