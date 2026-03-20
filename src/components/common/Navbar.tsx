import React, { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  /* ========================
     DEBOUNCED SEARCH
  ======================== */

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

        if (cancelled) {
          return;
        }

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];

        setResults(data);
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(delay);
    };
  }, [term]);

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

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <button onClick={() => goTo("/")}>
            <img
              src="https://res.cloudinary.com/du4ner2ab/image/upload/f_auto,q_auto,w_140/v1771519338/Untitled_design_13_1_dd7vux.png"
              alt="Logo"
              className="h-14 w-auto"
            />
          </button>

          {/* SEARCH */}
          <div className="hidden md:flex flex-1 justify-center px-10 relative">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              {term.length >= 2 && (
                <div
                  ref={dropdownRef}
                  className="absolute mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-50"
                >
                  {loading ? (
                    <div className="p-4 text-slate-500">
                      Searching...
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-slate-500">
                      No services found
                    </div>
                  ) : (
                    results.map((service) => (
                      <button
                        key={service.id}
                        onClick={() =>
                          handleNavigate(service.slug)
                        }
                        className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 text-left"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={service.images?.[0]}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-slate-900">
                            {service.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            ₹{service.price}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className={`transition-colors hover:text-blue-600 ${
                  location.pathname === "/" ? "text-blue-600" : ""
                }`}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                className={`transition-colors hover:text-blue-600 ${
                  location.pathname.startsWith("/blogs") ? "text-blue-600" : ""
                }`}
              >
                Blogs
              </Link>
            </div>

            <button
              onClick={() => goTo("/cart")}
              className="relative p-2 rounded-full hover:bg-slate-100"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => goTo("/profile")}
              className="hidden md:flex w-9 h-9 bg-slate-200 rounded-full items-center justify-center"
            >
              <User size={18} />
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-slate-100"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
          <div className="space-y-3">
            <button
              onClick={() => goTo("/")}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${
                location.pathname === "/"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => goTo("/blogs")}
              className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium ${
                location.pathname.startsWith("/blogs")
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              Blogs
            </button>

            <button
              onClick={() => goTo("/profile")}
              className="block w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
            >
              Profile
            </button>

            <button
              onClick={() => goTo("/cart")}
              className="block w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700"
            >
              Cart
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
