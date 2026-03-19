import { useEffect } from "react";

type SeoOptions = {
  title: string;
  description: string;
  canonicalUrl?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  publishedTime?: string;
  author?: string;
};

export default function useSeo({
  title,
  description,
  canonicalUrl,
  image,
  type = "website",
  keywords = [],
  publishedTime,
  author,
}: SeoOptions) {
  useEffect(() => {
    document.title = title;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywords.join(", "));
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", canonicalUrl || window.location.href);
    upsertMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    if (image) {
      upsertMeta("property", "og:image", image);
      upsertMeta("name", "twitter:image", image);
    } else {
      removeMeta("property", "og:image");
      removeMeta("name", "twitter:image");
    }

    if (type === "article" && publishedTime) {
      upsertMeta("property", "article:published_time", publishedTime);
    } else {
      removeMeta("property", "article:published_time");
    }

    if (type === "article" && author) {
      upsertMeta("property", "article:author", author);
    } else {
      removeMeta("property", "article:author");
    }

    upsertCanonical(canonicalUrl || window.location.href);
    upsertStructuredData({
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      headline: title,
      description,
      image: image ? [image] : undefined,
      author: author ? { "@type": "Person", name: author } : undefined,
      datePublished: publishedTime,
      url: canonicalUrl || window.location.href,
    });
  }, [author, canonicalUrl, description, image, keywords, publishedTime, title, type]);
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function removeMeta(attribute: "name" | "property", key: string) {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.remove();
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

function upsertStructuredData(payload: Record<string, any>) {
  const scriptId = "codex-seo-structured-data";
  let tag = document.head.querySelector<HTMLScriptElement>(`script#${scriptId}`);

  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = scriptId;
    document.head.appendChild(tag);
  }

  tag.textContent = JSON.stringify(payload);
}
