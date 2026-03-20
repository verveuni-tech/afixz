import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "../ui/ImageUploader";
import { useToast } from "../ui/Toast";

/* ============================
   TYPES
============================ */

interface UploadedImage {
  url: string;
  publicId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ServiceFormState {
  title: string;
  price: string;
  duration: string;
  warranty: string;
  professionals: string;
  overview: string;
  categoryId: string;
  isRecommended: boolean;
  images: UploadedImage[];
}

/* ============================
   UTIL
============================ */

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-");

/* ============================
   INITIAL STATE
============================ */

const initialFormState: ServiceFormState = {
  title: "",
  price: "",
  duration: "",
  warranty: "",
  professionals: "Verified",
  overview: "",
  categoryId: "",
  isRecommended: false,
  images: [],
};

/* ============================
   COMPONENT
============================ */

const ServiceFormCard = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState<ServiceFormState>(initialFormState);

  const [included, setIncluded] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");

  /* ============================
     FETCH CATEGORIES
  ============================ */

  const generateSearchKeywords = (title: string) => {
  const words = title.toLowerCase().split(" ");
  const keywords: string[] = [];

  words.forEach((word) => {
    let current = "";
    for (const char of word) {
      current += char;
      keywords.push(current);
    }
  });

  return keywords;
};

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      setCategories(data);
    };

    fetchCategories();
  }, []);

  /* ============================
     HANDLERS
  ============================ */

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const nextValue =
      "checked" in e.target && e.target.type === "checkbox"
        ? e.target.checked
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const addInclude = () => {
    if (!includeInput.trim()) return;

    setIncluded((prev) => [...prev, includeInput.trim()]);
    setIncludeInput("");
  };

  const removeInclude = (index: number) => {
    setIncluded((prev) => prev.filter((_, i) => i !== index));
  };

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.categoryId) {
      showToast("Title and category are required.", "error");
      return;
    }

    try {
      setLoading(true);

      const slug = slugify(form.title);

      // Check duplicate slug
      const existingQuery = query(
        collection(db, "services"),
        where("slug", "==", slug)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        showToast("A service with this title already exists.", "error");
        return;
      }

      const selectedCategory = categories.find(
        (c) => c.id === form.categoryId
      );

    await addDoc(collection(db, "services"), {
  title: form.title.trim(),
  slug,
  price: Number(form.price) || 0,
  duration: form.duration,
  warranty: form.warranty,
  professionals: form.professionals,
  overview: form.overview,
  included,

  // FIX: Save image URLs properly
  images: form.images.map((img) => img.url),

  categoryId: form.categoryId,
  categorySlug: selectedCategory?.slug || "",

  // PRODUCTION SEARCH FIELD
  searchKeywords: generateSearchKeywords(form.title),

  rating: 0,
  reviewCount: 0,
  isRecommended: form.isRecommended,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

      // Reset
      setForm(initialFormState);
      setIncluded([]);
      setIncludeInput("");

      showToast("Service added successfully.", "success");
    } catch (error) {
      showToast("Failed to add service. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     RENDER
  ============================ */

  return (
    <>
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

        <label className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <input
            type="checkbox"
            name="isRecommended"
            checked={form.isRecommended}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Feature in recommended services
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Recommended services appear in the home page showcase when available.
            </p>
          </div>
        </label>

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

        {/* Image Uploader */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            Service Images
          </h3>

          <ImageUploader
            value={form.images}
            onChange={(images) =>
              setForm((prev) => ({ ...prev, images }))
            }
            maxImages={4}
          />
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

/* ============================
   INPUT COMPONENT
============================ */

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

function Input({ label, ...props }: InputProps) {
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
