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

const creators = [
  ["alissa-eady", "Alissa Eady"], ["sophia-price", "Sophia Price"],
  ["josefine-uddman", "Josefine Uddman"], ["the-olive-tree-family", "The Olive Tree Family"],
  ["very-british-korean", "Very British Korean"], ["yen", "Yen"],
  ["jno-pwnr", "JNO PWR"], ["imhungryinlondon", "I'm Hungry In London"],
  ["very-british-problems", "Very British Problems"],
].map(([slug, name]) => [
  `creators/${slug}`,
  `${name} | WEARD Creator Roster`,
  `Meet ${name}, represented by WEARD Management. Explore their profile, audience, content, and brand partnership opportunities.`,
  `${name} is part of WEARD’s curated boutique creator roster.`,
]);

const escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const template = await readFile("dist/index.html", "utf8");

for (const [path, title, description, body] of [...pages, ...creators]) {
  const url = `${origin}/${path}`;
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/s, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace('<div id="root"></div>', `<div id="root"><main class="seo-fallback"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p></main></div>`);
  const output = join("dist", path, "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
}

