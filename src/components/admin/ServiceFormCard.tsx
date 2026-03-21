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
import { db } from "../../firebase";
import { Plus, Trash2, CheckCircle, RefreshCcw } from "lucide-react";
import ImageUploader from "../ui/ImageUploader";
import { LocationId, LOCATION_OPTIONS } from "../../lib/locations";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

type LocationOverrideState = {
  title: string;
  shortDescription: string;
  overview: string;
  price: string;
};

export interface EditableService {
  id: string;
  title?: string;
  slug?: string;
  price?: number;
  duration?: string;
  warranty?: string;
  professionals?: string | number;
  overview?: string;
  shortDescription?: string;
  categoryId?: string;
  categorySlug?: string;
  images?: string[];
  included?: string[];
  rating?: number;
  reviewCount?: number;
  isRecommended?: boolean;
  availableLocations?: LocationId[];
  contentByLocation?: Record<string, Partial<LocationOverrideState>>;
  priceByLocation?: Record<string, number>;
}

interface ServiceFormState {
  title: string;
  price: string;
  duration: string;
  warranty: string;
  professionals: string;
  overview: string;
  shortDescription: string;
  categoryId: string;
  images: UploadedImage[];
  isRecommended: boolean;
  availableLocations: LocationId[];
  locationOverrides: Record<LocationId, LocationOverrideState>;
}

interface Props {
  serviceToEdit: EditableService | null;
  onSaved: () => void;
  onCancelEdit: () => void;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-");

const createLocationOverrides = (): Record<LocationId, LocationOverrideState> => ({
  delhi: { title: "", shortDescription: "", overview: "", price: "" },
  noida: { title: "", shortDescription: "", overview: "", price: "" },
  gurgaon: { title: "", shortDescription: "", overview: "", price: "" },
});

const initialFormState: ServiceFormState = {
  title: "",
  price: "",
  duration: "",
  warranty: "",
  professionals: "Verified",
  overview: "",
  shortDescription: "",
  categoryId: "",
  images: [],
  isRecommended: false,
  availableLocations: [],
  locationOverrides: createLocationOverrides(),
};

const ServiceFormCard = ({ serviceToEdit, onSaved, onCancelEdit }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState<ServiceFormState>(initialFormState);
  const [included, setIncluded] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");

  const generateSearchKeywords = (values: string[]) => {
    const keywords = new Set<string>();

    values
      .map((value) => value.toLowerCase().trim())
      .filter(Boolean)
      .forEach((value) => {
        value
          .split(/\s+/)
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

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((entry) => ({
        id: entry.id,
        ...entry.data(),
      })) as Category[];

      setCategories(data);
    };

    void fetchCategories();
  }, []);

  useEffect(() => {
    if (!serviceToEdit) {
      setForm(initialFormState);
      setIncluded([]);
      setIncludeInput("");
      return;
    }

    setForm({
      title: serviceToEdit.title || "",
      price: serviceToEdit.price != null ? String(serviceToEdit.price) : "",
      duration: serviceToEdit.duration || "",
      warranty: serviceToEdit.warranty || "",
      professionals: String(serviceToEdit.professionals || "Verified"),
      overview: serviceToEdit.overview || "",
      shortDescription: serviceToEdit.shortDescription || "",
      categoryId: serviceToEdit.categoryId || "",
      images: Array.isArray(serviceToEdit.images)
        ? serviceToEdit.images.map((url, index) => ({
            url,
            publicId: `${serviceToEdit.id}-${index}`,
          }))
        : [],
      isRecommended: serviceToEdit.isRecommended === true,
      availableLocations: Array.isArray(serviceToEdit.availableLocations)
        ? serviceToEdit.availableLocations
        : [],
      locationOverrides: {
        delhi: {
          title: serviceToEdit.contentByLocation?.delhi?.title || "",
          shortDescription: serviceToEdit.contentByLocation?.delhi?.shortDescription || "",
          overview: serviceToEdit.contentByLocation?.delhi?.overview || "",
          price:
            serviceToEdit.priceByLocation?.delhi != null
              ? String(serviceToEdit.priceByLocation.delhi)
              : "",
        },
        noida: {
          title: serviceToEdit.contentByLocation?.noida?.title || "",
          shortDescription: serviceToEdit.contentByLocation?.noida?.shortDescription || "",
          overview: serviceToEdit.contentByLocation?.noida?.overview || "",
          price:
            serviceToEdit.priceByLocation?.noida != null
              ? String(serviceToEdit.priceByLocation.noida)
              : "",
        },
        gurgaon: {
          title: serviceToEdit.contentByLocation?.gurgaon?.title || "",
          shortDescription: serviceToEdit.contentByLocation?.gurgaon?.shortDescription || "",
          overview: serviceToEdit.contentByLocation?.gurgaon?.overview || "",
          price:
            serviceToEdit.priceByLocation?.gurgaon != null
              ? String(serviceToEdit.priceByLocation.gurgaon)
              : "",
        },
      },
    });
    setIncluded(Array.isArray(serviceToEdit.included) ? serviceToEdit.included : []);
    setIncludeInput("");
  }, [serviceToEdit]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationToggle = (location: LocationId) => {
    setForm((prev) => ({
      ...prev,
      availableLocations: prev.availableLocations.includes(location)
        ? prev.availableLocations.filter((entry) => entry !== location)
        : [...prev.availableLocations, location],
    }));
  };

  const handleLocationOverrideChange =
    (location: LocationId, field: keyof LocationOverrideState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;

      setForm((prev) => ({
        ...prev,
        locationOverrides: {
          ...prev.locationOverrides,
          [location]: {
            ...prev.locationOverrides[location],
            [field]: value,
          },
        },
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

  const resetForm = () => {
    setForm(initialFormState);
    setIncluded([]);
    setIncludeInput("");
    onCancelEdit();
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.categoryId) {
      alert("Title and category are required");
      return;
    }

    try {
      setLoading(true);

      const slug = serviceToEdit?.slug || slugify(form.title);

      const existingQuery = query(
        collection(db, "services"),
        where("slug", "==", slug)
      );

      const existingSnapshot = await getDocs(existingQuery);
      const hasDuplicate = existingSnapshot.docs.some((entry) => entry.id !== serviceToEdit?.id);

      if (hasDuplicate) {
        alert("A service with this title already exists.");
        return;
      }

      const selectedCategory = categories.find(
        (c) => c.id === form.categoryId
      );

      const contentByLocation = Object.fromEntries(
        LOCATION_OPTIONS.map(({ id }) => {
          const override = form.locationOverrides[id];
          return [
            id,
            Object.fromEntries(
              Object.entries({
                title: override.title.trim(),
                shortDescription: override.shortDescription.trim(),
                overview: override.overview.trim(),
              }).filter(([, value]) => Boolean(value))
            ),
          ];
        }).filter(([, value]) => Object.keys(value).length > 0)
      );

      const priceByLocation = Object.fromEntries(
        LOCATION_OPTIONS.map(({ id }) => {
          const price = Number(form.locationOverrides[id].price);
          return [id, Number.isFinite(price) && price > 0 ? price : null];
        }).filter(([, value]) => value != null)
      );

      const payload = {
        title: form.title.trim(),
        slug,
        price: Number(form.price) || 0,
        duration: form.duration,
        warranty: form.warranty,
        professionals: form.professionals,
        overview: form.overview,
        shortDescription: form.shortDescription.trim(),
        included,
        images: form.images.map((img) => img.url),
        categoryId: form.categoryId,
        categorySlug: selectedCategory?.slug || serviceToEdit?.categorySlug || "",
        searchKeywords: generateSearchKeywords([
          form.title,
          form.shortDescription,
          selectedCategory?.name || "",
          ...Object.values(form.locationOverrides).map((override) => override.title),
        ]),
        rating: serviceToEdit?.rating || 0,
        reviewCount: serviceToEdit?.reviewCount || 0,
        isRecommended: form.isRecommended,
        availableLocations: form.availableLocations,
        contentByLocation,
        priceByLocation,
        updatedAt: Timestamp.now(),
      };

      if (serviceToEdit) {
        await updateDoc(doc(db, "services", serviceToEdit.id), payload);
      } else {
        await addDoc(collection(db, "services"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      setForm(initialFormState);
      setIncluded([]);
      setIncludeInput("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onSaved();
    } catch (error) {
      console.error("Error adding service:", error);
      alert("We couldn't save the service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-white shadow-lg border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-3 z-50">
          <CheckCircle className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-slate-700">
            {serviceToEdit ? "Service updated successfully" : "Service added successfully"}
          </span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {serviceToEdit ? "Edit Service" : "Add New Service"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create services once, then tailor availability, messaging, and pricing by location.
            </p>
          </div>

          {serviceToEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={15} />
              New Service
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Input name="title" label="Service Title" value={form.title} onChange={handleChange} />
          <Input name="price" label="Starting Price" value={form.price} onChange={handleChange} />
          <Input name="duration" label="Duration" value={form.duration} onChange={handleChange} />
          <Input name="warranty" label="Warranty" value={form.warranty} onChange={handleChange} />
          <Input
            name="shortDescription"
            label="Short Description"
            value={form.shortDescription}
            onChange={handleChange}
          />
          <Input name="professionals" label="Professionals Label" value={form.professionals} onChange={handleChange} />
        </div>

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

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <input
            id="isRecommended"
            name="isRecommended"
            type="checkbox"
            checked={form.isRecommended}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isRecommended" className="text-sm font-medium text-slate-700">
            Feature this service in the recommended section
          </label>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">Available Locations</h3>
          <div className="flex flex-wrap gap-3">
            {LOCATION_OPTIONS.map((location) => {
              const active = form.availableLocations.includes(location.id);

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleLocationToggle(location.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {location.label}
                </button>
              );
            })}
          </div>
        </div>

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

        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-4">
            What's Included
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

        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-slate-800">Location Overrides</h3>
          {LOCATION_OPTIONS.map((location) => (
            <div key={location.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-base font-semibold text-slate-800">{location.label}</h4>
              <p className="mt-1 text-sm text-slate-500">{location.subtitle}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input
                  label="Title Override"
                  name={`${location.id}-title`}
                  value={form.locationOverrides[location.id].title}
                  onChange={handleLocationOverrideChange(location.id, "title")}
                />
                <Input
                  label="Price Override"
                  name={`${location.id}-price`}
                  value={form.locationOverrides[location.id].price}
                  onChange={handleLocationOverrideChange(location.id, "price")}
                />
                <Input
                  label="Short Description Override"
                  name={`${location.id}-short-description`}
                  value={form.locationOverrides[location.id].shortDescription}
                  onChange={handleLocationOverrideChange(location.id, "shortDescription")}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-600 mb-2">Overview Override</label>
                  <textarea
                    rows={3}
                    value={form.locationOverrides[location.id].overview}
                    onChange={handleLocationOverrideChange(location.id, "overview")}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : serviceToEdit ? "Update Service" : "Add Service"}
          </button>

          {serviceToEdit && (
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

export default ServiceFormCard;

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
