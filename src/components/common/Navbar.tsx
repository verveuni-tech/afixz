import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Cleaning", href: "#cleaning" },
    { name: "Repair", href: "#repair" },
    { name: "Beauty", href: "#beauty" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">

          {/* Left Section */}
          <div className="flex items-center gap-6">

            {/* Logo */}
            <a href="/" className="flex items-center">
              <img
                src="https://res.cloudinary.com/du4ner2ab/image/upload/f_auto,q_auto,w_140/v1771519338/Untitled_design_13_1_dd7vux.png"
                alt="AfixZ Logo"
                width={56}
                height={56}
                loading="eager"
                decoding="async"
                className="h-14 w-auto"
              />
            </a>

            {/* Desktop Categories */}
            <div className="hidden md:flex items-center gap-8">
              {categories.map((cat) => (
                <a
                  key={cat.name}
                  href={cat.href}
                  className="text-slate-600 hover:text-blue-600 font-medium transition"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center px-10">
            <div className="w-full max-w-xl relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search for services..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">

            {/* Mobile Search Icon */}
            <button className="md:hidden p-2 rounded-full hover:bg-slate-100 transition">
              <Search size={20} className="text-slate-700" />
            </button>

            {/* Cart */}
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition">
              <ShoppingCart size={20} className="text-slate-700" />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                2
              </span>
            </button>

            {/* Desktop Profile */}
            <button className="hidden md:flex w-9 h-9 bg-slate-200 rounded-full items-center justify-center hover:bg-slate-300 transition">
              <User size={18} className="text-slate-700" />
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 transition"
            >
              {isOpen ? (
                <X size={22} className="text-slate-700" />
              ) : (
                <Menu size={22} className="text-slate-700" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
          <div className="px-6 py-6 flex flex-col gap-5">

            {categories.map((cat) => (
              <a
                key={cat.name}
                href={cat.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-slate-700 hover:text-blue-600 transition"
              >
                {cat.name}
              </a>
            ))}

            <div className="pt-4 border-t border-slate-100">
              <button className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition">
                <User size={18} />
                Profile
              </button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
