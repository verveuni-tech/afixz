import { useEffect, useRef, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import AdminHeader from "../../components/admin/AdminHeader";
import { UserProfile, useAuth } from "../../context/AuthContext";
import { Download, Loader2, Search, Users, ShieldCheck, ShieldOff } from "lucide-react";

const PAGE_SIZE = 25;
const API_BASE = import.meta.env.VITE_API_BASE || "";

type RoleTab = "user" | "provider";
type UserRow = UserProfile & { id: string };

function formatDate(ts: any): string {
  if (!ts) return "—";
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return "—"; }
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin:    "bg-red-100 text-red-700",
    provider: "bg-violet-100 text-violet-700",
    user:     "bg-slate-100 text-slate-600",
  };
  return map[role] ?? "bg-slate-100 text-slate-600";
}

export default function AdminUsers() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab]   = useState<RoleTab>("user");
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const [search, setSearch]         = useState("");
  const [busyUid, setBusyUid]       = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const lastDoc = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  async function fetchUsers(loadMore = false, role: RoleTab = activeTab) {
    if (loadMore) setLoadingMore(true);
    else setLoading(true);
    try {
      const base = [
        collection(db, "users"),
        where("role", "==", role),
        orderBy("createdAt", "desc"),
      ] as const;
      const q = loadMore && lastDoc.current
        ? query(...base, startAfter(lastDoc.current), limit(PAGE_SIZE))
        : query(...base, limit(PAGE_SIZE));
      const snap = await getDocs(q);
      const batch: UserRow[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as UserProfile) }));
      if (loadMore) setUsers((prev) => [...prev, ...batch]);
      else setUsers(batch);
      lastDoc.current = snap.docs[snap.docs.length - 1] ?? null;
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    lastDoc.current = null;
    setSearch("");
    void fetchUsers(false, activeTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function setRole(targetUid: string, role: "provider", action: "grant" | "revoke") {
    if (!authUser) return;
    setBusyUid(targetUid);
    try {
      const idToken = await authUser.getIdToken();
      const res = await fetch(`${API_BASE}/api/set-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: targetUid, role, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      flash(
        action === "grant"
          ? `Provider claim granted. User must log out & back in to sync.`
          : `Provider claim revoked.`,
        true
      );

      // Optimistically move user out of current tab
      if (action === "revoke" && activeTab === "provider") {
        setUsers((prev) => prev.filter((u) => u.id !== targetUid));
      }
    } catch (err: any) {
      flash(err.message || "Failed to update role", false);
    } finally {
      setBusyUid(null);
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  }

  function exportCsv() {
    const rows = [
      ["Name", "Phone", "Email", "Role", "Provider", "Joined"],
      ...filtered.map((u) => [
        u.displayName || "—",
        u.phone       || "—",
        u.email       || "—",
        u.role        || "user",
        u.provider    || "—",
        formatDate(u.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `afixz-users-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter((u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    : users;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">

        {/* Toast */}
        {toast && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            toast.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {toast.ok ? "✓" : "✗"} {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-800 md:text-2xl">
              <Users size={20} className="text-slate-500" />
              Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {users.length} {activeTab === "provider" ? "providers" : "users"} loaded
            </p>
          </div>
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:shadow-sm disabled:opacity-40"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(["user", "provider"] as RoleTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "user" ? "Users" : "Providers"}
              {activeTab === tab && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Search size={15} className="shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin mr-2" /> Loading users…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              {search ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Provider</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((u) => {
                    const isBusy = busyUid === u.id;
                    return (
                      <tr key={u.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {u.displayName || <span className="text-slate-400 font-normal">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 tabular-nums">
                          {u.phone ? (
                            <a href={`tel:${u.phone}`} className="hover:text-primary hover:underline">{u.phone}</a>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {u.email ? (
                            <a href={`mailto:${u.email}`} className="hover:text-primary hover:underline truncate block max-w-[200px]">{u.email}</a>
                          ) : <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(u.role)}`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 capitalize">
                          {u.provider?.replace("google.com", "Google") || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 tabular-nums whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          {isBusy ? (
                            <Loader2 size={14} className="animate-spin text-slate-400" />
                          ) : activeTab === "user" ? (
                            /* Users tab: grant provider */
                            <button
                              onClick={() => setRole(u.id, "provider", "grant")}
                              title="Grant provider access"
                              className="flex items-center gap-1.5 rounded-lg border border-violet-200 px-2.5 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-50"
                            >
                              <ShieldCheck size={12} /> Make Provider
                            </button>
                          ) : (
                            /* Providers tab: revoke */
                            <button
                              onClick={() => setRole(u.id, "provider", "revoke")}
                              title="Revoke provider access"
                              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <ShieldOff size={12} /> Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Load more */}
        {!loading && hasMore && !search && (
          <div className="mt-4 text-center">
            <button
              onClick={() => void fetchUsers(true, activeTab)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:shadow-sm disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
