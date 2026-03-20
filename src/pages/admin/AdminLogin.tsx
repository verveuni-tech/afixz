import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { auth, googleProvider } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import useSeo from "../../hooks/useSeo";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useSeo({
    title: "Admin Login | AfixZ",
    description:
      "Secure administrator sign-in for the AfixZ dashboard.",
    canonicalUrl: import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL}/admin/login`
      : undefined,
    robots: "noindex, nofollow",
  });

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, isAdmin, navigate, user]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdTokenResult(true);

      if (token.claims.admin !== true) {
        await signOut(auth);
        setError(
          "This account is signed in, but it does not have administrator access."
        );
        return;
      }

      navigate("/admin/dashboard", { replace: true });
    } catch {
      setError("We could not complete sign-in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-center">
            <Link
              to="/"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>

            <div className="mt-8 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Admin Access
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Sign in to manage AfixZ content.
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Use your approved Google account to access the admin dashboard for
                services, categories, blogs, and storefront updates.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Admin-only access"
                description="Only accounts with the admin custom claim can enter the dashboard."
              />
              <InfoCard
                icon={<LockKeyhole className="h-5 w-5" />}
                title="Protected by rules"
                description="Firestore security rules stay in control of dashboard permissions."
              />
            </div>
          </section>

          <section className="flex items-center">
            <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Secure Sign-In
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-slate-900 sm:text-3xl">
                Continue with Google
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This login page is only for administrators. If your account has not
                been granted access yet, sign-in will be blocked after authentication.
              </p>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                onClick={handleGoogleLogin}
                disabled={loading || authLoading}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <GoogleIcon />
                {loading || authLoading ? "Checking access..." : "Sign in with Google"}
              </button>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                If your role was updated recently, sign out and try again so the latest
                admin claim can be read.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 10.023H12.18v4.148h5.518c-.237 1.336-1.658 3.918-5.518 3.918-3.319 0-6.023-2.748-6.023-6.137s2.704-6.137 6.023-6.137c1.89 0 3.154.807 3.879 1.504l2.647-2.568C17.019 3.18 14.84 2.16 12.18 2.16 6.64 2.16 2.15 6.676 2.15 12.252s4.49 10.092 10.03 10.092c5.79 0 9.625-4.066 9.625-9.799 0-.658-.07-1.16-.155-1.522Z"
        fill="#4285F4"
      />
      <path
        d="M3.305 7.612 6.714 10.1c.922-2.78 3.08-4.684 5.466-4.684 1.89 0 3.154.807 3.879 1.504l2.647-2.568C17.019 3.18 14.84 2.16 12.18 2.16c-3.85 0-7.165 2.208-8.875 5.452Z"
        fill="#EA4335"
      />
      <path
        d="M12.18 22.344c2.585 0 4.755-.85 6.34-2.312l-2.925-2.397c-.784.548-1.832.93-3.415.93-3.844 0-5.277-2.552-5.554-3.81l-3.385 2.61c1.692 3.292 5.095 4.979 8.939 4.979Z"
        fill="#34A853"
      />
      <path
        d="M3.241 17.365 6.626 14.755c-.087-.257-.137-.533-.137-.818 0-.284.05-.56.137-.818L3.241 10.51A10.208 10.208 0 0 0 2.15 12.25c0 1.87.5 3.625 1.091 5.115Z"
        fill="#FBBC05"
      />
    </svg>
  );
}
