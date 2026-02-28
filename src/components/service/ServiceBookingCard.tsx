import React, { useState } from "react";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../context/AuthContext";
import PhoneLogin from "../auth/PhoneLogin";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

interface Props {
  serviceId: string;
  serviceSlug: string;
  serviceTitle: string;
  price: number;
}

interface BookingForm {
  name: string;
  phone: string;
  address: string;
  date: string;
  time: string;
}

const ServiceBookingCard: React.FC<Props> = ({
  serviceId,
  serviceSlug,
  serviceTitle,
  price,
}) => {
  const { user } = useAuth();

  const {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  } = useRequireAuth();

  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "10:00 AM",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.date ||
      !form.time
    ) {
      alert("Please fill all fields.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      alert("Enter valid 10-digit phone number.");
      return false;
    }

    return true;
  };

  const handleBook = () => {
    requireAuth(async () => {
      if (!validateForm()) return;
      if (!user) return;

      try {
        setLoading(true);

        await addDoc(collection(db, "bookings"), {
          serviceId,
          serviceSlug,
          serviceTitle,
          price,

          customerName: form.name,
          customerPhone: form.phone,
          address: form.address,
          scheduledDate: form.date,
          scheduledTime: form.time,

          userId: user.uid,
          paymentMode: "cod",
          status: "pending",

          createdAt: serverTimestamp(),
        });

        setSuccess(true);
      } catch (error) {
        console.error("Booking failed:", error);
        alert("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  /* ---------------- SUCCESS STATE ---------------- */

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-32 text-center">
        <h3 className="text-xl font-semibold text-green-600">
          Booking Confirmed
        </h3>
        <p className="text-slate-600 mt-3">
          Our team will contact you shortly to confirm your slot.
        </p>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-32">

        {/* Price */}
        <div className="mb-8">
          <p className="text-xs uppercase text-slate-500">
            Starting Price
          </p>
          <span className="text-4xl font-bold text-slate-900">
            ₹{price}
          </span>
        </div>

        <div className="space-y-6">

          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Contact Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />

          <Textarea
            label="Service Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <Input
            label="Select Date"
            name="date"
            type="date"
            value={form.date}
            min={today}
            onChange={handleChange}
          />

          <Select
            label="Select Time"
            name="time"
            value={form.time}
            onChange={handleChange}
            options={[
              "10:00 AM",
              "12:00 PM",
              "2:00 PM",
              "4:00 PM",
            ]}
          />

          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Book Now "}
          </button>

          <p className="text-xs text-slate-500 text-center">
            Free cancellation up to 2 hours before service.
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-3 text-sm"
            >
              ✕
            </button>

            <PhoneLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceBookingCard;

/* ---------------- Input Components ---------------- */

interface BaseFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  min?: string;
}

interface InputProps extends BaseFieldProps {
  type?: string;
}

function Input({
  label,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div>
      <label className="text-xs uppercase text-slate-500">
        {label}
      </label>
      <input
        type={type}
        {...props}
        className="w-full mt-2 border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

function Textarea({ label, ...props }: BaseFieldProps) {
  return (
    <div>
      <label className="text-xs uppercase text-slate-500">
        {label}
      </label>
      <textarea
        rows={3}
        {...props}
        className="w-full mt-2 border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

interface SelectProps extends BaseFieldProps {
  options: string[];
}

function Select({
  label,
  options,
  ...props
}: SelectProps) {
  return (
    <div>
      <label className="text-xs uppercase text-slate-500">
        {label}
      </label>
      <select
        {...props}
        className="w-full mt-2 border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}