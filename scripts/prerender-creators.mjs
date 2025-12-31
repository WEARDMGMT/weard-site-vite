import fs from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://weardmgmt.com";
const DIST_DIR = path.resolve("dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

const SHEET_URL =
  process.env.VITE_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe2hqUTFYnlYQVFXLmR0G2bI_APH9kkJqL7XJIvFIloG7QEjBAJqXkxGrUBYrvoaTg7jS-ucCQ1Uzj/pub?output=csv";

const STATIC_PATHS = [
  "/",
  "/about",
  "/roster",
  "/contact",
  "/brands",
  "/privacy",
  "/asia-influencer-marketing",
  "/apac-influencer-marketing",
  "/thailand-influencer-marketing",
  "/hong-kong-influencer-management",
  "/asia-to-uk-influencer-marketing",
  "/asia-to-us-influencer-marketing",
  "/case-studies",
];

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function getUsernameFromUrl(url) {
  if (!url) return null;
  const m = url.match(
    /(?:instagram\.com|tiktok\.com|youtube\.com)\/(?:@)?([A-Za-z0-9_.-]+)/i
  );
  return m ? m[1].toLowerCase().replace(/^@/, "") : null;
}

function parseCSV(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines.shift().split(",").map((h) => h.trim());
  return lines.map((line) => {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '"') {
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (out[i] || "").trim()));
    return obj;
  });
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html, regex, replacement) {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace(/<\/head>/i, `${replacement}\n</head>`);
}

function setMetaTags(html, { title, description, canonical, jsonLd }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  out = replaceTag(
    out,
    /<meta\s+name="description"[\s\S]*?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  out = replaceTag(
    out,
    /<link\s+rel="canonical"[\s\S]*?>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`
  );

  out = replaceTag(
    out,
    /<meta\s+property="og:title"[\s\S]*?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:description"[\s\S]*?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property="og:url"[\s\S]*?>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:title"[\s\S]*?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+name="twitter:description"[\s\S]*?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  out = replaceTag(
    out,
    /<script\s+type="application\/ld\+json"\s+data-prerender="creator"[\s\S]*?<\/script>/i,
    `<script type="application/ld+json" data-prerender="creator">${JSON.stringify(jsonLd)}</script>`
  );

  return out;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function fetchCreators() {
  const res = await fetch(SHEET_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csv = await res.text();
  const rows = parseCSV(csv);
  return rows
    .filter((r) => r.name)
    .map((r) => ({
      name: r.name,
      instagram: r.instagram || "",
      tiktok: r.tiktok || "",
      youtube: r.youtube || "",
      bio: r.bio || "",
    }));
}

function buildSitemap(urls) {
  const lastmod = new Date().toISOString();
  const body = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

async function main() {
  const baseHtml = await fs.readFile(INDEX_PATH, "utf8");
  let creators = [];
  try {
    creators = await fetchCreators();
  } catch (error) {
    console.warn("Creator prerender skipped: failed to fetch sheet.", error);
  }

  const seen = new Set();
  const creatorPages = creators
    .map((creator) => ({
      ...creator,
      slug: slugify(creator.name || "creator"),
    }))
    .filter((creator) => creator.slug && !seen.has(creator.slug) && seen.add(creator.slug));

  for (const creator of creatorPages) {
    const handles = [
      getUsernameFromUrl(creator.instagram),
      getUsernameFromUrl(creator.tiktok),
      getUsernameFromUrl(creator.youtube),
    ]
      .filter(Boolean)
      .map((handle) => `@${handle}`)
      .join(", ");

    const title = `${creator.name} • WEARD Management`;
    const description = creator.bio
      ? creator.bio
      : `${creator.name} (${handles || "creator"}) represented by WEARD Management for global influencer campaigns and creator representation.`;

    const canonical = `${SITE_URL}/creators/${creator.slug}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: creator.name,
      description,
      jobTitle: "Creator",
      affiliation: {
        "@type": "Organization",
        name: "WEARD Management",
        url: SITE_URL,
      },
      url: canonical,
      sameAs: [creator.instagram, creator.tiktok, creator.youtube].filter(Boolean),
    };

    const html = setMetaTags(baseHtml, {
      title,
      description,
      canonical,
      jsonLd,
    });

    const outDir = path.join(DIST_DIR, "creators", creator.slug);
    await ensureDir(outDir);
    await fs.writeFile(path.join(outDir, "index.html"), html);
  }

  const sitemapUrls = [
    ...STATIC_PATHS.map((p) => `${SITE_URL}${p}`),
    ...creatorPages.map((creator) => `${SITE_URL}/creators/${creator.slug}`),
  ];

  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), buildSitemap(sitemapUrls));
}

main().catch((error) => {
  console.error("Prerender failed:", error);
  process.exit(1);
});
