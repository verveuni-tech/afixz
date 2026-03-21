export type CategorySectionKey = "cleaning" | "repair" | "beauty" | "gardening";

export type CategoryEntry = {
  id: string;
  name: string;
  slug: string;
};

const SECTION_ALIASES: Record<CategorySectionKey, string[]> = {
  cleaning: ["cleaning", "home-cleaning", "cleaning-services"],
  repair: [
    "repair",
    "repair-maintainance",
    "repair-maintenance",
    "repair-and-maintenance",
    "repair-services",
    "maintenance",
  ],
  beauty: [
    "beauty",
    "haircut",
    "beauty-personal-care",
    "beauty-and-personal-care",
    "personal-care",
    "grooming",
  ],
  gardening: [
    "gardening",
    "garden",
    "plant",
    "plants",
    "plant-gardening",
    "plant-and-gardening",
    "plant-care",
  ],
};

const aliasToSectionKey = Object.entries(SECTION_ALIASES).reduce<Record<string, CategorySectionKey>>(
  (accumulator, [sectionKey, aliases]) => {
    aliases.forEach((alias) => {
      accumulator[canonicalizeCategoryValue(alias)] = sectionKey as CategorySectionKey;
    });

    return accumulator;
  },
  {}
);

export function canonicalizeCategoryValue(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/maintainance/g, "maintenance")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCategory(id: string, raw: Record<string, any>): CategoryEntry {
  const slug = String(raw.slug || id).trim() || id;
  const nameSource = String(raw.name || raw.title || "").trim();

  return {
    id,
    slug,
    name: nameSource || humanizeCategorySlug(slug),
  };
}

export function expandCategoryAliases(value: string) {
  const canonical = canonicalizeCategoryValue(value);
  const sectionKey = aliasToSectionKey[canonical];

  if (!sectionKey) {
    return canonical ? [canonical] : [];
  }

  return Array.from(
    new Set(
      SECTION_ALIASES[sectionKey]
        .map((entry) => canonicalizeCategoryValue(entry))
        .concat(canonical)
        .filter(Boolean)
    )
  );
}

export function inferCategorySectionKey(...values: Array<string | undefined | null>) {
  for (const value of values) {
    const aliases = expandCategoryAliases(String(value || ""));

    for (const alias of aliases) {
      const sectionKey = aliasToSectionKey[alias];
      if (sectionKey) {
        return sectionKey;
      }
    }
  }

  return null;
}

export function matchesCategory(category: CategoryEntry, ...values: Array<string | undefined | null>) {
  const categoryTokens = new Set([
    canonicalizeCategoryValue(category.slug),
    canonicalizeCategoryValue(category.name),
  ]);

  return values.some((value) =>
    expandCategoryAliases(String(value || "")).some((alias) => categoryTokens.has(alias))
  );
}

export function resolveCategoryMatch(
  categories: CategoryEntry[],
  {
    preferredSlug,
    sectionKey,
    hints = [],
  }: {
    preferredSlug?: string;
    sectionKey?: CategorySectionKey;
    hints?: string[];
  }
) {
  const exactMatch = categories.find((category) => matchesCategory(category, preferredSlug));

  if (exactMatch) {
    return exactMatch;
  }

  if (sectionKey) {
    const sectionMatch = categories.find((category) =>
      matchesCategory(category, ...SECTION_ALIASES[sectionKey])
    );

    if (sectionMatch) {
      return sectionMatch;
    }
  }

  return categories.find((category) => matchesCategory(category, ...hints)) || null;
}

function humanizeCategorySlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
