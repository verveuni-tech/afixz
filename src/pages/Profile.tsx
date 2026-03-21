import React, { useEffect, useState } from "react";
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
  serverTimestamp,
} from "firebase/firestore";
import {
  User,
  MapPin,
  ShoppingBag,
  Phone,
  LogOut,
} from "lucide-react";
import { getLocationLabel } from "../lib/locations";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");

  if (loading) return <PageLoader />;
  if (!user) return <div className="py-32 text-center">Login required</div>;

  return (
    <div className="bg-slate-50 py-24 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl flex">
        <div className="w-1/3 p-10">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {profile?.email}
              </p>
              <p className="text-sm text-slate-500">
                {profile?.phone || "No phone linked"}
              </p>
            </div>
          </div>

          <SidebarItem
            icon={<ShoppingBag size={18} />}
            label="Bookings"
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          />

          <SidebarItem
            icon={<User size={18} />}
            label="Profile"
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
          />

          <SidebarItem
            icon={<MapPin size={18} />}
            label="Addresses"
            active={activeTab === "addresses"}
            onClick={() => setActiveTab("addresses")}
          />

          <SidebarItem
            icon={<Phone size={18} />}
            label="Support"
            active={activeTab === "support"}
            onClick={() => setActiveTab("support")}
          />

          <button
            onClick={() => signOut(auth)}
            className="mt-14 w-full border border-red-500 text-red-500 py-3 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>

        <div className="flex-1 p-14">
          {activeTab === "profile" && (
            <ProfilePanel profile={profile} />
          )}

          {activeTab === "bookings" && (
            <BookingsPanel userId={user.uid} />
          )}

          {activeTab === "addresses" && (
            <AddressesPanel userId={user.uid} />
          )}

          {activeTab === "support" && (
            <EmptyState title="Support section coming soon" />
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsPanel({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  const pageSize = 4;

  const fetchBookings = async (next = false) => {
    setLoading(true);

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

    const data = docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, any>)
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
  };

  useEffect(() => {
    void fetchBookings();
  }, [userId]);

  if (loading && bookings.length === 0)
    return <SkeletonBlock />;

  if (!bookings.length)
    return <EmptyState title="No bookings yet" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Booking History
      </h1>

      {bookings.map((booking) => {
        const lineItems = Array.isArray(booking.services) && booking.services.length > 0
          ? booking.services
          : [
              {
                title: booking.serviceTitle || booking.serviceSlug || "Booked service",
                price: booking.price || booking.totalPrice || 0,
              },
            ];

        const total = typeof booking.totalPrice === "number"
          ? booking.totalPrice
          : lineItems.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0);

        return (
          <div
            key={booking.id}
            className="bg-slate-50 p-6 rounded-2xl space-y-4"
          >
            <div className="flex justify-between">
              <span className="font-medium">{booking.id}</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {booking.status}
              </span>
            </div>

            {lineItems.map((service: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{service.title}</span>
                <span>Rs {service.price}</span>
              </div>
            ))}

            {booking.locationId && (
              <p className="text-xs text-slate-500">
                Location: {getLocationLabel(booking.locationId)}
              </p>
            )}

            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="flex justify-end">
          <button
            onClick={() => void fetchBookings(true)}
            className="text-sm text-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

function AddressesPanel({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      const snapshot = await getDocs(
        collection(db, "users", userId, "addresses")
      );

      setAddresses(snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })));

      setLoading(false);
    };

    void fetchAddresses();
  }, [userId]);

  const saveAddress = async () => {
    const docRef = await addDoc(
      collection(db, "users", userId, "addresses"),
      { ...form, createdAt: serverTimestamp() }
    );

    setAddresses((prev) => [...prev, { id: docRef.id, ...form }]);

    setShowForm(false);
    setForm({
      fullName: "",
      phone: "",
      line1: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const deleteAddress = async (id: string) => {
    await deleteDoc(
      doc(db, "users", userId, "addresses", id)
    );
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  };

  if (loading) return <SkeletonBlock />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Saved Addresses
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          {showForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <EmptyState title="No saved addresses" />
      )}

      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(form).map((key) => (
            <input
              key={key}
              placeholder={key}
              value={(form as any)[key]}
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
              className="border p-3 rounded-xl"
            />
          ))}
          <button
            onClick={saveAddress}
            className="md:col-span-2 bg-blue-600 text-white py-3 rounded-xl"
          >
            Save Address
          </button>
        </div>
      )}

      {addresses.map((address) => (
        <div
          key={address.id}
          className="border p-6 rounded-2xl flex justify-between"
        >
          <div>
            <p className="font-medium">{address.fullName}</p>
            <p className="text-sm text-slate-600">
              {address.line1}, {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
          <button
            onClick={() => void deleteAddress(address.id)}
            className="text-red-500 text-sm"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 ${
        active ? "bg-blue-50 text-blue-600" : "hover:bg-slate-50"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ProfilePanel({ profile }: any) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Account Information
      </h1>
      <p>Email: {profile?.email}</p>
      <p>Phone: {profile?.phone || "Not provided"}</p>
      {profile?.selectedLocation && (
        <p>Location: {getLocationLabel(profile.selectedLocation)}</p>
      )}
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-slate-500">
      {title}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded" />
      <div className="h-20 bg-slate-100 rounded-2xl" />
      <div className="h-20 bg-slate-100 rounded-2xl" />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
