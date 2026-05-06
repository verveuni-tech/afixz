import React, { useState } from "react";
import { X, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLocationContext } from "../../../context/LocationContext";
import { getLocationLabel } from "../../../lib/locations";
import { createSubscription } from "../lib";
import {
  FREQUENCY_LABELS,
  TIME_SLOTS,
  SubscriptionFrequency,
  SubscriptionAddress,
} from "../types";

interface Props {
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;
  price: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FREQUENCIES: SubscriptionFrequency[] = ["monthly", "biweekly", "weekly"];

const SubscribeModal: React.FC<Props> = ({
  serviceId,
  serviceTitle,
  serviceSlug,
  price,
  onClose,
  onSuccess,
}) => {
  const { user, profile } = useAuth();
  const { selectedLocation } = useLocationContext();

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const [frequency, setFrequency] = useState<SubscriptionFrequency>("monthly");
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [startDate, setStartDate] = useState(minDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState<SubscriptionAddress>({
    name: profile?.displayName || "",
    phone: profile?.phone || user?.phoneNumber || "",
    houseNo: "",
    area: "",
    landmark: "",
    city: "",
    pincode: "",
    fullAddress: "",
  });

  const handleChange = (field: keyof SubscriptionAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!selectedLocation) {
      setError("Please select a location before subscribing.");
      return false;
    }
    const required: (keyof SubscriptionAddress)[] = [
      "name", "phone", "houseNo", "area", "city", "pincode", "fullAddress",
    ];
    for (const field of required) {
      if (!address[field]?.trim()) {
        setError("Please fill in all required address fields.");
        return false;
      }
    }
    if (!startDate) {
      setError("Please choose a start date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!user || !selectedLocation) return;
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await createSubscription({
        userId: user.uid,
        serviceId,
        serviceTitle,
        serviceSlug,
        price,
        locationId: selectedLocation,
        address,
        frequency,
        preferredTime,
        startDate,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <RefreshCw size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Subscribe</p>
              <p className="text-xs text-slate-400 truncate max-w-[220px]">{serviceTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          {/* Price callout */}
          <div className="flex items-center justify-between rounded-xl bg-accent/5 px-4 py-3">
            <span className="text-sm text-slate-600">
              Price per visit · {getLocationLabel(selectedLocation)}
            </span>
            <span className="text-lg font-bold text-accent">₹{price}</span>
          </div>

          {/* Frequency */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              How often?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition ${
                    frequency === f
                      ? "border-accent bg-accent text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {FREQUENCY_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                First visit date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Preferred time <span className="text-red-400">*</span>
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Service address
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name" required>
                  <input
                    value={address.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Your name"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone" required>
                  <input
                    value={address.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="House / Flat no" required>
                  <input
                    value={address.houseNo}
                    onChange={(e) => handleChange("houseNo", e.target.value)}
                    placeholder="B-204"
                    className={inputCls}
                  />
                </Field>
                <Field label="Area / Street" required>
                  <input
                    value={address.area}
                    onChange={(e) => handleChange("area", e.target.value)}
                    placeholder="Sector 18"
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" required>
                  <input
                    value={address.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Noida"
                    className={inputCls}
                  />
                </Field>
                <Field label="Pincode" required>
                  <input
                    value={address.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    placeholder="201301"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Landmark" required={false}>
                <input
                  value={address.landmark}
                  onChange={(e) => handleChange("landmark", e.target.value)}
                  placeholder="Near metro station (optional)"
                  className={inputCls}
                />
              </Field>
              <Field label="Full address" required>
                <textarea
                  rows={2}
                  value={address.fullAddress}
                  onChange={(e) => handleChange("fullAddress", e.target.value)}
                  placeholder="House no, street, area, city, pincode"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          {/* COD note */}
          <p className="text-center text-[11px] text-slate-400">
            Payment on each visit · Cash on delivery · Cancel anytime
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating subscription…
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Confirm subscription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
