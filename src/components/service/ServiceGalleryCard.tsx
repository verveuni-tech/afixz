import React, { useState } from "react";

interface Props {
  images?: string[];
}

const ServiceGalleryCard: React.FC<Props> = ({ images = [] }) => {
  const [active, setActive] = useState(0);
  const validImages = images.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 p-6 overflow-hidden">

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        <div className="flex md:flex-col gap-4 md:col-span-1 order-2 md:order-1">
          {validImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt=""
              onClick={() => setActive(index)}
              className={`h-20 w-20 object-cover rounded-2xl cursor-pointer transition-all duration-200 
              ${active === index
                ? "ring-2 ring-blue-600 shadow-md scale-105"
                : "opacity-70 hover:opacity-100"}`}
            />
          ))}
        </div>

        <div className="md:col-span-4 order-1 md:order-2">
          <img
            src={validImages[active]}
            alt=""
            className="w-full h-96 object-cover rounded-3xl"
          />
        </div>

      </div>
    </div>
  );
};

export default ServiceGalleryCard;