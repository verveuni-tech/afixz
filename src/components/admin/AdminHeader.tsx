// src/components/admin/AdminHeader.tsx

import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useState } from "react";
import { LayoutDashboard, FileText, LogOut, Menu, X, List } from "lucide-react";
import logoImg from "../../assets/AfixZ logo_20260322_144619_0000.png";

const AdminHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isActive = (path: string) =>
    location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <img src={logoImg} alt="AfixZ" className="h-8 w-auto" />
            <span className="text-sm font-semibold text-slate-700">Admin</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem
              to="/admin/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={15} />}
              active={isActive("/admin/dashboard")}
            />
            <NavItem
              to="/admin/all-services"
              label="All Services"
              icon={<List size={15} />}
              active={isActive("/admin/all-services")}
            />
            <NavItem
              to="/admin/services"
              label="Content"
              icon={<FileText size={15} />}
              active={isActive("/admin/services")}
            />
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 md:inline-flex"
          >
            <LogOut size={14} />
            Logout
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="space-y-1">
            <MobileNavItem
              to="/admin/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={16} />}
              active={isActive("/admin/dashboard")}
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/admin/all-services"
              label="All Services"
              icon={<List size={16} />}
              active={isActive("/admin/all-services")}
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/admin/services"
              label="Manage Content"
              icon={<FileText size={16} />}
              active={isActive("/admin/services")}
              onClick={() => setMobileOpen(false)}
            />
          </div>

          <div className="mt-2 border-t border-slate-100 pt-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;


/* ------------------- Reusable Nav Items ------------------- */

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

function NavItem({ to, label, icon, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

function MobileNavItem({ to, label, icon, active, onClick }: MobileNavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
