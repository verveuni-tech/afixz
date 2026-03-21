import type { LocationId } from "./locations";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends Record<string, any>
    ? DeepPartial<T[K]>
    : T[K];
};

export function mergeBaseWithLocationOverride<T extends Record<string, any>>(
  base: T,
  location: LocationId | null,
  overrideMap?: Partial<Record<LocationId, DeepPartial<T>>> | null
) {
  if (!location || !overrideMap?.[location]) {
    return deepMerge(base, {});
  }

  return deepMerge(base, overrideMap[location] || {});
}

export function deepMerge<T extends Record<string, any>>(
  base: T,
  override?: DeepPartial<T> | null
): T {
  if (!override) {
    return Array.isArray(base) ? ([...base] as T) : ({ ...base } as T);
  }

  const result: Record<string, any> = Array.isArray(base) ? [...base] : { ...base };

  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      result[key] = [...value];
      return;
    }

    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
      return;
    }

    result[key] = value;
  });

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
