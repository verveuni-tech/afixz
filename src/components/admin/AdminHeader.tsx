// src/components/admin/AdminHeader.tsx

import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";

const AdminHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isActive = (path: string) =>
    location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-8">

          <h1 className="text-lg md:text-xl font-semibold text-slate-800 tracking-tight">
             Admin
          </h1>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm relative">

            <NavItem
              to="/admin/dashboard"
              label="Dashboard"
              active={isActive("/admin/dashboard")}
            />

            <NavItem
              to="/admin/services"
              label="Manage Services"
              active={isActive("/admin/services")}
            />

          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:block text-sm text-slate-600 hover:text-red-600 transition-colors"
          >
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-slate-700 text-xl"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 text-sm">

          <Link
            to="/admin/dashboard"
            onClick={() => setMobileOpen(false)}
            className={`block ${
              isActive("/admin/dashboard")
                ? "text-blue-600 font-medium"
                : "text-slate-600"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/admin/services"
            onClick={() => setMobileOpen(false)}
            className={`block ${
              isActive("/admin/services")
                ? "text-blue-600 font-medium"
                : "text-slate-600"
            }`}
          >
            Manage Services
          </Link>

          <button
            onClick={handleLogout}
            className="block text-left text-slate-600 hover:text-red-600 transition-colors"
          >
            Logout
          </button>

        </div>
      )}
    </header>
  );
};

export default AdminHeader;


/* ------------------- Reusable Nav Item ------------------- */

interface NavItemProps {
  to: string;
  label: string;
  active: boolean;
}

function NavItem({ to, label, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className="relative group"
    >
      <span
        className={`transition-colors ${
          active
            ? "text-blue-600 font-medium"
            : "text-slate-600 group-hover:text-blue-600"
        }`}
      >
        {label}
      </span>

      {/* Animated underline */}
      <span
        className={`absolute left-0 -bottom-2 h-[2px] w-full transition-all duration-300 ${
          active
            ? "bg-blue-600"
            : "bg-transparent group-hover:bg-blue-600"
        }`}
      />
    </Link>
  );
}