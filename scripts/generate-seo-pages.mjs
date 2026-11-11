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

for (const [path, title, description, body, share] of [...pages, ...creators]) {
  const url = `${origin}/${path}`;
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace('<div id="root"></div>', `<div id="root"><main class="seo-fallback"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p></main></div>`);
  if (share) {
    const image = `${origin}${share.image}`;
    html = html
      .replace(/(<meta\s+property="og:image"\s+content=")[^"]*("\s*\/?>)/, `$1${image}$2`)
      .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*("\s*\/?>)/, `$1${image}$2`)
      .replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(share.alt)}$2`)
      .replace(/(<meta\s+name="twitter:image:alt"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(share.alt)}$2`)
      .replace(/(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/?>)/, `$1profile$2`);
  }
  const output = join("dist", path, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

