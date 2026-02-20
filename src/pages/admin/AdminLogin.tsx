import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 w-full max-w-md">

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Admin Login
        </h1>

        <p className="text-slate-500 text-sm mb-8">
          Sign in with your Google account to access the admin panel.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 py-3 rounded-xl transition font-medium"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />

          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-xs text-slate-400 mt-6 text-center">
          Access restricted to authorized administrators.
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;