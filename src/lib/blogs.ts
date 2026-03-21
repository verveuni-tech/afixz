import { mergeBaseWithLocationOverride } from "./locationContent";
import { isLocationId, LocationId } from "./locations";

type TimestampLike = {
  toDate?: () => Date;
  seconds?: number;
};

type BlogLocationOverride = Partial<{
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImage: string;
  coverImage: string;
}>;

export type BlogEntry = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedAt: Date | null;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImage: string;
  status: string;
  availableLocations?: LocationId[];
  contentByLocation?: Partial<Record<LocationId, BlogLocationOverride>>;
};

const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80";

export function normalizeBlog(id: string, raw: Record<string, any>): BlogEntry {
  const title =
    String(raw.title || raw.name || raw.heading || "Untitled Blog").trim() ||
    "Untitled Blog";
  const content = String(
    raw.content || raw.body || raw.description || raw.excerpt || ""
  ).trim();
  const excerptSource = String(
    raw.excerpt || raw.summary || raw.description || content
  ).trim();
  const excerpt = buildExcerpt(excerptSource);
  const coverImage =
    String(
      raw.coverImage || raw.image || raw.thumbnail || raw.bannerImage || PLACEHOLDER_COVER
    ).trim() || PLACEHOLDER_COVER;
  const seoTitle = String(raw.seoTitle || title).trim() || title;
  const seoDescription =
    String(raw.seoDescription || raw.metaDescription || excerpt).trim() || excerpt;

  return {
    id,
    title,
    slug: String(raw.slug || "").trim(),
    excerpt,
    content,
    coverImage,
    author: String(raw.author || raw.authorName || "AfixZ Team").trim() || "AfixZ Team",
    category: String(raw.category || raw.topic || "Insights").trim() || "Insights",
    tags: Array.isArray(raw.tags)
      ? raw.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : [],
    readTime:
      String(raw.readTime || "").trim() || estimateReadTime(content || excerptSource),
    publishedAt: parseDate(
      raw.publishedAt || raw.createdAt || raw.updatedAt || raw.date
    ),
    seoTitle,
    seoDescription,
    canonicalUrl: String(raw.canonicalUrl || "").trim(),
    ogImage: String(raw.ogImage || raw.ogImageUrl || coverImage).trim() || coverImage,
    status:
      String(raw.status || (raw.published === false ? "draft" : "published")).trim() ||
      "published",
    availableLocations: Array.isArray(raw.availableLocations)
      ? raw.availableLocations.filter((value: unknown): value is LocationId => isLocationId(value))
      : undefined,
    contentByLocation: isRecord(raw.contentByLocation)
      ? (raw.contentByLocation as Partial<Record<LocationId, BlogLocationOverride>>)
      : undefined,
  };
}

export function resolveBlogForLocation(blog: BlogEntry, selectedLocation: LocationId | null) {
  return mergeBaseWithLocationOverride(
    blog,
    selectedLocation,
    blog.contentByLocation || null
  );
}

export function isBlogAvailableInLocation(
  blog: Pick<BlogEntry, "availableLocations">,
  selectedLocation: LocationId | null
) {
  if (!selectedLocation) {
    return true;
  }

  if (!blog.availableLocations || blog.availableLocations.length === 0) {
    return true;
  }

  return blog.availableLocations.includes(selectedLocation);
}

export function isBlogPublished(raw: Record<string, any>) {
  if (typeof raw.published === "boolean") {
    return raw.published;
  }

  const status = String(raw.status || "").toLowerCase().trim();

  if (["draft", "archived", "unpublished"].includes(status)) {
    return false;
  }

  return true;
}

export function formatBlogDate(value: Date | null) {
  if (!value) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function getBlogPath(blog: BlogEntry) {
  return `/blogs/${blog.slug || blog.id}`;
}

export function slugifyText(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateSearchKeywords(values: string[]) {
  const keywords = new Set<string>();

  values
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean)
    .forEach((value) => {
      value
        .split(/[\s,]+/)
        .filter(Boolean)
        .forEach((word) => {
          let current = "";

          for (const char of word) {
            current += char;
            keywords.add(current);
          }

          keywords.add(word);
        });
    });

  return Array.from(keywords);
}

export function splitCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function matchesBlogRoute(blog: BlogEntry, routeValue?: string) {
  if (!routeValue) {
    return false;
  }

  return routeValue === blog.id || routeValue === blog.slug;
}

function buildExcerpt(value: string) {
  if (!value) {
    return "Fresh updates, practical tips, and helpful service insights from the AfixZ team.";
  }

  return value.length > 180 ? `${value.slice(0, 177).trim()}...` : value;
}

function estimateReadTime(value: string) {
  const wordCount = value.split(/\s+/).filter(Boolean).length;

  if (wordCount === 0) {
    return "3 min read";
  }

  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

function parseDate(value: unknown) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const timestampLike = value as TimestampLike;

  if (typeof timestampLike.toDate === "function") {
    return timestampLike.toDate();
  }

  if (typeof timestampLike.seconds === "number") {
    return new Date(timestampLike.seconds * 1000);
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
