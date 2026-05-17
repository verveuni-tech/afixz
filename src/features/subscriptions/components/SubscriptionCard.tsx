import React, { useState } from "react";
import {
  Leaf,
  MapPin,
  Calendar,
  Clock,
  Pause,
  Play,
  X,
  Loader2,
} from "lucide-react";
import { Subscription } from "../types";
import { BILLING_CYCLE_LABELS } from "../plans";
import { getLocationLabel } from "../../../lib/locations";
import { updateSubscriptionStatus } from "../lib";
import type { LocationId } from "../../../lib/locations";

interface Props {
  subscription: Subscription;
  onUpdate: (updated: Partial<Subscription>) => void;
}

const SubscriptionCard: React.FC<Props> = ({ subscription: sub, onUpdate }) => {
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const isPaused = sub.status === "paused";
  const isCancelled = sub.status === "cancelled";
  const isExpired = sub.status === "expired";
  const isInactive = isCancelled || isExpired;

  const formatDate = (dateStr: string) =>
    dateStr
      ? new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  const handlePauseResume = async () => {
    setBusy(true);
    try {
      const nextStatus = isPaused ? "active" : "paused";
      await updateSubscriptionStatus(sub.id, nextStatus);
      onUpdate({ status: nextStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await updateSubscriptionStatus(sub.id, "cancelled");
      onUpdate({ status: "cancelled" });
      setConfirmCancel(false);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white transition ${
        isInactive
          ? "border-slate-100 opacity-60"
          : isPaused
          ? "border-amber-200"
          : "border-slate-200"
      }`}
    >
      {/* Top bar */}
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isInactive
                ? "bg-slate-100"
                : isPaused
                ? "bg-amber-50"
                : "bg-emerald-50"
            }`}
          >
            <Leaf
              size={16}
              className={
                isInactive
                  ? "text-slate-400"
                  : isPaused
                  ? "text-amber-500"
                  : "text-emerald-600"
              }
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Garden Care — {sub.planName}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {BILLING_CYCLE_LABELS[sub.billingCycle]} · ₹{sub.price}
              {sub.billingCycle !== "monthly"
                ? ` (₹${sub.pricePerMonth}/mo)`
                : "/mo"}
              {" · "}{sub.visitsPerMonth} visits/month
            </p>
          </div>
        </div>

        <StatusBadge status={sub.status} />
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <MapPin size={11} className="shrink-0" />
          {getLocationLabel(sub.locationId as LocationId)}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar size={11} className="shrink-0" />
          {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={11} className="shrink-0" />
          {sub.preferredTime}
        </span>
      </div>

      {/* Address snippet */}
      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        {sub.address.fullAddress}
      </div>

      {/* Actions */}
      {!isInactive && (
        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
          {busy ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {isPaused ? (
                  <>
                    <Play size={11} />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause size={11} />
                    Pause
                  </>
                )}
              </button>

              {confirmCancel ? (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-500">Are you sure?</span>
                  <button
                    onClick={handleCancel}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                  >
                    Yes, cancel
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:text-red-500"
                >
                  <X size={11} />
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    cancelled: "bg-slate-100 text-slate-500",
    expired: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
        map[status] ?? "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}
