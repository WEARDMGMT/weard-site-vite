// Refreshes Instagram and TikTok follower counts in src/weard/roster-stats.json from the creators'
// public profiles, then rebuilds the link-preview images. Run monthly (scheduled) or by hand:
//   node scripts/refresh-followers.mjs
// YouTube and Facebook counts are left as they are. A count is only replaced when the new value
// is readable and within 50% of the old one, so a blocked or odd page never wipes real numbers.
import { chromium } from "playwright-core";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const statsPath = "src/weard/roster-stats.json";
const stats = JSON.parse(await readFile(statsPath, "utf8"));
const creators = JSON.parse(await readFile("src/weard/creator-share.json", "utf8"));

// "1.2M" / "56K" / "6,177" -> number
const parseCount = (text) => {
  const m = String(text).trim().match(/^([\d.,]+)\s*([KM]?)$/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ""));
  return Math.round(n * ({ K: 1e3, M: 1e6 }[m[2].toUpperCase()] || 1));
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" });

const readInstagram = async (handle) => {
  await page.goto(`https://www.instagram.com/${handle}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const desc = await page.getAttribute('meta[property="og:description"]', "content").catch(() => null);
  return parseCount(desc?.match(/^([\d.,]+[KM]?) Followers/i)?.[1] ?? "");
};
const readTikTok = async (handle) => {
  await page.goto(`https://www.tiktok.com/@${handle}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const html = await page.content();
  const m = html.match(/"followerCount":(\d+)/);
  return m ? Number(m[1]) : null;
};

const changes = [];
for (const c of creators) {
  const entry = (stats.creators[c.slug] ||= {});
  for (const [field, read, handle] of [["instagram_followers", readInstagram, c.instagram], ["tiktok_followers", readTikTok, c.tiktok]]) {
    if (!handle) continue;
    let value = null;
    try { value = await read(handle); } catch { /* leave as is */ }
    const old = entry[field];
    if (!value || (old && (value < old * 0.5 || value > old * 1.5))) {
      changes.push(`${c.slug} ${field}: kept ${old ?? "-"} (read ${value ?? "nothing"})`);
      continue;
    }
    if (value !== old) changes.push(`${c.slug} ${field}: ${old ?? "-"} -> ${value}`);
    entry[field] = value;
  }
  await page.waitForTimeout(1500);
}
await browser.close();

stats.updated = new Date().toISOString().slice(0, 10);
await writeFile(statsPath, JSON.stringify(stats, null, 2) + "\n");
console.log(changes.join("\n") || "No changes");
execFileSync("node", ["scripts/make-share-cards.mjs"], { stdio: "inherit" });
