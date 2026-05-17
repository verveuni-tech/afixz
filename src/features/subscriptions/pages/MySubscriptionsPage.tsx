import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import { getUserSubscriptions } from "../lib";

import { Subscription } from "../types";

import SubscriptionCard from "../components/SubscriptionCard";

export default function MySubscriptionsPage() {
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user) return;

    void load();
  }, [user]);

  const load = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const subs = await getUserSubscriptions(
        user.uid
      );

      subs.sort((a, b) => {
        const order: Record<string, number> = {
          active: 0,
          paused: 1,
          expired: 2,
          cancelled: 3,
        };

        return (
          (order[a.status] ?? 4) -
          (order[b.status] ?? 4)
        );
      });

      setSubscriptions(subs);
    } catch (err) {
      console.error(
        "Failed to load subscriptions:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (
    id: string,
    patch: Partial<Subscription>
  ) => {
    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...patch }
          : s
      )
    );
  };

  const active = subscriptions.filter(
    (s) => s.status === "active"
  );

  const paused = subscriptions.filter(
    (s) => s.status === "paused"
  );

  const inactive = subscriptions.filter(
    (s) =>
      s.status === "cancelled" ||
      s.status === "expired"
  );

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28 text-sm text-slate-500">
        Please log in to view your
        subscriptions.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] pb-24 pt-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
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
            to="/profile"
            className="transition hover:text-slate-600"
          >
            Profile
          </Link>

          <ChevronRight size={13} />

          <span className="text-slate-700">
            Subscriptions
          </span>
        </nav>

        {/* header */}
        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-orange-500">
              Subscription Dashboard
            </p>

            <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.07em] text-[#0f1720]">
              My subscriptions
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-500">
              Manage your recurring service
              plans, monitor status, and keep
              track of upcoming maintenance
              visits.
            </p>
          </div>

          {/* stats */}
          {!loading &&
            subscriptions.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  value={active.length}
                  label="Active"
                />

                <StatCard
                  value={paused.length}
                  label="Paused"
                />

                <StatCard
                  value={inactive.length}
                  label="Inactive"
                />
              </div>
            )}
        </div>

        {/* loading */}
        {loading ? (
          <div className="mt-24 flex justify-center">
            <Loader2
              size={22}
              className="animate-spin text-slate-400"
            />
          </div>
        ) : subscriptions.length === 0 ? (
          /* empty state */
          <div className="mt-24 overflow-hidden rounded-[2.5rem] border border-black/[0.05] bg-white shadow-[0_20px_80px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center px-8 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-50">
                <Leaf
                  size={30}
                  className="text-orange-500"
                />
              </div>

              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-[#0f1720]">
                No active subscriptions
              </h2>

              <p className="mt-4 max-w-md text-[15px] leading-8 text-slate-500">
                Subscribe to a recurring garden
                care plan for professional
                maintenance, healthier plants,
                and ongoing outdoor upkeep.
              </p>

              <Link
                to="/garden-care"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-[#0f1720] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-black"
              >
                Explore Plans
              </Link>
            </div>
          </div>
        ) : (
          /* subscriptions */
          <div className="mt-16 space-y-12">
            {active.length > 0 && (
              <Section
                title="Active"
                count={active.length}
              >
                {active.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) =>
                      handleUpdate(
                        s.id,
                        patch
                      )
                    }
                  />
                ))}
              </Section>
            )}

            {paused.length > 0 && (
              <Section
                title="Paused"
                count={paused.length}
              >
                {paused.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) =>
                      handleUpdate(
                        s.id,
                        patch
                      )
                    }
                  />
                ))}
              </Section>
            )}

            {inactive.length > 0 && (
              <Section
                title="Inactive"
                count={inactive.length}
              >
                {inactive.map((s) => (
                  <SubscriptionCard
                    key={s.id}
                    subscription={s}
                    onUpdate={(patch) =>
                      handleUpdate(
                        s.id,
                        patch
                      )
                    }
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

/* ======================================
   SECTION
====================================== */

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
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-[#0f1720]">
            {title}
          </h2>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {count}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

/* ======================================
   STATS
====================================== */

function StatCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-black/[0.05] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div className="text-3xl font-semibold tracking-[-0.06em] text-[#0f1720]">
        {value}
      </div>

      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
    </div>
  );
}