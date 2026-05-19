import React from "react";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const tabs = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutGrid, label: "Browse", href: "/services" },
  { icon: ShoppingCart, label: "Cart", href: "/cart" },
  { icon: User, label: "Profile", href: "/profile" },
] as const;

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { cart } = useCart();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-slate-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ icon: Icon, label, href }) => {
          const isActive =
            href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);
          const badge = href === "/cart" && cart.length > 0 ? cart.length : null;

          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-[#f36b21]" : "text-slate-400"
              }`}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.75} />
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-2 bg-[#f36b21] text-white font-bold leading-none min-w-[15px] h-[15px] flex items-center justify-center rounded-full text-[9px] px-0.5">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
