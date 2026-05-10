import React from "react";
import { MessageSquare } from "lucide-react";

const ServiceReviewsCard: React.FC = () => {
  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-semibold text-slate-900">Customer Reviews</h3>

      <div className="mt-6 flex flex-col items-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <MessageSquare size={20} className="text-slate-400" />
        </div>

        <p className="mt-4 text-sm font-medium text-slate-700">
          Reviews coming soon
        </p>

        <p className="mt-1 max-w-xs text-xs text-slate-400">
          After your service is complete, you'll be able to share your experience here.
        </p>
      </div>
    </div>
  );
};

export default ServiceReviewsCard;
