import React, { useEffect, useState } from "react";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";
import { db } from "../firebase";
import { normalizeService, resolveServiceForLocation } from "../lib/services";
import { getLocationLabel } from "../lib/locations";

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
          ...booking,
          address: form,
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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-32 pb-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Checkout
          </h1>
          <p className="mt-3 text-slate-500 text-lg">
            Confirm your details and schedule your service.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
          Booking location:{" "}
          <button
            type="button"
            onClick={openLocationPicker}
            className="font-semibold text-blue-600 hover:underline"
          >
            {getLocationLabel(selectedLocation)}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-14">
            <ModernSection title="Customer Details">
              <TwoCol>
                <ModernInput label="Full Name" name="name" value={form.name} onChange={handleChange} />
                <ModernInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} />
              </TwoCol>
            </ModernSection>

            <ModernSection title="Service Address">
              <TwoCol>
                <ModernInput label="House / Flat No" name="houseNo" value={form.houseNo} onChange={handleChange} />
                <ModernInput label="Area / Street" name="area" value={form.area} onChange={handleChange} />
                <ModernInput label="Landmark (Optional)" name="landmark" value={form.landmark} onChange={handleChange} />
                <ModernInput label="City" name="city" value={form.city} onChange={handleChange} />
                <ModernInput label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
              </TwoCol>

              <ModernTextarea
                label="Complete Address"
                name="fullAddress"
                value={form.fullAddress}
                onChange={handleChange}
              />
            </ModernSection>

            <ModernSection title="Schedule">
              <TwoCol>
                <ModernInput
                  type="date"
                  min={today}
                  label="Select Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
                <ModernSelect
                  label="Select Time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  options={["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]}
                />
              </TwoCol>
            </ModernSection>
          </div>

          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl p-10 space-y-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm text-slate-600">
                {cart.map((item) => (
                  <div key={item.serviceId} className="flex justify-between gap-3">
                    <div>
                      <p>{item.title}</p>
                      {item.locationId && (
                        <p className="mt-1 text-xs text-slate-400">For {getLocationLabel(item.locationId)}</p>
                      )}
                    </div>
                    <span>Rs {item.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 flex justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>Rs {totalPrice}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-all duration-200 shadow-lg"
              >
                {loading ? "Processing..." : "Place Order (Cash on Delivery)"}
              </button>

              <p className="text-xs text-center text-slate-400">
                Secure booking for {getLocationLabel(selectedLocation)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

const ModernSection = ({ title, children }: any) => (
  <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
    <h3 className="text-lg font-semibold text-slate-900 mb-8">
      {title}
    </h3>
    <div className="space-y-6">{children}</div>
  </div>
);

const TwoCol = ({ children }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {children}
  </div>
);

const ModernInput = ({ label, ...props }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      {...props}
      className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const ModernTextarea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <textarea
      rows={4}
      {...props}
      className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    />
  </div>
);

const ModernSelect = ({ label, options, ...props }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
      {label}
    </label>
    <select
      {...props}
      className="w-full mt-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
    >
      {options.map((o: string) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  </div>
);
