import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { CheckCircle, Pencil, Trash2 } from "lucide-react";
import ImageUploader from "../../../components/ui/ImageUploader";

interface UploadedImage {
  url: string;
  publicId: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  banner: string;
  productCount: number;
  featured: boolean;
  sortOrder: number;
  createdAt: any;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const emptyForm = {
  name: "",
  description: "",
  image: [] as UploadedImage[],
  banner: [] as UploadedImage[],
  featured: false,
  sortOrder: "",
};

const ProductCategoryFormCard = () => {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadCategories = async () => {
    const snapshot = await getDocs(collection(db, "productCategories"));
    const data = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ProductCategory))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    setCategories(data);
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image ? [{ url: cat.image, publicId: "existing" }] : [],
      banner: cat.banner ? [{ url: cat.banner, publicId: "existing" }] : [],
      featured: cat.featured || false,
      sortOrder: cat.sortOrder != null ? String(cat.sortOrder) : "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product category?")) return;
    await deleteDoc(doc(db, "productCategories", id));
    await loadCategories();
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    setLoading(true);

    try {
      const slug = slugify(form.name);

      // Dup check
      if (!editingId) {
        const q = query(
          collection(db, "productCategories"),
          where("slug", "==", slug)
        );
        const existing = await getDocs(q);
        if (!existing.empty) {
          alert("Product category with this slug already exists.");
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        image: form.image[0]?.url || "",
        banner: form.banner[0]?.url || "",
        productCount: 0,
        featured: form.featured,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingId) {
        await updateDoc(doc(db, "productCategories", editingId), payload);
      } else {
        await addDoc(collection(db, "productCategories"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      resetForm();
      await loadCategories();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving product category:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-6 py-4 shadow-lg">
          <CheckCircle className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-slate-700">
            {editingId ? "Category updated" : "Category added"}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingId ? "Edit Product Category" : "Add Product Category"}
          </h2>

          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600">Category Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Plants"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.name && (
                  <p className="mt-1 text-xs text-slate-400">
                    Slug: <span className="font-medium">{slugify(form.name)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-600">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                  placeholder="1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-600">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional category description"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-600">Category Image</label>
                <ImageUploader
                  value={form.image}
                  onChange={(images) => setForm((p) => ({ ...p, image: images }))}
                  maxImages={1}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-600">Banner Image</label>
                <ImageUploader
                  value={form.banner}
                  onChange={(images) => setForm((p) => ({ ...p, banner: images }))}
                  maxImages={1}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <input
                id="productCatFeatured"
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="productCatFeatured" className="text-sm font-medium text-slate-700">
                Featured category (shown on store homepage)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                {loading ? "Saving..." : editingId ? "Update Category" : "Add Category"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing categories list */}
        {categories.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">
              Existing Product Categories ({categories.length})
            </h3>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                >
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-400">
                      {cat.slug} &middot; order: {cat.sortOrder || 0}
                      {cat.featured && (
                        <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          Featured
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => handleEdit(cat)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCategoryFormCard;
