import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { CheckCircle, RefreshCcw, Plus, Trash2 } from "lucide-react";
import ImageUploader from "../../../components/ui/ImageUploader";
import { LocationId, LOCATION_OPTIONS } from "../../../lib/locations";
import type { ProductCategory } from "./ProductCategoryFormCard";

interface UploadedImage {
  url: string;
  publicId: string;
}

type LocationOverrideState = {
  name: string;
  shortDescription: string;
  description: string;
  price: string;
};

export interface EditableProduct {
  id: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  categorySlug?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  inStock?: boolean;
  featured?: boolean;
  bestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  availableLocations?: LocationId[];
  priceByLocation?: Record<string, number>;
  contentByLocation?: Record<string, Partial<LocationOverrideState>>;
  seo?: { title: string; description: string };
  aboutThisItem?: string[];
  specifications?: { label: string; value: string }[];
}

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  images: UploadedImage[];
  seoTitle: string;
  seoDescription: string;
  aboutThisItem: string[];
  specifications: { label: string; value: string }[];
  availableLocations: LocationId[];
  locationOverrides: Record<LocationId, LocationOverrideState>;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-");

const generateSearchKeywords = (values: string[]) => {
  const keywords = new Set<string>();
  values
    .map((v) => v.toLowerCase().trim())
    .filter(Boolean)
    .forEach((v) => {
      v.split(/\s+/)
        .filter(Boolean)
        .forEach((word) => {
          let current = "";
          for (const char of word) {
            current += char;
            keywords.add(current);
          }
          keywords.add(word);
        });
    });
  return Array.from(keywords);
};

const createLocationOverrides = (): Record<LocationId, LocationOverrideState> => ({
  delhi: { name: "", shortDescription: "", description: "", price: "" },
  noida: { name: "", shortDescription: "", description: "", price: "" },
  gurgaon: { name: "", shortDescription: "", description: "", price: "" },
});

const initialForm: FormState = {
  name: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  inStock: true,
  featured: false,
  bestseller: false,
  images: [],
  seoTitle: "",
  seoDescription: "",
  aboutThisItem: [""],
  specifications: [{ label: "", value: "" }],
  availableLocations: [],
  locationOverrides: createLocationOverrides(),
};

interface Props {
  productToEdit: EditableProduct | null;
  onSaved: () => void;
  onCancelEdit: () => void;
}

const ProductFormCard = ({ productToEdit, onSaved, onCancelEdit }: Props) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  // Load product categories
  useEffect(() => {
    async function load() {
      const snapshot = await getDocs(collection(db, "productCategories"));
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as ProductCategory))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(data);
    }
    void load();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (!productToEdit) {
      setForm(initialForm);
      return;
    }

    setForm({
      name: productToEdit.name || "",
      shortDescription: productToEdit.shortDescription || "",
      description: productToEdit.description || "",
      categoryId: productToEdit.categoryId || "",
      price: productToEdit.price != null ? String(productToEdit.price) : "",
      compareAtPrice:
        productToEdit.compareAtPrice != null ? String(productToEdit.compareAtPrice) : "",
      stock: productToEdit.stock != null ? String(productToEdit.stock) : "",
      inStock: productToEdit.inStock !== false,
      featured: productToEdit.featured === true,
      bestseller: productToEdit.bestseller === true,
      images: Array.isArray(productToEdit.images)
        ? productToEdit.images.map((url, i) => ({ url, publicId: `${productToEdit.id}-${i}` }))
        : [],
      seoTitle: productToEdit.seo?.title || "",
      seoDescription: productToEdit.seo?.description || "",
      aboutThisItem:
        Array.isArray(productToEdit.aboutThisItem) && productToEdit.aboutThisItem.length > 0
          ? productToEdit.aboutThisItem
          : [""],
      specifications:
        Array.isArray(productToEdit.specifications) && productToEdit.specifications.length > 0
          ? productToEdit.specifications
          : [{ label: "", value: "" }],
      availableLocations: Array.isArray(productToEdit.availableLocations)
        ? productToEdit.availableLocations
        : [],
      locationOverrides: {
        delhi: {
          name: productToEdit.contentByLocation?.delhi?.name || "",
          shortDescription: productToEdit.contentByLocation?.delhi?.shortDescription || "",
          description: productToEdit.contentByLocation?.delhi?.description || "",
          price:
            productToEdit.priceByLocation?.delhi != null
              ? String(productToEdit.priceByLocation.delhi)
              : "",
        },
        noida: {
          name: productToEdit.contentByLocation?.noida?.name || "",
          shortDescription: productToEdit.contentByLocation?.noida?.shortDescription || "",
          description: productToEdit.contentByLocation?.noida?.description || "",
          price:
            productToEdit.priceByLocation?.noida != null
              ? String(productToEdit.priceByLocation.noida)
              : "",
        },
        gurgaon: {
          name: productToEdit.contentByLocation?.gurgaon?.name || "",
          shortDescription: productToEdit.contentByLocation?.gurgaon?.shortDescription || "",
          description: productToEdit.contentByLocation?.gurgaon?.description || "",
          price:
            productToEdit.priceByLocation?.gurgaon != null
              ? String(productToEdit.priceByLocation.gurgaon)
              : "",
        },
      },
    });
  }, [productToEdit]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleLocationToggle = (loc: LocationId) => {
    setForm((p) => ({
      ...p,
      availableLocations: p.availableLocations.includes(loc)
        ? p.availableLocations.filter((l) => l !== loc)
        : [...p.availableLocations, loc],
    }));
  };

  const handleLocOverride =
    (loc: LocationId, field: keyof LocationOverrideState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((p) => ({
        ...p,
        locationOverrides: {
          ...p.locationOverrides,
          [loc]: { ...p.locationOverrides[loc], [field]: e.target.value },
        },
      }));
    };

  const resetForm = () => {
    setForm(initialForm);
    onCancelEdit();
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.categoryId) {
      alert("Name and category are required.");
      return;
    }

    try {
      setLoading(true);

      const slug = productToEdit?.slug || slugify(form.name);

      // Dup check
      const existingQ = query(collection(db, "products"), where("slug", "==", slug));
      const existingSnap = await getDocs(existingQ);
      const hasDup = existingSnap.docs.some((d) => d.id !== productToEdit?.id);
      if (hasDup) {
        alert("A product with this name already exists.");
        return;
      }

      const selectedCat = categories.find((c) => c.id === form.categoryId);

      const contentByLocation = Object.fromEntries(
        LOCATION_OPTIONS.map(({ id }) => {
          const o = form.locationOverrides[id];
          return [
            id,
            Object.fromEntries(
              Object.entries({
                name: o.name.trim(),
                shortDescription: o.shortDescription.trim(),
                description: o.description.trim(),
              }).filter(([, v]) => Boolean(v))
            ),
          ];
        }).filter(([, v]) => Object.keys(v as object).length > 0)
      );

      const priceByLocation = Object.fromEntries(
        LOCATION_OPTIONS.map(({ id }) => {
          const price = Number(form.locationOverrides[id].price);
          return [id, Number.isFinite(price) && price > 0 ? price : null];
        }).filter(([, v]) => v != null)
      );

      const payload = {
        name: form.name.trim(),
        slug,
        categoryId: form.categoryId,
        categorySlug: selectedCat?.slug || productToEdit?.categorySlug || "",
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        images: form.images.map((img) => img.url),
        price: Number(form.price) || 0,
        compareAtPrice: Number(form.compareAtPrice) || 0,
        stock: Number(form.stock) || 0,
        inStock: form.inStock,
        featured: form.featured,
        bestseller: form.bestseller,
        rating: productToEdit?.rating || 0,
        reviewCount: productToEdit?.reviewCount || 0,
        searchKeywords: generateSearchKeywords([
          form.name,
          form.shortDescription,
          selectedCat?.name || "",
          ...Object.values(form.locationOverrides).map((o) => o.name),
        ]),
        availableLocations: form.availableLocations,
        priceByLocation,
        contentByLocation,
        seo: {
          title: form.seoTitle.trim() || form.name.trim(),
          description: form.seoDescription.trim() || form.shortDescription.trim(),
        },
        aboutThisItem: form.aboutThisItem.map((s) => s.trim()).filter(Boolean),
        specifications: form.specifications
          .filter((s) => s.label.trim() && s.value.trim())
          .map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
        updatedAt: Timestamp.now(),
      };

      if (productToEdit) {
        await updateDoc(doc(db, "products", productToEdit.id), payload);
      } else {
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      setForm(initialForm);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onSaved();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product. Please try again.");
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
            {productToEdit ? "Product updated" : "Product added"}
          </span>
        </div>
      )}

      <div className="space-y-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {productToEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Products for the AfixZ Store. Pricing and content can be overridden per location.
            </p>
          </div>

          {productToEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={15} />
              New Product
            </button>
          )}
        </div>

        {/* Basic fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput name="name" label="Product Name" value={form.name} onChange={handleChange} />
          <FormInput name="price" label="Price (INR)" value={form.price} onChange={handleChange} />
          <FormInput
            name="compareAtPrice"
            label="Compare-at Price (strikethrough)"
            value={form.compareAtPrice}
            onChange={handleChange}
          />
          <FormInput name="stock" label="Stock Quantity" value={form.stock} onChange={handleChange} />
          <FormInput
            name="shortDescription"
            label="Short Description"
            value={form.shortDescription}
            onChange={handleChange}
          />

          <div>
            <label className="mb-2 block text-sm text-slate-600">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm text-slate-600">Full Description</label>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          <Toggle id="inStock" name="inStock" label="In Stock" checked={form.inStock} onChange={handleChange} />
          <Toggle id="featured" name="featured" label="Featured" checked={form.featured} onChange={handleChange} />
          <Toggle id="bestseller" name="bestseller" label="Bestseller" checked={form.bestseller} onChange={handleChange} />
        </div>

        {/* Available Locations */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-slate-700">Available Locations</h3>
          <div className="flex flex-wrap gap-3">
            {LOCATION_OPTIONS.map((loc) => {
              const active = form.availableLocations.includes(loc.id);
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleLocationToggle(loc.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Images */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-slate-700">Product Images</h3>
          <ImageUploader
            value={form.images}
            onChange={(images) => setForm((p) => ({ ...p, images }))}
            maxImages={6}
          />
        </div>

        {/* SEO */}
        <div>
          <h3 className="mb-4 text-sm font-medium text-slate-700">SEO</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput name="seoTitle" label="SEO Title" value={form.seoTitle} onChange={handleChange} />
            <FormInput
              name="seoDescription"
              label="SEO Description"
              value={form.seoDescription}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* About This Item */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">About This Item</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Bullet points describing key product features
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, aboutThisItem: [...p.aboutThisItem, ""] }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Plus size={13} />
              Add Point
            </button>
          </div>
          <div className="space-y-2">
            {form.aboutThisItem.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {idx + 1}
                </span>
                <input
                  value={item}
                  onChange={(e) => {
                    const updated = [...form.aboutThisItem];
                    updated[idx] = e.target.value;
                    setForm((p) => ({ ...p, aboutThisItem: updated }));
                  }}
                  placeholder="e.g. Name of the plant: Philodendron Oxycardium Golden"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.aboutThisItem.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.aboutThisItem.filter((_, i) => i !== idx);
                      setForm((p) => ({ ...p, aboutThisItem: updated }));
                    }}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">Specifications</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Key-value pairs like Brand, Color, Weight, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  specifications: [...p.specifications, { label: "", value: "" }],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Plus size={13} />
              Add Spec
            </button>
          </div>
          <div className="space-y-2">
            {form.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  value={spec.label}
                  onChange={(e) => {
                    const updated = [...form.specifications];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    setForm((p) => ({ ...p, specifications: updated }));
                  }}
                  placeholder="Label (e.g. Brand)"
                  className="w-2/5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={spec.value}
                  onChange={(e) => {
                    const updated = [...form.specifications];
                    updated[idx] = { ...updated[idx], value: e.target.value };
                    setForm((p) => ({ ...p, specifications: updated }));
                  }}
                  placeholder="Value (e.g. UGAOO)"
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.specifications.filter((_, i) => i !== idx);
                      setForm((p) => ({ ...p, specifications: updated }));
                    }}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location Overrides */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-slate-800">Location Overrides</h3>
          {LOCATION_OPTIONS.map((loc) => (
            <div key={loc.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-base font-semibold text-slate-800">{loc.label}</h4>
              <p className="mt-1 text-sm text-slate-500">{loc.subtitle}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Name Override"
                  name={`${loc.id}-name`}
                  value={form.locationOverrides[loc.id].name}
                  onChange={handleLocOverride(loc.id, "name")}
                />
                <FormInput
                  label="Price Override"
                  name={`${loc.id}-price`}
                  value={form.locationOverrides[loc.id].price}
                  onChange={handleLocOverride(loc.id, "price")}
                />
                <FormInput
                  label="Short Description Override"
                  name={`${loc.id}-shortDesc`}
                  value={form.locationOverrides[loc.id].shortDescription}
                  onChange={handleLocOverride(loc.id, "shortDescription")}
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-600">Description Override</label>
                  <textarea
                    rows={3}
                    value={form.locationOverrides[loc.id].description}
                    onChange={handleLocOverride(loc.id, "description")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            {loading ? "Saving..." : productToEdit ? "Update Product" : "Add Product"}
          </button>

          {productToEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full rounded-xl border border-slate-200 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductFormCard;

/* ---- Helpers ---- */

function FormInput({
  label,
  ...props
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-600">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Toggle({
  id,
  name,
  label,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
    </div>
  );
}
