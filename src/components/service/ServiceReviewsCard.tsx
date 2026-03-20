import React from "react";
import { Star } from "lucide-react";

interface Props {
  rating: number;
  reviewCount: number;
}

const ServiceReviewsCard: React.FC<Props> = ({ rating, reviewCount }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/40 rounded-3xl transition-all duration-300 hover:shadow-xl p-8">
      <h3 className="text-2xl font-semibold mb-6">Customer Reviews</h3>

      {reviewCount > 0 ? (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-4xl font-bold text-slate-900">
              {rating.toFixed(1)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 fill-slate-200"
                  }
                />
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Based on {reviewCount.toLocaleString()} reviews
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500">
            No reviews yet. Reviews will appear here once customers complete their bookings.
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceReviewsCard;
