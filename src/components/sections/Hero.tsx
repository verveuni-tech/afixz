import React, { useEffect, useState } from "react";
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
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { HomepageHeroContent } from "../../lib/homepageFallbackContent";
import { getLocationLabel } from "../../lib/locations";
import { useLocationContext } from "../../context/LocationContext";

type Props = {
  content: HomepageHeroContent;
};

type CategoryCard = {
  label: string;
  slug: string;
  icon: typeof Sprout;
  image: string;
  serviceCount: number;
};

const CATEGORY_META: Record<
  string,
  { icon: typeof Sprout; label: string; order: number }
> = {
  "garden-and-landscaping": { icon: Sprout, label: "Gardening", order: 0 },
  mechanic: { icon: Bike, label: "Mechanic", order: 1 },
  interior: { icon: Home, label: "Interior", order: 2 },
  fabrication: { icon: Hammer, label: "Fabrication", order: 3 },
  cleaning: { icon: BrushCleaning, label: "Cleaning", order: 4 },
};

const CATEGORY_SLUGS = Object.keys(CATEGORY_META);

const Hero: React.FC<Props> = ({ content }) => {
  const navigate = useNavigate();
  const { selectedLocation, openLocationPicker } = useLocationContext();
  const [cards, setCards] = useState<CategoryCard[]>([]);

  useEffect(() => {
    let active = true;

    async function loadCategoryImages() {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const categoryMap = new Map<string, string>();

        catSnap.docs.forEach((doc) => {
          const data = doc.data();
          const slug = String(data.slug || doc.id).trim().toLowerCase();
          categoryMap.set(slug, doc.id);
        });

        const results: CategoryCard[] = [];

        for (const slug of CATEGORY_SLUGS) {
          const meta = CATEGORY_META[slug];
          const catId = categoryMap.get(slug);

          let image = "";
          let serviceCount = 0;

          if (catId) {
            const svcSnap = await getDocs(
              query(
                collection(db, "services"),
                where("categoryId", "==", catId),
                limit(10)
              )
            );
            serviceCount = svcSnap.size;

            for (const svcDoc of svcSnap.docs) {
              const svcData = svcDoc.data();
              const images = Array.isArray(svcData.images) ? svcData.images : [];
              const firstImage = images.find(
                (img: unknown) => typeof img === "string" && img.trim()
              );
              if (firstImage) {
                image = String(firstImage).trim();
                break;
              }
            }
          }

          results.push({
            label: meta.label,
            slug,
            icon: meta.icon,
            image,
            serviceCount,
          });
        }

        if (active) {
          setCards(results.sort((a, b) => CATEGORY_META[a.slug].order - CATEGORY_META[b.slug].order));
        }
      } catch (error) {
        console.error("Failed to load hero category images:", error);
      }
    }

    void loadCategoryImages();
    return () => { active = false; };
  }, []);

  const trustItems = content.trustBadge
    .split("·")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="relative overflow-hidden bg-[#fafaf9] pt-24 pb-14 sm:pt-28 sm:pb-18">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header row */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 flex items-center gap-3">
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

              <span className="text-[11px] font-semibold tracking-[0.15em] text-accent uppercase">
                {content.eyebrow}
              </span>
            </div>

            <h1 className="font-heading text-[clamp(1.6rem,3.5vw,2.5rem)] leading-[1.15] font-bold tracking-tight text-slate-900">
              {content.title}
            </h1>

            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
              {content.description}
            </p>
          </div>

          {/* Trust badges — desktop */}
          <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400"
              >
                <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:gap-4 lg:grid-cols-4 lg:auto-rows-[220px]">
          {cards.map((card, index) => {
            const Icon = card.icon;
            // First card spans 2 cols + 2 rows on large screens
            const isFeature = index === 0;
            // Last card spans 2 cols on mobile only
            const isLast = index === cards.length - 1 && cards.length % 2 !== 0;

            return (
              <button
                key={card.slug}
                type="button"
                onClick={() => navigate(`/category/${card.slug}`)}
                className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-200 hover:-translate-y-0.5 ${
                  isFeature ? "lg:col-span-2 lg:row-span-2" : ""
                } ${isLast ? "col-span-2 sm:col-span-1" : ""}`}
              >
                {/* Image */}
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100">
                    <Icon
                      size={isFeature ? 80 : 48}
                      className="absolute right-4 bottom-4 text-slate-200/80"
                      strokeWidth={1}
                    />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="relative flex h-full flex-col justify-end p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                      <Icon size={14} className="text-white" strokeWidth={2} />
                    </div>
                    {card.serviceCount > 0 && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                        {card.serviceCount} {card.serviceCount === 1 ? "service" : "services"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <h3
                      className={`font-heading font-semibold text-white ${
                        isFeature ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
                      }`}
                    >
                      {card.label}
                    </h3>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-white/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white/80"
                    />
                  </div>
                </div>
              </button>
            );
          })}

          {/* Static loading placeholders when cards haven't loaded */}
          {cards.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`animate-pulse rounded-2xl bg-slate-100 ${
                  i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                } ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
              />
            ))}
        </div>

        {/* Bottom row: CTA + mobile trust */}
        <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-accent/15 transition hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]"
          >
            {content.ctaText}
            <ArrowRight size={15} />
          </button>

          {/* Mobile trust badges */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:hidden">
            {trustItems.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 text-[10px] font-medium text-slate-400"
              >
                <CheckCircle size={10} className="text-emerald-500 shrink-0" />
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
