import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Loader2,
  MapPin,
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Leaf,
  ShoppingCart,
  ArrowLeft,
  LogOut,
  ChevronDown,
  Users,
} from "lucide-react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  increment,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import { getLocationLabel } from "../../../lib/locations";
import type { LocationId } from "../../../lib/locations";

interface Booking {
  id: string;
  userId: string;
  serviceTitle: string;
  serviceSlug: string;
  price: number;
  totalPrice: number;
  locationId: string;
  address: any;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  subscriptionId?: string;
  visitNumber?: number;
  totalVisits?: number;
  source?: string;
  claimedBy?: string;
  completedBy?: string;
  completedAt?: any;
  createdAt?: any;
}

interface CustomerGroup {
  key: string;           // customerPhone (stable identifier)
  customerName: string;
  customerPhone: string;
  bookings: Booking[];
}

type FilterTab = "customers" | "all" | "pending" | "confirmed" | "mine" | "completed";

function groupByCustomer(bookings: Booking[]): CustomerGroup[] {
  const map = new Map<string, CustomerGroup>();
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "on-hold") continue;
    const key = b.customerPhone || b.userId || b.id;
    if (!map.has(key)) {
      map.set(key, {
        key,
        customerName:  b.customerName  || "Unknown",
        customerPhone: b.customerPhone || "—",
        bookings: [],
      });
    }
    map.get(key)!.bookings.push(b);
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      bookings: g.bookings.sort((a, b) =>
        a.scheduledDate.localeCompare(b.scheduledDate)
      ),
    }))
    .sort((a, b) => {
      // Customers with pending bookings first
      const aP = a.bookings.filter((x) => x.status === "pending").length;
      const bP = b.bookings.filter((x) => x.status === "pending").length;
      return bP - aP;
    });
}

export default function ProviderDashboard() {
  const { user, profile, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterTab>("customers");
  const [busyId, setBusyId]     = useState<string | null>(null);
  const [providerName, setProviderName] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const displayName = profile?.displayName || user?.displayName || "Provider";

  useEffect(() => { void load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      // Server-side: only active statuses, exclude cancelled/on-hold
      // Completed loaded separately to avoid massive reads
      const activeQ = query(
        collection(db, "bookings"),
        where("status", "in", ["pending", "confirmed"]),
        orderBy("scheduledDate", "asc")
      );
      const completedQ = query(
        collection(db, "bookings"),
        where("status", "==", "completed"),
        orderBy("scheduledDate", "asc")
      );
      const [activeSnap, completedSnap] = await Promise.all([
        getDocs(activeQ),
        getDocs(completedQ),
      ]);
      const all = [
        ...activeSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)),
        ...completedSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking)),
      ];
      setBookings(all);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (booking: Booking) => {
    const name = providerName.trim() || displayName;
    if (!name) return;
    setBusyId(booking.id);
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        claimedBy: name, status: "confirmed",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, claimedBy: name, status: "confirmed" } : b
        )
      );
    } catch (err) { console.error(err); }
    finally { setBusyId(null); }
  };

  const handleComplete = async (booking: Booking) => {
    const name = booking.claimedBy || providerName.trim() || displayName;
    setBusyId(booking.id);
    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "completed", completedBy: name, completedAt: serverTimestamp(),
      });
      // Increment completedVisits on subscription if this is a subscription visit
      if (booking.subscriptionId) {
        await updateDoc(doc(db, "subscriptions", booking.subscriptionId), {
          completedVisits: increment(1),
        });
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: "completed", completedBy: name, completedAt: new Date() }
            : b
        )
      );
    } catch (err) { console.error(err); }
    finally { setBusyId(null); }
  };

  const today = new Date().toISOString().split("T")[0];

  // Flat filtered views (exclude on-hold from all provider views)
  const visibleBookings = bookings.filter(
    (b) => b.status !== "on-hold" && b.status !== "cancelled"
  );

  const filtered = (() => {
    if (filter === "all")       return visibleBookings;
    if (filter === "pending")   return visibleBookings.filter((b) => b.status === "pending");
    if (filter === "confirmed") return visibleBookings.filter((b) => b.status === "confirmed");
    if (filter === "completed") return bookings.filter((b) => b.status === "completed");
    if (filter === "mine") {
      const name = providerName.trim() || displayName;
      return bookings.filter((b) => b.claimedBy === name || b.completedBy === name);
    }
    return visibleBookings;
  })();

  const pendingCount   = visibleBookings.filter((b) => b.status === "pending").length;
  const confirmedCount = visibleBookings.filter((b) => b.status === "confirmed").length;

  const customerGroups = groupByCustomer(bookings);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "customers",  label: `By Customer (${customerGroups.length})` },
    { key: "all",        label: "All" },
    { key: "pending",    label: `Pending (${pendingCount})` },
    { key: "confirmed",  label: `Confirmed (${confirmedCount})` },
    { key: "mine",       label: "My Jobs" },
    { key: "completed",  label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 transition hover:text-slate-600">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Job Dashboard</h1>
              <p className="text-xs text-slate-500">Hi, {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw size={12} /> Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-red-500"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Provider name */}
        <div className="mb-5 flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500">Your name:</label>
          <input
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder={displayName}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <span className="text-[11px] text-slate-400">Used when claiming/completing jobs</span>
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setExpandedCustomer(null); }}
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

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : filter === "customers" ? (
          /* ── Grouped by customer ── */
          customerGroups.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <Users size={28} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No active jobs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerGroups.map((group) => (
                <CustomerGroupCard
                  key={group.key}
                  group={group}
                  today={today}
                  busyId={busyId}
                  expanded={expandedCustomer === group.key}
                  onToggle={() =>
                    setExpandedCustomer(
                      expandedCustomer === group.key ? null : group.key
                    )
                  }
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                />
              ))}
            </div>
          )
        ) : (
          /* ── Flat view ── */
          filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <CheckCircle2 size={28} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No jobs found</p>
              <p className="mt-1 text-xs text-slate-400">Try a different filter or refresh.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((booking) => (
                <JobCard
                  key={booking.id}
                  booking={booking}
                  today={today}
                  busy={busyId === booking.id}
                  onClaim={() => handleClaim(booking)}
                  onComplete={() => handleComplete(booking)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ── Customer Group Card ─────────────────────────────────── */

function CustomerGroupCard({
  group,
  today,
  busyId,
  expanded,
  onToggle,
  onClaim,
  onComplete,
}: {
  group: CustomerGroup;
  today: string;
  busyId: string | null;
  expanded: boolean;
  onToggle: () => void;
  onClaim: (b: Booking) => void;
  onComplete: (b: Booking) => void;
}) {
  const pending   = group.bookings.filter((b) => b.status === "pending").length;
  const confirmed = group.bookings.filter((b) => b.status === "confirmed").length;
  const subCount  = new Set(group.bookings.filter((b) => b.subscriptionId).map((b) => b.subscriptionId)).size;

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition hover:shadow-sm">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <User size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">{group.customerName}</span>
            {pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {pending} pending
              </span>
            )}
            {confirmed > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                {confirmed} confirmed
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Phone size={10} />{group.customerPhone}</span>
            {subCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Leaf size={10} />{subCount} subscription{subCount > 1 ? "s" : ""}
              </span>
            )}
            <span>{group.bookings.length} total visits</span>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Bookings */}
      {expanded && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {group.bookings.map((booking) => (
            <div key={booking.id} className="px-4 py-3 sm:px-5">
              <JobCard
                booking={booking}
                today={today}
                busy={busyId === booking.id}
                onClaim={() => onClaim(booking)}
                onComplete={() => onComplete(booking)}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Individual Job Card ─────────────────────────────────── */

function JobCard({
  booking,
  today,
  busy,
  onClaim,
  onComplete,
  compact = false,
}: {
  booking: Booking;
  today: string;
  busy: boolean;
  onClaim: () => void;
  onComplete: () => void;
  compact?: boolean;
}) {
  const isSubscription = booking.source === "subscription" || !!booking.subscriptionId;
  const isDueToday     = booking.scheduledDate <= today && booking.status !== "completed" && booking.status !== "cancelled";
  const isCompleted    = booking.status === "completed";
  const isCancelled    = booking.status === "cancelled";

  const addressText =
    typeof booking.address === "string"
      ? booking.address
      : booking.address?.fullAddress || booking.address?.line1 || "—";

  return (
    <div
      className={`rounded-xl border bg-white transition ${
        compact ? "border-0 rounded-none" :
        isCancelled  ? "border-slate-100 opacity-50" :
        isCompleted  ? "border-emerald-100" :
        isDueToday   ? "border-amber-200 bg-amber-50/30" :
        "border-slate-200"
      }`}
    >
      <div className={`flex items-start justify-between gap-3 ${compact ? "py-1" : "p-4 sm:p-5"}`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800">{booking.serviceTitle}</p>
            {booking.visitNumber && (
              <span className="text-[10px] text-slate-400">visit #{booking.visitNumber}</span>
            )}
            {isSubscription ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <Leaf size={9} /> Subscription
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                <ShoppingCart size={9} /> One-time
              </span>
            )}
          </div>

          {!compact && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {booking.customerName && (
                <span className="flex items-center gap-1"><User size={10} /> {booking.customerName}</span>
              )}
              {booking.customerPhone && (
                <span className="flex items-center gap-1"><Phone size={10} /> {booking.customerPhone}</span>
              )}
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {getLocationLabel(booking.locationId as LocationId)}
              </span>
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar size={10} className={isDueToday ? "text-amber-500" : ""} />
              <span className={isDueToday ? "font-medium text-amber-700" : ""}>
                {formatDate(booking.scheduledDate)}
              </span>
            </span>
            <span className="flex items-center gap-1"><Clock size={10} /> {booking.scheduledTime}</span>
          </div>

          {!compact && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-1">{addressText}</p>
          )}

          {booking.claimedBy && !isCompleted && (
            <p className="mt-1.5 text-[11px] font-medium text-blue-600">Claimed by: {booking.claimedBy}</p>
          )}
          {isCompleted && booking.completedBy && (
            <p className="mt-1.5 text-[11px] font-medium text-emerald-600">Done by: {booking.completedBy}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={booking.status} />
          <span className="text-sm font-semibold text-slate-700">₹{booking.price}</span>
        </div>
      </div>

      {!isCompleted && !isCancelled && (
        <div className={`flex items-center gap-2 border-t border-slate-100 ${compact ? "px-0 py-2" : "px-4 py-3 sm:px-5"}`}>
          {busy ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : (
            <>
              {booking.status === "pending" && (
                <button
                  onClick={onClaim}
                  className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent/10"
                >
                  Claim & Confirm
                </button>
              )}
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <button
                  onClick={onComplete}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                >
                  Mark Completed
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   "bg-amber-50 text-amber-700",
    confirmed: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-500",
    "on-hold": "bg-slate-100 text-slate-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
