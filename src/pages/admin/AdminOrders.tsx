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
import { db } from "../../firebase";
import AdminHeader from "../../components/admin/AdminHeader";
import { Package, Phone, MapPin, Clock, Filter, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

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
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const bookingsSnap = await getDocs(
        query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(200))
      );

      const loaded = bookingsSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerName: data.customerName || "—",
          customerPhone: data.customerPhone || "—",
          serviceTitle: data.serviceTitle || "—",
          price: data.price || 0,
          totalPrice: data.totalPrice || 0,
          locationId: data.locationId || "—",
          address: data.address || "—",
          scheduledDate: data.scheduledDate || "—",
          scheduledTime: data.scheduledTime || "—",
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      setOrders(loaded);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(order: Order, newStatus: string) {
    try {
      await updateDoc(doc(db, "bookings", order.id), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
              Orders
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {counts.pending > 0 && (
                <span className="font-medium text-amber-600">
                  {counts.pending} pending
                </span>
              )}
              {counts.pending > 0 && " · "}
              {counts.all} total orders
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
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

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-medium">Failed to load orders</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400">No orders found</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onStatusChange={(s) => updateStatus(order, s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
      {/* Header row */}
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

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <DetailRow icon={<Phone size={14} />} label="Phone" value={order.customerPhone} />
            <DetailRow icon={<MapPin size={14} />} label="Address" value={addr} />
            <DetailRow icon={<Clock size={14} />} label="Scheduled" value={`${order.scheduledDate} at ${order.scheduledTime}`} />
            <DetailRow icon={<Package size={14} />} label="Amount" value={`₹${order.totalPrice} (COD)`} />
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400">
                Order ID: <code className="font-mono">{order.id}</code>
              </p>
            </div>
          </div>

          {/* Status change */}
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
