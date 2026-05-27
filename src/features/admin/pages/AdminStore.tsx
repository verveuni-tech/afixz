import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import ProductFormCard, { EditableProduct } from "../components/ProductFormCard";
import ProductCategoryFormCard from "../components/ProductCategoryFormCard";
import { db } from "../../../lib/firebase";
import { Info } from "lucide-react";

type StoreTab = "products" | "categories";

const tabs: { key: StoreTab; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "categories", label: "Categories" },
];

const AdminStore = () => {
  const [activeTab, setActiveTab] = useState<StoreTab>("products");
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const requestedTab = searchParams.get("tab") as StoreTab | null;
    const editProductId = searchParams.get("editProduct");

    if (requestedTab && tabs.some((t) => t.key === requestedTab)) {
      setActiveTab(requestedTab);
    }

    if (!editProductId) {
      setEditingProduct(null);
    }

    async function loadProduct() {
      if (!editProductId) return;

      const snapshot = await getDoc(doc(db, "products", editProductId));
      if (!snapshot.exists()) {
        setEditingProduct(null);
        return;
      }

      setActiveTab("products");
      setEditingProduct({ id: snapshot.id, ...(snapshot.data() as EditableProduct) });
    }

    void loadProduct();
  }, [searchParams]);

  const handleTabChange = (tab: StoreTab) => {
    setActiveTab(tab);
    if (tab !== "products") setEditingProduct(null);
    setSearchParams({ tab });
  };

  const clearProductEditing = () => {
    setEditingProduct(null);
    setSearchParams({ tab: "products" });
  };

  return (
    <div className="min-h-screen">

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">Store</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage products and product categories for the AfixZ Store.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
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

        <div className="mt-6 space-y-6">
          {activeTab === "products" ? (
            <ProductFormCard
              productToEdit={editingProduct}
              onSaved={clearProductEditing}
              onCancelEdit={clearProductEditing}
            />
          ) : (
            <ProductCategoryFormCard />
          )}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
            <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
            <div className="space-y-1 text-xs leading-5 text-slate-500">
              <p>Products use the same location system as services — override pricing and content per city.</p>
              <p>Product categories are separate from service categories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStore;
