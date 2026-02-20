import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Plus, Trash2, CheckCircle } from "lucide-react";

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-");

const initialFormState = {
  title: "",
  price: "",
  duration: "",
  warranty: "",
  professionals: "Verified",
  overview: "",
  categoryId: "",
  images: ["", "", "", ""],
};

const ServiceFormCard = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState(initialFormState);
  const [included, setIncluded] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...form.images];
    updated[index] = value;
    setForm({ ...form, images: updated });
  };

  const addInclude = () => {
    if (!includeInput.trim()) return;
    setIncluded([...included, includeInput.trim()]);
    setIncludeInput("");
  };

  const removeInclude = (index: number) => {
    setIncluded(included.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.categoryId) {
      return;
    }

    try {
      setLoading(true);

      const selectedCategory = categories.find(
        (c) => c.id === form.categoryId
      );

      await addDoc(collection(db, "services"), {
        title: form.title.trim(),
        slug: slugify(form.title),
        price: Number(form.price),
        duration: form.duration,
        warranty: form.warranty,
        professionals: form.professionals,
        overview: form.overview,
        included,
        images: form.images.filter(Boolean),
        categoryId: form.categoryId,
        categorySlug: selectedCategory?.slug,
        rating: 0,
        reviewCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // ✅ Proper Reset
      setForm(initialFormState);
      setIncluded([]);
      setIncludeInput("");

      // ✅ Show success popup
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error("Error adding service:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-white shadow-lg border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-3 animate-slideIn z-50">
          <CheckCircle className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-slate-700">
            Service added successfully 🎉
          </span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-10">

        <h2 className="text-xl font-semibold text-slate-800">
          Add New Service
        </h2>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Input name="title" label="Service Title" value={form.title} onChange={handleChange} />
          <Input name="price" label="Starting Price" value={form.price} onChange={handleChange} />
          <Input name="duration" label="Duration" value={form.duration} onChange={handleChange} />
          <Input name="warranty" label="Warranty" value={form.warranty} onChange={handleChange} />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Category
          </label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Overview */}
        <div>
          <label className="block text-sm text-slate-600 mb-2">
            Service Overview
          </label>
          <textarea
            name="overview"
            rows={4}
            value={form.overview}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Images */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Service Images (Max 4)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {form.images.map((img, index) => (
              <input
                key={index}
                placeholder={`Image URL ${index + 1}`}
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-3"
              />
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            What’s Included
          </h3>

          <div className="flex gap-3 mb-4">
            <input
              value={includeInput}
              onChange={(e) => setIncludeInput(e.target.value)}
              placeholder="Add item"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3"
            />
            <button
              type="button"
              onClick={addInclude}
              className="bg-blue-600 text-white px-4 rounded-xl flex items-center gap-1"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {included.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl"
              >
                <span className="text-sm text-slate-700">{item}</span>
                <button
                  type="button"
                  onClick={() => removeInclude(index)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Service"}
        </button>
      </div>
    </>
  );
};

export default ServiceFormCard;

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}