import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CartSkeleton from "../components/ui/CartSkeleton";
import AuthLogin from "../components/auth/AuthLogin";
import { LogIn, X } from "lucide-react";

const UserProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    if (location.pathname === "/cart") {
      return <CartSkeleton />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <LogIn size={28} className="text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Sign in required</h2>
          <p className="text-sm text-slate-500 text-center max-w-xs">
            Please log in to access this page.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="mt-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Sign In
          </button>
        </div>

        {showLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
              <button
                onClick={() => setShowLogin(false)}
                className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
              <AuthLogin onSuccess={() => setShowLogin(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default UserProtectedRoute;
