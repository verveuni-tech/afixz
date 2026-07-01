import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useOrderNotifications } from "../../../hooks/useOrderNotifications";
import logoImg from "../../../assets/AfixZ logo_20260322_144619_0000.png";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  List,
  RefreshCw,
  Users,
  Shield,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Wrench,
  Store,
  Package,
  Tags,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavSection {
  key: string;
  label: string;
  icon: React.ReactNode;
  children: NavLink[];
}

interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

/* ------------------------------------------------------------------ */
/*  Navigation config                                                  */
/* ------------------------------------------------------------------ */

function useNavSections(): NavSection[] {
  const { unreadCount } = useOrderNotifications();

  return [
    {
      key: "services",
      label: "Services",
      icon: <Wrench size={18} />,
      children: [
        { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { to: "/admin/all-services", label: "All Services", icon: <List size={16} /> },
        {
          to: "/admin/orders",
          label: "Orders",
          icon: <ShoppingBag size={16} />,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { to: "/admin/services", label: "Content", icon: <FileText size={16} /> },
        { to: "/admin/subscriptions", label: "Subscriptions", icon: <RefreshCw size={16} /> },
      ],
    },
    {
      key: "store",
      label: "Store",
      icon: <Store size={18} />,
      children: [
        { to: "/admin/store-dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
        { to: "/admin/store/products", label: "Products", icon: <Package size={16} /> },
        { to: "/admin/store?tab=categories", label: "Categories", icon: <Tags size={16} /> },
      ],
    },
  ];
}

const globalLinks: NavLink[] = [
  { to: "/admin/users", label: "Users", icon: <Users size={16} /> },
  { to: "/admin/roles", label: "Roles", icon: <Shield size={16} /> },
];

/* ------------------------------------------------------------------ */
/*  AdminLayout                                                        */
/* ------------------------------------------------------------------ */

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { unreadCount, markAllRead } = useOrderNotifications();
  const sections = useNavSections();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isActive = (path: string) => {
    // Handle query-param routes like /admin/store?tab=products
    const [linkPath, linkQuery] = path.split("?");
    if (location.pathname !== linkPath) return false;
    if (!linkQuery) return true;
    // If link has query, check current search params contain it
    return location.search.includes(linkQuery);
  };

  // Determine which section is active
  const activeSectionKey = (() => {
    for (const section of sections) {
      if (
        section.children.some((c) => {
          const linkPath = c.to.split("?")[0];
          return location.pathname === linkPath || location.pathname.startsWith(linkPath + "/");
        })
      ) {
        return section.key;
      }
    }
    return sections[0]?.key;
  })();

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* ---- Desktop Sidebar ---- */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white md:flex">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <img src={logoImg} alt="AfixZ" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-slate-700">Admin</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <SidebarSection
              key={section.key}
              section={section}
              isOpen={section.key === activeSectionKey}
              isActive={isActive}
              onLinkClick={
                section.key === "services"
                  ? (to: string) => {
                      if (to === "/admin/orders") markAllRead();
                    }
                  : undefined
              }
            />
          ))}

          {/* Divider */}
          <div className="mx-2 my-3 border-t border-slate-100" />

          {/* Global links */}
          {globalLinks.map((link) => (
            <SidebarLink key={link.to} link={link} active={isActive(link.to)} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ---- Main Area ---- */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-sm md:hidden">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src={logoImg} alt="AfixZ" className="h-7 w-auto" />
            <span className="text-sm font-semibold text-slate-700">Admin</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/orders"
              onClick={markAllRead}
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Mobile Dropdown Nav */}
        {mobileOpen && (
          <div className="border-b border-slate-100 bg-white px-4 py-3 md:hidden">
            {sections.map((section) => (
              <MobileSection
                key={section.key}
                section={section}
                isActive={isActive}
                onClose={() => setMobileOpen(false)}
                onLinkClick={
                  section.key === "services"
                    ? (to: string) => {
                        if (to === "/admin/orders") markAllRead();
                      }
                    : undefined
                }
              />
            ))}

            <div className="mx-1 my-2 border-t border-slate-100" />

            {globalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <div className="mx-1 my-2 border-t border-slate-100" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop Sidebar Section (collapsible)                              */
/* ------------------------------------------------------------------ */

function SidebarSection({
  section,
  isOpen,
  isActive,
  onLinkClick,
}: {
  section: NavSection;
  isOpen: boolean;
  isActive: (path: string) => boolean;
  onLinkClick?: (to: string) => void;
}) {
  const [open, setOpen] = useState(isOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          isOpen
            ? "text-slate-900"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        {section.icon}
        {section.label}
        <ChevronDown
          size={14}
          className={`ml-auto text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5 border-l border-slate-100 pl-3">
          {section.children.map((link) => (
            <SidebarLink
              key={link.to}
              link={link}
              active={isActive(link.to)}
              onClick={() => onLinkClick?.(link.to)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop Sidebar Link                                               */
/* ------------------------------------------------------------------ */

function SidebarLink({
  link,
  active,
  onClick,
}: {
  link: NavLink;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={link.to}
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {link.icon}
      {link.label}
      {link.badge != null && link.badge > 0 && (
        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {link.badge > 9 ? "9+" : link.badge}
        </span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Section (collapsible)                                       */
/* ------------------------------------------------------------------ */

function MobileSection({
  section,
  isActive,
  onClose,
  onLinkClick,
}: {
  section: NavSection;
  isActive: (path: string) => boolean;
  onClose: () => void;
  onLinkClick?: (to: string) => void;
}) {
  const hasActiveChild = section.children.some((c) => isActive(c.to));
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
          hasActiveChild ? "text-slate-900" : "text-slate-500"
        }`}
      >
        {section.icon}
        {section.label}
        <ChevronDown
          size={14}
          className={`ml-auto text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="ml-3 space-y-0.5 border-l border-slate-100 pl-3">
          {section.children.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => {
                onLinkClick?.(link.to);
                onClose();
              }}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {link.icon}
              {link.label}
              {link.badge != null && link.badge > 0 && (
                <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {link.badge > 9 ? "9+" : link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
