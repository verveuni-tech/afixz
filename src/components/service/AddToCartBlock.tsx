import React, { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { useAuth } from "../../context/AuthContext";
import AuthLogin from "../auth/AuthLogin";
import { useLocationContext } from "../../context/LocationContext";
import { getLocationLabel } from "../../lib/locations";
import { MapPin, ShoppingCart, Trash2, X, RefreshCw, Check } from "lucide-react";
import SubscribeModal from "../../features/subscriptions/components/SubscribeModal";
import { Link } from "react-router-dom";

interface Props {
  serviceId: string;
  title: string;
  price: number;
  slug: string;
  availableInLocation: boolean;
}

type Tab = "book" | "subscribe";

const AddToCartBlock: React.FC<Props> = ({
  serviceId,
  title,
  price,
  slug,
  availableInLocation,
}) => {
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const { selectedLocation, openLocationPicker } = useLocationContext();

  const {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  } = useRequireAuth();

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("book");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const isInCart = useMemo(
    () => cart.some((item) => item.serviceId === serviceId),
    [cart, serviceId]
  );

  const handleAdd = () => {
    requireAuth(async () => {
      if (!user || isInCart) return;
      if (!selectedLocation) {
        openLocationPicker();
        return;
      }
      try {
        setLoading(true);
        await addToCart({ serviceId, title, price, slug, locationId: selectedLocation });
      } catch (err) {
        console.error("Add to cart failed:", err);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSubscribeClick = () => {
    requireAuth(() => {
      if (!selectedLocation) {
        openLocationPicker();
        return;
      }
      setShowSubscribeModal(true);
    });
  };

  const handleSubscribeSuccess = () => {
    setShowSubscribeModal(false);
    setSubscribeSuccess(true);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {/* Price */}
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Starting at</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-accent">₹{price}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-slate-100" />

        {/* Location */}
        <div className="flex items-center gap-2.5 rounded-lg bg-accent/5 px-3.5 py-2.5">
          <MapPin size={14} className="shrink-0 text-accent" />
          <div className="flex-1 text-sm">
            <span className="text-slate-500">Location: </span>
            <span className="font-medium text-slate-700">{getLocationLabel(selectedLocation)}</span>
          </div>
          <button
            onClick={openLocationPicker}
            className="text-xs font-medium text-accent transition hover:text-accent-hover"
          >
            Change
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 flex rounded-lg border border-slate-200 p-0.5">
          <TabBtn active={tab === "book"} onClick={() => setTab("book")}>
            <ShoppingCart size={13} />
            Book once
          </TabBtn>
          <TabBtn active={tab === "subscribe"} onClick={() => setTab("subscribe")}>
            <RefreshCw size={13} />
            Subscribe
          </TabBtn>
        </div>

        {/* Actions */}
        <div className="mt-3 space-y-3">
          {!selectedLocation && (
            <button
              type="button"
              onClick={openLocationPicker}
              className="w-full rounded-lg border border-accent/20 bg-accent/5 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10"
            >
              Choose location to continue
            </button>
          )}

          {selectedLocation && !availableInLocation && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
              Unavailable in this location. Switch your city from the header.
            </div>
          )}

          {selectedLocation && availableInLocation && tab === "book" && (
            <>
              {!isInCart ? (
                <button
                  onClick={handleAdd}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
                >
                  <ShoppingCart size={15} />
                  {loading ? "Adding…" : "Add to Cart"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-lg bg-emerald-50 px-4 py-2.5 text-center text-sm font-medium text-emerald-700">
                    ✓ In your cart
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.location.assign("/cart")}
                      className="rounded-lg bg-primary py-2.5 text-xs font-medium text-white transition hover:bg-primary-hover"
                    >
                      Go to Cart
                    </button>
                    <button
                      onClick={() => removeFromCart(serviceId)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {selectedLocation && availableInLocation && tab === "subscribe" && (
            <>
              {subscribeSuccess ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                    <Check size={14} className="inline mr-1" />
                    Subscription created!
                  </div>
                  <Link
                    to="/subscriptions"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={12} />
                    Manage subscriptions
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleSubscribeClick}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw size={15} />
                  Subscribe — ₹{price}/visit
                </button>
              )}
              <p className="text-center text-[11px] text-slate-400">
                Recurring visits · COD · Cancel anytime
              </p>
            </>
          )}
        </div>

        {/* Footer note (only on book tab) */}
        {tab === "book" && (
          <p className="mt-4 text-center text-[11px] text-slate-400">
            Combine multiple services in one visit.
          </p>
        )}
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <SubscribeModal
          serviceId={serviceId}
          serviceTitle={title}
          serviceSlug={slug}
          price={price}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={handleSubscribeSuccess}
        />
      )}

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
            <AuthLogin onSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </>
  );
};

export default AddToCartBlock;

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
