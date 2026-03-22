import React from "react";
import { Clock, Shield, Users, CheckCircle } from "lucide-react";

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
    <div className="space-y-6">
      {/* Key Info Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white">
        <InfoItem icon={<Clock size={16} />} label="Duration" value={duration} />
        <InfoItem icon={<Shield size={16} />} label="Warranty" value={warranty} />
        <InfoItem icon={<Users size={16} />} label="Professionals" value={professionals} />
      </div>

      {/* Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-semibold text-slate-800">
          Service Overview
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {overview}
        </p>
      </div>

      {/* What's Included */}
      {included && included.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-800">
            What's Included
          </h3>

          <ul className="mt-4 space-y-3">
            {included.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-600">
                <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServiceOverviewCard;

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-4 py-4 text-center">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[11px] uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
