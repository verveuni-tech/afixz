import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Leaf,
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
  GARDEN_CARE_PLANS,
  GARDEN_CARE_NOTES,
  type SubscriptionPlan,
} from "../features/subscriptions/plans";

import {
  createPlanSubscription,
  getPlansFromFirestore,
} from "../features/subscriptions/lib";

import {
  TIME_SLOTS,
  type SubscriptionAddress,
} from "../features/subscriptions/types";

import useSeo from "../hooks/useSeo";

export default function GardenCarePlans() {
  const { selectedLocation, openLocationPicker } =
    useLocationContext();

  const {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  } = useRequireAuth();

  const [plans, setPlans] =
    useState<SubscriptionPlan[]>(GARDEN_CARE_PLANS);

  useEffect(() => {
    getPlansFromFirestore()
      .then(setPlans)
      .catch(() => setPlans(GARDEN_CARE_PLANS));
  }, []);

  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionPlan | null>(null);

  const [showCheckout, setShowCheckout] =
    useState(false);

  useSeo({
    title:
      "Garden Care Subscription Plans | AfixZ",
    description:
      "Recurring garden maintenance plans with professional care, seasonal upkeep, pruning and plant health support.",
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
    <div className="min-h-screen overflow-hidden bg-[#f6f6f4] pb-28 pt-32">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/[0.045] blur-3xl" />

        <div className="absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-slate-300/[0.08] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] font-medium tracking-wide text-slate-400">
          <Link
            to="/"
            className="transition hover:text-slate-600"
          >
            Home
          </Link>

          <ChevronRight size={13} />

          <Link
            to="/services"
            className="transition hover:text-slate-600"
          >
            Services
          </Link>

          <ChevronRight size={13} />

          <span className="text-slate-700">
            Garden Subscription
          </span>
        </nav>

        {/* intro */}
        <div className="mt-14 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">
              Garden Care Subscription
            </p>

            <h1 className="mt-5 max-w-[12ch] text-[clamp(3.5rem,6vw,6rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-[#0f1720]">
              Ongoing garden maintenance for modern homes.
            </h1>

            <p className="mt-6 max-w-2xl text-[1.02rem] leading-8 text-slate-500">
              Recurring professional plant care,
              pruning, maintenance, and seasonal
              upkeep handled by verified gardening
              experts.
            </p>
          </div>

          {/* stats */}
          <div className="grid w-full max-w-lg grid-cols-3 gap-4">
            <MinimalStat
              value="2"
              label="Visits / month"
            />

            <MinimalStat
              value="30"
              label="Plants covered"
            />

            <MinimalStat
              value="7"
              label="Day guarantee"
              accent
            />
          </div>
        </div>

        {/* pricing */}
        <div className="mt-24 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </div>

        {/* features */}
        <div className="mt-28">
          <div className="mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
              Included In Every Plan
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#0f1720]">
              Ongoing professional care
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans[0]?.features.map((f) => (
              <div
                key={f}
                className="rounded-[1.75rem] border border-black/[0.05] bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                    <Leaf
                      size={18}
                      className="text-orange-500"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-medium leading-7 text-[#0f1720]">
                      {f}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Professional recurring maintenance
                      handled by verified gardening
                      experts.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* notes */}
        <div className="mt-28 rounded-[2rem] border border-black/[0.05] bg-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
            Good To Know
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {GARDEN_CARE_NOTES.map((note) => (
              <div
                key={note}
                className="flex items-start gap-4 rounded-2xl border border-black/[0.05] bg-[#fafafa] p-5"
              >
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Check
                    size={12}
                    className="text-orange-500"
                  />
                </div>

                <p className="text-sm leading-7 text-slate-600">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* checkout */}
      {showCheckout && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* login */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-black/[0.06] bg-white p-7 shadow-2xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
            >
              <X size={16} />
            </button>

            <AuthLogin
              onSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================
   PLAN CARD
=========================== */

function PlanCard({
  plan,
  onSelect,
}: {
  plan: SubscriptionPlan;
  onSelect: () => void;
}) {
  const isPopular =
    plan.billingCycle === "6months";

  const isYearly =
    plan.billingCycle === "yearly";

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] transition-all duration-500 ${
        isPopular
          ? "border border-orange-200 bg-white shadow-[0_35px_90px_rgba(15,23,42,0.08)] lg:-translate-y-3 lg:scale-[1.02]"
          : isYearly
          ? "border border-orange-100 bg-[#fffaf7]"
          : "border border-black/[0.06] bg-white"
      }`}
    >
      {/* glow */}
      {isPopular && (
        <div className="absolute -right-10 top-0 h-[180px] w-[180px] rounded-full bg-orange-500/[0.08] blur-3xl" />
      )}

      <div className="relative z-10 flex h-full flex-col p-10">
        {/* label */}
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.24em] ${
              isPopular
                ? "text-orange-500"
                : isYearly
                ? "text-orange-500"
                : "text-slate-400"
            }`}
          >
            {isPopular
              ? "Most Popular"
              : isYearly
              ? "Best Value"
              : "Flexible"}
          </p>
        </div>

        {/* title */}
        <div className="mt-7">
          <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#0f1720]">
            {plan.name}
          </h3>

          <div className="mt-6 flex items-end gap-1">
            <span className="pb-2 text-lg text-slate-400">
              ₹
            </span>

           <span className="text-6xl font-semibold leading-none tracking-[-0.07em] text-[#0f1720]">
  ₹{plan.price}
</span>

<span className="pb-2 text-sm text-slate-400">
  {plan.billingCycle === "monthly"
    ? "/month"
    : plan.billingCycle === "6months"
    ? "/6 months"
    : "/year"}
</span>

            <span className="pb-2 text-sm text-slate-400">
              /mo
            </span>
          </div>

       <p className="mt-4 text-sm leading-7 text-slate-500">
  {plan.billingCycle === "monthly"
    ? "Flexible monthly billing."
    : `₹${plan.pricePerMonth}/month equivalent`}
</p>


{plan.billingCycle !== "monthly" && (
  <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
    Save ₹{plan.savings}
  </div>
)}

        </div>

        {/* features */}
        <div className="mt-10 space-y-5">
          <FeatureRow>
            {plan.visitsPerMonth} expert visits /
            month
          </FeatureRow>

          <FeatureRow>
            Up to {plan.plantCoverage} plants
          </FeatureRow>

          <FeatureRow>
            All maintenance included
          </FeatureRow>

          {isPopular && (
            <FeatureRow accent>
              Save ₹{plan.savings} vs monthly
            </FeatureRow>
          )}

          {isYearly && (
            <FeatureRow accent>
              1 month free + priority support
            </FeatureRow>
          )}
        </div>

        <div className="mt-14 flex-1" />

        <button
          onClick={onSelect}
          className={`w-full rounded-2xl py-3.5 text-sm font-semibold transition-all duration-300 ${
            isPopular
              ? "bg-orange-500 text-white hover:bg-orange-400"
              : isYearly
              ? "bg-[#0f1720] text-white hover:bg-black"
              : "border border-[#0f1720] text-[#0f1720] hover:bg-[#0f1720] hover:text-white"
          }`}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}

/* ===========================
   CHECKOUT MODAL
=========================== */

function CheckoutModal({
  plan,
  onClose,
}: {
  plan: SubscriptionPlan;
  onClose: () => void;
}) {
  const { user, profile } = useAuth();

  const { selectedLocation } =
    useLocationContext();

  const today = new Date();

  today.setDate(today.getDate() + 1);

  const minDate =
    today.toISOString().split("T")[0];

  const [preferredTime, setPreferredTime] =
    useState(TIME_SLOTS[0]);

  const [startDate, setStartDate] =
    useState(minDate);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [address, setAddress] =
    useState<SubscriptionAddress>({
      name: profile?.displayName || "",
      phone: profile?.phone || "",
      houseNo: "",
      area: "",
      landmark: "",
      city: "",
      pincode: "",
      fullAddress: "",
    });

  const handleChange = (
    field: keyof SubscriptionAddress,
    value: string
  ) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const required: (keyof SubscriptionAddress)[] =
      [
        "name",
        "phone",
        "houseNo",
        "area",
        "city",
        "pincode",
        "fullAddress",
      ];

    for (const field of required) {
      if (!address[field]?.trim()) {
        setError(
          "Please fill in all required address fields."
        );

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

      setError(
        err?.message ||
          "Failed to create subscription."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
            <Check
              size={28}
              className="text-orange-500"
            />
          </div>

          <h3 className="text-2xl font-semibold tracking-tight text-[#0f1720]">
            Subscription Created
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Your subscription begins on {startDate}.
            Our gardening professional will visit{" "}
            {plan.visitsPerMonth} times every month.
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              to="/subscriptions"
              className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              View Plans
            </Link>

            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-black/[0.08] py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto mt-10 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.05] bg-white/90 px-8 py-5 backdrop-blur-xl">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">
              Selected Plan
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f1720]">
              {plan.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              ₹{plan.price}
              {plan.billingCycle !== "monthly"
                ? ` / ${
                    plan.billingCycle === "6months"
                      ? "6 months"
                      : "year"
                  }`
                : "/month"}
              {" · "}
              {plan.visitsPerMonth} visits/month
              {selectedLocation &&
                ` · ${getLocationLabel(
                  selectedLocation
                )}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* content */}
        <div className="space-y-8 px-8 py-8">
          {/* schedule */}
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Schedule
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="First visit date"
                required
              >
                <input
                  type="date"
                  value={startDate}
                  min={minDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className={inputCls}
                />
              </Field>

              <Field
                label="Preferred time"
                required
              >
                <select
                  value={preferredTime}
                  onChange={(e) =>
                    setPreferredTime(
                      e.target.value
                    )
                  }
                  className={inputCls}
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* address */}
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Service Address
            </p>

            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full name"
                  required
                >
                  <input
                    value={address.name}
                    onChange={(e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Your name"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Phone"
                  required
                >
                  <input
                    value={address.phone}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="+91 98765 43210"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="House / Flat no"
                  required
                >
                  <input
                    value={address.houseNo}
                    onChange={(e) =>
                      handleChange(
                        "houseNo",
                        e.target.value
                      )
                    }
                    placeholder="B-204"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Area / Street"
                  required
                >
                  <input
                    value={address.area}
                    onChange={(e) =>
                      handleChange(
                        "area",
                        e.target.value
                      )
                    }
                    placeholder="Sector 18"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="City"
                  required
                >
                  <input
                    value={address.city}
                    onChange={(e) =>
                      handleChange(
                        "city",
                        e.target.value
                      )
                    }
                    placeholder="Noida"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Pincode"
                  required
                >
                  <input
                    value={address.pincode}
                    onChange={(e) =>
                      handleChange(
                        "pincode",
                        e.target.value
                      )
                    }
                    placeholder="201301"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Landmark">
                <input
                  value={address.landmark}
                  onChange={(e) =>
                    handleChange(
                      "landmark",
                      e.target.value
                    )
                  }
                  placeholder="Near metro station"
                  className={inputCls}
                />
              </Field>

              <Field
                label="Full address"
                required
              >
                <textarea
                  rows={3}
                  value={address.fullAddress}
                  onChange={(e) =>
                    handleChange(
                      "fullAddress",
                      e.target.value
                    )
                  }
                  placeholder="House no, street, area, city, pincode"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* error */}
          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="text-center text-[11px] tracking-wide text-slate-400">
            Payment on each visit · Cash on delivery ·
            Cancel anytime
          </p>
        </div>

        {/* footer */}
        <div className="sticky bottom-0 border-t border-black/[0.05] bg-white px-8 py-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Creating subscription…
              </>
            ) : (
              <>
                Confirm Subscription
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===========================
   SHARED
=========================== */

function MinimalStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1.75rem] border border-black/[0.05] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div
        className={`text-5xl font-semibold leading-none tracking-[-0.07em] ${
          accent
            ? "text-orange-500"
            : "text-[#0f1720]"
        }`}
      >
        {value}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {label}
      </p>
    </div>
  );
}

function FeatureRow({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          accent
            ? "bg-orange-500/15"
            : "bg-emerald-500/10"
        }`}
      >
        <Check
          size={11}
          className={
            accent
              ? "text-orange-500"
              : "text-emerald-600"
          }
        />
      </div>

      <span
        className={`text-sm ${
          accent
            ? "font-medium text-orange-500"
            : "text-slate-600"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-black/20 focus:outline-none focus:ring-4 focus:ring-black/[0.03]";

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
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}

        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}