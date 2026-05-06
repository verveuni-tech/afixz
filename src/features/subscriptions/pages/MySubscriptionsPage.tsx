import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ChevronRight, Loader2, Package } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { getUserSubscriptions, processDueSubscriptions } from "../lib";
import { Subscription } from "../types";
import SubscriptionCard from "../components/SubscriptionCard";

export default function MySubscriptionsPage() {
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    void load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const subs = await getUserSubscriptions(user.uid);
      subs.sort((a, b) => {
        const order = { active: 0, paused: 1, cancelled: 2 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
      setSubscriptions(subs);

      // Process due subscriptions silently after loading
      setProcessing(true);
      const count = await processDueSubscriptions(user.uid);
      if (count > 0) {
        setProcessedCount(count);
        // Reload to show updated nextScheduledDate
        const updated = await getUserSubscriptions(user.uid);
        updated.sort((a, b) => {
          const order = { active: 0, paused: 1, cancelled: 2 };
          return (order[a.status] ?? 3) - (order[b.status] ?? 3);
        });
        setSubscriptions(updated);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  };

  const handleUpdate = (id: string, patch: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const active = subscriptions.filter((s) => s.status === "active");
  const paused = subscriptions.filter((s) => s.status === "paused");
  const cancelled = subscriptions.filter((s) => s.status === "cancelled");

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28 text-sm text-slate-500">
        Please log in to view your subscriptions.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-slate-400">
          <Link to="/" className="transition hover:text-slate-600">Home</Link>
          <ChevronRight size={13} />
          <Link to="/profile" className="transition hover:text-slate-600">Profile</Link>
          <ChevronRight size={13} />
          <span className="font-medium text-slate-700">Subscriptions</span>
        </nav>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your recurring service visits.
            </p>
          </div>

          {processing && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 size={12} className="animate-spin" />
              Checking schedule…
            </div>
          )}
        </div>

        {/* Processed notification */}
        {processedCount > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✓ {processedCount} subscription{processedCount > 1 ? "s" : ""} auto-booked. Check{" "}
            <Link to="/profile" className="font-semibold underline">
              your bookings
            </Link>{" "}
            for details.
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <RefreshCw size={24} className="text-slate-300" />
            </div>
            <p className="text-base font-semibold text-slate-700">No subscriptions yet</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Subscribe to a service from its detail page to get recurring visits at your door.
            </p>
            <Link
              to="/services"
              className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Browse services
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {active.length > 0 && (
              <Section title="Active" count={active.length}>
                {active.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) => handleUpdate(s.id, patch)}
                  />
                ))}
              </Section>
            )}

            {paused.length > 0 && (
              <Section title="Paused" count={paused.length}>
                {paused.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) => handleUpdate(s.id, patch)}
                  />
                ))}
              </Section>
            )}

            {cancelled.length > 0 && (
              <Section title="Cancelled" count={cancelled.length}>
                {cancelled.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) => handleUpdate(s.id, patch)}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
        {title}
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
          {count}
        </span>
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
