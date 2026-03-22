import React, { useEffect, useState } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";
import { db } from "../firebase";
import { normalizeService, resolveServiceForLocation } from "../lib/services";
import { getLocationLabel } from "../lib/locations";
import { ChevronRight, Loader2, MapPin, Lock } from "lucide-react";

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: user?.phoneNumber || "",
    houseNo: "",
    area: "",
    landmark: "",
    city: "",
    pincode: "",
    fullAddress: "",
    date: "",
    time: "10:00 AM",
  });

  useEffect(() => {
    if (!orderPlaced && cart.length === 0) {
      navigate("/cart");
    }
  }, [cart, orderPlaced, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const required = [
      "name",
      "phone",
      "houseNo",
      "area",
      "city",
      "pincode",
      "fullAddress",
      "date",
      "time",
    ];

    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        alert("Please complete all required fields.");
        return false;
      }
    }

    if (!selectedLocation) {
      openLocationPicker();
      alert("Please select a booking location before placing the order.");
      return false;
    }

    const hasLocationMismatch = cart.some(
      (item) => item.locationId && item.locationId !== selectedLocation
    );

    if (hasLocationMismatch) {
      alert("Your cart contains services from a different location. Please review the cart first.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
  if (!validate()) return;
  if (!user || !selectedLocation) return;

  try {
    setLoading(true);

    const validatedBookings = await Promise.all(
      cart.map(async (item) => {
        const snapshot = await getDoc(doc(db, "services", item.serviceId));

        if (!snapshot.exists()) {
          throw new Error(`Service "${item.title}" is no longer available.`);
        }

        const service = resolveServiceForLocation(
          normalizeService(snapshot.id, snapshot.data() as Record<string, any>),
          selectedLocation
        );

        if (item.locationId && item.locationId !== selectedLocation) {
          throw new Error(`"${item.title}" belongs to another location and must be removed first.`);
        }

        return {
          serviceId: service.id,
          serviceSlug: service.slug,
          serviceTitle: service.title,
          price: service.price,
          locationId: selectedLocation,
        };
      })
    );

    const bookingIds: string[] = [];

    for (const booking of validatedBookings) {
      const bookingRef = await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        serviceId: booking.serviceId,
        serviceSlug: booking.serviceSlug,
        serviceTitle: booking.serviceTitle,
        price: booking.price,
        totalPrice: booking.price,
        locationId: booking.locationId,

        address: {
          name: form.name,
          phone: form.phone,
          houseNo: form.houseNo,
          area: form.area,
          landmark: form.landmark,
          city: form.city,
          pincode: form.pincode,
          fullAddress: form.fullAddress,
        },

        scheduledDate: form.date,
        scheduledTime: form.time,
        customerName: form.name,
        customerPhone: form.phone,
        paymentMode: "cod",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      bookingIds.push(bookingRef.id);
    }

    setOrderPlaced(true);
    await clearCart();

    navigate(`/booking-success/${bookingIds[0]}`);
  } catch (err: any) {
    console.error(err);
    alert(err?.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">Home</Link>
          <ChevronRight size={13} />
          <Link to="/cart" className="transition hover:text-slate-600">Cart</Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">Checkout</span>
        </nav>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirm your details and schedule your service.
        </p>

        {/* Location Bar */}
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <MapPin size={14} className="shrink-0 text-slate-400" />
          <span className="flex-1 text-sm text-slate-600">
            Booking for <span className="font-medium text-slate-800">{getLocationLabel(selectedLocation)}</span>
          </span>
          <button
            type="button"
            onClick={openLocationPicker}
            className="text-xs font-medium text-accent transition hover:text-accent-hover"
          >
            Change
          </button>
        </div>

        {/* Main Layout */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left — Form */}
          <div className="space-y-6">
            {/* Customer Details */}
            <FormSection title="Customer Details" step={1}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                <FormInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
            </FormSection>

            {/* Service Address */}
            <FormSection title="Service Address" step={2}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput label="House / Flat No" name="houseNo" value={form.houseNo} onChange={handleChange} required />
                <FormInput label="Area / Street" name="area" value={form.area} onChange={handleChange} required />
                <FormInput label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Optional" />
                <FormInput label="City" name="city" value={form.city} onChange={handleChange} required />
                <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} required />
              </div>
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Complete Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  name="fullAddress"
                  value={form.fullAddress}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  placeholder="Full address for the service visit"
                />
              </div>
            </FormSection>

            {/* Schedule */}
            <FormSection title="Schedule" step={3}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  type="date"
                  label="Preferred Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Preferred Time <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                  >
                    {["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </FormSection>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-800">
                Order Summary
              </h2>

              <div className="mt-5 space-y-3">
                {cart.map((item) => (
                  <div key={item.serviceId} className="flex justify-between gap-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-slate-600">{item.title}</p>
                      {item.locationId && (
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {getLocationLabel(item.locationId)}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-medium text-slate-800">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between">
                <span className="font-semibold text-slate-800">Total</span>
                <span className="text-lg font-bold text-accent">₹{totalPrice}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Place Order — Cash on Delivery"
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock size={10} />
                Secure booking for {getLocationLabel(selectedLocation)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

/* ---- Sub-components ---- */

function FormSection({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {step}
        </span>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormInput({
  label,
  required,
  ...props
}: {
  label: string;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}
