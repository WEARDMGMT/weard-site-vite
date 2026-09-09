const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_BODY_BYTES = 4 * 1024 * 1024;
const buckets = new Map();

const text = (value, limit = 3000) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, limit);

function clientAddress(req) {
  return text(req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0] || "unknown", 64);
}

function takeRateLimit(key) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= MAX_REQUESTS, remaining: Math.max(0, MAX_REQUESTS - bucket.count), resetAt: bucket.resetAt };
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function cleanFields(kind, fields) {
  const common = ["subject", "email", "number", "message"];
  const allowed = kind === "brand"
    ? [...common, "brand", "role", "budget", "timeline", "outline"]
    : [...common, "name", "instagram", "tiktok", "other", "category", "location", "availability", "audience", "stats_summary", "stats_screenshot_names", "why_weard", "notes"];
  const cleaned = Object.fromEntries(allowed.map((key) => [key, text(fields?.[key]) ]));
  if (kind === "talent" && Array.isArray(fields.stats_screenshots)) {
    cleaned.stats_screenshots = fields.stats_screenshots.slice(0, 3).flatMap((file) => {
      const type = text(file?.type, 32);
      const data = String(file?.data || "");
      const validType = ["image/jpeg", "image/png", "image/webp"].includes(type);
      const validData = data.startsWith(`data:${type};base64,`) && data.length <= 1_400_000;
      if (!validType || !validData || Number(file?.size) > 1024 * 1024) return [];
      return [{ name: text(file?.name, 120).replace(/[^a-zA-Z0-9._-]/g, "_"), type, size: Number(file.size), data }];
    });
  }
  return cleaned;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: "Forbidden" });
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) {
    return res.status(413).json({ error: "Request too large" });
  }

  const rate = takeRateLimit(clientAddress(req));
  res.setHeader("RateLimit-Limit", String(MAX_REQUESTS));
  res.setHeader("RateLimit-Remaining", String(rate.remaining));
  res.setHeader("RateLimit-Reset", String(Math.ceil(rate.resetAt / 1000)));
  if (!rate.allowed) {
    res.setHeader("Retry-After", String(Math.ceil((rate.resetAt - Date.now()) / 1000)));
    return res.status(429).json({ error: "Too many requests" });
  }

  const { kind, website, fields } = req.body || {};
  if (website) return res.status(202).json({ ok: true });
  if (!['brand', 'talent'].includes(kind) || !fields || typeof fields !== "object") {
    return res.status(400).json({ error: "Invalid submission" });
  }
  const cleaned = cleanFields(kind, fields);
  if (!cleaned.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) {
    return res.status(400).json({ error: "Invalid submission" });
  }
  if (kind === "brand" && (!cleaned.brand || !cleaned.outline)) return res.status(400).json({ error: "Invalid submission" });
  if (kind === "talent" && (!cleaned.name || !cleaned.instagram || !cleaned.category)) return res.status(400).json({ error: "Invalid submission" });

  const templateId = kind === "brand" ? process.env.EMAILJS_BRAND_TEMPLATE_ID : process.env.EMAILJS_TALENT_TEMPLATE_ID;
  const { EMAILJS_SERVICE_ID: serviceId, EMAILJS_PUBLIC_KEY: publicKey, EMAILJS_PRIVATE_KEY: privateKey } = process.env;
  if (!serviceId || !templateId || !publicKey || !privateKey) return res.status(503).json({ error: "Contact service unavailable" });

  const response = await fetch(EMAILJS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, accessToken: privateKey, template_params: cleaned }),
  });
  if (!response.ok) return res.status(502).json({ error: "Contact service unavailable" });
  return res.status(200).json({ ok: true });
}
