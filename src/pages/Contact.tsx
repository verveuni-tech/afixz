import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import useSeo from "../hooks/useSeo";

const SERVICES = [
  "Gardening",
  "Bike Service",
  "Cycle Service",
  "Home Interior & Fabrication",
] as const;

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  notes: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  service: "",
  notes: "",
};

const Contact: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useSeo({
    title: "Book a Service | AfixZ",
    description:
      "Book an offline service with AfixZ — gardening, bike service, cycle service, and home interior & fabrication.",
    canonicalUrl: `${import.meta.env.VITE_SITE_URL || ""}/contact`,
  });

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Valid email is required.";
    if (!form.phone.trim() || !/^\+?[0-9]{7,15}$/.test(form.phone.replace(/\s/g, "")))
      return "Valid phone number is required.";
    if (!form.address.trim()) return "Address is required.";
    if (!form.service) return "Please select a service.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "offlineBookings"), {
        ...form,
        phone: form.phone.replace(/\s/g, ""),
        createdAt: serverTimestamp(),
        status: "pending",
      });
      setSubmitted(true);
      setForm(initialForm);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Booking Received!
          </h2>
          <p className="text-slate-600 mb-8">
            We've received your service request. Our team will contact you
            shortly to confirm your booking.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="rounded-xl bg-accent px-8 py-3 font-semibold text-white transition hover:bg-accent-hover"
          >
            Book Another Service
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            Offline Booking
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Book a Service
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Online orders are temporarily unavailable. Fill out the form below
            to book a service and our team will get back to you to confirm your
            appointment.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info cards */}
          <div className="space-y-6 lg:order-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Get in Touch</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Phone</p>
                    <p>+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p>support@afixz.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">Office</p>
                    <p>AfixZ Headquarters, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Available Services</h3>
              <ul className="space-y-2">
                {SERVICES.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 lg:order-1 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Service Booking Form
            </h2>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.service}
                  onChange={(e) => update("service", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Your full address for service visit"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Additional Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any details about your requirement (optional)"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-accent px-10 py-3.5 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Booking
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
