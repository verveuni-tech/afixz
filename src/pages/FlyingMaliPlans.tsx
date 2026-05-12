import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Leaf,
  Shield,
  Clock,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocationContext } from "../context/LocationContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { getLocationLabel } from "../lib/locations";
import AuthLogin from "../components/auth/AuthLogin";
import {
  FLYING_MALI_PLANS,
  FLYING_MALI_NOTES,
  type SubscriptionPlan,
} from "../features/subscriptions/plans";
import { createPlanSubscription } from "../features/subscriptions/lib";
import { TIME_SLOTS, type SubscriptionAddress } from "../features/subscriptions/types";
import useSeo from "../hooks/useSeo";

export default function FlyingMaliPlans() {
  const { user, profile } = useAuth();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const { requireAuth, showLogin, setShowLogin, handleLoginSuccess } = useRequireAuth();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useSeo({
    title: "Flying Mali Plans — Professional Garden Care | AfixZ",
    description:
      "Subscribe to Flying Mali for professional gardening care. Monthly, 6-month & yearly plans starting ₹449/month. 2 visits/month, up to 30 plants.",
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    requireAuth(() => {
      if (!selectedLocation) {
        openLocationPicker();
        return;
      }
      setSelectedPlan(plan);
      setShowCheckout(true);
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">Home</Link>
          <ChevronRight size={13} />
          <Link to="/services" className="transition hover:text-slate-600">Services</Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">Flying Mali Plans</span>
        </nav>

        {/* Header */}
        <div className="mt-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <Leaf size={24} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Flying Mali
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
            Professional garden care delivered to your doorstep. Pick a plan that
            works for you — same expert service, different commitment.
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
          <Stat icon={<Clock size={16} />} label="Visits" value="2/month" />
          <Stat icon={<Leaf size={16} />} label="Plants" value="Up to 30" />
          <Stat icon={<Shield size={16} />} label="Guarantee" value="7-day" />
        </div>

        {/* Plans */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {FLYING_MALI_PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* Features */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-800">
            Included in every plan
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {FLYING_MALI_PLANS[0].features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 py-1.5">
                <Check size={14} className="shrink-0 text-emerald-500" />
                <span className="text-sm text-slate-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
          <h3 className="text-sm font-semibold text-slate-700">Good to know</h3>
          <ul className="mt-3 space-y-2">
            {FLYING_MALI_NOTES.map((note) => (
              <li key={note} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100"
            >
              <X size={16} />
            </button>
            <AuthLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================
   Plan Card
   =========================== */

function PlanCard({
  plan,
  onSelect,
}: {
  plan: SubscriptionPlan;
  onSelect: () => void;
}) {
  const isHighlighted = !!plan.highlight;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition ${
        isHighlighted
          ? "border-accent bg-accent/[0.02] shadow-sm"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-5 rounded-full bg-accent px-3 py-0.5 text-[11px] font-semibold text-white">
          {plan.highlight}
        </span>
      )}

      <p className="text-sm font-semibold text-slate-800">{plan.name}</p>

      <div className="mt-3">
        <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
        {plan.billingCycle !== "monthly" && (
          <span className="ml-1 text-sm text-slate-400">
            / {plan.billingCycle === "6months" ? "6 mo" : "year"}
          </span>
        )}
        {plan.billingCycle === "monthly" && (
          <span className="ml-1 text-sm text-slate-400">/ month</span>
        )}
      </div>

      {plan.billingCycle !== "monthly" && (
        <p className="mt-1 text-xs text-slate-500">
          ₹{plan.pricePerMonth}/month · Save ₹{plan.savings}
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Check size={13} className="text-emerald-500" />
          {plan.visitsPerMonth} visits/month
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-emerald-500" />
          Up to {plan.plantCoverage} plants
        </div>
        <div className="flex items-center gap-2">
          <Check size={13} className="text-emerald-500" />
          All features included
        </div>
        {plan.billingCycle === "yearly" && (
          <div className="flex items-center gap-2">
            <Check size={13} className="text-accent" />
            <span className="font-medium text-accent">1 month free + priority support</span>
          </div>
        )}
      </div>

      <button
        onClick={onSelect}
        className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
          isHighlighted
            ? "bg-accent text-white hover:bg-accent-hover"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
      >
        Subscribe
      </button>
    </div>
  );
}

/* ===========================
   Checkout Modal
   =========================== */

function CheckoutModal({
  plan,
  onClose,
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
}) {
  const { user, profile } = useAuth();
  const { selectedLocation } = useLocationContext();

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [startDate, setStartDate] = useState(minDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [address, setAddress] = useState<SubscriptionAddress>({
    name: profile?.displayName || "",
    phone: profile?.phone || "",
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
      await createPlanSubscription({
        userId: user.uid,
        plan,
        locationId: selectedLocation,
        address,
        preferredTime,
        startDate,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create subscription.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <Check size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Subscription Created!</h3>
          <p className="mt-2 text-sm text-slate-500">
            Your {plan.name} Flying Mali plan starts on {startDate}. Our
            professional gardener will visit you {plan.visitsPerMonth} times a
            month.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/subscriptions"
              className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              View Subscriptions
            </Link>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Subscribe to {plan.name} Plan
            </p>
            <p className="text-xs text-slate-400">
              ₹{plan.price}
              {plan.billingCycle !== "monthly"
                ? ` / ${plan.billingCycle === "6months" ? "6 months" : "year"}`
                : "/month"}
              {" · "}{plan.visitsPerMonth} visits/month
              {selectedLocation && ` · ${getLocationLabel(selectedLocation)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
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
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Preferred time <span className="text-red-400">*</span>
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className={inputCls}
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
                  <input value={address.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Your name" className={inputCls} />
                </Field>
                <Field label="Phone" required>
                  <input value={address.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91 98765 43210" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="House / Flat no" required>
                  <input value={address.houseNo} onChange={(e) => handleChange("houseNo", e.target.value)} placeholder="B-204" className={inputCls} />
                </Field>
                <Field label="Area / Street" required>
                  <input value={address.area} onChange={(e) => handleChange("area", e.target.value)} placeholder="Sector 18" className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" required>
                  <input value={address.city} onChange={(e) => handleChange("city", e.target.value)} placeholder="Noida" className={inputCls} />
                </Field>
                <Field label="Pincode" required>
                  <input value={address.pincode} onChange={(e) => handleChange("pincode", e.target.value)} placeholder="201301" className={inputCls} />
                </Field>
              </div>
              <Field label="Landmark">
                <input value={address.landmark} onChange={(e) => handleChange("landmark", e.target.value)} placeholder="Near metro station (optional)" className={inputCls} />
              </Field>
              <Field label="Full address" required>
                <textarea rows={2} value={address.fullAddress} onChange={(e) => handleChange("fullAddress", e.target.value)} placeholder="House no, street, area, city, pincode" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <p className="text-center text-[11px] text-slate-400">
            Payment on each visit · Cash on delivery · Cancel anytime
          </p>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating subscription…
              </>
            ) : (
              <>
                <Leaf size={15} />
                Confirm — ₹{plan.price}
                {plan.billingCycle !== "monthly"
                  ? ` / ${plan.billingCycle === "6months" ? "6 mo" : "yr"}`
                  : "/mo"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   Shared UI
   =========================== */

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}

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
