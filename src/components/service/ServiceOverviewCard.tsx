import React from "react";

interface Props {
  overview: string;
  included: string[];
  duration: string;
  warranty: string;
  professionals: string;
}

const ServiceOverviewCard: React.FC<Props> = ({
  overview,
  included,
  duration,
  warranty,
  professionals,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

      {/* Top Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-center">
        <InfoItem label="Duration" value={duration} />
        <InfoItem label="Warranty" value={warranty} />
        <InfoItem label="Professionals" value={professionals} />
      </div>

      {/* Overview */}
      <h3 className="text-xl font-semibold mb-4 text-slate-900">
        Service Overview
      </h3>
      <p className="text-slate-600 mb-8 leading-relaxed">
        {overview}
      </p>

      {/* Included */}
      <h3 className="text-xl font-semibold mb-4 text-slate-900">
        What’s Included
      </h3>

      <ul className="space-y-3 text-slate-600 list-disc pl-5">
        {included?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

    </div>
  );
};

export default ServiceOverviewCard;

/* Reusable Item */
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl py-4 px-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}