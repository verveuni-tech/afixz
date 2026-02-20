import React, { useState } from "react";

interface Props {
  images?: string[];
}

const ServiceGalleryCard: React.FC<Props> = ({ images = [] }) => {
  const [active, setActive] = useState(0);

  const validImages = images.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 md:col-span-1 order-2 md:order-1">
          {validImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-16 w-16 object-cover rounded-lg cursor-pointer border
                ${active === index ? "ring-2 ring-blue-500" : "border-slate-200"}`}
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="md:col-span-4 order-1 md:order-2">
          <img
            src={validImages[active]}
            alt="Service"
            className="w-full h-80 md:h-96 object-cover rounded-xl"
          />
        </div>

      </div>
    </div>
  );
};

export default ServiceGalleryCard;