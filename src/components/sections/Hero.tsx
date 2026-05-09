import React from "react";
import {
  Sprout,
  Bike,
  Home,
  Hammer,
  BrushCleaning,
  MapPin,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

const BENTO_CARDS = [
  {
    key: "gardening",
    label: "Gardening",
    tagline: "Flying Mali at your doorstep",
    slug: "garden-and-landscaping",
    icon: Sprout,
    bg: "bg-emerald-600",
    iconColor: "text-emerald-300/30",
    accentDot: "bg-emerald-400",
  },
  {
    key: "mechanic",
    label: "Mechanic",
    tagline: "Skip the garage, we come to you",
    slug: "mechanic",
    icon: Bike,
    bg: "bg-sky-600",
    iconColor: "text-sky-300/30",
    accentDot: "bg-sky-400",
  },
  {
    key: "interior",
    label: "Home Interior",
    tagline: "Curtains, panels & greenery",
    slug: "interior",
    icon: Home,
    bg: "bg-violet-600",
    iconColor: "text-violet-300/30",
    accentDot: "bg-violet-400",
  },
  {
    key: "fabrication",
    label: "Fabrication",
    tagline: "Gates, frames & welding work",
    slug: "fabrication",
    icon: Hammer,
    bg: "bg-amber-600",
    iconColor: "text-amber-300/30",
    accentDot: "bg-amber-400",
  },
  {
    key: "cleaning",
    label: "Deep Cleaning",
    tagline: "Reset every corner of your space",
    slug: "cleaning",
    icon: BrushCleaning,
    bg: "bg-rose-600",
    iconColor: "text-rose-300/30",
    accentDot: "bg-rose-400",
  },
];

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();

  const trustItems = content.trustBadge
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="bg-[#fafaf9] pt-24 pb-14 sm:pt-28 sm:pb-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Top bar */}
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <button
            type="button"
            onClick={openLocationPicker}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <MapPin size={12} className="text-accent shrink-0" />
            <span className="max-w-[120px] truncate">
              {getLocationLabel(selectedLocation)}
            </span>
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400"
              >
                <CheckCircle size={11} className="text-emerald-500/70 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Headline */}
        <div className="mb-8 max-w-2xl sm:mb-10">
          <h1 className="font-heading text-[clamp(1.6rem,3.5vw,2.5rem)] leading-[1.15] font-bold tracking-tight text-slate-900">
            {content.title}
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
            {content.description}
          </p>
        </div>

        {/* Bento grid — categories */}
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-12 lg:auto-rows-[140px]">
          {BENTO_CARDS.map((card, index) => {
            const Icon = card.icon;

            // Bento sizing: first card wide, others vary
            const spanClass =
              index === 0
                ? "lg:col-span-5 lg:row-span-2"
                : index === 1
                  ? "lg:col-span-4 lg:row-span-1"
                  : index === 2
                    ? "lg:col-span-3 lg:row-span-1"
                    : index === 3
                      ? "lg:col-span-3 lg:row-span-1"
                      : "lg:col-span-4 lg:row-span-1";

            const isLarge = index === 0;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => navigate(`/category/${card.slug}`)}
                className={`group relative overflow-hidden rounded-2xl ${card.bg} p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] sm:p-6 ${spanClass}`}
              >
                {/* Background icon decoration */}
                <Icon
                  size={isLarge ? 140 : 90}
                  className={`absolute -right-4 -bottom-4 ${card.iconColor} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
                  strokeWidth={0.8}
                />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${card.accentDot}`} />
                      <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50 uppercase">
                        {card.key}
                      </span>
                    </div>
                    <h3
                      className={`font-heading font-bold text-white ${
                        isLarge ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                      }`}
                    >
                      {card.label}
                    </h3>
                    <p
                      className={`mt-1 text-white/60 ${
                        isLarge ? "text-sm" : "text-xs sm:text-[13px]"
                      }`}
                    >
                      {card.tagline}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-white/40 transition group-hover:text-white/70">
                    <span className="text-xs font-medium">Explore</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom: CTA + mobile trust */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-accent/15 transition hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]"
          >
            {content.ctaText}
            <ArrowRight size={15} />
          </button>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:hidden">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 text-[10px] font-medium text-slate-400"
              >
                <CheckCircle size={10} className="text-emerald-500/70 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
