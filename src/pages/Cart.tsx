import React from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { useNavigate, Link } from "react-router-dom";
import PhoneLogin from "../components/auth/PhoneLogin";

/* ================================
   SKELETON
================================ */

const CartContentSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-pulse">

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

      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
        <div className="h-12 w-full bg-slate-200 rounded-2xl" />
      </div>

    </div>
  );
};

/* ================================
   MAIN
================================ */

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart, totalPrice, loading } = useCart();
  const { user } = useAuth();
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

  const renderContent = () => {
    if (loading) {
      return <CartContentSkeleton />;
    }

    if (!user) {
      return (
        <div className="text-center mt-20">
          <h2 className="text-xl font-semibold text-slate-900">
            Please login to view your cart
          </h2>
        </div>
      );
    }

    if (cart.length === 0) {
      return (
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-slate-900">
            Your Cart is Empty
          </h2>
          <p className="mt-4 text-slate-600">
            Add services to combine them in one visit.
          </p>

          <Link
            to="/"
            className="inline-block mt-8 bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-blue-700 transition"
          >
            Browse Services
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 transition-opacity duration-300">

        {/* Service List */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div
              key={item.serviceId}
              className="bg-white rounded-3xl shadow p-6 flex justify-between items-center transition hover:shadow-lg"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-600 mt-2">
                  ₹{item.price}
                </p>
              </div>

              <button
                onClick={() =>
                  removeFromCart(item.serviceId)
                }
                className="text-red-500 text-sm font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-slate-500 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

            <h2 className="text-xl font-semibold text-slate-900">
              Order Summary
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.serviceId}
                  className="flex justify-between text-sm text-slate-600"
                >
                  <span>{item.title}</span>
                  <span>₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-slate-500 text-center">
              Cash on delivery available.
            </p>
          </div>
        </div>

      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900">
              Your Cart
            </h1>
            <p className="mt-3 text-slate-600">
              Review your selected services before checkout.
            </p>
          </div>

          {renderContent()}

        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm relative">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-3 right-3 text-sm"
            >
              ✕
            </button>
            <PhoneLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;