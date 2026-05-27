import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  Package,
  Phone,
  MapPin,
  Clock,
  Filter,
  ChevronDown,
  Leaf,
  User,
  CheckCircle2,
  Circle,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type TypeTab = "one-time" | "subscription";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  price: number;
  totalPrice: number;
  locationId: string;
  address: Record<string, string> | string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  createdAt: Date;
  source?: string;
  completedBy?: string;
  claimedBy?: string;
  subscriptionId?: string;
  visitNumber?: number;
  totalVisits?: number;
}

interface SubGroup {
  subscriptionId: string;
  customerName: string;
  customerPhone: string;
  planTitle: string;
  locationId: string;
  visits: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  "on-hold": "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

function groupBySubscription(orders: Order[]): SubGroup[] {
  const map = new Map<string, SubGroup>();
  for (const o of orders) {
    const key = o.subscriptionId || o.id;
    if (!map.has(key)) {
      map.set(key, {
        subscriptionId: key,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        planTitle: o.serviceTitle,
        locationId: o.locationId,
        visits: [],
      });
    }
    map.get(key)!.visits.push(o);
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      visits: g.visits.sort((a, b) =>
        (a.visitNumber ?? 0) - (b.visitNumber ?? 0) ||
        a.scheduledDate.localeCompare(b.scheduledDate)
      ),
    }))
    .sort((a, b) => {
      // Sort: groups with pending visits first
      const aP = a.visits.filter((v) => v.status === "pending").length;
      const bP = b.visits.filter((v) => v.status === "pending").length;
      return bP - aP;
    });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeTab, setTypeTab] = useState<TypeTab>("one-time");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(500))
      );
      const loaded = bookingsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerName:   data.customerName   || "—",
          customerPhone:  data.customerPhone  || "—",
          serviceTitle:   data.serviceTitle   || "—",
          price:          data.price          || 0,
          totalPrice:     data.totalPrice     || 0,
          locationId:     data.locationId     || "—",
          address:        data.address        || "—",
          scheduledDate:  data.scheduledDate  || "—",
          scheduledTime:  data.scheduledTime  || "—",
          status:         data.status         || "pending",
          createdAt:      data.createdAt?.toDate?.() || new Date(),
          source:         data.source         || "booking",
          completedBy:    data.completedBy    || undefined,
          claimedBy:      data.claimedBy      || undefined,
          subscriptionId: data.subscriptionId || undefined,
          visitNumber:    data.visitNumber    || undefined,
          totalVisits:    data.totalVisits    || undefined,
        } as Order;
      });
      setOrders(loaded);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      await updateDoc(doc(db, "bookings", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  const isSubscription = (o: Order) =>
    o.source === "subscription" || !!o.subscriptionId;

  const byType = orders.filter((o) =>
    typeTab === "subscription" ? isSubscription(o) : !isSubscription(o)
  );

  // For one-time: apply status filter flat
  const filteredFlat = byType.filter((o) =>
    statusFilter === "all" ? true : o.status === statusFilter
  );

  // For subscription: group, then apply status filter at group level
  const subGroups = groupBySubscription(byType).map((g) => ({
    ...g,
    visits:
      statusFilter === "all"
        ? g.visits
        : g.visits.filter((v) => v.status === statusFilter),
  })).filter((g) => g.visits.length > 0);

  const counts = {
    "one-time":    orders.filter((o) => !isSubscription(o)).length,
    subscription:  orders.filter((o) => isSubscription(o)).length,
    pending:
      typeTab === "subscription"
        ? [...new Set(byType.filter((o) => o.status === "pending").map((o) => o.subscriptionId))].length
        : byType.filter((o) => o.status === "pending").length,
  };

  return (
    <div className="min-h-screen">

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">
              {counts.pending > 0 && (
                <span className="font-medium text-amber-600">{counts.pending} pending</span>
              )}
              {counts.pending > 0 && " · "}
              {orders.length} total bookings
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {/* Type tabs */}
        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(["one-time", "subscription"] as TypeTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeTab(t); setStatusFilter("all"); setExpandedId(null); }}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                typeTab === t ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t === "one-time" ? "One-time Orders" : "Subscription Visits"}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                {t === "subscription"
                  ? `${groupBySubscription(orders.filter((o) => isSubscription(o))).length} subs`
                  : counts[t]}
              </span>
              {typeTab === t && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Status:</span>
          {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading orders...</div>
        ) : typeTab === "subscription" ? (
          /* ── Subscription visits: grouped by subscription ── */
          subGroups.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">No subscription visits found</div>
          ) : (
            <div className="space-y-3">
              {subGroups.map((group) => (
                <SubscriptionGroupCard
                  key={group.subscriptionId}
                  group={group}
                  expanded={expandedId === group.subscriptionId}
                  onToggle={() =>
                    setExpandedId(
                      expandedId === group.subscriptionId ? null : group.subscriptionId
                    )
                  }
                  onStatusChange={(orderId, s) => updateStatus(orderId, s)}
                />
              ))}
            </div>
          )
        ) : (
          /* ── One-time orders: flat list ── */
          filteredFlat.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">No orders found</div>
          ) : (
            <div className="space-y-3">
              {filteredFlat.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expandedId === order.id}
                  onToggle={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  onStatusChange={(s) => updateStatus(order.id, s)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ── Subscription Group Card ─────────────────────────────── */

function SubscriptionGroupCard({
  group,
  expanded,
  onToggle,
  onStatusChange,
}: {
  group: SubGroup;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (orderId: string, status: string) => void;
}) {
  const pending   = group.visits.filter((v) => v.status === "pending").length;
  const completed = group.visits.filter((v) => v.status === "completed").length;
  const total     = group.visits.length;
  const nextVisit = group.visits.find((v) => v.status === "pending" || v.status === "confirmed");

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition hover:shadow-sm">
      {/* Group header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Leaf size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800">{group.customerName}</span>
            {pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                {pending} pending
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Phone size={10} />{group.customerPhone}</span>
            <span>{group.planTitle}</span>
            {nextVisit && (
              <span className="flex items-center gap-1">
                <Clock size={10} />Next: {formatDate(nextVisit.scheduledDate)}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-semibold text-slate-700">
            {completed}<span className="font-normal text-slate-400">/{total}</span>
          </p>
          <p className="text-xs text-slate-400">visits done</p>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Visit list */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Progress bar */}
          <div className="px-5 py-3 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>{completed} of {total} completed</span>
              <span className="font-medium">{Math.round((completed / total) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-emerald-400 transition-all"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {group.visits.map((visit) => (
              <VisitRow
                key={visit.id}
                visit={visit}
                onStatusChange={(s) => onStatusChange(visit.id, s)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VisitRow({
  visit,
  onStatusChange,
}: {
  visit: Order;
  onStatusChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const statusColor = STATUS_COLORS[visit.status] || STATUS_COLORS.pending;

  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-3">
        {/* Visit # indicator */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          {visit.status === "completed" ? (
            <CheckCircle2 size={16} className="text-emerald-500" />
          ) : visit.status === "cancelled" ? (
            <Circle size={16} className="text-slate-300" />
          ) : (
            <span className="text-[11px] font-bold text-slate-400">
              #{visit.visitNumber ?? "?"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{formatDate(visit.scheduledDate)}</span>
            <span className="text-xs text-slate-400">{visit.scheduledTime}</span>
            <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize ${statusColor}`}>
              {visit.status}
            </span>
          </div>
          {visit.claimedBy && (
            <p className="text-[11px] text-blue-600 mt-0.5">Claimed by: {visit.claimedBy}</p>
          )}
          {visit.completedBy && (
            <p className="text-[11px] text-emerald-600 mt-0.5">Done by: {visit.completedBy}</p>
          )}
        </div>

        {/* Quick status change */}
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-50"
        >
          Change
        </button>
      </div>

      {open && (
        <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { onStatusChange(s); setOpen(false); }}
              disabled={visit.status === s}
              className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                visit.status === s
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── One-time Order Card ─────────────────────────────────── */

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
}) {
  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const addr =
    typeof order.address === "object"
      ? [order.address.houseNo, order.address.area, order.address.city, order.address.pincode]
          .filter(Boolean)
          .join(", ")
      : order.address;

  return (
    <div className="rounded-xl border border-slate-200 bg-white transition hover:shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Package size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-800 truncate">{order.customerName}</span>
            <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${statusColor}`}>
              {order.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 truncate">{order.serviceTitle}</p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-semibold text-accent">₹{order.price}</p>
          <p className="text-xs text-slate-400">{dayjs(order.createdAt).fromNow()}</p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <DetailRow icon={<Phone size={14} />}  label="Phone"     value={order.customerPhone} />
            <DetailRow icon={<MapPin size={14} />} label="Address"   value={addr} />
            <DetailRow icon={<Clock size={14} />}  label="Scheduled" value={`${order.scheduledDate} at ${order.scheduledTime}`} />
            <DetailRow icon={<Package size={14} />} label="Amount"   value={`₹${order.totalPrice} (COD)`} />
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400">
                Order ID: <code className="font-mono">{order.id}</code>
              </p>
              {order.claimedBy   && <p className="text-xs text-blue-600 mt-1">Claimed by: {order.claimedBy}</p>}
              {order.completedBy && <p className="text-xs text-emerald-600 mt-1">Completed by: {order.completedBy}</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-xs font-medium text-slate-500">Change status:</span>
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                disabled={order.status === s}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                  order.status === s
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}
