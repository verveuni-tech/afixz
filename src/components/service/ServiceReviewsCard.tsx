import React from "react";

const ServiceReviewsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

      <h3 className="text-2xl font-semibold mb-6">Customer Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Rating Summary */}
        <div>
          <p className="text-4xl font-bold text-slate-900">4.7</p>
          <p className="text-slate-500">Based on 1,248 reviews</p>
        </div>

        {/* Sample Reviews */}
        <div className="md:col-span-2 space-y-6">
          <div className="border-b pb-4">
            <p className="font-medium text-slate-900">Rahul Sharma</p>
            <p className="text-slate-600 text-sm mt-1">
              Technician was professional and explained everything clearly.
            </p>
          </div>

          <div className="border-b pb-4">
            <p className="font-medium text-slate-900">Anita Verma</p>
            <p className="text-slate-600 text-sm mt-1">
              Service was quick and efficient. Highly recommended.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceReviewsCard;