import React, { useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/services?search=${encodeURIComponent(trimmed)}` : "/services");
  };

  return (
    <section className="bg-primary px-4 pb-12 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent-light">
          <Sparkles size={12} />
          {content.eyebrow}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {content.title}
        </h1>

        <p className="font-display mx-auto mt-2 max-w-xl text-sm text-white/60 sm:text-base">
          {content.description}
        </p>

        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-black/10 sm:flex-row sm:items-stretch">
          <button
            type="button"
            onClick={openLocationPicker}
            className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-2.5 text-sm transition hover:bg-accent/15"
          >
            <MapPin size={15} className="shrink-0 text-accent" />
            <span className="max-w-[120px] truncate text-xs font-semibold text-primary">
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
            className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-accent/20 transition hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30"
          >
            {content.ctaText}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {content.quickServices.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => navigate(`/services?search=${encodeURIComponent(service.toLowerCase())}`)}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              {service}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-white/40">
          {content.trustBadge}
        </p>
      </div>
    </section>
  );
};

export default Hero;
