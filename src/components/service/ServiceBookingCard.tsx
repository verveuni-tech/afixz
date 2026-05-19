import React, { useState } from "react";
import { X } from "lucide-react";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../context/AuthContext";
import AuthLogin from "../auth/AuthLogin";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  const [fieldError, setFieldError] = useState("");
  const [bookError, setBookError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFieldError("");
    setBookError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.date ||
      !form.time
    ) {
      setFieldError("Please fill in all fields.");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setFieldError("Enter a valid 10-digit Indian phone number.");
      return false;
    }

    setFieldError("");
    return true;
  };

  const handleBook = () => {
    requireAuth(async () => {
      if (!validateForm()) return;
      if (!user) return;

      try {
        setLoading(true);
        setBookError("");

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
        setBookError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  /* ---------------- SUCCESS STATE ---------------- */

  if (success) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:sticky md:top-32 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Booking Confirmed</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Our team will contact you shortly to confirm your slot.
        </p>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:sticky md:top-32">

        {/* Price */}
        <div className="mb-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-medium">
            Starting Price
          </p>
          <span className="text-4xl font-bold text-[#1f2933]">
            ₹{price}
          </span>
        </div>

        <div className="space-y-5">
          <FormInput
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <FormInput
            label="Contact Number"
            name="phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={handleChange}
          />

          <FormTextarea
            label="Service Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <FormInput
            label="Preferred Date"
            name="date"
            type="date"
            value={form.date}
            min={today}
            onChange={handleChange}
          />

          <FormSelect
            label="Preferred Time"
            name="time"
            value={form.time}
            onChange={handleChange}
            options={["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]}
          />

          {fieldError && (
            <p className="text-xs text-red-500 font-medium -mt-1">{fieldError}</p>
          )}

          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-[#f36b21] hover:bg-[#e85d0f] text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing…" : "Book Now"}
          </button>

          {bookError && (
            <p className="text-xs text-red-500 text-center">{bookError}</p>
          )}

          <p className="text-xs text-slate-400 text-center">
            Free cancellation up to 2 hours before service.
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() => setShowLogin(false)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
            <AuthLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceBookingCard;

/* ---------------- Field Components ---------------- */

const fieldClass =
  "w-full mt-1.5 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[#f36b21] focus:border-transparent outline-none transition";

const labelClass = "block text-[11px] uppercase tracking-[0.14em] font-medium text-slate-400";

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
  placeholder?: string;
}

interface InputProps extends BaseFieldProps {
  type?: string;
}

function FormInput({ label, type = "text", name, value, onChange, min, placeholder }: InputProps) {
  const id = `booking-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}

function FormTextarea({ label, name, value, onChange }: BaseFieldProps) {
  const id = `booking-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <textarea
        id={id}
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        className={fieldClass}
      />
    </div>
  );
}

interface SelectProps extends BaseFieldProps {
  options: string[];
}

function FormSelect({ label, name, value, onChange, options }: SelectProps) {
  const id = `booking-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={fieldClass}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
