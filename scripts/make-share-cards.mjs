// Builds the 1200x630 link-preview image for each creator (public/og/<slug>.jpg), used when a
// profile link is shared on WhatsApp, LinkedIn, email etc. Run locally after roster changes:
//   node scripts/make-share-cards.mjs
// Needs Google Chrome installed (set CHROME_PATH to override).
import { chromium } from "playwright-core";
import { mkdir, readFile } from "node:fs/promises";

const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const creators = JSON.parse(await readFile("src/weard/creator-share.json", "utf8"));
const stats = JSON.parse(await readFile("src/weard/roster-stats.json", "utf8")).creators;

const short = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}K` : String(n));
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

await mkdir("public/og", { recursive: true });
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const c of creators) {
  const s = stats[c.slug] || {};
  const lines = [
    ["TikTok", s.tiktok_followers],
    ["Instagram", s.instagram_followers],
    ["YouTube", s.youtube_subscribers],
  ].filter(([, n]) => n).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const photo = (await readFile(`public${c.image}`)).toString("base64");

  await page.setContent(`<!doctype html><html><head><style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; display: flex; background: #0a0a0c; color: #fff; font-family: "Helvetica Neue", Arial, sans-serif; overflow: hidden; }
    .photo { width: 470px; height: 630px; background: url(data:image/jpeg;base64,${photo}) center 25% / cover; position: relative; }
    .photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 70%, #0a0a0c); }
    .text { flex: 1; padding: 64px 64px 56px 40px; display: flex; flex-direction: column; }
    .brand { font-size: 26px; font-weight: 900; letter-spacing: .32em; background: linear-gradient(90deg,#3b82f6,#6366f1,#a855f7); -webkit-background-clip: text; color: transparent; }
    .brand small { font-size: 14px; letter-spacing: .4em; color: rgba(255,255,255,.55); -webkit-text-fill-color: rgba(255,255,255,.55); margin-left: 14px; }
    .cat { margin-top: auto; font-size: 18px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; color: #a5b4fc; }
    h1 { margin-top: 14px; font-size: ${c.name.length > 16 ? 64 : 80}px; line-height: .95; font-weight: 900; letter-spacing: -.04em; text-transform: uppercase; }
    .handle { margin-top: 14px; font-size: 24px; color: rgba(255,255,255,.65); }
    .stats { margin-top: 36px; display: flex; gap: 16px; }
    .stat { padding: 14px 22px; border-radius: 18px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); }
    .stat b { display: block; font-size: 40px; font-weight: 900; letter-spacing: -.03em; }
    .stat span { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.6); }
  </style></head><body>
    <div class="photo"></div>
    <div class="text">
      <div class="brand">WEARD<small>MANAGEMENT</small></div>
      <div class="cat">${esc(c.category)}</div>
      <h1>${esc(c.name)}</h1>
      <div class="handle">${esc(c.handle)}</div>
      <div class="stats">${lines.map(([label, n]) => `<div class="stat"><b>${short(n)}</b><span>${label}</span></div>`).join("")}</div>
    </div>
  </body></html>`);
  await page.screenshot({ path: `public/og/${c.slug}.jpg`, type: "jpeg", quality: 82 });
  console.log("made", `public/og/${c.slug}.jpg`);
}
await browser.close();
