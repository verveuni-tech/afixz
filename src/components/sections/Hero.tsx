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

const HERO_SLIDES = [
  {
    url: "",
    alt: "Doorstep gardening service",
    caption: "Expert garden care at your doorstep",
    icon: Sprout,
    gradient: "from-emerald-950 via-emerald-800 to-teal-600",
  },
  {
    url: "",
    alt: "Bike mechanic service",
    caption: "Flying Mechanic — we come to you",
    icon: Bike,
    gradient: "from-sky-950 via-sky-800 to-cyan-600",
  },
  {
    url: "",
    alt: "Home interior service",
    caption: "Transform your living space",
    icon: Home,
    gradient: "from-violet-950 via-violet-800 to-purple-600",
  },
  {
    url: "",
    alt: "Custom fabrication work",
    caption: "Custom-built to fit your home",
    icon: Hammer,
    gradient: "from-orange-950 via-orange-800 to-amber-600",
  },
  {
    url: "",
    alt: "Deep cleaning service",
    caption: "A thorough reset for every corner",
    icon: BrushCleaning,
    gradient: "from-rose-950 via-rose-800 to-pink-600",
  },
];

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();

  const { selectedLocation, openLocationPicker } =
    useLocationContext();

  const [active, setActive] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const slideCount = HERO_SLIDES.length;

  const advance = useCallback(
    (dir: 1 | -1) => {
      setActive((p) => (p + dir + slideCount) % slideCount);
    },
    [slideCount]
  );

  useEffect(() => {
    if (slideCount < 2) return;

    timerRef.current = setInterval(() => {
      advance(1);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideCount, advance]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      advance(1);
    }, 4500);
  };

  const trustItems = content.trustBadge
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="bg-[#f8f8f7] pt-20 pb-6 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="overflow-hidden rounded-[2rem] border border-slate-200/70 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">

          {/* HERO */}
          <div className="grid min-h-[420px] lg:grid-cols-[1.2fr_0.8fr]">

            {/* LEFT */}
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#0d1726] px-6 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8">

              {/* Texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              {/* Glow */}
              <div className="absolute -left-24 top-0 h-[260px] w-[260px] rounded-full bg-orange-500/10 blur-3xl" />

              <div className="relative z-10">

                {/* TOP ROW */}
                <div className="mb-6 flex flex-wrap items-center gap-3">

                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.08]"
                  >
                    <MapPin
                      size={13}
                      className="text-orange-400"
                    />

                    <span className="max-w-[110px] truncate">
                      {getLocationLabel(selectedLocation)}
                    </span>
                  </button>

                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-orange-400">
                    {content.eyebrow}
                  </span>
                </div>

                {/* HEADING */}
                <h1 className="max-w-[18ch] font-heading text-[clamp(2.8rem,4.6vw,4.8rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-white">
                  {content.title}
                </h1>

                {/* DESCRIPTION */}
                <p className="mt-5 max-w-xl text-[15px] leading-7 text-white/55 sm:text-base">
                  {content.description}
                </p>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="group mt-7 inline-flex items-center gap-3 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition-all duration-200 hover:-translate-y-1 hover:bg-orange-400"
                >
                  Explore Now

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* TRUST STRIP */}
              <div className="relative z-10 mt-6 border-t border-white/[0.06] pt-4">

                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {trustItems.map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/35"
                    >
                      <CheckCircle
                        size={12}
                        className="shrink-0 text-orange-400/70"
                      />

                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative overflow-hidden bg-[#0b1220] min-h-[320px]">

              {/* SLIDES */}
              {HERO_SLIDES.map((slide, i) => {
                const Icon = slide.icon;

                const isActive = i === active;

                return (
                  <div
                    key={i}
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `scale(${isActive ? 1 : 1.04})`,
                      zIndex: isActive ? 2 : 1,
                    }}
                    aria-hidden={!isActive}
                  >

                    {/* PLACEHOLDER / IMAGE */}
                    {slide.url ? (
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        className="h-full w-full object-cover"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div
                        className={`relative h-full w-full bg-gradient-to-br ${slide.gradient}`}
                      >

                        {/* Gradient highlight */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%)]" />

                        {/* Dot texture */}
                        <div className="absolute inset-0 opacity-[0.08]">
                          <div
                            className="h-full w-full"
                            style={{
                              backgroundImage:
                                "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)",
                              backgroundSize: "22px 22px",
                            }}
                          />
                        </div>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            size={180}
                            strokeWidth={0.7}
                            className="text-white/10"
                          />
                        </div>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/15" />

                    {/* Floating stats */}
                    <div className="absolute left-5 top-5 z-30 hidden items-center gap-3 md:flex">

                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
                        <p className="text-lg font-bold text-white">
                          24/7
                        </p>

                        <p className="text-[11px] text-white/60">
                          Booking support
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
                        <p className="text-lg font-bold text-white">
                          Same Day
                        </p>

                        <p className="text-[11px] text-white/60">
                          Service available
                        </p>
                      </div>
                    </div>

                    {/* Counter */}
                    <div className="absolute right-5 top-5 z-30 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs font-semibold tracking-wide text-white/75 backdrop-blur-xl">
                      {String(active + 1).padStart(2, "0")}
                      <span className="px-1 text-white/30">/</span>
                      {String(HERO_SLIDES.length).padStart(2, "0")}
                    </div>

                    {/* BOTTOM CARD */}
                    <div className="absolute inset-x-0 bottom-5 z-20 p-5">

                      <div className="max-w-[320px] rounded-[1.6rem] border border-white/10 bg-black/30 p-5 backdrop-blur-2xl">

                        <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                          Premium Home Services
                        </div>

                        <p className="text-xl font-bold leading-tight text-white">
                          {slide.caption}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/65">
                          Trusted professionals, rapid booking,
                          and reliable service quality for modern
                          households.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CONTROLS */}
              <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-5 py-5">

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() => {
                        setActive(i);
                        resetTimer();
                      }}
                      className={`rounded-full transition-all duration-300 ${
                        i === active
                          ? "h-2 w-10 bg-white"
                          : "h-2 w-2 bg-white/35 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => {
                      advance(-1);
                      resetTimer();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-xl transition hover:bg-black/40"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => {
                      advance(1);
                      resetTimer();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur-xl transition hover:bg-black/40"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;