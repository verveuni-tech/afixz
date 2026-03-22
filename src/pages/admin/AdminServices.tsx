import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import AdminTabs, { AdminTab } from "../../components/admin/AdminTabs";
import ServiceFormCard, {
  EditableService,
} from "../../components/admin/ServiceFormCard";
import CategoryFormCard from "../../components/admin/CategoryFormCard";
import AdminHeader from "../../components/admin/AdminHeader";
import BlogFormCard, {
  EditableBlog,
} from "../../components/admin/BlogFormCard";
import HomepageContentFormCard from "../../components/admin/HomepageContentFormCard";
import { db } from "../../firebase";
import { Info } from "lucide-react";

const validTabs: AdminTab[] = ["services", "categories", "blogs", "homepage"];

const AdminServices = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("services");
  const [editingBlog, setEditingBlog] = useState<EditableBlog | null>(null);
  const [editingService, setEditingService] = useState<EditableService | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const requestedTab = searchParams.get("tab") as AdminTab | null;
    const editBlogId = searchParams.get("editBlog");
    const editServiceId = searchParams.get("editService");

    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }

    if (!editBlogId) {
      setEditingBlog(null);
    }

    if (!editServiceId) {
      setEditingService(null);
    }

    async function loadBlog() {
      if (!editBlogId) {
        return;
      }

      const snapshot = await getDoc(doc(db, "blogs", editBlogId));

      if (!snapshot.exists()) {
        setEditingBlog(null);
        return;
      }

      setActiveTab("blogs");
      setEditingBlog({
        id: snapshot.id,
        ...(snapshot.data() as EditableBlog),
      });
    }

    async function loadService() {
      if (!editServiceId) {
        return;
      }

      const snapshot = await getDoc(doc(db, "services", editServiceId));

      if (!snapshot.exists()) {
        setEditingService(null);
        return;
      }

      setActiveTab("services");
      setEditingService({
        id: snapshot.id,
        ...(snapshot.data() as EditableService),
      });
    }

    void loadBlog();
    void loadService();
  }, [searchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);

    if (tab !== "blogs") {
      setEditingBlog(null);
    }

    if (tab !== "services") {
      setEditingService(null);
    }

    setSearchParams({ tab });
  };

  const clearBlogEditing = () => {
    setEditingBlog(null);
    setSearchParams({ tab: "blogs" });
  };

  const clearServiceEditing = () => {
    setEditingService(null);
    setSearchParams({ tab: "services" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Manage Content
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Services, categories, homepage copy, and blog articles.
          </p>
        </div>

        <AdminTabs activeTab={activeTab} setActiveTab={handleTabChange} />

        <div className="mt-6 space-y-6">
          {activeTab === "services" ? (
            <ServiceFormCard
              serviceToEdit={editingService}
              onSaved={clearServiceEditing}
              onCancelEdit={clearServiceEditing}
            />
          ) : activeTab === "categories" ? (
            <CategoryFormCard />
          ) : activeTab === "blogs" ? (
            <BlogFormCard
              blogToEdit={editingBlog}
              onSaved={clearBlogEditing}
              onCancelEdit={clearBlogEditing}
            />
          ) : (
            <HomepageContentFormCard />
          )}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <div className="space-y-1 text-xs leading-5 text-slate-500">
              <p>Draft blogs stay private until you switch the status to published.</p>
              <p>Homepage content falls back to code defaults if Firestore data is incomplete.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
