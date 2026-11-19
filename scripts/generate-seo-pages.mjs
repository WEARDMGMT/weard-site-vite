import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const origin = "https://weardmgmt.com";
const pages = [
  ["about", "About WEARD | A Culturally Fluent Talent Company", "Meet WEARD: a highly curated, culturally fluent talent company with exceptional knowledge of the UK–Asia corridor.", "WEARD represents distinctive creators who move culture, building long-term careers and meaningful partnerships across the UK and Asia."],
  ["roster", "WEARD Creator Roster | Curated Talent Management", "Meet WEARD’s boutique roster of distinctive creators with original perspectives, engaged communities, and stories worth following.", "A curated boutique roster of creators chosen for individuality, cultural fluency, and long-term potential."],
  ["asiancy", "Asiancy by WEARD | Talent. Culture. Markets.", "Asiancy is WEARD’s UK–Asia market capability, connecting APAC brands, British audiences, and Asian diaspora communities through culture-first influencer marketing.", "Talent. Culture. Markets. UK to Hong Kong, China, Thailand and APAC—and Asian brands and diaspora audiences in the UK."],
  ["contact", "Contact WEARD | Talent & Influencer Marketing Enquiries", "Contact WEARD about creator representation, brand partnerships, and culture-first influencer marketing across the UK and Asia.", "Talk to WEARD about talent representation, creator partnerships, or a UK–Asia campaign."],
  ["privacy", "Privacy Policy | WEARD Management", "Read how WEARD Management collects, uses, and protects personal information.", "WEARD Management privacy policy and data protection information."],
  ["terms", "Website Terms | WEARD Management", "Read the terms governing use of the WEARD Management website.", "Terms governing the use of the WEARD Management website."],
];

// One entry per creator in src/weard/creator-share.json; the preview image comes from
// scripts/make-share-cards.mjs (public/og/<slug>.jpg).
const creators = JSON.parse(await readFile("src/weard/creator-share.json", "utf8")).map((c) => [
  `creators/${c.slug}`,
  `${c.name} | WEARD Creator Roster`,
  `${c.name} (${c.handle}): ${c.summary} Represented by WEARD Management.`,
  `${c.name} is part of WEARD’s curated boutique creator roster.`,
  { image: `/og/${c.slug}.jpg`, alt: `${c.name}, ${c.category}, represented by WEARD Management` },
]);

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const template = await readFile("dist/index.html", "utf8");

// Real page content for crawlers. React replaces #root as soon as the app starts, so visitors
// see the full design; Google and link previews get readable HTML and links without running JS.
const share = JSON.parse(await readFile("src/weard/creator-share.json", "utf8"));
const stats = JSON.parse(await readFile("src/weard/roster-stats.json", "utf8")).creators;
const appSource = await readFile("src/weard/App.jsx", "utf8");
const rosterBlock = appSource.slice(appSource.indexOf("const STARTER_CREATORS"), appSource.indexOf("\n];", appSource.indexOf("const STARTER_CREATORS")));
const bioFor = (name) => {
  const at = rosterBlock.search(new RegExp(`name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  const match = at < 0 ? null : rosterBlock.slice(at).match(/bio:\s*"((?:[^"\\]|\\.)*)"/);
  return match ? JSON.parse(`"${match[1]}"`) : "";
};
const compact = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
const navHtml = `<nav aria-label="Primary"><a href="/">Home</a> <a href="/about">About Us</a> <a href="/roster">Roster</a> <a href="/asiancy">Asiancy</a> <a href="/contact">Contact</a></nav>`;
const rosterLinks = `<h2>Our creators</h2><ul>${share.map((c) => `<li><a href="/creators/${c.slug}">${escapeHtml(c.name)}</a>: ${escapeHtml(c.category)}. ${escapeHtml(c.summary)}</li>`).join("")}</ul>`;
const footerHtml = `<footer><p><a href="/contact">Contact</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="mailto:info@weardmgmt.com">info@weardmgmt.com</a></p><p>© WEARD Management Limited</p></footer>`;
const creatorHtml = (c) => {
  const s = stats[c.slug] || {};
  const reach = [
    s.instagram_followers && `<li><a href="https://www.instagram.com/${c.instagram}/" rel="noopener">Instagram</a>: ${compact(s.instagram_followers)} followers</li>`,
    s.tiktok_followers && `<li><a href="https://www.tiktok.com/@${c.tiktok}" rel="noopener">TikTok</a>: ${compact(s.tiktok_followers)} followers</li>`,
    s.youtube_subscribers && `<li>YouTube: ${compact(s.youtube_subscribers)} subscribers</li>`,
  ].filter(Boolean).join("");
  return `<article><h1>${escapeHtml(c.name)}</h1><p>${escapeHtml(c.category)} creator (${escapeHtml(c.handle)}), represented by WEARD Management.</p>`
    + `<p>${escapeHtml(bioFor(c.name) || c.summary)}</p>${reach ? `<ul>${reach}</ul>` : ""}`
    + `<p><a href="/contact">Work with ${escapeHtml(c.name)}</a> · <a href="/roster">See the full roster</a></p></article>`
    + `<h2>More WEARD creators</h2><ul>${share.filter((o) => o.slug !== c.slug).map((o) => `<li><a href="/creators/${o.slug}">${escapeHtml(o.name)}</a></li>`).join("")}</ul>`;
};
const fallback = (inner) => `<div id="root"><div class="seo-fallback">${navHtml}<main>${inner}</main>${footerHtml}</div></div>`;

const write = async (file, html) => {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
};

// Home page: keep its own meta, add content and links.
await write("dist/index.html", template.replace('<div id="root"></div>', fallback(
  `<h1>WEARD Management: creator talent management, UK and Asia</h1><p>WEARD is a highly curated, culturally fluent talent company representing distinctive creators and building brand partnerships across the UK and Asia.</p>${rosterLinks}`
)));

const creatorPages = new Map(share.map((c) => [`creators/${c.slug}`, c]));
for (const [path, title, description, body, card] of [...pages, ...creators]) {
  const url = `${origin}/${path}`;
  const creator = creatorPages.get(path);
  const inner = creator
    ? creatorHtml(creator)
    : `<h1>${escapeHtml(title.split(" | ")[0])}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(body)}</p>${["about", "roster", "asiancy"].includes(path) ? rosterLinks : ""}`;
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace('<div id="root"></div>', fallback(inner));
  if (card) {
    const image = `${origin}${card.image}`;
    html = html
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?>)/, `$1${image}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*("\s*\/?>)/, `$1${image}$2`)
      .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(card.alt)}$2`)
      .replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(card.alt)}$2`)
      .replace(/(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/?>)/, `$1profile$2`);
  }
  // Written as dist/<path>.html (not <path>/index.html): GitHub Pages then serves /about directly,
  // matching the canonical tag and sitemap, instead of 301-redirecting to /about/.
  await write(join("dist", `${path}.html`), html);
}
