import React, { useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

const chipColors = [
  "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100",
  "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
  "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100",
  "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100",
  "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100",
];

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/services?search=${encodeURIComponent(trimmed)}` : "/services");
  };

  return (
    <section className="bg-gradient-to-b from-stone-50 via-white to-white px-4 pb-8 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          <Sparkles size={12} />
          {content.eyebrow}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {content.title}
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          {content.description}
        </p>

        <div className="mx-auto mt-5 flex max-w-2xl flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-2 shadow-lg shadow-stone-100/50 sm:flex-row sm:items-stretch">
          <button
            type="button"
            onClick={openLocationPicker}
            className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2.5 text-sm transition hover:bg-stone-100"
          >
            <MapPin size={15} className="shrink-0 text-stone-500" />
            <span className="max-w-[120px] truncate text-xs font-semibold text-stone-600">
              {getLocationLabel(selectedLocation)}
            </span>
          </button>

          <div className="flex flex-1 items-center gap-2 px-2">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              placeholder={content.searchPlaceholder}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-stone-200 transition hover:bg-slate-900 hover:shadow-lg hover:shadow-stone-300"
          >
            {content.ctaText}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {content.quickServices.map((service, index) => (
            <button
              key={service}
              type="button"
              onClick={() => navigate(`/services?search=${encodeURIComponent(service.toLowerCase())}`)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${chipColors[index % chipColors.length]}`}
            >
              {service}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-stone-500">
          {content.trustBadge}
        </p>
      </div>
    </section>
  );
};

export default Hero;
