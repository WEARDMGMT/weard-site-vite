// Writes a small JPEG still (frame at 1s) for each home-wall clip into public/assets/videos/posters/.
// Run after adding clips:  node scripts/make-video-posters.mjs public/assets/videos   (needs Google Chrome)
import { chromium } from "playwright-core";
import { readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const dir = resolve(process.argv[2] || "public/assets/videos");
const files = (await readdir(dir)).filter((f) => f.endsWith(".mp4"));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--allow-file-access-from-files"] });
const p = await b.newPage(); await p.goto("file:///");
for (const f of files) {
  const url = await p.evaluate(async (src) => {
    const v = document.createElement("video"); v.muted = true; v.src = src; await new Promise((r) => (v.onloadeddata = r));
    v.currentTime = Math.min(1, v.duration / 2); await new Promise((r) => (v.onseeked = r));
    const W = 360, H = Math.round((v.videoHeight / v.videoWidth) * W);
    const c = document.createElement("canvas"); c.width = W; c.height = H; c.getContext("2d").drawImage(v, 0, 0, W, H);
    return c.toDataURL("image/jpeg", 0.72);
  }, `file://${dir}/${f}`);
  const out = `${dir}/posters/${f.replace(/\.mp4$/, ".jpg")}`;
  await writeFile(out, Buffer.from(url.split(",")[1], "base64"));
}
console.log("made", files.length); await b.close();
