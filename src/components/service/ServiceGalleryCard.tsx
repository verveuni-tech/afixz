import React, { useState } from "react";

interface Props {
  images?: string[];
}

const ServiceGalleryCard: React.FC<Props> = ({ images = [] }) => {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const validImages = hasImages ? images : [];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Main Image */}
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        {hasImages ? (
          <img
            src={validImages[active]}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-3xl font-bold tracking-tight text-primary/25">
              afixz
            </span>
            <span className="mt-1 text-xs text-primary/40">No images available</span>
          </div>
        )}

        {/* Image counter */}
        {hasImages && validImages.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {active + 1} / {validImages.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {hasImages && validImages.length > 1 && (
        <div className="flex gap-2 border-t border-slate-100 p-3">
          {validImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActive(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                active === index
                  ? "ring-2 ring-slate-900 ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceGalleryCard;
