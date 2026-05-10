import { useState } from "react";
import {
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { Mail, Loader2 } from "lucide-react";

interface Props {
  onSuccess?: () => void;
}

const EMAIL_LINK_KEY = "afixz_email_for_signin";

const actionCodeSettings = {
  url: window.location.origin + "/auth/callback",
  handleCodeInApp: true,
};

export default function AuthLogin({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess?.();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLink = async () => {
    setError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem(EMAIL_LINK_KEY, email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send sign-in link.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
          <Mail size={20} className="text-green-600" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          Check your email
        </h3>

        <p className="text-sm text-slate-500">
          We sent a sign-in link to <strong>{email}</strong>. Click the link
          to log in — no password needed.
        </p>

        <button
          type="button"
          onClick={() => setEmailSent(false)}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Sign in to continue</h3>

      {/* Google Sign-In */}
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Email Link */}
      <div className="space-y-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          onKeyDown={(e) => e.key === "Enter" && handleEmailLink()}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />

        <button
          type="button"
          disabled={loading || !email}
          onClick={handleEmailLink}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Mail size={16} />
          )}
          Send sign-in link
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-slate-400">
        No password needed — we'll email you a one-click login link.
      </p>
    </div>
  );
}

/**
 * Call this on app load / auth callback page to complete email link sign-in.
 * Should be invoked once in App.tsx or a dedicated /auth/callback route.
 */
export async function completeEmailLinkSignIn(): Promise<boolean> {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return false;
  }

  let email = window.localStorage.getItem(EMAIL_LINK_KEY);

  if (!email) {
    // If user opened link on different device
    email = window.prompt("Please enter your email to confirm sign-in:");
  }

  if (!email) return false;

  try {
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem(EMAIL_LINK_KEY);
    // Clean up URL
    window.history.replaceState(null, "", window.location.pathname);
    return true;
  } catch (err) {
    console.error("Email link sign-in failed:", err);
    return false;
  }
}
