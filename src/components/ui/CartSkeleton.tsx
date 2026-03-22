import React from "react";

const CartSkeleton = () => {
  return (
    <div className="min-h-screen bg-white pb-20 pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-3 w-32 rounded bg-slate-100" />
          <div className="mt-4 h-7 w-36 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] animate-pulse">
          {/* Left skeleton */}
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2.5">
                    <div className="h-4 w-44 rounded bg-slate-100" />
                    <div className="h-3 w-20 rounded bg-slate-100" />
                  </div>
                  <div className="h-8 w-16 rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-28 rounded bg-slate-100" />
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-10 w-full rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
