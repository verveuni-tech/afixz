export type LocationId = "delhi" | "noida" | "gurgaon";

export type LocationOption = {
  id: LocationId;
  label: string;
  subtitle: string;
  shortLabel: string;
};

export const ALL_LOCATIONS: LocationId[] = ["delhi", "noida", "gurgaon"];

export const LOCATION_OPTIONS: LocationOption[] = [
  {
    id: "delhi",
    label: "Delhi",
    shortLabel: "Delhi",
    subtitle: "Home services across selected Delhi areas",
  },
  {
    id: "noida",
    label: "Noida",
    shortLabel: "Noida",
    subtitle: "Fast slots for apartments, villas, and offices in Noida",
  },
  {
    id: "gurgaon",
    label: "Gurgaon",
    shortLabel: "Gurgaon",
    subtitle: "Trusted professionals serving Gurgaon neighborhoods",
  },
];

export function isLocationId(value: unknown): value is LocationId {
  return typeof value === "string" && ALL_LOCATIONS.includes(value as LocationId);
}

export function getLocationLabel(locationId: LocationId | null | undefined) {
  if (!locationId) {
    return "Select location";
  }

  return (
    LOCATION_OPTIONS.find((location) => location.id === locationId)?.label ||
    "Select location"
  );
}
