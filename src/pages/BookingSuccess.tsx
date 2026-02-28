// src/pages/BookingSuccess.tsx

import React from "react";
import { useParams, Link } from "react-router-dom";

const BookingSuccess: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg">

        <div className="text-green-600 text-5xl mb-6">✓</div>

        <h1 className="text-3xl font-semibold mb-4">
          Booking Confirmed
        </h1>

        <p className="text-slate-600 mb-6">
          Your booking has been successfully placed.
        </p>

        <div className="bg-slate-100 rounded-xl p-4 mb-8">
          <p className="text-sm text-slate-500">Booking ID</p>
          <p className="font-semibold">{id}</p>
        </div>

        <p className="text-sm text-slate-500 mb-8">
          Our team will contact you shortly to confirm your service slot.
        </p>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
};

export default BookingSuccess;