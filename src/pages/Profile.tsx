import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  User,
  MapPin,
  ShoppingBag,
  Phone,
  LogOut,
} from "lucide-react";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-32 px-6">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-32 px-6">
        <p className="text-red-500">You must be logged in.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-24 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-1/3 border-r border-slate-100 p-10">

          {/* User Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={28} className="text-blue-600" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 text-lg">
                {profile?.email}
              </h2>
              <p className="text-sm text-slate-500">
                {profile?.phone || "No phone linked"}
              </p>
            </div>
          </div>

          <nav className="space-y-3">

             <SidebarItem
              icon={<ShoppingBag size={18} />}
              label="Bookings"
              active={activeTab === "bookings"}
              onClick={() => setActiveTab("bookings")}
            />

            
            <SidebarItem
              icon={<User size={18} />}
              label="Profile"
              active={activeTab === "profile"}
              onClick={() => setActiveTab("profile")}
            />

           

            <SidebarItem
              icon={<MapPin size={18} />}
              label="Addresses"
              active={activeTab === "addresses"}
              onClick={() => setActiveTab("addresses")}
            />

            <SidebarItem
              icon={<Phone size={18} />}
              label="Support"
              active={activeTab === "support"}
              onClick={() => setActiveTab("support")}
            />
          </nav>

          <button
            onClick={() => signOut(auth)}
            className="mt-14 w-full border border-red-500 text-red-500 py-3 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 p-14">

          {activeTab === "profile" && (
            <ProfilePanel profile={profile} />
          )}

          {activeTab === "bookings" && (
            <EmptyState title="No bookings yet" />
          )}

          {activeTab === "addresses" && (
            <EmptyState title="No saved addresses" />
          )}

          {activeTab === "support" && (
            <EmptyState title="Support section coming soon" />
          )}

        </div>
      </div>
    </div>
  );
}

/* ---------------- Profile Panel ---------------- */

function ProfilePanel({ profile }: any) {
  return (
    <div className="space-y-10">

      <h1 className="text-2xl font-semibold text-slate-900">
        Account Information
      </h1>

      <InfoRow label="Email" value={profile?.email} />
      <InfoRow
        label="Phone Number"
        value={profile?.phone || "Not provided"}
      />
    </div>
  );
}

/* ---------------- Components ---------------- */

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
        active
          ? "bg-blue-50 text-blue-600"
          : "hover:bg-slate-50 text-slate-700"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-slate-900 text-base">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      {title}
    </div>
  );
}