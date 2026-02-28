import React, { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../context/AuthContext";
import PhoneLogin from "../auth/PhoneLogin";

interface Props {
  serviceId: string;
  title: string;
  price: number;
  slug: string;
}

const AddToCartBlock: React.FC<Props> = ({
  serviceId,
  title,
  price,
  slug,
}) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();

  const {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  } = useRequireAuth();

  const [loading, setLoading] = useState(false);

  const isInCart = useMemo(() => {
    return cart.some((item) => item.serviceId === serviceId);
  }, [cart, serviceId]);

  const handleAdd = () => {
    requireAuth(async () => {
      if (!user || isInCart) return;

      try {
        setLoading(true);

        await addToCart({
          serviceId,
          title,
          price,
          slug,
        });

      } catch (err) {
        console.error("Add to cart failed:", err);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">

        {/* Price */}
        <div>
          <p className="text-xs uppercase text-slate-500">
            Starting Price
          </p>
          <span className="text-4xl font-bold text-slate-900">
            ₹{price}
          </span>
        </div>

        {/* Add Button */}
        {!isInCart && (
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        )}

        {/* Persistent Confirmation */}
        {isInCart && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
            <p className="text-green-700 font-medium">
              ✓ This service is in your cart
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  window.location.assign("/cart")
                }
                className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm"
              >
                Go to Cart
              </button>

              <button
                onClick={() =>
                  removeFromCart(serviceId)
                }
                className="flex-1 border border-green-300 text-green-700 py-3 rounded-xl text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 text-center">
          Combine multiple services in one visit.
        </p>
      </div>

      {/* Login Modal */}
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

export default AddToCartBlock;