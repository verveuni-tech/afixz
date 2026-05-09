import React, { useCallback, useEffect, useRef, useState } from "react";
import {
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
 * Hardcoded hero carousel images — update URLs to your Cloudinary assets.
 * Format: { url, alt, caption }
 */
const HERO_SLIDES = [
  {
    url: "https://res.cloudinary.com/afixz/image/upload/v1/hero/gardening.jpg",
    alt: "Doorstep gardening service",
    caption: "Expert garden care at your doorstep",
  },
  {
    url: "https://res.cloudinary.com/afixz/image/upload/v1/hero/mechanic.jpg",
    alt: "Bike mechanic service",
    caption: "Flying Mechanic — we come to you",
  },
  {
    url: "https://res.cloudinary.com/afixz/image/upload/v1/hero/interior.jpg",
    alt: "Home interior service",
    caption: "Transform your living space",
  },
  {
    url: "https://res.cloudinary.com/afixz/image/upload/v1/hero/fabrication.jpg",
    alt: "Custom fabrication work",
    caption: "Custom-built to fit your home",
  },
  {
    url: "https://res.cloudinary.com/afixz/image/upload/v1/hero/cleaning.jpg",
    alt: "Deep cleaning service",
    caption: "A thorough reset for every corner",
  },
];

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideCount = HERO_SLIDES.length;

  const advance = useCallback(
    (direction: 1 | -1) => {
      setActive((prev) => (prev + direction + slideCount) % slideCount);
    },
    [slideCount]
  );

  useEffect(() => {
    if (slideCount < 2) return;
    timerRef.current = setInterval(() => advance(1), 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideCount, advance]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => advance(1), 4000);
  };

  const trustItems = content.trustBadge
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="bg-[#fafaf9] pt-20 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl shadow-xl shadow-slate-900/5 lg:rounded-[2rem]">
          <div className="grid lg:grid-cols-[1fr,1.15fr]">
            {/* ── Left: Dark panel ── */}
            <div className="relative flex flex-col justify-between bg-primary px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              {/* Subtle pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,.4) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative">
                {/* Location + eyebrow */}
                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <MapPin size={12} className="text-accent shrink-0" />
                    <span className="max-w-[120px] truncate">
                      {getLocationLabel(selectedLocation)}
                    </span>
                  </button>
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-accent uppercase">
                    {content.eyebrow}
                  </span>
                </div>

                {/* Headline */}
                <h1 className="font-heading text-[clamp(1.5rem,3.2vw,2.4rem)] leading-[1.15] font-bold tracking-tight text-white">
                  {content.title}
                </h1>

                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/45">
                  {content.description}
                </p>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent-hover hover:shadow-xl active:scale-[0.98]"
                >
                  {content.ctaText}
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="relative mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.06] pt-6">
                {trustItems.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-white/35"
                  >
                    <CheckCircle size={11} className="text-accent-light/60 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: Image carousel ── */}
            <div className="relative bg-[#f5f5f0] p-5 sm:p-8 lg:p-10">
              {/* Carousel viewport */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-200 sm:aspect-[3/2] lg:aspect-auto lg:h-full lg:min-h-[380px]">
                {HERO_SLIDES.map((slide, i) => (
                  <div
                    key={slide.url}
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      opacity: i === active ? 1 : 0,
                      transform: `scale(${i === active ? 1 : 1.05})`,
                    }}
                  >
                    <img
                      src={slide.url}
                      alt={slide.alt}
                      className="h-full w-full object-cover"
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                    {/* Bottom caption overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-5 pb-5 pt-16 sm:px-6 sm:pb-6">
                      <p className="text-sm font-semibold text-white sm:text-base">
                        {slide.caption}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Navigation arrows */}
                <div className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 sm:right-5 sm:bottom-5">
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => { advance(-1); resetTimer(); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition hover:bg-white/25"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => { advance(1); resetTimer(); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition hover:bg-white/25"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Slide indicators */}
                <div className="absolute bottom-4 left-5 z-10 flex items-center gap-1.5 sm:left-6">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => { setActive(i); resetTimer(); }}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === active
                          ? "w-5 bg-white"
                          : "w-1.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Slide counter + progress */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400">
                  <span className="text-slate-600">{String(active + 1).padStart(2, "0")}</span>
                  {" / "}
                  {String(HERO_SLIDES.length).padStart(2, "0")}
                </p>
                <div className="mx-4 h-px flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-accent/60 transition-all duration-500"
                    style={{ width: `${((active + 1) / HERO_SLIDES.length) * 100}%` }}
                  />
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
