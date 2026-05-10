import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100">
        <span className="text-4xl font-bold text-slate-300">404</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          <Home size={16} />
          Go Home
        </Link>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
