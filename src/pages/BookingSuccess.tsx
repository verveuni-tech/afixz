import React from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Copy, ArrowLeft } from "lucide-react";

const BookingSuccess: React.FC = () => {
  const { id } = useParams();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          Booking Confirmed
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your booking has been placed successfully. Our team will reach out shortly.
        </p>

        {/* Booking ID */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Booking ID
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <code className="text-sm font-semibold text-slate-800">
              {id}
            </code>
            <button
              onClick={handleCopy}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              title="Copy booking ID"
            >
              <Copy size={13} />
            </button>
          </div>
          {copied && (
            <p className="mt-1 text-[11px] text-emerald-500">Copied!</p>
          )}
        </div>

        {/* Info */}
        <p className="mt-5 text-xs leading-5 text-slate-400">
          You will receive a confirmation call to finalize your service slot. Keep this booking ID handy.
        </p>

        {/* CTA */}
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
