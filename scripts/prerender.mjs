import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const templatePath = path.join(distDir, "index.html");

await run();

async function run() {
  const template = normalizeAssetUrls(
    await readFile(templatePath, "utf8")
  );

  const env = loadEnvFiles([
    ".env",
    ".env.local",
    ".env.production",
    ".env.production.local",
  ]);

  const siteUrl = getSiteUrl(env);

  /*
  |--------------------------------------------------------------------------
  | HOME PAGE
  |--------------------------------------------------------------------------
  */

  await writeStaticPage({
    template,
    targetPath: path.join(distDir, "index.html"),
    seo: {
      title: "AfixZ | Trusted Local Services",
      description:
        "Book trusted local home services with AfixZ, from cleaning and repairs to beauty and plant care.",
      canonicalUrl: siteUrl ? `${siteUrl}/` : "",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "AfixZ",
        url: siteUrl || undefined,
      },
    },
  });

  /*
  |--------------------------------------------------------------------------
  | STATIC PAGES
  |--------------------------------------------------------------------------
  */

  const staticPages = [
    {
      slug: "services",
      title: "All Services | AfixZ",
      description:
        "Explore all trusted local services available on AfixZ.",
    },

    {
      slug: "about",
      title: "About Us | AfixZ",
      description:
        "Learn more about AfixZ and our mission to simplify local services.",
    },

    {
      slug: "blogs",
      title: "AfixZ Blog | Home Service Tips & Guides",
      description:
        "Explore home maintenance guides, service tips, and updates from AfixZ.",
    },

    {
      slug: "garden-care",
      title: "Garden Care Plans | AfixZ",
      description:
        "Recurring garden maintenance plans with professional care, pruning and plant health support.",
    },

    {
      slug: "privacy",
      title: "Privacy Policy | AfixZ",
      description:
        "Read the AfixZ privacy policy and data handling practices.",
    },

    {
      slug: "terms",
      title: "Terms of Service | AfixZ",
      description:
        "Review the terms and conditions for using AfixZ.",
    },
  ];

  for (const page of staticPages) {
    const targetDir = path.join(distDir, page.slug);

    await mkdir(targetDir, { recursive: true });

    await writeStaticPage({
      template,

      targetPath: path.join(targetDir, "index.html"),

      seo: {
        title: page.title,

        description: page.description,

        canonicalUrl: siteUrl
          ? `${siteUrl}/${page.slug}`
          : "",

        structuredData: {
          "@context": "https://schema.org",

          "@type": "WebPage",

          name: page.title,

          url: siteUrl
            ? `${siteUrl}/${page.slug}`
            : undefined,
        },
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY PAGES
  |--------------------------------------------------------------------------
  */

  const categories = [
    {
      slug: "garden-and-landscaping",

      title: "Garden & Landscaping Services | AfixZ",

      description:
        "Find trusted garden and landscaping professionals near you with AfixZ.",
    },

    {
      slug: "mechanic",

      title: "Mechanic Services | AfixZ",

      description:
        "Book trusted mechanic services and repairs with AfixZ.",
    },

    {
      slug: "interior",

      title: "Interior Services | AfixZ",

      description:
        "Discover interior design and renovation professionals on AfixZ.",
    },

    {
      slug: "fabrication",

      title: "Fabrication Services | AfixZ",

      description:
        "Find custom fabrication experts and welding professionals on AfixZ.",
    },
  ];

  for (const category of categories) {
    const categoryDir = path.join(
      distDir,
      "category",
      category.slug
    );

    await mkdir(categoryDir, { recursive: true });

    await writeStaticPage({
      template,

      targetPath: path.join(categoryDir, "index.html"),

      seo: {
        title: category.title,

        description: category.description,

        canonicalUrl: siteUrl
          ? `${siteUrl}/category/${category.slug}`
          : "",

        structuredData: {
          "@context": "https://schema.org",

          "@type": "CollectionPage",

          name: category.title,

          url: siteUrl
            ? `${siteUrl}/category/${category.slug}`
            : undefined,
        },
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | BLOG PAGES
  |--------------------------------------------------------------------------
  */

  const blogs = await fetchPublishedBlogs(env);

  for (const blog of blogs) {
    const slug = blog.slug || blog.id;

    const targetDir = path.join(
      distDir,
      "blogs",
      slug
    );

    await mkdir(targetDir, { recursive: true });

    await writeStaticPage({
      template,

      targetPath: path.join(targetDir, "index.html"),

      seo: {
        title: /afixz/i.test(blog.seoTitle)
          ? blog.seoTitle
          : `${blog.seoTitle} | AfixZ Blog`,

        description: blog.seoDescription,

        canonicalUrl:
          blog.canonicalUrl ||
          (siteUrl ? `${siteUrl}/blogs/${slug}` : ""),

        image: blog.ogImage || blog.coverImage,

        keywords: blog.tags?.join(", ") || "",

        type: "article",

        publishedTime: blog.publishedAt,

        author: blog.author,

        structuredData: {
          "@context": "https://schema.org",

          "@type": "Article",

          headline: blog.title,

          description: blog.seoDescription,

          image:
            blog.ogImage || blog.coverImage
              ? [blog.ogImage || blog.coverImage]
              : undefined,

          datePublished:
            blog.publishedAt || undefined,

          author: blog.author
            ? {
                "@type": "Person",
                name: blog.author,
              }
            : undefined,

          url:
            blog.canonicalUrl ||
            (siteUrl
              ? `${siteUrl}/blogs/${slug}`
              : undefined),
        },
      },
    });
  }

  /*
  |--------------------------------------------------------------------------
  | SITEMAP
  |--------------------------------------------------------------------------
  */

  await generateSitemap({
    siteUrl,
    blogs,
    categories,
    staticPages,
  });

  console.log(`
[prerender] complete

- static pages: ${staticPages.length}
- categories: ${categories.length}
- blog pages: ${blogs.length}
`);
}

async function writeStaticPage({
  template,
  targetPath,
  seo,
}) {
  await writeFile(
    targetPath,
    injectSeo(template, seo)
  );
}

async function generateSitemap({
  siteUrl,
  blogs,
  categories,
  staticPages,
}) {
  if (!siteUrl) {
    console.warn(
      "[prerender] no VITE_SITE_URL found, skipping sitemap"
    );

    return;
  }

  const urls = [
    "/",

    ...staticPages.map((p) => `/${p.slug}`),

    ...categories.map(
      (c) => `/category/${c.slug}`
    ),

    ...blogs.map(
      (b) => `/blogs/${b.slug || b.id}`
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${siteUrl}${url}</loc>
  </url>`
  )
  .join("")}
</urlset>`;

  await writeFile(
    path.join(distDir, "sitemap.xml"),
    sitemap
  );
}

async function fetchPublishedBlogs(env) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId:
        env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };

    if (
      !firebaseConfig.apiKey ||
      !firebaseConfig.projectId ||
      !firebaseConfig.appId
    ) {
      console.warn(
        "[prerender] firebase env vars missing"
      );

      return [];
    }

    const app = initializeApp(
      firebaseConfig,
      "prerender"
    );

    const db = getFirestore(app);

    const blogs = [];

    let lastDoc = null;

    let hasMore = true;

    while (hasMore) {
      const constraints = [
        where("published", "==", true),

        orderBy("publishedAt", "desc"),

        limit(100),
      ];

      if (lastDoc) {
        constraints.splice(2, 0, startAfter(lastDoc));
      }

      const snapshot = await getDocs(
        query(collection(db, "blogs"), ...constraints)
      );

      blogs.push(
        ...snapshot.docs.map((entry) => {
          const data = entry.data();

          return {
            id: entry.id,

            slug: String(data.slug || "").trim(),

            title:
              String(
                data.title || "Untitled Blog"
              ).trim() || "Untitled Blog",

            seoTitle: String(
              data.seoTitle ||
                data.title ||
                "AfixZ Blog"
            ).trim(),

            seoDescription: String(
              data.seoDescription ||
                data.excerpt ||
                "Read the latest updates from the AfixZ blog."
            ).trim(),

            canonicalUrl: String(
              data.canonicalUrl || ""
            ).trim(),

            ogImage: String(
              data.ogImage || ""
            ).trim(),

            coverImage: String(
              data.coverImage || ""
            ).trim(),

            author:
              String(
                data.author || "AfixZ Team"
              ).trim() || "AfixZ Team",

            tags: Array.isArray(data.tags)
              ? data.tags.map((tag) => String(tag))
              : [],

            publishedAt: formatPublishedDate(
              data.publishedAt
            ),
          };
        })
      );

      lastDoc =
        snapshot.docs[snapshot.docs.length - 1] || null;

      hasMore = snapshot.docs.length === 100;
    }

    return blogs;
  } catch (error) {
    console.warn(
      "[prerender] blog fetch failed"
    );

    console.warn(
      error instanceof Error
        ? error.message
        : String(error)
    );

    return [];
  }
}

function injectSeo(template, seo) {
  const sanitized = stripManagedSeo(template);

  const metaTags = buildSeoTags(seo);

  return sanitized
    .replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(seo.title)}</title>`
    )
    .replace(
      "</head>",
      `${metaTags}\n  </head>`
    );
}

function buildSeoTags({
  title,
  description,
  canonicalUrl,
  image,
  keywords = "",
  type = "website",
  publishedTime = "",
  author = "",
  structuredData,
}) {
  const tags = [
    tag("meta", {
      name: "description",
      content: description,
    }),

    keywords
      ? tag("meta", {
          name: "keywords",
          content: keywords,
        })
      : "",

    tag("meta", {
      property: "og:title",
      content: title,
    }),

    tag("meta", {
      property: "og:description",
      content: description,
    }),

    tag("meta", {
      property: "og:type",
      content: type,
    }),

    canonicalUrl
      ? tag("meta", {
          property: "og:url",
          content: canonicalUrl,
        })
      : "",

    image
      ? tag("meta", {
          property: "og:image",
          content: image,
        })
      : "",

    tag("meta", {
      name: "twitter:card",
      content: image
        ? "summary_large_image"
        : "summary",
    }),

    tag("meta", {
      name: "twitter:title",
      content: title,
    }),

    tag("meta", {
      name: "twitter:description",
      content: description,
    }),

    image
      ? tag("meta", {
          name: "twitter:image",
          content: image,
        })
      : "",

    canonicalUrl
      ? tag("link", {
          rel: "canonical",
          href: canonicalUrl,
        })
      : "",

    tag("meta", {
      name: "robots",
      content: "index,follow",
    }),

    structuredData
      ? `<script id="codex-seo-structured-data" type="application/ld+json">${escapeHtml(
          JSON.stringify(structuredData)
        )}</script>`
      : "",
  ].filter(Boolean);

  return tags
    .map((entry) => `  ${entry}`)
    .join("\n");
}

function stripManagedSeo(template) {
  return template
    .replace(
      /<meta[^>]+name="description"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<meta[^>]+name="keywords"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<meta[^>]+property="og:[^"]+"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<meta[^>]+name="twitter:[^"]+"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<meta[^>]+name="robots"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<link[^>]+rel="canonical"[^>]*>\s*/gi,
      ""
    )
    .replace(
      /<script[^>]+id="codex-seo-structured-data"[\s\S]*?<\/script>\s*/gi,
      ""
    );
}

function normalizeAssetUrls(html) {
  return html
    .replace(
      /(src|href)="\.?\/?(assets\/[^"]+)"/g,
      '$1="/$2"'
    )
    .replace(
      /src="\/index\.tsx"/g,
      'src="/index.tsx"'
    );
}

function tag(name, attributes) {
  const attrs = Object.entries(attributes)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `${key}="${escapeHtml(String(value))}"`
    )
    .join(" ");

  if (name === "link") {
    return `<link ${attrs} />`;
  }

  return `<${name} ${attrs} />`;
}

function loadEnvFiles(fileNames) {
  const env = { ...process.env };

  for (const fileName of fileNames) {
    try {
      const content = readLocalEnv(
        path.join(projectRoot, fileName)
      );

      Object.assign(env, content);
    } catch {}
  }

  return env;
}

function readLocalEnv(filePath) {
  const content = readFileSync(
    filePath,
    "utf8"
  );

  const result = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const separatorIndex =
      trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed
      .slice(0, separatorIndex)
      .trim();

    const value = trimmed
      .slice(separatorIndex + 1)
      .trim();

    result[key] = value;
  }

  return result;
}

function getSiteUrl(env) {
  const explicit =
    env.VITE_SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelUrl =
    env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")}`;
  }

  return "";
}

function formatPublishedDate(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value.seconds === "number") {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString();
  }

  return "";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}