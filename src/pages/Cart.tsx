import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneLogin from "../components/auth/PhoneLogin";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocationContext } from "../context/LocationContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { getLocationLabel } from "../lib/locations";
import { MapPin, ShoppingBag, Trash2, X, ChevronRight } from "lucide-react";

const CartContentSkeleton = () => (
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
    <div className="space-y-3 animate-pulse">
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
      <div className="h-5 w-28 rounded bg-slate-100" />
      <div className="mt-5 space-y-3">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-3/4 rounded bg-slate-100" />
      </div>
      <div className="mt-6 h-11 w-full rounded-lg bg-slate-100" />
    </div>
  </div>
);

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, totalPrice, loading } = useCart();
  const { user } = useAuth();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  } = useRequireAuth();

  const navigate = useNavigate();

  React.useEffect(() => {
    requireAuth(() => {});
  }, []);

  const locationMismatch = Boolean(
    selectedLocation &&
      cart.some((item) => item.locationId && item.locationId !== selectedLocation)
  );

  const renderContent = () => {
    if (loading) {
      return <CartContentSkeleton />;
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-slate-700">
            Please log in to view your cart
          </p>
        </div>
      );
    }

    if (cart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag size={24} className="text-slate-400" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-800">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add services to combine them in one visit.
          </p>
          <Link
            to="/"
            className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            Browse Services
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart Items */}
        <div className="space-y-3">
          {locationMismatch && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              Some services belong to another location. Switch back or remove them before checkout.
            </div>
          )}

          {cart.map((item) => (
            <div
              key={item.serviceId}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/service/${item.slug}`}
                    className="text-sm font-semibold text-slate-800 hover:text-slate-900"
                  >
                    {item.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-semibold text-accent">₹{item.price}</span>
                    {item.locationId && (
                      <span className="text-xs text-slate-400">
                        · {getLocationLabel(item.locationId)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.serviceId)}
                  className="flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="mt-1 text-xs text-slate-400 transition hover:text-red-500"
          >
            Clear all items
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-800">
              Order Summary
            </h2>

            {/* Location */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
              <MapPin size={13} className="shrink-0 text-slate-400" />
              <span className="flex-1 text-sm text-slate-600">
                {getLocationLabel(selectedLocation)}
              </span>
              <button
                onClick={openLocationPicker}
                className="text-xs font-medium text-accent hover:text-accent-hover"
              >
                Change
              </button>
            </div>

            {/* Line Items */}
            <div className="mt-5 space-y-3">
              {cart.map((item) => (
                <div key={item.serviceId} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-600 truncate">{item.title}</span>
                  <span className="shrink-0 font-medium text-slate-800">₹{item.price}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-between">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-lg font-bold text-accent">₹{totalPrice}</span>
            </div>

            {/* CTA */}
            <button
              onClick={() => navigate("/checkout")}
              disabled={locationMismatch}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Proceed to Checkout
              <ChevronRight size={15} />
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Cash on delivery available
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-white pb-20 pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <nav className="flex items-center gap-1 text-sm text-slate-400">
              <Link to="/" className="transition hover:text-slate-600">Home</Link>
              <ChevronRight size={13} />
              <span className="font-medium text-slate-700">Cart</span>
            </nav>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              Your Cart
            </h1>
            {cart.length > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                {cart.length} {cart.length === 1 ? "service" : "services"} selected
              </p>
            )}
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
            <PhoneLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
