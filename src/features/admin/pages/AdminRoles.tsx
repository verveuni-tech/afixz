import React, { useState } from "react";
import { Shield, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { auth } from "../../../lib/firebase";

type Role = "admin" | "provider";

interface RoleResult {
  success: boolean;
  uid: string;
  email: string;
  displayName: string;
  action: string;
  role: string;
  claims: Record<string, boolean>;
}

export default function AdminRoles() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("provider");
  const [action, setAction] = useState<"grant" | "revoke">("grant");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoleResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        setError("Not authenticated — sign in again");
        return;
      }

      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: email.trim(), role, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Error ${res.status}`);
        return;
      }

      setResult(data);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-slate-800 md:text-2xl">
            Role Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Grant or revoke admin and provider roles for users.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                User email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-slate-400">
                User must have signed in at least once.
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Role
              </label>
              <div className="flex gap-3">
                <RoleButton
                  label="Provider"
                  description="Can view and complete jobs"
                  selected={role === "provider"}
                  onClick={() => setRole("provider")}
                />
                <RoleButton
                  label="Admin"
                  description="Full dashboard access"
                  selected={role === "admin"}
                  onClick={() => setRole("admin")}
                />
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Action
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAction("grant")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    action === "grant"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Grant role
                </button>
                <button
                  type="button"
                  onClick={() => setAction("revoke")}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    action === "revoke"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Revoke role
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading
                ? "Processing..."
                : `${action === "grant" ? "Grant" : "Revoke"} ${role} role`}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-medium text-emerald-700">
                ✓ {result.action === "granted" ? "Granted" : "Revoked"}{" "}
                <span className="font-semibold">{result.role}</span> role
                {result.action === "granted" ? " to" : " from"}{" "}
                {result.displayName || result.email}
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Active claims: {Object.keys(result.claims).filter((k) => result.claims[k]).join(", ") || "none"}
              </p>
              <p className="mt-1 text-xs text-emerald-500">
                User must sign out and sign back in for changes to take effect.
              </p>
            </div>
          )}
        </div>

        {/* Setup instructions */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Shield size={14} />
            Setup required
          </h2>
          <div className="mt-3 space-y-2 text-xs text-slate-500">
            <p>This page calls <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">/api/set-role</code> on Vercel. Ensure these env vars are set:</p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li><code className="font-mono">FIREBASE_SERVICE_ACCOUNT_KEY</code> — Firebase Admin SDK service account JSON</li>
            </ul>
            <p className="mt-2">Auth uses your Firebase admin ID token — no API secret needed on frontend.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleButton({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border p-3 text-left transition ${
        selected
          ? "border-accent bg-accent/5"
          : "border-slate-200 hover:bg-slate-50"
      }`}
    >
      <p className={`text-sm font-semibold ${selected ? "text-accent" : "text-slate-700"}`}>
        {label}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </button>
  );
}
