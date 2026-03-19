import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import AdminTabs, { AdminTab } from "../../components/admin/AdminTabs";
import ServiceFormCard from "../../components/admin/ServiceFormCard";
import CategoryFormCard from "../../components/admin/CategoryFormCard";
import AdminHeader from "../../components/admin/AdminHeader";
import BlogFormCard, {
  EditableBlog,
} from "../../components/admin/BlogFormCard";
import { db } from "../../firebase";

const validTabs: AdminTab[] = ["services", "categories", "blogs"];

const AdminServices = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("services");
  const [editingBlog, setEditingBlog] = useState<EditableBlog | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const requestedTab = searchParams.get("tab") as AdminTab | null;
    const editBlogId = searchParams.get("editBlog");

    if (requestedTab && validTabs.includes(requestedTab)) {
      setActiveTab(requestedTab);
    }

    if (!editBlogId) {
      setEditingBlog(null);
      return;
    }

    async function loadBlog() {
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

    loadBlog();
  }, [searchParams]);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);

    if (tab !== "blogs") {
      setEditingBlog(null);
    }

    setSearchParams({ tab });
  };

  const clearBlogEditing = () => {
    setEditingBlog(null);
    setSearchParams({ tab: "blogs" });
  };

  return (
    <div> 
    <AdminHeader/>
    <div className="min-h-screen bg-slate-100 py-8 px-4 md:px-6">

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="text-3xl font-semibold">
            Manage Content
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Create services, categories, and SEO-ready blog articles from one
            streamlined workspace. Recent content stays on the dashboard so this
            screen can stay focused on publishing.
          </p>
        </div>

        {/* Tabs */}
        <AdminTabs activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Workspace */}
        <div className="space-y-6">
          {activeTab === "services" ? (
            <ServiceFormCard />
          ) : activeTab === "categories" ? (
            <CategoryFormCard />
          ) : (
            <BlogFormCard
              blogToEdit={editingBlog}
              onSaved={clearBlogEditing}
              onCancelEdit={clearBlogEditing}
            />
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              Publishing Notes
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <p>Use the dashboard for recent services and blog visibility.</p>
              <p>Draft blogs stay private until you switch the status to published.</p>
              <p>For the best SEO, keep the slug short and the description clear.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
    </div>
  );
};

export default AdminServices;
