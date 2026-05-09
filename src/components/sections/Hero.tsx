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

const SERVICE_CARDS: {
  label: string;
  slug: string;
  icon: typeof Sprout;
  accent: string;
  iconBg: string;
}[] = [
  {
    label: "Gardening",
    slug: "garden-and-landscaping",
    icon: Sprout,
    accent: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-500/12 text-emerald-600",
  },
  {
    label: "Mechanic",
    slug: "mechanic",
    icon: Bike,
    accent: "from-sky-500/10 to-sky-500/5",
    iconBg: "bg-sky-500/12 text-sky-600",
  },
  {
    label: "Interior",
    slug: "interior",
    icon: Home,
    accent: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-500/12 text-violet-600",
  },
  {
    label: "Fabrication",
    slug: "fabrication",
    icon: Hammer,
    accent: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-500/12 text-amber-600",
  },
  {
    label: "Cleaning",
    slug: "cleaning",
    icon: BrushCleaning,
    accent: "from-rose-500/10 to-rose-500/5",
    iconBg: "bg-rose-500/12 text-rose-600",
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
    <section className="relative overflow-hidden bg-primary pt-24 pb-16 sm:pt-28 sm:pb-20">
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Top row: location + trust */}
        <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-10">
          <button
            type="button"
            onClick={openLocationPicker}
            className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <MapPin size={13} className="text-accent shrink-0" />
            <span className="max-w-[140px] truncate">
              {getLocationLabel(selectedLocation)}
            </span>
          </button>

          <div className="hidden items-center gap-4 sm:flex">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/40 uppercase"
              >
                <CheckCircle size={11} className="text-accent-light shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Headline + service grid — two-column on desktop */}
        <div className="grid items-start gap-10 lg:grid-cols-[1fr,1.1fr] lg:gap-14">
          {/* Left: copy */}
          <div className="max-w-lg">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
              {content.eyebrow}
            </p>

            <h1 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.15] font-bold tracking-tight text-white">
              {content.title}
            </h1>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/50">
              {content.description}
            </p>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98]"
            >
              {content.ctaText}
              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </button>

            {/* Mobile trust badges */}
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 sm:hidden">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1 text-[10px] font-medium text-white/35"
                >
                  <CheckCircle size={10} className="text-accent-light shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: service category cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-3.5">
            {SERVICE_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.slug}
                  type="button"
                  onClick={() => navigate(`/category/${card.slug}`)}
                  className={`group relative flex flex-col items-start rounded-2xl border border-white/[0.06] bg-gradient-to-br ${card.accent} p-4 text-left backdrop-blur-sm transition-all duration-200 hover:border-white/15 hover:scale-[1.03] hover:shadow-lg hover:shadow-black/20 sm:p-5 ${
                    index === 4
                      ? "col-span-2 flex-row items-center gap-4 sm:col-span-1 sm:flex-col sm:items-start sm:gap-0"
                      : ""
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} mb-3 transition-transform duration-200 group-hover:scale-110 sm:h-11 sm:w-11`}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <span className="text-sm font-semibold text-white/90 transition group-hover:text-white">
                      {card.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/50"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
