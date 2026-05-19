import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "../../assets/AFIXZ.png";
import { useCart } from "../../context/CartContext";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useLocationContext } from "../../context/LocationContext";
import { getLocationLabel } from "../../lib/locations";
import { isServiceAvailableInLocation, normalizeService } from "../../lib/services";

type Service = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images?: string[];
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  const { selectedLocation, openLocationPicker } = useLocationContext();

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /* click-outside: close search dropdown */
  useEffect(() => {
    if (term.length < 2) return;

    const handleOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        desktopSearchRef.current?.contains(t) ||
        mobileSearchRef.current?.contains(t)
      )
        return;
      setTerm("");
      setResults([]);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [term]);

  /* debounced Firestore search */
  useEffect(() => {
    let cancelled = false;

    const delay = setTimeout(async () => {
      if (term.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const q = query(
          collection(db, "services"),
          where("searchKeywords", "array-contains", term.toLowerCase()),
          limit(6)
        );

        const snapshot = await getDocs(q);
        if (cancelled) return;

        const data = snapshot.docs
          .map((entry) =>
            normalizeService(entry.id, entry.data() as Record<string, any>)
          )
          .filter((service) =>
            isServiceAvailableInLocation(service, selectedLocation)
          )
          .map((service) => ({
            id: service.id,
            title: service.title,
            slug: service.slug,
            price: service.price,
            images: service.images,
          })) as Service[];

        setResults(data);
      } catch (searchError) {
        console.error("Search failed:", searchError);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delay);
    };
  }, [selectedLocation, term]);

  const handleNavigate = (slug: string) => {
    setTerm("");
    setResults([]);
    setIsOpen(false);
    navigate(`/services/${slug}`);
  };

  const goTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const searchDropdown = term.length >= 2 && (
    <div className="absolute mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
      {loading ? (
        <div className="p-4 text-sm text-slate-500">Searching…</div>
      ) : results.length === 0 ? (
        <div className="p-4 text-sm text-slate-500">No services found</div>
      ) : (
        results.map((service) => (
          <button
            key={service.id}
            onClick={() => handleNavigate(service.slug)}
            className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <img
                src={service.images?.[0]}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {service.title}
              </p>
              <p className="text-xs font-semibold text-[#f36b21]">
                ₹{service.price}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Main row ── */}
        <div className="flex items-center justify-between h-14 md:h-20">

          {/* Logo */}
          <button onClick={() => goTo("/")} className="flex shrink-0 items-center">
            <img
              src={logoImg}
              alt="AfixZ"
              className="h-12 md:h-16 w-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-[1.02]"
            />
          </button>

          {/* Desktop search */}
          <div
            ref={desktopSearchRef}
            className="hidden md:flex flex-1 justify-center px-10 relative"
          >
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                aria-label="Search services"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search services…"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#f36b21] focus:border-transparent outline-none transition"
              />
              {searchDropdown}
            </div>
          </div>

          {/* Right — desktop items */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={openLocationPicker}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#f36b21]/40 hover:text-[#f36b21]"
            >
              <MapPin size={16} />
              {getLocationLabel(selectedLocation)}
            </button>

            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className={`transition-colors hover:text-[#f36b21] ${
                  location.pathname === "/" ? "text-[#f36b21]" : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/garden-care"
                className={`transition-colors hover:text-[#f36b21] ${
                  location.pathname === "/garden-care" ? "text-[#f36b21]" : ""
                }`}
              >
                Our Plans
              </Link>
              <Link
                to="/blogs"
                className={`transition-colors hover:text-[#f36b21] ${
                  location.pathname.startsWith("/blogs") ? "text-[#f36b21]" : ""
                }`}
              >
                Blogs
              </Link>
            </div>

            {/* Cart — desktop only */}
            <button
              onClick={() => goTo("/cart")}
              aria-label="Cart"
              className="relative hidden md:block p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f36b21] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => goTo("/profile")}
              aria-label="Profile"
              className="hidden md:flex w-9 h-9 bg-[#1f2933] rounded-full items-center justify-center text-white hover:bg-[#323f4b] transition-colors"
            >
              <User size={18} />
            </button>

            {/* Mobile hamburger — secondary nav only */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile search row ── */}
        <div ref={mobileSearchRef} className="md:hidden pb-2.5">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              aria-label="Search services"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search services…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#f36b21] focus:border-transparent outline-none transition"
            />
            {searchDropdown}
          </div>
        </div>
      </div>

      {/* ── Mobile secondary menu ── */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="space-y-2">
            <button
              onClick={openLocationPicker}
              className="flex w-full items-center gap-2 rounded-2xl bg-[#f36b21]/5 px-4 py-3 text-left text-sm font-medium text-[#1f2933] hover:bg-[#f36b21]/10 transition-colors"
            >
              <MapPin size={16} className="text-[#f36b21] shrink-0" />
              <span className="truncate">{getLocationLabel(selectedLocation)}</span>
            </button>

            <button
              onClick={() => goTo("/garden-care")}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                location.pathname === "/garden-care"
                  ? "bg-[#f36b21]/10 text-[#f36b21]"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Our Plans
            </button>

            <button
              onClick={() => goTo("/blogs")}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                location.pathname.startsWith("/blogs")
                  ? "bg-[#f36b21]/10 text-[#f36b21]"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Blogs
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
