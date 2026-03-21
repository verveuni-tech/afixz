import { DeepPartial, mergeBaseWithLocationOverride } from "./locationContent";
import { LocationId, isLocationId } from "./locations";

export type ServiceEntry = {
  id: string;
  title: string;
  slug: string;
  price: number;
  duration: string;
  warranty: string;
  professionals: string | number;
  overview: string;
  shortDescription: string;
  included: string[];
  images: string[];
  categoryId: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  searchKeywords: string[];
  isRecommended: boolean;
  availableLocations?: LocationId[];
  contentByLocation?: Partial<Record<LocationId, DeepPartial<ServiceEntry>>>;
  priceByLocation?: Partial<Record<LocationId, number>>;
};

export function normalizeService(id: string, raw: Record<string, any>): ServiceEntry {
  const normalizedLocations = Array.isArray(raw.availableLocations)
    ? raw.availableLocations.filter((value: unknown): value is LocationId => isLocationId(value))
    : undefined;

  return {
    id,
    title: String(raw.title || "Untitled Service").trim() || "Untitled Service",
    slug: String(raw.slug || id).trim() || id,
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    duration: String(raw.duration || "").trim(),
    warranty: String(raw.warranty || "").trim(),
    professionals: raw.professionals ?? "",
    overview: String(raw.overview || "").trim(),
    shortDescription: String(raw.shortDescription || raw.overview || "").trim(),
    included: Array.isArray(raw.included)
      ? raw.included.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [],
    images: Array.isArray(raw.images)
      ? raw.images.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [],
    categoryId: String(raw.categoryId || "").trim(),
    categorySlug: String(raw.categorySlug || "").trim(),
    rating: typeof raw.rating === "number" ? raw.rating : Number(raw.rating) || 0,
    reviewCount:
      typeof raw.reviewCount === "number" ? raw.reviewCount : Number(raw.reviewCount) || 0,
    searchKeywords: Array.isArray(raw.searchKeywords)
      ? raw.searchKeywords.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [],
    isRecommended: raw.isRecommended === true,
    availableLocations: normalizedLocations,
    contentByLocation: isRecord(raw.contentByLocation)
      ? (raw.contentByLocation as Partial<Record<LocationId, DeepPartial<ServiceEntry>>>)
      : undefined,
    priceByLocation: isRecord(raw.priceByLocation)
      ? (raw.priceByLocation as Partial<Record<LocationId, number>>)
      : undefined,
  };
}

export function isServiceAvailableInLocation(
  service: Pick<ServiceEntry, "availableLocations">,
  selectedLocation: LocationId | null
) {
  if (!selectedLocation) {
    return true;
  }

  if (!service.availableLocations || service.availableLocations.length === 0) {
    return true;
  }

  return service.availableLocations.includes(selectedLocation);
}

export function resolveServiceForLocation(service: ServiceEntry, selectedLocation: LocationId | null) {
  const merged = mergeBaseWithLocationOverride(
    service,
    selectedLocation,
    service.contentByLocation || null
  );

  const priceOverride =
    selectedLocation && service.priceByLocation?.[selectedLocation] != null
      ? service.priceByLocation[selectedLocation]
      : undefined;

  return {
    ...merged,
    price: typeof priceOverride === "number" ? priceOverride : merged.price,
  };
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
