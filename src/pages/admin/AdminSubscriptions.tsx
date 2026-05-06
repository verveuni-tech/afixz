import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAllSubscriptions, createBookingFromSubscription, updateSubscriptionStatus } from "../../features/subscriptions/lib";
import { Subscription, FREQUENCY_LABELS, SubscriptionStatus } from "../../features/subscriptions/types";
import { getLocationLabel } from "../../lib/locations";

type FilterStatus = "all" | SubscriptionStatus | "due";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const subs = await getAllSubscriptions();
      subs.sort((a, b) => a.nextScheduledDate.localeCompare(b.nextScheduledDate));
      setSubscriptions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceBook = async (sub: Subscription) => {
    setBusyId(sub.id);
    try {
      const bookingId = await createBookingFromSubscription(sub, sub.userId);
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? {
                ...s,
                lastBookingId: bookingId,
                nextScheduledDate: getNextDate(s.nextScheduledDate, s.frequency),
              }
            : s
        )
      );
      flash(`Booking created: ${bookingId.slice(0, 8)}`);
    } catch (err: any) {
      alert(err?.message || "Failed to create booking.");
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (sub: Subscription, status: SubscriptionStatus) => {
    setBusyId(sub.id);
    try {
      await updateSubscriptionStatus(sub.id, status);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status } : s))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = subscriptions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "due") return s.status === "active" && s.nextScheduledDate <= today;
    return s.status === filter;
  });

  const dueCount = subscriptions.filter(
    (s) => s.status === "active" && s.nextScheduledDate <= today
  ).length;

  const FILTERS: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "due", label: `Due today (${dueCount})` },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {/* Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View all customer subscriptions. Manually trigger bookings or update status.
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ {successMsg}
          </div>
        )}

        {/* Due alert */}
        {dueCount > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-700">
              <span className="font-semibold">{dueCount} subscription{dueCount > 1 ? "s" : ""}</span> due today.
              Click "Book now" to create bookings, or customers will auto-book when they next log in.
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
            <RefreshCw size={24} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Service</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Frequency</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Next date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => {
                  const isDue = sub.status === "active" && sub.nextScheduledDate <= today;
                  const isBusy = busyId === sub.id;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition hover:bg-slate-50 ${isDue ? "bg-amber-50/40" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{sub.serviceTitle}</p>
                        <p className="text-xs text-slate-400">₹{sub.price}/visit</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} />
                          {getLocationLabel(sub.locationId as import("../../lib/locations").LocationId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {FREQUENCY_LABELS[sub.frequency]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className={isDue ? "text-amber-500" : "text-slate-400"} />
                          <span className={`text-xs font-medium ${isDue ? "text-amber-700" : "text-slate-600"}`}>
                            {formatDate(sub.nextScheduledDate)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={10} />
                          {sub.preferredTime}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isBusy ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : (
                            <>
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleForceBook(sub)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                    isDue
                                      ? "bg-accent text-white hover:bg-accent-hover"
                                      : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  Book now
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
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getNextDate(from: string, frequency: string): string {
  const d = new Date(from + "T00:00:00");
  const days = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
