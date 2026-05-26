// src/features/admin/components/AdminHeader.tsx

import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useState } from "react";
import { LayoutDashboard, FileText, LogOut, Menu, X, List, Bell, ShoppingBag, Shield, Users, RefreshCw } from "lucide-react";
import logoImg from "../../../assets/AfixZ logo_20260322_144619_0000.png";
import { useOrderNotifications } from "../../../hooks/useOrderNotifications";

const AdminHeader = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount, markAllRead } = useOrderNotifications();

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
              to="/admin/orders"
              label="Orders"
              icon={<ShoppingBag size={15} />}
              active={isActive("/admin/orders")}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
            <NavItem
              to="/admin/services"
              label="Content"
              icon={<FileText size={15} />}
              active={isActive("/admin/services")}
            />
            <NavItem
              to="/admin/subscriptions"
              label="Subscriptions"
              icon={<RefreshCw size={15} />}
              active={isActive("/admin/subscriptions")}
            />
            <NavItem
              to="/admin/users"
              label="Users"
              icon={<Users size={15} />}
              active={isActive("/admin/users")}
            />
            <NavItem
              to="/admin/roles"
              label="Roles"
              icon={<Shield size={15} />}
              active={isActive("/admin/roles")}
            />
          </nav>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Link
            to="/admin/orders"
            onClick={markAllRead}
            className="relative hidden items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 md:inline-flex"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

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
              to="/admin/orders"
              label="Orders"
              icon={<ShoppingBag size={16} />}
              active={isActive("/admin/orders")}
              onClick={() => { setMobileOpen(false); markAllRead(); }}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
            <MobileNavItem
              to="/admin/services"
              label="Manage Content"
              icon={<FileText size={16} />}
              active={isActive("/admin/services")}
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/admin/subscriptions"
              label="Subscriptions"
              icon={<RefreshCw size={16} />}
              active={isActive("/admin/subscriptions")}
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/admin/users"
              label="Users"
              icon={<Users size={16} />}
              active={isActive("/admin/users")}
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/admin/roles"
              label="Roles"
              icon={<Shield size={16} />}
              active={isActive("/admin/roles")}
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
  badge?: number;
}

function NavItem({ to, label, icon, active, badge }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
      {badge != null && badge > 0 && (
        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

interface MobileNavItemProps extends NavItemProps {
  onClick: () => void;
}

function MobileNavItem({ to, label, icon, active, onClick, badge }: MobileNavItemProps) {
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
      {badge != null && badge > 0 && (
        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
