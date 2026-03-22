import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  User,
  MapPin,
  ShoppingBag,
  Phone,
  LogOut,
  Mail,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Package,
  X,
  Home,
  Camera,
  Pencil,
  Check,
} from "lucide-react";
import { getLocationLabel } from "../lib/locations";
import { uploadImageWithProgress } from "../lib/cloudinary";

type Tab = "bookings" | "profile" | "addresses" | "support";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return <PageLoader />;
  if (!user)
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28 text-sm text-slate-500">
        Please log in to view your profile.
      </div>
    );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "bookings", label: "Bookings", icon: <ShoppingBag size={16} /> },
    { key: "profile", label: "Profile", icon: <User size={16} /> },
    { key: "addresses", label: "Addresses", icon: <MapPin size={16} /> },
    { key: "support", label: "Support", icon: <Phone size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <User size={20} className="text-slate-500" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {profile?.displayName || profile?.email || "User"}
            </p>
            <p className="text-xs text-slate-400">
              {profile?.phone || profile?.email || "No contact info"}
            </p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex"
          >
            <LogOut size={13} />
            Log out
          </button>
        </div>

        {/* Tab navigation */}
        <div className="mt-6 border-b border-slate-100">
          {/* Desktop tabs */}
          <div className="hidden gap-1 sm:flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-accent text-accent"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile tab selector */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex w-full items-center justify-between py-3 text-sm font-medium text-slate-700"
            >
              <span className="flex items-center gap-2">
                {tabs.find((t) => t.key === activeTab)?.icon}
                {tabs.find((t) => t.key === activeTab)?.label}
              </span>
              <ChevronRight
                size={14}
                className={`text-slate-400 transition ${mobileMenuOpen ? "rotate-90" : ""}`}
              />
            </button>
            {mobileMenuOpen && (
              <div className="mb-2 space-y-1">
                {tabs
                  .filter((t) => t.key !== activeTab)
                  .map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                <button
                  onClick={() => signOut(auth)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "profile" && <ProfilePanel />}
          {activeTab === "bookings" && <BookingsPanel userId={user.uid} />}
          {activeTab === "addresses" && <AddressesPanel userId={user.uid} />}
          {activeTab === "support" && <SupportPanel />}
        </div>
      </div>
    </div>
  );
}

/* ==============================
   Profile Panel (Editable)
   ============================== */

function ProfilePanel() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(profile?.email || "");

  // Sync when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      setEditing(false);
      showSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB.");
      return;
    }

    setUploadingPhoto(true);
    setUploadProgress(0);

    try {
      const result = await uploadImageWithProgress(file, (percent) => {
        setUploadProgress(percent);
      });

      await updateDoc(doc(db, "users", user.uid), {
        photoURL: result.secure_url,
        updatedAt: serverTimestamp(),
      });

      await refreshProfile();
      showSuccess("Photo updated.");
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setUploadingPhoto(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: null,
        updatedAt: serverTimestamp(),
      });
      await refreshProfile();
      showSuccess("Photo removed.");
    } catch (err) {
      console.error("Failed to remove photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const infoFields = [
    {
      icon: <User size={15} className="text-slate-400" />,
      label: "Name",
      value: profile?.displayName || "Not set",
      editable: true,
      editValue: displayName,
      onChange: setDisplayName,
      placeholder: "Your full name",
    },
    {
      icon: <Mail size={15} className="text-slate-400" />,
      label: "Email",
      value: profile?.email || "Not provided",
      editable: true,
      editValue: email,
      onChange: setEmail,
      placeholder: "your@email.com",
    },
    {
      icon: <Phone size={15} className="text-slate-400" />,
      label: "Phone",
      value: profile?.phone || "Not provided",
      editable: true,
      editValue: phone,
      onChange: setPhone,
      placeholder: "+91 98765 43210",
    },
    {
      icon: <MapPin size={15} className="text-slate-400" />,
      label: "Location",
      value: profile?.selectedLocation
        ? getLocationLabel(profile.selectedLocation)
        : "Not selected",
      editable: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {successMsg && (
        <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          ✓ {successMsg}
        </div>
      )}

      {/* Photo Section */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <User size={28} className="text-slate-300" />
            </div>
          )}

          {/* Upload overlay */}
          {uploadingPhoto && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <span className="text-xs font-semibold text-white">
                {uploadProgress > 0 ? `${uploadProgress}%` : "..."}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Profile Photo</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <Camera size={12} />
              {profile?.photoURL ? "Change" : "Upload"}
            </button>
            {profile?.photoURL && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            JPG, PNG or WebP. Max 5 MB.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100" />

      {/* Info Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          Personal Information
        </h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <Pencil size={12} />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing(false);
                // Reset to original values
                setDisplayName(profile?.displayName || "");
                setPhone(profile?.phone || "");
                setEmail(profile?.email || "");
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Check size={12} />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {infoFields.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-4">
            {item.icon}
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">
                {item.label}
              </p>
              {editing && item.editable ? (
                <input
                  value={item.editValue}
                  onChange={(e) => item.onChange!(e.target.value)}
                  placeholder={item.placeholder}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                />
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-700">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Provider info */}
      {profile?.provider && (
        <p className="text-xs text-slate-400">
          Signed in via{" "}
          <span className="font-medium text-slate-500">
            {profile.provider === "phone"
              ? "Phone"
              : profile.provider === "google.com"
              ? "Google"
              : profile.provider}
          </span>
        </p>
      )}
    </div>
  );
}

/* ==============================
   Bookings Panel
   ============================== */

function BookingsPanel({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageSize = 5;

  const fetchBookings = async (next = false) => {
    if (next) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    let q;

    if (next && lastDoc) {
      q = query(
        collection(db, "bookings"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    } else {
      q = query(
        collection(db, "bookings"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(pageSize + 1)
      );
      setBookings([]);
    }

    const snapshot = await getDocs(q);

    let docs = snapshot.docs;

    if (docs.length > pageSize) {
      setHasMore(true);
      docs = docs.slice(0, pageSize);
    } else {
      setHasMore(false);
    }

    const data = docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, any>),
    }));

    if (next) {
      setBookings((prev) => [...prev, ...data]);
    } else {
      setBookings(data);
    }

    if (docs.length > 0) {
      setLastDoc(docs[docs.length - 1]);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    void fetchBookings();
  }, [userId]);

  if (loading && bookings.length === 0) return <SkeletonBlock rows={3} />;

  if (!bookings.length)
    return (
      <EmptyState
        icon={<Package size={24} className="text-slate-300" />}
        title="No bookings yet"
        description="Your past and upcoming bookings will appear here."
      />
    );

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "delivered") return "bg-emerald-50 text-emerald-700";
    if (s === "cancelled" || s === "failed") return "bg-red-50 text-red-600";
    if (s === "pending" || s === "processing") return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-800">Booking History</h2>

      <div className="space-y-3">
        {bookings.map((booking) => {
          const lineItems =
            Array.isArray(booking.services) && booking.services.length > 0
              ? booking.services
              : [
                  {
                    title:
                      booking.serviceTitle || booking.serviceSlug || "Booked service",
                    price: booking.price || booking.totalPrice || 0,
                  },
                ];

          const total =
            typeof booking.totalPrice === "number"
              ? booking.totalPrice
              : lineItems.reduce(
                  (sum: number, item: any) => sum + (Number(item.price) || 0),
                  0
                );

          return (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">
                  #{booking.id.slice(0, 8)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Line items */}
              <div className="mt-3 space-y-1.5">
                {lineItems.map((service: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700">{service.title}</span>
                    <span className="font-medium text-slate-800">
                      ₹{service.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {booking.locationId && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {getLocationLabel(booking.locationId)}
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  ₹{total}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => void fetchBookings(true)}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ==============================
   Addresses Panel
   ============================== */

const ADDRESS_FIELDS = [
  { key: "fullName", label: "Full Name", placeholder: "John Doe" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { key: "line1", label: "Address", placeholder: "House no, street, area" },
  { key: "city", label: "City", placeholder: "New Delhi" },
  { key: "state", label: "State", placeholder: "Delhi" },
  { key: "pincode", label: "Pincode", placeholder: "110001" },
] as const;

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
};

function AddressesPanel({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    const fetchAddresses = async () => {
      const snapshot = await getDocs(
        collection(db, "users", userId, "addresses")
      );

      setAddresses(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
      setLoading(false);
    };

    void fetchAddresses();
  }, [userId]);

  const saveAddress = async () => {
    if (!form.fullName.trim() || !form.line1.trim()) return;

    setSaving(true);
    const docRef = await addDoc(collection(db, "users", userId, "addresses"), {
      ...form,
      createdAt: serverTimestamp(),
    });

    setAddresses((prev) => [...prev, { id: docRef.id, ...form }]);
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
    setSaving(false);
  };

  const deleteAddress = async (id: string) => {
    await deleteDoc(doc(db, "users", userId, "addresses", id));
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  };

  if (loading) return <SkeletonBlock rows={2} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">
          Saved Addresses
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
            showForm
              ? "border border-slate-200 text-slate-500 hover:bg-slate-50"
              : "bg-primary text-white hover:bg-primary-hover"
          }`}
        >
          {showForm ? (
            <>
              <X size={12} />
              Cancel
            </>
          ) : (
            <>
              <Plus size={12} />
              Add Address
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ADDRESS_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {label}
                </label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveAddress}
            disabled={saving || !form.fullName.trim() || !form.line1.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto sm:px-6"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Address
          </button>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <EmptyState
          icon={<Home size={24} className="text-slate-300" />}
          title="No saved addresses"
          description="Add your home or office address for faster checkout."
        />
      )}

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="group flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
          >
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <MapPin size={14} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {address.fullName}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {address.line1}, {address.city}, {address.state} —{" "}
                  {address.pincode}
                </p>
                {address.phone && (
                  <p className="mt-0.5 text-xs text-slate-400">{address.phone}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => void deleteAddress(address.id)}
              className="shrink-0 rounded-md p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
              title="Delete address"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================
   Support Panel
   ============================== */

function SupportPanel() {
  return (
    <EmptyState
      icon={<Phone size={24} className="text-slate-300" />}
      title="Support coming soon"
      description="We're working on bringing you in-app support. For now, reach out via email."
    />
  );
}

/* ==============================
   Shared Components
   ============================== */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      {icon && <div className="mb-3">{icon}</div>}
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}

function SkeletonBlock({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-3 pt-2">
      <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-slate-100 bg-slate-50"
        />
      ))}
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center pt-28">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 size={14} className="animate-spin" />
        Loading profile...
      </div>
    </div>
  );
}
