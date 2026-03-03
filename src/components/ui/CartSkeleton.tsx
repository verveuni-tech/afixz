import React from "react";

const CartSkeleton = () => {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header skeleton */}
        <div className="mb-12 animate-pulse">
          <div className="h-10 w-40 bg-slate-200 rounded" />
          <div className="h-4 w-72 bg-slate-200 rounded mt-3" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-pulse">

          {/* Left skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl shadow p-6 space-y-4"
              >
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-200 rounded-2xl" />
          </div>

        </div>

      </div>
    </div>
  );
};

export default CartSkeleton;