import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { CheckCircle } from "lucide-react";
import { db } from "../../firebase";
import { homepageFallbackContent } from "../../lib/homepageFallbackContent";
import { LocationId, LOCATION_OPTIONS } from "../../lib/locations";

type LocationOverrideState = {
  heroTitle: string;
  heroDescription: string;
  cleaningTitle: string;
  cleaningSubtitle: string;
  repairTitle: string;
  repairSubtitle: string;
  beautyTitle: string;
  beautySubtitle: string;
  gardeningTitle: string;
  gardeningSubtitle: string;
  featuredServiceIds: string;
  featuredCategorySlugs: string;
};

type FormState = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroSearchPlaceholder: string;
  heroCtaText: string;
  heroQuickServices: string;
  heroTrustBadge: string;
  topCategoriesEyebrow: string;
  topCategoriesTitle: string;
  topCategoriesDescription: string;
  topCategoriesCtaText: string;
  featuredCategorySlugs: string;
  recommendedEyebrow: string;
  recommendedTitle: string;
  recommendedDescription: string;
  recommendedCtaText: string;
  featuredServiceIds: string;
  cleaningTitle: string;
  cleaningSubtitle: string;
  cleaningDescription: string;
  repairTitle: string;
  repairSubtitle: string;
  repairDescription: string;
  beautyTitle: string;
  beautySubtitle: string;
  beautyDescription: string;
  gardeningTitle: string;
  gardeningSubtitle: string;
  gardeningDescription: string;
  byLocation: Record<LocationId, LocationOverrideState>;
};

const initialLocationOverride = (): LocationOverrideState => ({
  heroTitle: "",
  heroDescription: "",
  cleaningTitle: "",
  cleaningSubtitle: "",
  repairTitle: "",
  repairSubtitle: "",
  beautyTitle: "",
  beautySubtitle: "",
  gardeningTitle: "",
  gardeningSubtitle: "",
  featuredServiceIds: "",
  featuredCategorySlugs: "",
});

const initialState = (): FormState => ({
  heroEyebrow: homepageFallbackContent.hero.eyebrow,
  heroTitle: homepageFallbackContent.hero.title,
  heroDescription: homepageFallbackContent.hero.description,
  heroSearchPlaceholder: homepageFallbackContent.hero.searchPlaceholder,
  heroCtaText: homepageFallbackContent.hero.ctaText,
  heroQuickServices: homepageFallbackContent.hero.quickServices.join(", "),
  heroTrustBadge: homepageFallbackContent.hero.trustBadge,
  topCategoriesEyebrow: homepageFallbackContent.topCategories.eyebrow,
  topCategoriesTitle: homepageFallbackContent.topCategories.title,
  topCategoriesDescription: homepageFallbackContent.topCategories.description,
  topCategoriesCtaText: homepageFallbackContent.topCategories.ctaText,
  featuredCategorySlugs: homepageFallbackContent.topCategories.featuredCategorySlugs.join(", "),
  recommendedEyebrow: homepageFallbackContent.recommended.eyebrow,
  recommendedTitle: homepageFallbackContent.recommended.title,
  recommendedDescription: homepageFallbackContent.recommended.description,
  recommendedCtaText: homepageFallbackContent.recommended.ctaText,
  featuredServiceIds: homepageFallbackContent.recommended.featuredServiceIds.join(", "),
  cleaningTitle: homepageFallbackContent.sections.cleaning.title,
  cleaningSubtitle: homepageFallbackContent.sections.cleaning.subtitle,
  cleaningDescription: homepageFallbackContent.sections.cleaning.description,
  repairTitle: homepageFallbackContent.sections.repair.title,
  repairSubtitle: homepageFallbackContent.sections.repair.subtitle,
  repairDescription: homepageFallbackContent.sections.repair.description,
  beautyTitle: homepageFallbackContent.sections.beauty.title,
  beautySubtitle: homepageFallbackContent.sections.beauty.subtitle,
  beautyDescription: homepageFallbackContent.sections.beauty.description,
  gardeningTitle: homepageFallbackContent.sections.gardening.title,
  gardeningSubtitle: homepageFallbackContent.sections.gardening.subtitle,
  gardeningDescription: homepageFallbackContent.sections.gardening.description,
  byLocation: {
    delhi: initialLocationOverride(),
    noida: initialLocationOverride(),
    gurgaon: initialLocationOverride(),
  },
});

export default function HomepageContentFormCard() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const snapshot = await getDoc(doc(db, "siteContent", "homepage"));

        if (!snapshot.exists() || !active) {
          return;
        }

        const raw = snapshot.data() as Record<string, any>;
        const defaultContent = raw.default || {};
        const byLocation = raw.byLocation || {};

        setForm((prev) => ({
          ...prev,
          heroEyebrow: defaultContent.hero?.eyebrow || prev.heroEyebrow,
          heroTitle: defaultContent.hero?.title || prev.heroTitle,
          heroDescription: defaultContent.hero?.description || prev.heroDescription,
          heroSearchPlaceholder:
            defaultContent.hero?.searchPlaceholder || prev.heroSearchPlaceholder,
          heroCtaText: defaultContent.hero?.ctaText || prev.heroCtaText,
          heroQuickServices: Array.isArray(defaultContent.hero?.quickServices)
            ? defaultContent.hero.quickServices.join(", ")
            : prev.heroQuickServices,
          heroTrustBadge: defaultContent.hero?.trustBadge || prev.heroTrustBadge,
          topCategoriesEyebrow:
            defaultContent.topCategories?.eyebrow || prev.topCategoriesEyebrow,
          topCategoriesTitle:
            defaultContent.topCategories?.title || prev.topCategoriesTitle,
          topCategoriesDescription:
            defaultContent.topCategories?.description || prev.topCategoriesDescription,
          topCategoriesCtaText:
            defaultContent.topCategories?.ctaText || prev.topCategoriesCtaText,
          featuredCategorySlugs: Array.isArray(defaultContent.topCategories?.featuredCategorySlugs)
            ? defaultContent.topCategories.featuredCategorySlugs.join(", ")
            : prev.featuredCategorySlugs,
          recommendedEyebrow:
            defaultContent.recommended?.eyebrow || prev.recommendedEyebrow,
          recommendedTitle:
            defaultContent.recommended?.title || prev.recommendedTitle,
          recommendedDescription:
            defaultContent.recommended?.description || prev.recommendedDescription,
          recommendedCtaText:
            defaultContent.recommended?.ctaText || prev.recommendedCtaText,
          featuredServiceIds: Array.isArray(defaultContent.recommended?.featuredServiceIds)
            ? defaultContent.recommended.featuredServiceIds.join(", ")
            : prev.featuredServiceIds,
          cleaningTitle: defaultContent.sections?.cleaning?.title || prev.cleaningTitle,
          cleaningSubtitle: defaultContent.sections?.cleaning?.subtitle || prev.cleaningSubtitle,
          cleaningDescription:
            defaultContent.sections?.cleaning?.description || prev.cleaningDescription,
          repairTitle: defaultContent.sections?.repair?.title || prev.repairTitle,
          repairSubtitle: defaultContent.sections?.repair?.subtitle || prev.repairSubtitle,
          repairDescription:
            defaultContent.sections?.repair?.description || prev.repairDescription,
          beautyTitle: defaultContent.sections?.beauty?.title || prev.beautyTitle,
          beautySubtitle: defaultContent.sections?.beauty?.subtitle || prev.beautySubtitle,
          beautyDescription:
            defaultContent.sections?.beauty?.description || prev.beautyDescription,
          gardeningTitle:
            defaultContent.sections?.gardening?.title || prev.gardeningTitle,
          gardeningSubtitle:
            defaultContent.sections?.gardening?.subtitle || prev.gardeningSubtitle,
          gardeningDescription:
            defaultContent.sections?.gardening?.description || prev.gardeningDescription,
          byLocation: {
            delhi: mapLocationOverride(prev.byLocation.delhi, byLocation.delhi),
            noida: mapLocationOverride(prev.byLocation.noida, byLocation.noida),
            gurgaon: mapLocationOverride(prev.byLocation.gurgaon, byLocation.gurgaon),
          },
        }));
      } catch (error) {
        console.error("Failed to load homepage content:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const preview = useMemo(
    () => ({
      title: form.heroTitle,
      cleaning: form.cleaningTitle,
      recommended: form.recommendedTitle,
    }),
    [form.cleaningTitle, form.heroTitle, form.recommendedTitle]
  );

  const handleChange =
    (field: keyof Omit<FormState, "byLocation">) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleLocationChange =
    (location: LocationId, field: keyof LocationOverrideState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        byLocation: {
          ...prev.byLocation,
          [location]: {
            ...prev.byLocation[location],
            [field]: value,
          },
        },
      }));
    };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      await setDoc(doc(db, "siteContent", "homepage"), {
        default: {
          hero: {
            eyebrow: form.heroEyebrow.trim(),
            title: form.heroTitle.trim(),
            description: form.heroDescription.trim(),
            searchPlaceholder: form.heroSearchPlaceholder.trim(),
            ctaText: form.heroCtaText.trim(),
            quickServices: splitComma(form.heroQuickServices),
            trustBadge: form.heroTrustBadge.trim(),
          },
          topCategories: {
            eyebrow: form.topCategoriesEyebrow.trim(),
            title: form.topCategoriesTitle.trim(),
            description: form.topCategoriesDescription.trim(),
            ctaText: form.topCategoriesCtaText.trim(),
            featuredCategorySlugs: splitComma(form.featuredCategorySlugs),
          },
          recommended: {
            eyebrow: form.recommendedEyebrow.trim(),
            title: form.recommendedTitle.trim(),
            description: form.recommendedDescription.trim(),
            ctaText: form.recommendedCtaText.trim(),
            featuredServiceIds: splitComma(form.featuredServiceIds),
          },
          sections: {
            cleaning: {
              title: form.cleaningTitle.trim(),
              subtitle: form.cleaningSubtitle.trim(),
              description: form.cleaningDescription.trim(),
            },
            repair: {
              title: form.repairTitle.trim(),
              subtitle: form.repairSubtitle.trim(),
              description: form.repairDescription.trim(),
            },
            beauty: {
              title: form.beautyTitle.trim(),
              subtitle: form.beautySubtitle.trim(),
              description: form.beautyDescription.trim(),
            },
            gardening: {
              title: form.gardeningTitle.trim(),
              subtitle: form.gardeningSubtitle.trim(),
              description: form.gardeningDescription.trim(),
            },
          },
        },
        byLocation: buildLocationPayload(form.byLocation),
        updatedAt: serverTimestamp(),
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save homepage content:", error);
      alert("We couldn't save the homepage content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="h-20 rounded bg-slate-100" />
          <div className="h-20 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <>
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-6 py-4 shadow-lg">
          <CheckCircle className="text-emerald-500" size={20} />
          <span className="text-sm font-medium text-slate-700">
            Homepage content saved successfully
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Homepage Content</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage the default homepage copy and add city-specific overrides without touching
              the layout code.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Preview: <span className="font-semibold text-slate-800">{preview.title}</span>
          </div>
        </div>

        <div className="mt-8 space-y-10">
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Hero</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Eyebrow" value={form.heroEyebrow} onChange={handleChange("heroEyebrow")} />
              <Input label="CTA Text" value={form.heroCtaText} onChange={handleChange("heroCtaText")} />
              <Input label="Hero Title" value={form.heroTitle} onChange={handleChange("heroTitle")} className="md:col-span-2" />
              <Textarea label="Hero Description" value={form.heroDescription} onChange={handleChange("heroDescription")} className="md:col-span-2" />
              <Input
                label="Search Placeholder"
                value={form.heroSearchPlaceholder}
                onChange={handleChange("heroSearchPlaceholder")}
              />
              <Input label="Trust Badge" value={form.heroTrustBadge} onChange={handleChange("heroTrustBadge")} />
              <Input
                label="Quick Services"
                value={form.heroQuickServices}
                onChange={handleChange("heroQuickServices")}
                helperText="Comma-separated labels"
                className="md:col-span-2"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Top Categories</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Eyebrow" value={form.topCategoriesEyebrow} onChange={handleChange("topCategoriesEyebrow")} />
              <Input label="CTA Text" value={form.topCategoriesCtaText} onChange={handleChange("topCategoriesCtaText")} />
              <Input label="Title" value={form.topCategoriesTitle} onChange={handleChange("topCategoriesTitle")} className="md:col-span-2" />
              <Textarea label="Description" value={form.topCategoriesDescription} onChange={handleChange("topCategoriesDescription")} className="md:col-span-2" />
              <Input
                label="Featured Category Slugs"
                value={form.featuredCategorySlugs}
                onChange={handleChange("featuredCategorySlugs")}
                helperText="Comma-separated category slugs"
                className="md:col-span-2"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Recommended Services</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Eyebrow" value={form.recommendedEyebrow} onChange={handleChange("recommendedEyebrow")} />
              <Input label="CTA Text" value={form.recommendedCtaText} onChange={handleChange("recommendedCtaText")} />
              <Input label="Title" value={form.recommendedTitle} onChange={handleChange("recommendedTitle")} className="md:col-span-2" />
              <Textarea label="Description" value={form.recommendedDescription} onChange={handleChange("recommendedDescription")} className="md:col-span-2" />
              <Input
                label="Featured Service IDs"
                value={form.featuredServiceIds}
                onChange={handleChange("featuredServiceIds")}
                helperText="Comma-separated Firestore service document ids"
                className="md:col-span-2"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Category Sections</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Input label="Cleaning Title" value={form.cleaningTitle} onChange={handleChange("cleaningTitle")} />
              <Input label="Cleaning Subtitle" value={form.cleaningSubtitle} onChange={handleChange("cleaningSubtitle")} />
              <Textarea label="Cleaning Description" value={form.cleaningDescription} onChange={handleChange("cleaningDescription")} className="md:col-span-2" />
              <Input label="Repair Title" value={form.repairTitle} onChange={handleChange("repairTitle")} />
              <Input label="Repair Subtitle" value={form.repairSubtitle} onChange={handleChange("repairSubtitle")} />
              <Textarea label="Repair Description" value={form.repairDescription} onChange={handleChange("repairDescription")} className="md:col-span-2" />
              <Input label="Beauty Title" value={form.beautyTitle} onChange={handleChange("beautyTitle")} />
              <Input label="Beauty Subtitle" value={form.beautySubtitle} onChange={handleChange("beautySubtitle")} />
              <Textarea label="Beauty Description" value={form.beautyDescription} onChange={handleChange("beautyDescription")} className="md:col-span-2" />
              <Input label="Gardening Title" value={form.gardeningTitle} onChange={handleChange("gardeningTitle")} />
              <Input label="Gardening Subtitle" value={form.gardeningSubtitle} onChange={handleChange("gardeningSubtitle")} />
              <Textarea label="Gardening Description" value={form.gardeningDescription} onChange={handleChange("gardeningDescription")} className="md:col-span-2" />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Location Overrides</h3>
            <div className="space-y-6">
              {LOCATION_OPTIONS.map((location) => (
                <div key={location.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h4 className="text-base font-semibold text-slate-800">{location.label}</h4>
                  <p className="mt-1 text-sm text-slate-500">{location.subtitle}</p>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Input label="Hero Title Override" value={form.byLocation[location.id].heroTitle} onChange={handleLocationChange(location.id, "heroTitle")} />
                    <Textarea label="Hero Description Override" value={form.byLocation[location.id].heroDescription} onChange={handleLocationChange(location.id, "heroDescription")} />
                    <Input label="Cleaning Title Override" value={form.byLocation[location.id].cleaningTitle} onChange={handleLocationChange(location.id, "cleaningTitle")} />
                    <Input label="Cleaning Subtitle Override" value={form.byLocation[location.id].cleaningSubtitle} onChange={handleLocationChange(location.id, "cleaningSubtitle")} />
                    <Input label="Repair Title Override" value={form.byLocation[location.id].repairTitle} onChange={handleLocationChange(location.id, "repairTitle")} />
                    <Input label="Repair Subtitle Override" value={form.byLocation[location.id].repairSubtitle} onChange={handleLocationChange(location.id, "repairSubtitle")} />
                    <Input label="Beauty Title Override" value={form.byLocation[location.id].beautyTitle} onChange={handleLocationChange(location.id, "beautyTitle")} />
                    <Input label="Beauty Subtitle Override" value={form.byLocation[location.id].beautySubtitle} onChange={handleLocationChange(location.id, "beautySubtitle")} />
                    <Input label="Gardening Title Override" value={form.byLocation[location.id].gardeningTitle} onChange={handleLocationChange(location.id, "gardeningTitle")} />
                    <Input label="Gardening Subtitle Override" value={form.byLocation[location.id].gardeningSubtitle} onChange={handleLocationChange(location.id, "gardeningSubtitle")} />
                    <Input label="Featured Service IDs" value={form.byLocation[location.id].featuredServiceIds} onChange={handleLocationChange(location.id, "featuredServiceIds")} />
                    <Input label="Featured Category Slugs" value={form.byLocation[location.id].featuredCategorySlugs} onChange={handleLocationChange(location.id, "featuredCategorySlugs")} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {saving ? "Saving..." : "Save Homepage Content"}
          </button>
        </div>
      </div>
    </>
  );
}

function mapLocationOverride(initial: LocationOverrideState, value: Record<string, any> | undefined) {
  return {
    ...initial,
    heroTitle: value?.hero?.title || "",
    heroDescription: value?.hero?.description || "",
    cleaningTitle: value?.sections?.cleaning?.title || "",
    cleaningSubtitle: value?.sections?.cleaning?.subtitle || "",
    repairTitle: value?.sections?.repair?.title || "",
    repairSubtitle: value?.sections?.repair?.subtitle || "",
    beautyTitle: value?.sections?.beauty?.title || "",
    beautySubtitle: value?.sections?.beauty?.subtitle || "",
    gardeningTitle: value?.sections?.gardening?.title || "",
    gardeningSubtitle: value?.sections?.gardening?.subtitle || "",
    featuredServiceIds: Array.isArray(value?.recommended?.featuredServiceIds)
      ? value.recommended.featuredServiceIds.join(", ")
      : "",
    featuredCategorySlugs: Array.isArray(value?.topCategories?.featuredCategorySlugs)
      ? value.topCategories.featuredCategorySlugs.join(", ")
      : "",
  };
}

function buildLocationPayload(byLocation: Record<LocationId, LocationOverrideState>) {
  return Object.fromEntries(
    Object.entries(byLocation).map(([location, value]) => [
      location,
      compactMap({
        hero: compactMap({
          title: value.heroTitle.trim(),
          description: value.heroDescription.trim(),
        }),
        topCategories: compactMap({
          featuredCategorySlugs: splitComma(value.featuredCategorySlugs),
        }),
        recommended: compactMap({
          featuredServiceIds: splitComma(value.featuredServiceIds),
        }),
        sections: compactMap({
          cleaning: compactMap({
            title: value.cleaningTitle.trim(),
            subtitle: value.cleaningSubtitle.trim(),
          }),
          repair: compactMap({
            title: value.repairTitle.trim(),
            subtitle: value.repairSubtitle.trim(),
          }),
          beauty: compactMap({
            title: value.beautyTitle.trim(),
            subtitle: value.beautySubtitle.trim(),
          }),
          gardening: compactMap({
            title: value.gardeningTitle.trim(),
            subtitle: value.gardeningSubtitle.trim(),
          }),
        }),
      }),
    ])
  );
}

function compactMap<T extends Record<string, any>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (Array.isArray(entry)) {
        return entry.length > 0;
      }

      if (typeof entry === "object" && entry !== null) {
        return Object.keys(entry).length > 0;
      }

      return Boolean(entry);
    })
  );
}

function splitComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Input({
  label,
  value,
  onChange,
  helperText,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-slate-600">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helperText && (
        <p className="mt-2 text-xs leading-6 text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm text-slate-600">{label}</label>
      <textarea
        rows={4}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
