import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";

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
  const env = loadEnvFiles([".env", ".env.local", ".env.production", ".env.production.local"]);
  const siteUrl = getSiteUrl(env);

  await writeFile(
    templatePath,
    injectSeo(template, {
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
    })
  );

  await mkdir(path.join(distDir, "blogs"), { recursive: true });
  await writeFile(
    path.join(distDir, "blogs", "index.html"),
    injectSeo(template, {
      title: "AfixZ Blog | Home Service Tips, Guides, and Updates",
      description:
        "Explore the latest AfixZ blogs for home service guides, maintenance tips, cleaning advice, repairs, and platform updates.",
      canonicalUrl: siteUrl ? `${siteUrl}/blogs` : "",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "AfixZ Blog",
        url: siteUrl ? `${siteUrl}/blogs` : undefined,
      },
    })
  );

  const blogs = await fetchPublishedBlogs(env);

  for (const blog of blogs) {
    const slug = blog.slug || blog.id;
    const targetDir = path.join(distDir, "blogs", slug);

    await mkdir(targetDir, { recursive: true });
    await writeFile(
      path.join(targetDir, "index.html"),
      injectSeo(template, {
        title: /afixz/i.test(blog.seoTitle)
          ? blog.seoTitle
          : `${blog.seoTitle} | AfixZ Blog`,
        description: blog.seoDescription,
        canonicalUrl:
          blog.canonicalUrl || (siteUrl ? `${siteUrl}/blogs/${slug}` : ""),
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
          image: blog.ogImage || blog.coverImage ? [blog.ogImage || blog.coverImage] : undefined,
          datePublished: blog.publishedAt || undefined,
          author: blog.author
            ? {
                "@type": "Person",
                name: blog.author,
              }
            : undefined,
          url:
            blog.canonicalUrl || (siteUrl ? `${siteUrl}/blogs/${slug}` : undefined),
        },
      })
    );
  }

  console.log(
    `[prerender] generated home, blog listing, and ${blogs.length} blog detail route(s)`
  );
}

async function fetchPublishedBlogs(env) {
  try {
    const firebaseConfig = {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
      console.warn("[prerender] firebase env vars missing, skipping blog detail prerender");
      return [];
    }

    const app = initializeApp(firebaseConfig, "prerender");
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
              String(data.title || "Untitled Blog").trim() || "Untitled Blog",
            seoTitle: String(
              data.seoTitle || data.title || "AfixZ Blog"
            ).trim(),
            seoDescription: String(
              data.seoDescription ||
                data.excerpt ||
                "Read the latest updates from the AfixZ blog."
            ).trim(),
            canonicalUrl: String(data.canonicalUrl || "").trim(),
            ogImage: String(data.ogImage || "").trim(),
            coverImage: String(data.coverImage || "").trim(),
            author:
              String(data.author || "AfixZ Team").trim() || "AfixZ Team",
            tags: Array.isArray(data.tags)
              ? data.tags.map((tag) => String(tag))
              : [],
            publishedAt: formatPublishedDate(data.publishedAt),
          };
        })
      );

      lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      hasMore = snapshot.docs.length === 100;
    }

    return blogs;
  } catch (error) {
    console.warn("[prerender] blog prerender fetch failed, continuing without blog detail snapshots");
    console.warn(error instanceof Error ? error.message : String(error));
    return [];
  }
}

function injectSeo(template, seo) {
  const sanitized = stripManagedSeo(template);
  const metaTags = buildSeoTags(seo);

  return sanitized
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
    .replace("</head>", `${metaTags}\n  </head>`);
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
    tag("meta", { name: "description", content: description }),
    keywords ? tag("meta", { name: "keywords", content: keywords }) : "",
    tag("meta", { property: "og:title", content: title }),
    tag("meta", { property: "og:description", content: description }),
    tag("meta", { property: "og:type", content: type }),
    canonicalUrl ? tag("meta", { property: "og:url", content: canonicalUrl }) : "",
    image ? tag("meta", { property: "og:image", content: image }) : "",
    tag("meta", { name: "twitter:card", content: image ? "summary_large_image" : "summary" }),
    tag("meta", { name: "twitter:title", content: title }),
    tag("meta", { name: "twitter:description", content: description }),
    image ? tag("meta", { name: "twitter:image", content: image }) : "",
    canonicalUrl ? tag("link", { rel: "canonical", href: canonicalUrl }) : "",
    tag("meta", { name: "robots", content: "index,follow" }),
    type === "article" && publishedTime
      ? tag("meta", { property: "article:published_time", content: publishedTime })
      : "",
    type === "article" && author
      ? tag("meta", { property: "article:author", content: author })
      : "",
    structuredData
      ? `<script id="codex-seo-structured-data" type="application/ld+json">${escapeHtml(
          JSON.stringify(structuredData)
        )}</script>`
      : "",
  ].filter(Boolean);

  return tags.map((entry) => `  ${entry}`).join("\n");
}

function stripManagedSeo(template) {
  return template
    .replace(/<meta[^>]+name="description"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="keywords"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property="og:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="twitter:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property="article:[^"]+"[^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name="robots"[^>]*>\s*/gi, "")
    .replace(/<link[^>]+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<script[^>]+id="codex-seo-structured-data"[\s\S]*?<\/script>\s*/gi, "");
}

function normalizeAssetUrls(html) {
  return html
    .replace(/(src|href)="\.?\/?(assets\/[^"]+)"/g, '$1="/$2"')
    .replace(/src="\/index\.tsx"/g, 'src="/index.tsx"');
}

function tag(name, attributes) {
  const attrs = Object.entries(attributes)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
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
      const content = readLocalEnv(path.join(projectRoot, fileName));
      Object.assign(env, content);
    } catch {
      // Ignore missing env files.
    }
  }

  return env;
}

function readLocalEnv(filePath) {
  const content = requireText(filePath);
  const result = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    result[key] = value;
  }

  return result;
}

function requireText(filePath) {
  return readFileSync(filePath, "utf8");
}

function getSiteUrl(env) {
  const explicit = env.VITE_SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelUrl = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
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
    return new Date(value.seconds * 1000).toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
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
