import React, { useState } from "react";

const ServiceBookingCard: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    date: "",
    time: "10:00 AM",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-32">

      {/* Price */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">Starting at</p>
        <p className="text-3xl font-semibold text-slate-900">₹499</p>
      </div>

      <div className="space-y-5">

        {/* Name */}
        <div>
          <label className="text-sm text-slate-600">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            className="w-full mt-2 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm text-slate-600">Contact Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={handleChange}
            className="w-full mt-2 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm text-slate-600">Service Address</label>
          <textarea
            name="address"
            placeholder="Enter complete service address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="w-full mt-2 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-sm text-slate-600">Select Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full mt-2 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Time */}
        <div>
          <label className="text-sm text-slate-600">Select Time</label>
          <select
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full mt-2 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option>10:00 AM</option>
            <option>12:00 PM</option>
            <option>2:00 PM</option>
            <option>4:00 PM</option>
          </select>
        </div>

        {/* CTA */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition">
          Book Service
        </button>

        <p className="text-xs text-slate-500 text-center">
          Free cancellation up to 2 hours before service.
        </p>
      </div>

    </div>
  );
};

export default ServiceBookingCard;