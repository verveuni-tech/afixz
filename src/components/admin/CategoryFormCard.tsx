import { useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "../ui/Toast";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const CategoryFormCard = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const slug = slugify(name);

      const q = query(
        collection(db, "categories"),
        where("slug", "==", slug)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        showToast("A category with this name already exists.", "error");
        return;
      }

      await addDoc(collection(db, "categories"), {
        name: name.trim(),
        slug,
        createdAt: Timestamp.now(),
      });

      setName("");
      showToast("Category added successfully.", "success");
    } catch {
      showToast("Failed to add category. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">
        Add New Category
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Cleaning"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {name && (
          <p className="text-sm text-slate-500">
            Slug: <span className="font-medium">{slugify(name)}</span>
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Category"}
        </button>
      </div>
    </div>
  );
};

export default CategoryFormCard;