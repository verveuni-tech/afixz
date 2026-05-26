export type AdminTab = "services" | "categories" | "blogs" | "homepage";

interface Props {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const tabs: { key: AdminTab; label: string }[] = [
  { key: "services", label: "Services" },
  { key: "categories", label: "Categories" },
  { key: "blogs", label: "Blogs" },
  { key: "homepage", label: "Homepage" },
];

const AdminTabs = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === key
              ? "text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {label}
          {activeTab === key && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-slate-900" />
          )}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;
