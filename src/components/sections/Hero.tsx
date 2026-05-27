import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import hero1 from "@/assets/images/hero1.webp";
import hero2 from "@/assets/images/hero2.webp";
import hero3 from "@/assets/images/hero3.webp";

import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

const HERO_SLIDES = [
  {
    image: hero1,
    alt: "Luxury modern landscaped residence",
    caption: "Refined outdoor spaces for modern homes",
  },
  {
    image: hero2,
    alt: "Minimal premium interior workspace",
    caption: "Elevated interiors crafted with precision",
  },
  {
    image: hero3,
    alt: "Premium architectural garden lighting",
    caption:
      "Intentional landscaping with timeless aesthetics",
  },
];

const AUTOPLAY_DELAY = 6500;

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();

  const { selectedLocation, openLocationPicker } =
    useLocationContext();

  const [active, setActive] = useState(0);

  const timerRef = useRef<ReturnType<
    typeof setInterval
  > | null>(null);

  const slideCount = HERO_SLIDES.length;

  const trustItems = useMemo(
    () =>
      content.trustBadge
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean),
    [content.trustBadge]
  );

  const advance = useCallback(
    (dir: 1 | -1) => {
      setActive((prev) => {
        return (prev + dir + slideCount) % slideCount;
      });
    },
    [slideCount]
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startTimer = useCallback(() => {
    clearTimer();

    timerRef.current = setInterval(() => {
      advance(1);
    }, AUTOPLAY_DELAY);
  }, [advance]);

  useEffect(() => {
    if (slideCount < 2) return;

    startTimer();

    return () => {
      clearTimer();
    };
  }, [slideCount, startTimer]);

  const handleSlideChange = (index: number) => {
    setActive(index);
    startTimer();
  };

  const handleAdvance = (dir: 1 | -1) => {
    advance(dir);
    startTimer();
  };

  return (
    <section className="bg-[#f6f6f4] pt-2 pb-5 sm:pt-3 lg:pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
          <div className="grid lg:min-h-[560px] lg:grid-cols-[1.08fr_0.92fr]">
            {/* LEFT */}
            <div
              className="
                relative flex flex-col justify-between overflow-hidden
                bg-[#0d1117]
                px-5 py-6
                sm:px-7 sm:py-7
                lg:px-10 lg:py-9
              "
            >
              {/* ambient texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,.7) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />

              {/* ambient glow */}
              <div className="absolute -left-28 top-0 h-[280px] w-[280px] rounded-full bg-orange-500/10 blur-3xl" />

              {/* subtle gradient */}
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_28%)]" />

              <div className="relative z-10">
                {/* top row */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={openLocationPicker}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/70 transition-colors duration-200 hover:bg-white/[0.08]"
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

                {/* heading */}
                <h1
                  className="
                    max-w-[13ch]
                    text-balance
                    font-heading
                    text-[clamp(2.65rem,8vw,5.1rem)]
                    font-extrabold
                    leading-[0.94]
                    tracking-[-0.05em]
                    text-white
                    sm:max-w-[14ch]
                    md:max-w-[15ch]
                    lg:max-w-[13ch]
                  "
                >
                  {content.title}
                </h1>

                {/* description */}
                <p
                  className="
                    mt-4
                    max-w-[34rem]
                    text-[14px]
                    leading-6
                    text-white/60
                    sm:text-[15px]
                    sm:leading-7
                  "
                >
                  {content.description}
                </p>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="
                    group mt-7 inline-flex w-full items-center
                    justify-center gap-3 rounded-2xl
                    bg-orange-500 px-6 py-3.5 text-sm
                    font-semibold text-white
                    shadow-[0_18px_40px_rgba(249,115,22,0.32)]
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:bg-orange-400
                    sm:w-auto
                  "
                >
                  Explore Now

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* trust strip */}
              <div className="relative z-10 mt-7 border-t border-white/[0.06] pt-5">
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
            <div
              className="
                relative min-h-[300px]
                overflow-hidden
                bg-[#090d14]
                sm:min-h-[360px]
                lg:min-h-[420px]
              "
            >
              {HERO_SLIDES.map((slide, i) => {
                const isActive = i === active;

                return (
                  <div
                    key={slide.alt}
                    className="absolute inset-0 will-change-transform transition-all duration-700 ease-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: `scale(${
                        isActive ? 1 : 1.04
                      })`,
                      zIndex: isActive ? 2 : 1,
                    }}
                    aria-hidden={!isActive}
                  >
                    {/* IMAGE */}
                    <div className="relative h-full w-full">
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        width={1200}
                        height={800}
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={
                          i === 0 ? "high" : "auto"
                        }
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-cover select-none"
                      />

                      {/* cinematic overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />

                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.34))]" />

                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.12),transparent_35%)]" />
                    </div>

                    {/* floating stats */}
                    <div className="absolute left-5 top-5 z-30 hidden items-center gap-3 lg:flex">
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-lg">
                        <p className="text-lg font-bold text-white">
                          24/7
                        </p>

                        <p className="text-[11px] text-white/60">
                          Booking support
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-lg">
                        <p className="text-lg font-bold text-white">
                          Same Day
                        </p>

                        <p className="text-[11px] text-white/60">
                          Service available
                        </p>
                      </div>
                    </div>

                    {/* slide counter */}
                    <div className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold tracking-wide text-white/75 backdrop-blur-lg">
                      {String(active + 1).padStart(2, "0")}

                      <span className="px-1 text-white/30">
                        /
                      </span>

                      {String(slideCount).padStart(2, "0")}
                    </div>

                    {/* bottom card */}
                    <div className="absolute inset-x-0 bottom-5 z-20 p-4 sm:p-5">
                      <div
                        className="
                          max-w-full
                          rounded-[1.5rem]
                          border border-white/10
                          bg-black/30
                          p-4
                          backdrop-blur-lg
                          sm:max-w-[340px]
                          sm:p-5
                        "
                      >
                        <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                          Premium Home Services
                        </div>

                        <p className="text-[1.2rem] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[1.45rem]">
                          {slide.caption}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/65">
                          Trusted professionals,
                          intentional craftsmanship,
                          and premium service
                          experiences designed for
                          modern homeowners.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* controls */}
              <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-4 py-4 sm:px-5 sm:py-5">
                {/* dots */}
                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      onClick={() =>
                        handleSlideChange(i)
                      }
                      className={`rounded-full transition-all duration-300 ${
                        i === active
                          ? "h-2 w-10 bg-white"
                          : "h-2 w-2 bg-white/35 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>

                {/* arrows */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => handleAdvance(-1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-lg transition-colors duration-200 hover:bg-black/35 sm:h-10 sm:w-10"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => handleAdvance(1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-lg transition-colors duration-200 hover:bg-black/35 sm:h-10 sm:w-10"
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