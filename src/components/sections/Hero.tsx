import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sprout,
  Bike,
  Home,
  Hammer,
  BrushCleaning,
  MapPin,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

/**
 * Hero carousel slides — using gradient placeholders until real
 * Cloudinary images are uploaded. Replace `url` with actual image
 * URLs when ready; the gradient becomes a fallback.
 */
const HERO_SLIDES = [
  {
    url: "",
    alt: "Doorstep gardening service",
    caption: "Expert garden care at your doorstep",
    icon: Sprout,
    gradient: "from-emerald-800 via-emerald-600 to-teal-500",
  },
  {
    url: "",
    alt: "Bike mechanic service",
    caption: "Flying Mechanic — we come to you",
    icon: Bike,
    gradient: "from-sky-800 via-sky-600 to-cyan-500",
  },
  {
    url: "",
    alt: "Home interior service",
    caption: "Transform your living space",
    icon: Home,
    gradient: "from-violet-800 via-violet-600 to-purple-500",
  },
  {
    url: "",
    alt: "Custom fabrication work",
    caption: "Custom-built to fit your home",
    icon: Hammer,
    gradient: "from-amber-800 via-amber-600 to-orange-500",
  },
  {
    url: "",
    alt: "Deep cleaning service",
    caption: "A thorough reset for every corner",
    icon: BrushCleaning,
    gradient: "from-rose-800 via-rose-600 to-pink-500",
  },
];

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideCount = HERO_SLIDES.length;

  const advance = useCallback(
    (dir: 1 | -1) => {
      setActive((p) => (p + dir + slideCount) % slideCount);
    },
    [slideCount]
  );

  useEffect(() => {
    if (slideCount < 2) return;
    timerRef.current = setInterval(() => advance(1), 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideCount, advance]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 4500);
  };

  const trustItems = content.trustBadge
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="bg-[#fafaf9] pt-20 pb-4 sm:pt-24 sm:pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/8 md:rounded-3xl">
          {/* ── Split: left copy | right carousel ── */}
          <div className="grid md:grid-cols-[1fr,1.2fr] min-h-[420px] md:min-h-[480px]">

            {/* LEFT — dark panel */}
            <div className="relative flex flex-col justify-between bg-primary px-6 py-10 sm:px-10 sm:py-12 md:px-10 md:py-14 lg:px-14">
              {/* Dot texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              <div className="relative z-10">
                {/* Location pill + eyebrow */}
                <div className="mb-8 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
                  >
                    <MapPin size={12} className="text-accent shrink-0" />
                    <span className="max-w-[110px] truncate">
                      {getLocationLabel(selectedLocation)}
                    </span>
                  </button>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">
                    {content.eyebrow}
                  </span>
                </div>

                {/* Headline — dramatic size */}
                <h1 className="font-heading text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.08] font-extrabold tracking-tight text-white">
                  {content.title}
                </h1>

                <p className="mt-5 max-w-md text-[15px] leading-[1.7] font-light text-white/40">
                  {content.description}
                </p>

                {/* CTA — bold, oversized */}
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="group mt-8 inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:shadow-2xl hover:shadow-accent/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  {content.ctaText}
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* Trust strip */}
              <div className="relative z-10 mt-10 border-t border-white/[0.06] pt-5">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {trustItems.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-white/30"
                    >
                      <CheckCircle size={11} className="text-accent-light/50 shrink-0" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — image carousel */}
            <div className="relative overflow-hidden">
              {/* Slides */}
              {HERO_SLIDES.map((slide, i) => {
                const Icon = slide.icon;
                const isActive = i === active;

                return (
                  <div
                    key={i}
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `scale(${isActive ? 1 : 1.08})`,
                      zIndex: isActive ? 2 : 1,
                    }}
                    aria-hidden={!isActive}
                  >
                    {/* Image or gradient placeholder */}
                    {slide.url ? (
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        className="h-full w-full object-cover"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${slide.gradient}`}
                      >
                        <Icon
                          size={160}
                          strokeWidth={0.5}
                          className="text-white/[0.12]"
                        />
                      </div>
                    )}

                    {/* Bottom overlay */}
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pb-16 pt-20 sm:px-8 sm:pb-18">
                      <p className="max-w-sm text-base font-semibold text-white sm:text-lg">
                        {slide.caption}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Controls bar — pinned to bottom */}
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between px-6 py-4 sm:px-8">
                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => { setActive(i); resetTimer(); }}
                      className={`rounded-full transition-all duration-300 ${
                        i === active
                          ? "h-2 w-6 bg-white"
                          : "h-2 w-2 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => { advance(-1); resetTimer(); }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/70 backdrop-blur-md transition hover:bg-black/40 hover:text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => { advance(1); resetTimer(); }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/70 backdrop-blur-md transition hover:bg-black/40 hover:text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Slide counter — top right */}
              <div className="absolute top-5 right-6 z-20 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold tabular-nums text-white/70 backdrop-blur-md sm:top-6 sm:right-8">
                {String(active + 1).padStart(2, "0")}
                <span className="text-white/30"> / </span>
                {String(HERO_SLIDES.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
