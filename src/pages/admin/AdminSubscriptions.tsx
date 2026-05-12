import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Leaf,
  CalendarPlus,
  Database,
} from "lucide-react";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  getAllSubscriptions,
  updateSubscriptionStatus,
  generateVisitBooking,
  seedPlansToFirestore,
} from "../../features/subscriptions/lib";
import { Subscription, SubscriptionStatus } from "../../features/subscriptions/types";
import { BILLING_CYCLE_LABELS } from "../../features/subscriptions/plans";
import { getLocationLabel } from "../../lib/locations";
import type { LocationId } from "../../lib/locations";

type FilterStatus = "all" | SubscriptionStatus;

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [seeding, setSeeding] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const subs = await getAllSubscriptions();
      const order: Record<string, number> = { active: 0, paused: 1, expired: 2, cancelled: 3 };
      subs.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4));
      setSubscriptions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sub: Subscription, status: SubscriptionStatus) => {
    setBusyId(sub.id);
    try {
      await updateSubscriptionStatus(sub.id, status);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status } : s))
      );
      flash(`${sub.customerName || "Subscription"} → ${status}`);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const handleGenerateVisit = async (sub: Subscription) => {
    setBusyId(sub.id);
    try {
      const bookingId = await generateVisitBooking(sub);
      // Update local nextVisitDate (+15 days)
      const next = new Date(sub.nextVisitDate);
      next.setDate(next.getDate() + 15);
      const nextStr = next.toISOString().split("T")[0];
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, nextVisitDate: nextStr } : s))
      );
      flash(`Visit booking created: ${bookingId.slice(0, 8)}`);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to generate visit");
    } finally {
      setBusyId(null);
    }
  };

  const handleSeedPlans = async () => {
    setSeeding(true);
    try {
      await seedPlansToFirestore();
      flash("Plans seeded to Firestore");
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = subscriptions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const counts = {
    active: subscriptions.filter((s) => s.status === "active").length,
    paused: subscriptions.filter((s) => s.status === "paused").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    expired: subscriptions.filter((s) => s.status === "expired").length,
  };

  const dueVisits = subscriptions.filter(
    (s) => s.status === "active" && s.nextVisitDate <= today
  ).length;

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: `All (${subscriptions.length})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "paused", label: `Paused (${counts.paused})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
    { key: "expired", label: `Expired (${counts.expired})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage Flying Mali plan subscriptions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedPlans}
              disabled={seeding}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <Database size={12} />
              {seeding ? "Seeding..." : "Seed Plans"}
            </button>
            <button
              onClick={load}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ {successMsg}
          </div>
        )}

        {/* Due visits alert */}
        {dueVisits > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <CalendarPlus size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{dueVisits} subscription{dueVisits > 1 ? "s" : ""}</span>{" "}
              have visits due. Click "Generate Visit" to create bookings for providers.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition ${
                filter === key
                  ? "border-slate-800 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Leaf size={24} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Plan</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Period</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Next Visit</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => {
                  const isBusy = busyId === sub.id;
                  const visitDue = sub.status === "active" && sub.nextVisitDate <= today;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition hover:bg-slate-50 ${visitDue ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{sub.customerName || "—"}</p>
                        <p className="text-xs text-slate-400">{sub.customerPhone || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{sub.planName}</p>
                        <p className="text-xs text-slate-400">
                          {BILLING_CYCLE_LABELS[sub.billingCycle]} · ₹{sub.price}
                          {sub.billingCycle !== "monthly" && ` (₹${sub.pricePerMonth}/mo)`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} />
                          {getLocationLabel(sub.locationId as LocationId)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={10} />
                          {sub.preferredTime} · {sub.visitsPerMonth} visits/mo
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {sub.status === "active" ? (
                          <span
                            className={`text-xs font-medium ${
                              visitDue ? "text-amber-700" : "text-slate-600"
                            }`}
                          >
                            {formatDate(sub.nextVisitDate)}
                            {visitDue && (
                              <span className="ml-1 text-[10px] font-semibold text-amber-600">DUE</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {isBusy ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : (
                            <>
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleGenerateVisit(sub)}
                                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    visitDue
                                      ? "bg-accent text-white hover:bg-accent-hover"
                                      : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <CalendarPlus size={11} />
                                  Generate Visit
                                </button>
                              )}
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleStatusChange(sub, "paused")}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  Pause
                                </button>
                              )}
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleStatusChange(sub, "cancelled")}
                                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                                >
                                  Cancel
                                </button>
                              )}
                              {sub.status === "paused" && (
                                <button
                                  onClick={() => handleStatusChange(sub, "active")}
                                  className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                                >
                                  Resume
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    cancelled: "bg-slate-100 text-slate-500",
    expired: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
