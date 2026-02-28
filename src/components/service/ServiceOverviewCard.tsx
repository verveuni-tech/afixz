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
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-10 space-y-10">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <InfoItem label="Duration" value={duration} />
        <InfoItem label="Warranty" value={warranty} />
        <InfoItem label="Professionals" value={professionals} />
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">
          Service Overview
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {overview}
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">
          What’s Included
        </h3>

        <ul className="space-y-4">
          {included?.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-600">
              <span className="mt-2 h-2 w-2 rounded-full bg-blue-600"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default ServiceOverviewCard;

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl py-6 px-6 shadow-sm text-center">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="font-semibold text-lg text-slate-900 mt-2">
        {value}
      </p>
    </div>
  );
}