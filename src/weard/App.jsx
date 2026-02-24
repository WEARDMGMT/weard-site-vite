

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Mail, ExternalLink, ArrowRight, ArrowUp, Globe, Menu, X, Sparkles, Youtube } from "lucide-react";
// Simple TikTok icon (outline) to match lucide style
const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={size}
    height={size}
    className={className}
    fill="currentColor"
  >
    <path d="M220.1 82.1c-26.4 0-47.8-21.4-47.8-47.8V28h-30v124.4c0 15.8-12.9 28.7-28.7 28.7s-28.7-12.9-28.7-28.7 12.9-28.7 28.7-28.7c5.5 0 10.6 1.6 14.9 4.2V101c-4.8-0.7-9.7-1.1-14.9-1.1-31.8 0-57.7 25.8-57.7 57.7s25.8 57.7 57.7 57.7 57.7-25.8 57.7-57.7V102c12.6 9.3 27.7 14.8 44.4 14.8V82.1z" />
  </svg>
);

const WorldMap = React.lazy(() => import("./WorldMap"));

/**
 * WEARD Management - Vite + React + Tailwind
 * Final consolidated version with:
 * - Title-case hero copy
 * - Disruptive "Who We Are" copy
 * - Global nav helper (window.weardNav)
 * - Roster "Submit profile" + About "Join the roster" -> Contact page
 * - Real world map with geographic hover glow (react-simple-maps)
 * - Clickable social stat tiles + image header links to default profile
 * - Followers set for Sophia, animated count-up + totals
 * - Hover video playback on cards
 * - Brands intro update
 * - Contact forms -> mailto prefill
 */
const VideoHover = ({ src, poster, className }) => {
  const ref = useRef(null);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      playsInline
      muted
      loop
      preload="metadata"
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => ref.current?.pause()}
      className={`${className} scale-[0.85] transition-transform`}



    />
  );
};

const LoadingScreen = ({ progress = 0 }) => (
  <motion.div
    className="weard-loader"
    initial={{ opacity: 1 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.6 } }}
  >
    <div className="weard-loader__fx" aria-hidden="true">
      <span className="weard-loader__glow weard-loader__glow--a" />
      <span className="weard-loader__glow weard-loader__glow--b" />
      <span className="weard-loader__glow weard-loader__glow--c" />
    </div>
    <div className="weard-loader__core">
      <div className="weard-loader__rig" aria-hidden="true">
        <div className="weard-loader__ring weard-loader__ring--outer" />
        <div className="weard-loader__ring weard-loader__ring--inner" />
        <div className="weard-loader__orbit">
          <span className="weard-loader__dot weard-loader__dot--a" />
          <span className="weard-loader__dot weard-loader__dot--b" />
          <span className="weard-loader__dot weard-loader__dot--c" />
        </div>
        <div className="weard-loader__sparkles">
          <span className="weard-loader__sparkle weard-loader__sparkle--a" />
          <span className="weard-loader__sparkle weard-loader__sparkle--b" />
          <span className="weard-loader__sparkle weard-loader__sparkle--c" />
          <span className="weard-loader__sparkle weard-loader__sparkle--d" />
        </div>
      </div>
      <div className="weard-loader__mark">WEARD</div>
      <div className="weard-loader__tagline">Because normal doesnt trend</div>
      <div
        className="weard-loader__progress"
        style={{ "--loader-progress": `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
      >
        <div className="weard-loader__track">
          <div className="weard-loader__fill" />
        </div>
        <div className="weard-loader__percent">{Math.round(progress * 100)}%</div>
      </div>
    </div>
  </motion.div>
);

const ScrollToTopButton = ({ elevated = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed right-4 z-40 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:bg-neutral-900 sm:right-6 ${
        elevated ? "bottom-28" : "bottom-6"
      }`}
      aria-label="Scroll back to top"
    >
      <ArrowUp size={16} aria-hidden="true" />
      Back to top
    </button>
  );
};
// ======= CONFIG =======
const SHEET_URL =
  import.meta.env.VITE_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe2hqUTFYnlYQVFXLmR0G2bI_APH9kkJqL7XJIvFIloG7QEjBAJqXkxGrUBYrvoaTg7jS-ucCQ1Uzj/pub?output=csv";
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_BRAND_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BRAND_TEMPLATE_ID;
const EMAILJS_TALENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TALENT_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Accurate country flags
const FLAG_SRC = {
  "United Kingdom": "https://flagcdn.com/gb.svg",
  "Hong Kong": "https://flagcdn.com/hk.svg",
  Thailand: "https://flagcdn.com/th.svg",
};

// Accent utilities
const GRADIENT = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";
const TEXT_GRAD = "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent";
const INPUT_CLS =
  "w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const BTN_PRIMARY_CLS = `${GRADIENT} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;
const CONSENT_STORAGE_KEY = "weard-cookie-consent";
const HUBSPOT_SCRIPT_ID = "hs-script-loader";
const HUBSPOT_SCRIPT_SRC = "//js-eu1.hs-scripts.com/147478125.js";

const loadHubspotScript = () => {
  if (document.getElementById(HUBSPOT_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.id = HUBSPOT_SCRIPT_ID;
  script.async = true;
  script.defer = true;
  script.src = HUBSPOT_SCRIPT_SRC;
  document.body.appendChild(script);
};

// Media placeholders (swap with real assets when ready)
const MEDIA = {
  creators: {
    Sophia: {
      hero:   "/media/creators/sophia/sophia-hero.jpg",   // main profile image
      poster: "/media/creators/sophia/sophia-poster.jpg", // still frame before hover
      video:  "/media/creators/sophia/sophia-hover.mp4",  // hover video
    },
    Amy: {
      hero:   "/media/creators/amy/amy-hero.jpg", // main profile image
      poster: "/media/creators/amy/amy-poster.jpg",// still frame before hover
      video:  "/media/creators/amy/amy-hover.mp4",  // hover video
    },
    Josefine: {
    hero:   "/media/creators/josefine/josefine-hero-v2.jpg",
    poster: "/media/creators/josefine/josefine-poster-v2.jpg",
    video:  "/media/creators/josefine/josefine-hover-v2.mp4",
   },

    OliveTreeFamily: {
      hero:   "/media/creators/theolivetreefamily/olivetreefamily-hero.jpg",
      poster: "/media/creators/theolivetreefamily/olivetreefamily-poster.jpg",
      video:  "/media/creators/theolivetreefamily/olivetreefamily-hover.mp4",
    },
    VeryBritishKorean: {
      hero: "/media/creators/verybritishkorean/verybritishkorean-hero.jpg",
      poster: "/media/creators/verybritishkorean/verybritishkorean-poster.jpg",
      video: "/media/creators/verybritishkorean/verybritishkorean-hover.mp4",
    },
    VeryBritishProblems: {
      hero: "/media/creators/verybritishproblems/verybritishproblems-hero.jpg",
      poster: "/media/creators/verybritishproblems/verybritishproblems-poster.jpg",
      video: "/media/creators/verybritishproblems/verybritishproblems-hover.mp4",
    },
  },
};

// ======= BRAND LOGOS =======
const BRAND_LOGOS = [
  { src: "/media/logos/amazon.png", alt: "Amazon" },
  { src: "/media/logos/beautyplus.png", alt: "BeautyPlus" },
  { src: "/media/logos/bella-barnett.png", alt: "Bella Barnett" },
  { src: "/media/logos/disney.png", alt: "Disney" },
  { src: "/media/logos/iamgia.svg", alt: "I.AM.GIA" },
  { src: "/media/logos/mediheal.png", alt: "Mediheal" },
  { src: "/media/logos/showpo.svg", alt: "Showpo" },
  { src: "/media/logos/skin-plus-me.svg", alt: "Skin+Me" },
  { src: "/media/logos/capcut.svg", alt: "CapCut" },
  { src: "/media/logos/the-week-junior.svg", alt: "The Week Junior" },
  { src: "/media/logos/tiger-mist.png", alt: "Tiger Mist" },
  { src: "/media/logos/time-phoria.png", alt: "Timephoria" },
];

const WEARE_WORDS = ["DIFFERENT", "DISRUPTIVE", "DYNAMIC", "DISTINCT", "DRIVEN", "DECISIVE", "DEFIANT"];
const HERO_VIDEOS = [
  "/assets/videos/video-01.mp4",
  "/assets/videos/video-02.mp4",
  "/assets/videos/video-03.mp4",
  "/assets/videos/video-04.mp4",
  "/assets/videos/video-05.mp4",
  "/assets/videos/video-06.mp4",
  "/assets/videos/video-07.mp4",
  "/assets/videos/video-08.mp4",
  "/assets/videos/video-09.mp4",
  "/assets/videos/video-10.mp4",
  "/assets/videos/video-11.mp4",
  "/assets/videos/video-12.mp4",
  "/assets/videos/video-13.mp4",
  "/assets/videos/video-14.mp4",
  "/assets/videos/video-15.mp4",
  "/assets/videos/video-16.mp4",
  "/assets/videos/video-17.mp4",
  "/assets/videos/video-18.mp4",
  "/assets/videos/video-19.mp4",
  "/assets/videos/video-20.mp4",
];
const HERO_LANES = [
  { seed: 0, speed: 54, pulse: 0.18 },
  { seed: 2, speed: 68, pulse: 0.22 },
  { seed: 4, speed: 46, pulse: 0.2 },
];

const CREATOR_ALIASES = {
  "sophia-price": ["sophiapriceyyy", "XsophiapriceyX", "xsophiapriceyx", "Sophia Price"],
  "emily-uddman": ["emily.uddman", "Emily Janrawee Uddman"],
  "josefine-uddman": [
    "josefine.ku.ud",
    "Josefine uddman",
    "Josefine Kuanroethai Uddman",
    "Bakhamnoi",
  ],
  "the-olive-tree-family": ["theolivetreefamily", "W Ken | Lynsay | Chung Family", "TheOliveTreeFamily"],
};

const STARTER_CREATORS = [
  {
     name: "Sophia Price",
  category: "Fashion",
  instagram: "https://www.instagram.com/xsophiapriceyx",
  tiktok: "https://www.tiktok.com/@sophiapriceyyy",
  youtube: "https://www.youtube.com/channel/UCKDFGIM9V-KRGxlISDODpPQ", 
  email: "sophia@weardmgmt.com",
location: "Thailand",
  instagram_followers: 715000,
  tiktok_followers: 656900,
  youtube_subscribers: 8380,                       
  profile_image: MEDIA.creators.Sophia.hero,   // static profile image
  photo: MEDIA.creators.Sophia.poster,         // still frame before hover
  tags: ["Fashion", "Beauty", "Travel"],
  video: MEDIA.creators.Sophia.video,
  bio: "Sophia Pricey is a Thai–British fashion, beauty and travel content creator known for her trend-setting style and high-engagement global audience. She shares fashion hauls, beauty tutorials and aspirational travel content across Instagram and TikTok, reaching over 1.3 million followers. With a photographer’s eye and a playful yet polished aesthetic, Sophia delivers visually striking campaigns for brands seeking authentic, cross-cultural influence.",
  top_audience: ["United States", "Thailand"],   // 👈 add this line

  },
     {name: "Josefine Uddman",
  category: "Beauty",
  instagram: "https://www.instagram.com/josefine.ku.ud/",
  tiktok: "https://www.tiktok.com/@josefine.ku.ud",
  email: "josefine@weardmgmt.com",
  location: "Thailand",
  instagram_followers: 9490,
  tiktok_followers: 83600,
  profile_image: MEDIA.creators.Josefine.hero, // static profile image
  photo: MEDIA.creators.Josefine.poster,          // still frame before hover
  tags: ["Beauty", "Lifestyle"],
  video: MEDIA.creators.Josefine.video,  
  bio: "Josefine Uddman is a Swedish–Thai fashion, beauty and lifestyle creator whose content reflects a distinctive cross-cultural perspective. Known for her trend-led outfits, skincare routines and authentic lifestyle insights, she connects with a growing global audience across Instagram and TikTok, delivering impactful, culturally aware campaigns for leading brands.",
  top_audience: ["Thailand", "Sweden"],
}, 
{
  name: "The Olive Tree Family",
  category: "Family",
  instagram: "https://www.instagram.com/theolivetreefamily",
  tiktok: "https://www.tiktok.com/@theolivetreefamily",
  youtube: "https://www.youtube.com/@theolivetreefamily", 
  email: "theolivetreefamily@weardmgmt.com",
  location: "UK",
  instagram_followers: 56400,
  tiktok_followers: 63900,
  youtube_subscribers: 6140,                       
 profile_image: MEDIA.creators.OliveTreeFamily.hero,
photo: MEDIA.creators.OliveTreeFamily.poster,
video: MEDIA.creators.OliveTreeFamily.video,
  tags: ["Family", "Lifestyle", "Travel"],
  bio: "The Olive Tree Family is a lively and engaging Scottish household turning everyday life into authentic stories. From delicious family food content and immersive experiences to travel adventures and comforting at-home moments, they create warm, relatable posts that resonate with families across the UK and beyond. Their thriving TikTok and Instagram community looks to them for genuine, family-friendly inspiration and everyday lifestyle ideas.",
  top_audience: ["United Kingdom"],
},
{
  name: "Very British Korean",
  category: "Lifestyle",
  instagram: "https://www.instagram.com/verybritishkorean/?hl=en",
  tiktok: "https://www.tiktok.com/@verybritishkorean",
  location: "UK",
  instagram_followers: 85100,
  tiktok_followers: 9900,
  profile_image: MEDIA.creators.VeryBritishKorean.hero,
  photo: MEDIA.creators.VeryBritishKorean.poster,
  video: MEDIA.creators.VeryBritishKorean.video,
  tags: ["Lifestyle", "Comedy", "Beauty"],
  bio: "Very British Korean is a culture-blending creator best known for sharp, observational humour that explores the quirks of British life through a Korean lens. Her content resonates for its relatability, warmth and comedic timing, building a highly engaged audience across TikTok and Instagram. With a natural ability to integrate brands into everyday moments, she delivers content that feels authentic, entertaining, and genuinely shareable.",
  top_audience: ["United Kingdom"],
},
{
  name: "Very British Problems",
  category: "Lifestyle",
  instagram: "https://www.instagram.com/verybritishproblemsofficial/?hl=en",
  tiktok: "https://www.tiktok.com/@verybritishproblems",
  youtube: "https://www.youtube.com/@verybritishproblems",
  facebook: "https://www.facebook.com/soverybritish/?locale=en_GB",
  location: "UK",
  instagram_followers: 1100000,
  tiktok_followers: 223500,
  youtube_subscribers: 34700,
  facebook_followers: 1200000,
  profile_image: MEDIA.creators.VeryBritishProblems.hero,
  photo: MEDIA.creators.VeryBritishProblems.poster,
  video: MEDIA.creators.VeryBritishProblems.video,
  tags: ["Comedy", "Lifestyle"],
  bio: "Very British Problems is a UK comedy and lifestyle creator capturing the everyday quirks, awkward rituals and iconic moments of British culture. Through punchy sketches, relatable observations and social-first storytelling, Rob has built a deeply engaged cross-platform audience of over 2.5 million followers. His content blends humour with cultural insight, making them a standout partner for campaigns that want to feel current, local and instantly shareable.",
  top_audience: ["United Kingdom"],
},
{
  name: "Emily Uddman",
  category: "Lifestyle",
  instagram: "https://www.instagram.com/emily.uddman/?hl=en",
  tiktok: "https://www.tiktok.com/@emily.uddman",
  instagram_followers: 90200,
  tiktok_followers: 378700,
  tags: ["Lifestyle", "Beauty"],
  rosterVisible: false,
},
{
  name: "Zophia",
  category: "Lifestyle",
  instagram: "https://www.instagram.com/zophia.zz/",
  tiktok: "https://www.tiktok.com/@zophia.6905?lang=en",
  instagram_followers: 251000,
  tiktok_followers: 922400,
  tags: ["Lifestyle", "Fashion"],
  rosterVisible: false,
},
];

const CATEGORIES = [
  { key: "Fashion", label: "Fashion" },
  { key: "Sport", label: "Sport" },
  { key: "Family", label: "Family" },
  { key: "Travel", label: "Travel" },
  { key: "Beauty", label: "Beauty" },
  { key: "Lifestyle", label: "Lifestyle" },
];

// ======= UTIL =======
const cn = (...c) => c.filter(Boolean).join(" ");
const shuffleWithSeed = (items, seed = 0) => {
  const arr = [...items];
  let state = seed + 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    state = (state * 9301 + 49297) % 233280;
    const j = Math.floor((state / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const cleanNum = (v) => {
  if (v == null || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return isFinite(n) ? n : null;
};

const shortFormat = (n) => {
  if (n == null) return "—";
  if (n < 1_000) return String(n);
  if (n < 1_000_000) return `${(n / 1_000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
};
const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PAGE_PATHS = {
  home: "/",
  about: "/about",
  roster: "/roster",
  contact: "/contact",
  brands: "/brands",
  privacy: "/privacy",
  "apac-influencer-marketing": "/apac-influencer-marketing",
  "asia-to-uk-influencer-marketing": "/asia-to-uk-influencer-marketing",
};

// Lightweight intersection observer for lazy loading
function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return () => {};
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      });
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}


function getUsernameFromUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let path = (u.pathname || "").replace(/\/+$/, "");
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return null;

    // YouTube: @handle preferred; else first segment (channel/c/custom)
    if (/youtube\.com$/i.test(u.hostname)) {
      const first = parts[0];
      if (first.startsWith("@")) return first.slice(1).toLowerCase();
      return first.toLowerCase();
    }

    // IG/TikTok (strip leading @)
    const first = parts[0].replace(/^@/, "");
    return first.toLowerCase();
  } catch {
    // fallback for plain strings that may not be valid URLs
    const m = String(url).match(
      /(?:instagram\.com|tiktok\.com|youtube\.com)\/(?:@)?([A-Za-z0-9_.-]+)/i
    );
    return m ? m[1].toLowerCase().replace(/^@/, "") : null;
  }
}

function CountTo({ to = 0, duration = 650, format = (x) => x.toLocaleString() }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let start = null;
    let raf;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setV(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{format(v)}</>;
}

// CSV with quoted fields
function parseCSV(csv) {
  const lines = csv.trim().split(/\\r?\\n/);
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

function useRosterHydration(initialCreators = STARTER_CREATORS) {
  const [creators, setCreators] = useState(initialCreators);
  useEffect(() => {
    let canceled = false;
    async function fetchSheet() {
      try {
        if (!SHEET_URL) return;
        const res = await fetch(SHEET_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
        const csv = await res.text();
        const rows = parseCSV(csv);
let mapped = rows
  .filter((r) => r.name)
  .filter((r) => !/amelie|amy\s*wyg/i.test(r.name))
 .map((r) => ({
  name: r.name,
  category: r.category || "Lifestyle",
  instagram: r.instagram || "",
  tiktok: r.tiktok || "",
  youtube: r.youtube || "",                          // NEW
  email: r.email || "",
  location: r.location || "",
  instagram_followers: cleanNum(r.instagram_followers),
  tiktok_followers: cleanNum(r.tiktok_followers),
  youtube_subscribers: cleanNum(r.youtube_subscribers), // NEW
  profile_image: r.profile_image || MEDIA.creators.Sophia.photo,
  tags: (r.tags || "").split("|").filter(Boolean),
  photo: r.photo || MEDIA.creators.Sophia.photo,
  video: r.video || MEDIA.creators.Sophia.video,
  bio: r.bio || "",
  top_audience: (r.top_audience || "")
    .split("|")
    .map(s => s.trim())
    .filter(Boolean),
}))

        // Fallbacks for Sophia if sheet doesn’t supply numbers
        mapped = mapped.map((c) => {
          const name = c.name?.toLowerCase() || "";
          if (name.includes("sophia")) {
            c.instagram_followers ??= 721000;
            c.tiktok_followers ??= 552900;
          }
          return c;
        });

        const existingNames = new Set(
          mapped.map((creator) => creator.name?.toLowerCase()).filter(Boolean)
        );
        const merged = [
          ...mapped,
          ...initialCreators.filter(
            (creator) => !existingNames.has(creator.name?.toLowerCase())
          ),
        ];

        if (!canceled && merged.length) setCreators(merged);
      } catch (e) {
        console.warn("Roster hydration failed:", e);
      }
    }
    fetchSheet();
    const id = setInterval(fetchSheet, 60 * 60 * 1000);
    return () => {
      canceled = true;
      clearInterval(id);
    };
  }, []);
  return creators;
}

// ======= APP =======
export default function App() {
  const creators = useRosterHydration();
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [activePage, setActivePage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  });
  const creatorSlugMap = useMemo(() => {
    const map = new Map();
    creators.forEach((creator) => {
      if (creator?.name) map.set(slugify(creator.name), creator);
    });
    return map;
  }, [creators]);

  const resolveRoute = (path) => {
    const normalized = path.replace(/\/+$/, "") || "/";
    if (normalized.startsWith("/creators/")) {
      const slug = normalized.split("/")[2];
      const creator = creatorSlugMap.get(slug);
      if (creator) {
        setSelectedCreator(creator);
        setActivePage("profile");
        return;
      }
    }
    const match = Object.entries(PAGE_PATHS).find(([, p]) => p === normalized);
    setSelectedCreator(null);
    setActivePage(match?.[0] || "home");
  };

  const navigate = (k, options = {}) => {
    const path = options.path || PAGE_PATHS[k] || "/";
    setActivePage(k);
    if (k !== "profile") setSelectedCreator(null);
    setMenuOpen(false);
    if (!options.replace) {
      window.history.pushState({}, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // expose simple global nav + openProfile
useEffect(() => {
  window.weardNav = (k) => navigate(k);
  window.weardOpenProfile = (creator) => {
    if (!creator) return;
    const slug = slugify(creator.name || "creator");
    setSelectedCreator(creator);
    navigate("profile", { path: `/creators/${slug}` });
  };
  return () => {
    delete window.weardNav;
    delete window.weardOpenProfile;
  };
}, []);

  useEffect(() => {
    resolveRoute(window.location.pathname);
  }, [creatorSlugMap]);

  useEffect(() => {
    let minPassed = false;
    let loaded = document.readyState === "complete";
    let rafId;
    const minDuration = 1200;
    const start = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - start;
      const timeProgress = Math.min(elapsed / minDuration, 1);
      const readyState = document.readyState;
      const readyProgress =
        readyState === "complete" ? 1 : readyState === "interactive" ? 0.6 : 0.3;
      let target = Math.min(0.95, Math.max(timeProgress, readyProgress));

      if (loaded) target = 1;

      setLoadProgress((prev) => (target > prev ? target : prev));

      if (!loaded || target < 1) {
        rafId = requestAnimationFrame(updateProgress);
      }
    };

    const handleLoad = () => {
      loaded = true;
      setLoadProgress(1);
      if (minPassed) setIsLoading(false);
    };

    const timer = setTimeout(() => {
      minPassed = true;
      if (loaded) setIsLoading(false);
    }, minDuration);

    window.addEventListener("load", handleLoad);
    if (loaded) handleLoad();
    rafId = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", handleLoad);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("weard-loading", isLoading);
    return () => document.body.classList.remove("weard-loading");
  }, [isLoading]);

  useEffect(() => {
    const handlePopState = () => resolveRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [creatorSlugMap]);

  useEffect(() => {
    if (cookieConsent !== "accepted") return;
    loadHubspotScript();
  }, [cookieConsent]);

  const handleCookieConsent = (value) => {
    setCookieConsent(value);
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  };

  useEffect(() => {
    if (activePage === "profile") return;
    const meta = {
      home: {
        title: "WEARD Management | Global Influencer Talent Management Agency",
        description:
          "WEARD Management (WEARDMGMT) connects brands with creators across Asia, APAC, Thailand, Hong Kong, the UK, and the US, delivering cross-border talent management and creator campaigns.",
      },
      about: {
        title: "About WEARD Management | Cross-Border Influencer Management",
        description:
          "Discover WEARD’s creator-first approach to influencer talent management, building bridges between Asian brands and Western audiences across APAC, the UK, and the US.",
      },
      roster: {
        title: "WEARD Roster | Influencer Talent Management & Creator Representation",
        description:
          "Explore WEARD’s global creator roster for influencer talent management, creator representation, and brand-safe partnerships across Asia and APAC.",
      },
      contact: {
        title: "Contact WEARD Management | Global Influencer Campaigns",
        description:
          "Work with WEARD Management on performance-driven influencer marketing, ROI-focused creator campaigns, and cross-border activations.",
      },
      brands: {
        title: "Brand Partnerships | WEARD Management Influencer Agency",
        description:
          "Partner with WEARD Management for brand-safe creator partnerships, global brand expansion, and influencer talent management across Asia, APAC, the UK, and the US.",
      },
      privacy: {
        title: "Privacy Policy | WEARD Management",
        description: "WEARD Management privacy policy and data protection information.",
      },
      "apac-influencer-marketing": {
        title: "APAC Influencer Marketing | WEARD Management",
        description:
          "APAC influencer marketing and talent management agency delivering creator campaigns across Asia-Pacific markets.",
      },
      "asia-to-uk-influencer-marketing": {
        title: "UK Influencer Marketing | WEARD Management",
        description:
          "UK influencer marketing built on cross-border creator campaigns connecting Asian brands with British audiences.",
      },
    };
    const metaConfig = meta[activePage] || meta.home;
    document.title = metaConfig.title;
    const descriptionTag =
      document.querySelector('meta[name="description"]') ||
      document.head.appendChild(document.createElement("meta"));
    descriptionTag.setAttribute("name", "description");
    descriptionTag.setAttribute("content", metaConfig.description);

    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.head.appendChild(document.createElement("link"));
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", `https://weardmgmt.com${PAGE_PATHS[activePage] || "/"}`);
  }, [activePage]);

  useEffect(() => {
    const people = creators.map((creator) => {
      const sameAs = [creator.instagram, creator.tiktok, creator.youtube].filter(Boolean);
      const slug = slugify(creator.name);
      const handleAliases = sameAs
        .map((url) => getUsernameFromUrl(url))
        .filter(Boolean)
        .flatMap((handle) => [handle, `@${handle}`]);
      const alternateName = Array.from(
        new Set([...(CREATOR_ALIASES[slug] || []), ...handleAliases].filter(Boolean))
      );
      return {
        "@type": "Person",
        name: creator.name,
        description: creator.bio || `${creator.name} represented by WEARD Management.`,
        jobTitle: "Creator",
        affiliation: {
          "@type": "Organization",
          name: "WEARD Management",
          url: "https://weardmgmt.com",
        },
        url: `https://weardmgmt.com/creators/${slug}`,
        sameAs,
        ...(alternateName.length ? { alternateName } : {}),
      };
    });
    const data = {
      "@context": "https://schema.org",
      "@graph": people,
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, [creators]);
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <AnimatePresence>{isLoading ? <LoadingScreen progress={loadProgress} /> : null}</AnimatePresence>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header onNav={navigate} active={activePage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main id="main-content" tabIndex={-1}>
        <AnimatePresence mode="wait">
          {activePage === "home" && (
            <motion.section key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Home onExploreRoster={() => navigate("roster")} onWorkWithUs={() => navigate("contact")} />
            </motion.section>
          )}
          {activePage === "about" && (
            <motion.section key="about" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <About />
            </motion.section>
          )}
          {activePage === "roster" && (
            <motion.section key="roster" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Roster creators={creators} onNav={navigate} />
            </motion.section>
          )}
          {activePage === "contact" && (
            <motion.section key="contact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Contact />
            </motion.section>
          )}
          {activePage === "brands" && (
            <motion.section key="brands" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <BrandPartnerships onNav={navigate} />
            </motion.section>
          )}
          {activePage === "privacy" && (
            <motion.section
            key="privacy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}  exit={{ opacity: 0, y: -8 }}
  >
    <PrivacyPolicy />
  </motion.section>
)}
          {activePage === "profile" && (
  <motion.section
    key="profile"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
  >
    <CreatorProfile
      creator={selectedCreator}
      onBack={() => navigate("roster")}
    />
  </motion.section>
)}
          {activePage === "apac-influencer-marketing" && (
            <motion.section key="apac-influencer-marketing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <MarketingLanding
                title="APAC Influencer Marketing"
                primaryKeyword="APAC Influencer Marketing"
                secondaryKeywords={[
                  "APAC Influencer Talent Management",
                  "Asia-Pacific Influencer Agency",
                  "Regional creator campaigns",
                  "Multi-market activations",
                ]}
                regionFocus="APAC"
                bridgeKeywords={[
                  "Cross-border influencer marketing",
                  "Creator partnerships across Asia-Pacific",
                  "Global influencer campaign delivery",
                  "Gateway to Western influencer markets",
                ]}
                onNav={navigate}
              />
            </motion.section>
          )}
          {activePage === "asia-to-uk-influencer-marketing" && (
            <motion.section key="asia-to-uk-influencer-marketing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <MarketingLanding
                title="UK Influencer Marketing"
                primaryKeyword="UK Influencer Marketing"
                secondaryKeywords={[
                  "Asia to UK influencer marketing",
                  "UK influencer talent management",
                  "British creator partnerships",
                  "International influencer management",
                ]}
                regionFocus="the UK"
                bridgeKeywords={[
                  "Connecting Asian brands to UK creators",
                  "Cross-border influencer marketing",
                  "Brand-safe creator partnerships",
                  "Global influencer campaign delivery",
                ]}
                onNav={navigate}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <ScrollToTopButton elevated={cookieConsent == null} />

      {cookieConsent == null && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 text-sm text-neutral-700 dark:text-neutral-200 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">Cookies & analytics</p>
              <p>
                We use cookies to understand site traffic and improve your experience. You can accept or decline analytics cookies.
                Review our{" "}
                <button
                  type="button"
                  onClick={() => navigate("privacy")}
                  className="font-semibold text-indigo-600 underline underline-offset-4 dark:text-indigo-300"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => handleCookieConsent("declined")}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleCookieConsent("accepted")}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer onNav={navigate} />
    </div>
  );
}

function Header({ onNav, active, menuOpen, setMenuOpen }) {
  const nav = [
    { k: "home", label: "Home" },
    { k: "about", label: "About Us" },
    { k: "roster", label: "Roster" },
    { k: "contact", label: "Contact" },
  ];

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 text-white backdrop-blur border-b border-black/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("font-black tracking-widest text-xl sm:text-2xl", TEXT_GRAD)}>WEARD</span>
          <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-neutral-300">Management</span>
        </div>
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {nav.map((n) => (
            <button
              key={n.k}
              onClick={() => onNav(n.k)}
              className={cn("text-sm hover:opacity-80 focus:outline-none focus:underline", active === n.k ? "font-semibold text-white" : "text-neutral-300")}
              aria-current={active === n.k ? "page" : undefined}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed inset-y-0 right-0 z-50 w-[86%] max-w-sm bg-neutral-900 text-white border-l border-black/20 p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            id="mobile-nav"
          >
            <div className="flex items-center justify-between">
              <div className="font-black tracking-widest text-white">WEARD</div>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {nav.map((n) => (
                <button
                  key={n.k}
                  onClick={() => onNav(n.k)}
                  className={cn(
  "w-full text-left px-4 py-3 rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
  active === n.k
    ? "bg-white text-neutral-900 font-semibold border-white"
    : "bg-neutral-800 text-neutral-200 border-white/15 hover:bg-neutral-800/80"
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
function CreatorProfile({ creator, onBack }) {
  // Set document title for SEO/nice browser tab text
  useEffect(() => {
    const name = creator?.name;
    document.title = name
      ? `${name} • WEARD Management`
      : "Profile • WEARD Management";
    const handles = [
      getUsernameFromUrl(creator?.instagram),
      getUsernameFromUrl(creator?.tiktok),
      getUsernameFromUrl(creator?.youtube),
    ]
      .filter(Boolean)
      .map((handle) => `@${handle}`)
      .join(", ");
    const description = name
      ? `${name} (${handles || "creator"}) represented by WEARD Management for global influencer campaigns and creator representation.`
      : "Creator profile on WEARD Management.";
    const descriptionTag =
      document.querySelector('meta[name="description"]') ||
      document.head.appendChild(document.createElement("meta"));
    descriptionTag.setAttribute("name", "description");
    descriptionTag.setAttribute("content", description);
    const canonical =
      document.querySelector('link[rel="canonical"]') ||
      document.head.appendChild(document.createElement("link"));
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute(
      "href",
      name ? `https://weardmgmt.com/creators/${slugify(name)}` : "https://weardmgmt.com/roster"
    );
    return () => { document.title = "WEARD Management"; };
  }, [creator]);

  // If no creator selected
  if (!creator) {
    return (
      <section className="max-w-5xl mx-auto px-4 pt-10 pb-20">
        <button onClick={onBack} className="text-sm underline">← Back to roster</button>
        <h2 className="mt-6 text-2xl font-bold">Profile not found</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Please return to the roster and open a creator again.
        </p>
      </section>
    );
  }

  const {
    name,
    tags = [],
    photo,
    video,
    instagram,
    tiktok,
    youtube, // NEW
    email,
    location,
    bio,
    instagram_followers,
    tiktok_followers,
    youtube_subscribers, // NEW
    top_audience = [],
  } = creator;

  const [mediaRef, mediaInView] = useInView({ rootMargin: "200px" });
  const mediaVideoRef = useRef(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  useEffect(() => {
    if (mediaInView && video) setShouldLoadVideo(true);
  }, [mediaInView, video]);
  const [isMediaActive, setIsMediaActive] = useState(false);
  const handleMediaEnter = () => {
    if (!video) return;
    setShouldLoadVideo(true);
    setIsMediaActive(true);
    mediaVideoRef.current?.play();
  };
  const handleMediaLeave = () => {
    setIsMediaActive(false);
    mediaVideoRef.current?.pause();
  };

  const ig = cleanNum(instagram_followers) ?? 0;
  const tt = cleanNum(tiktok_followers) ?? 0;
  const yt = cleanNum(youtube_subscribers) ?? 0; // NEW
  const total = ig + tt + yt; // NEW


  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:opacity-80"
      >
        ← Back to Roster
      </button>

      <div className="mt-6 grid lg:grid-cols-2 gap-8 items-start">
        {/* Media */}
        <div
          ref={mediaRef}
          className="rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 relative"
        >
          <div className="relative aspect-[4/5] sm:aspect-[3/4]">
            <img
              src={photo || creator.profile_image}
              alt={`${name} — WEARD Management creator`}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {video && (
              <video
                ref={mediaVideoRef}
                src={shouldLoadVideo ? video : undefined}
                muted
                loop
                playsInline
                preload="none"
                className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ${
                  isMediaActive ? "opacity-100" : "hover:opacity-100"
                }`}
                onMouseEnter={handleMediaEnter}
                onMouseLeave={handleMediaLeave}
                onTouchStart={handleMediaEnter}
                onTouchEnd={handleMediaLeave}
              />
            )}
          </div>
        </div>

        {/* Meta */}
        <div>
          {/* Tags + socials */}
          <div className="flex items-center gap-3 flex-wrap">
            {tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full text-black/90"
                style={{ backgroundImage: "linear-gradient(90deg,#4F46E5,#A855F7)" }}
              >
                {t}
              </span>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              {tiktok && (
                <a
                  className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center"
                  href={tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open TikTok"
                  title="TikTok"
                >
                  <TikTokIcon />
                </a>
              )}
              {instagram && (
                <a
                  className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center"
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Instagram"
                  title="Instagram"
                >
                  <Instagram size={16} />
                </a>
      )}   
      {youtube && (
  <a
    className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center"
    href={youtube}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Open YouTube"
    title="YouTube"
  >
    <Youtube size={16} />
  </a>
              )}
              {email && (
                <a
                  className="h-9 px-3 rounded-full bg-neutral-100 dark:bg-neutral-800 grid place-items-center text-xs"
                  href={`mailto:${email}`}
                  aria-label="Email"
                  title="Email"
                >
                  <Mail size={14} className="mr-1 inline" /> Email
                </a>
              )}
            </div>
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold leading-[1.05] tracking-tight">
            {name}
          </h1>

          <div className="mt-2 text-sm text-neutral-500">
            {location && <span>{location}</span>}
            {top_audience.length > 0 && (
              <span className="ml-2">• Top audience: {top_audience.join(" · ")}</span>
            )}
          </div>

          <div className="mt-4 text-neutral-700 dark:text-neutral-300 space-y-4">
            <p>{bio}</p>
          </div>

       {/* Stats */}
<div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
  {tt > 0 && (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
      <div className="text-2xl font-extrabold">
        <CountTo to={tt} format={shortFormat} />
      </div>
      <div className="text-xs text-neutral-500 mt-1">TikTok Followers</div>
    </div>
  )}

  {ig > 0 && (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
      <div className="text-2xl font-extrabold">
        <CountTo to={ig} format={shortFormat} />
      </div>
      <div className="text-xs text-neutral-500 mt-1">Instagram Followers</div>
    </div>
  )}

  {yt > 0 && (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
      <div className="text-2xl font-extrabold">
        <CountTo to={yt} format={shortFormat} />
      </div>
      <div className="text-xs text-neutral-500 mt-1">YouTube Subscribers</div>
    </div>
  )}
</div>
          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className={BTN_PRIMARY_CLS}
              onClick={() => window.weardNav?.("contact")}
            >
              Brief This Creator <ArrowRight size={16} />
            </button>
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700"
              >
                View Instagram <ExternalLink size={14} />
              </a>
            )}
            {tiktok && (
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700"
              >
                View TikTok <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteLink({ to, onNav, className, children }) {
  const href = PAGE_PATHS[to] || to;
  const pageKey = PAGE_PATHS[to]
    ? to
    : Object.entries(PAGE_PATHS).find(([, path]) => path === href)?.[0];
  return (
    <a
      href={href}
      onClick={(event) => {
        if (!onNav || !pageKey) return;
        event.preventDefault();
        onNav(pageKey);
      }}
      className={className}
    >
      {children}
    </a>
  );
}

// ======= HOME =======
function Home({ onExploreRoster, onWorkWithUs }) {
  return (
    <section className="relative overflow-hidden">
      <HeroCarousel onExploreRoster={onExploreRoster} onWorkWithUs={onWorkWithUs} />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
          WE ARE <RotatingWords words={WEARE_WORDS} />
        </h1>
        <p className="mt-5 text-base sm:text-lg text-neutral-700 dark:text-neutral-200 max-w-prose">
          WEARD Management (WEARDMGMT) is a global influencer talent management agency connecting
          Asia, APAC, Thailand, Hong Kong, the UK, and the US through cross-border creator
          campaigns.<br />
          Global influence. Global campaigns. Global talent.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={onExploreRoster}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Explore Roster <ArrowRight size={16} />
          </button>
          <button
            onClick={onWorkWithUs}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-white hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${GRADIENT}`}
          >
            Work With Us <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Regional expertise</p>
            <h2 className="mt-3 text-2xl font-semibold">Asia, APAC, Thailand, Hong Kong & UK focus</h2>
            <p className="mt-3 text-sm text-neutral-600">
              We deliver Asia and APAC creator campaigns, Thailand and Hong Kong talent management,
              plus UK market entry support for brands expanding across the region.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Cross-border bridges</p>
            <h2 className="mt-3 text-2xl font-semibold">Asia to UK & US influencer marketing</h2>
            <p className="mt-3 text-sm text-neutral-600">
              WEARD builds bridges between Asian brands and Western audiences with international
              influencer management, global influencer campaigns, and Asia to UK/US activations.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Commercial outcomes</p>
            <h2 className="mt-3 text-2xl font-semibold">Performance-driven creator campaigns</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Expect influencer talent management, creator representation, paid social amplification,
              ROI-focused creator campaigns, and end-to-end influencer management from ideation to execution.
            </p>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-neutral-900 bg-neutral-900 p-6 sm:p-8 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Insights</p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-semibold">
            Brand-safe creator partnerships for global brand expansion
          </h3>
          <p className="mt-3 text-sm text-white/70">
            We specialise in always-on influencer strategy, whitelisted content, localised creator
            strategy, and multi-market activations that connect Asian brands to UK and US creators.
          </p>
        </div>
      </div>
    </section>
  );
}

function HeroCarousel({ onExploreRoster, onWorkWithUs }) {
  const trackRefs = useRef([]);
  const containerRef = useRef(null);
  const shuffleSeed = useMemo(() => Math.floor(Math.random() * 10_000), []);
  const laneOrders = useMemo(
    () => HERO_LANES.map((lane) => shuffleWithSeed(HERO_VIDEOS, lane.seed + shuffleSeed)),
    [shuffleSeed]
  );

  useEffect(() => {
    const state = HERO_LANES.map((lane, index) => {
      const track = trackRefs.current[index];
      const startOffset = ((lane.seed * 179) % 900) + Math.random() * 320;
      return {
        track,
        speed: lane.speed,
        pulse: lane.pulse,
        phase: Math.random() * Math.PI * 2,
        y: startOffset,
        loopAt: 1,
      };
    });

    const measureLoop = () => {
      state.forEach((s) => {
        if (s.track) {
          s.loopAt = Math.max(1, s.track.scrollHeight / 2);
        }
      });
    };

    measureLoop();

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureLoop, 120);
    };
    window.addEventListener("resize", handleResize);

    let last = performance.now();
    let raf;
    const normaliseY = (y, loopAt) => {
      let next = y % loopAt;
      if (next < 0) next += loopAt;
      return next;
    };

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      state.forEach((s) => {
        if (!s.track) return;
        const freq = 0.55 + s.pulse * 0.6;
        const wobble =
          1 +
          Math.sin((now / 1000) * (Math.PI * 2) * freq + s.phase) * s.pulse;
        s.y = normaliseY(s.y + s.speed * wobble * dt, s.loopAt);
        s.track.style.transform = `translate3d(0, ${-s.y}px, 0)`;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !window.IntersectionObserver) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.6 }
    );

    const cards = containerRef.current.querySelectorAll(".weard-hero__card");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="weard-hero" ref={containerRef}>
      <div className="weard-hero__lanes">
        {HERO_LANES.map((lane, laneIndex) => {
          const ordered = laneOrders[laneIndex] || HERO_VIDEOS;
          return (
            <div
              key={lane.seed}
              className="weard-hero__lane"
              data-seed={lane.seed}
              data-speed={lane.speed}
              data-pulse={lane.pulse}
            >
              <div
                className="weard-hero__track"
                ref={(el) => {
                  trackRefs.current[laneIndex] = el;
                }}
              >
                {ordered.map((src, index) => (
                  <HeroCard key={`${src}-${index}-a`} src={src} />
                ))}
                {ordered.map((src, index) => (
                  <HeroCard key={`${src}-${index}-b`} src={src} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="weard-hero__grain" />

      <div className="weard-hero__overlay">
        <div className="weard-hero__glass">
          <h1>WEARD</h1>
          <p>A global talent management agency specialising across the UK and Asia.</p>
          <div className="weard-hero__cta">
            <button
              onClick={onExploreRoster}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-sm hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Explore roster <ArrowRight size={16} />
            </button>
            <button
              onClick={onWorkWithUs}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            >
              Work with us <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroCard({ src }) {
  const [hasError, setHasError] = useState(false);
  return (
    <div className="weard-hero__card">
      <video
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div className="weard-hero__fallback">Add MP4 at: {src}</div>
      )}
    </div>
  );
}

function RotatingWords({ words }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <span className="inline-block ml-2">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          className={TEXT_GRAD}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ======= ABOUT =======
function About() {
  const totalCreators = STARTER_CREATORS.length;
  const totalFollowing = STARTER_CREATORS.reduce((sum, creator) => {
    const ig = cleanNum(creator.instagram_followers) ?? 0;
    const tt = cleanNum(creator.tiktok_followers) ?? 0;
    const yt = cleanNum(creator.youtube_subscribers) ?? 0;
    return sum + ig + tt + yt;
  }, 0);
  const highlights = [
    {
      title: "Talent strategy",
      body: "Full-service creator management from positioning and pricing to long-term brand alignment.",
      accent: "from-blue-500/15 via-indigo-500/10 to-purple-500/15",
    },
    {
      title: "Campaign production",
      body: "We handle creative direction, briefs, approvals, and delivery timelines across every platform.",
      accent: "from-purple-500/15 via-pink-500/10 to-orange-400/15",
    },
    {
      title: "Brand partnerships",
      body: "We source, negotiate, and activate premium deals with brands that fit each creator’s voice.",
      accent: "from-emerald-500/15 via-teal-500/10 to-blue-500/15",
    },
    {
      title: "Performance reporting",
      body: "Post-campaign analytics, audience insights, and learnings to guide the next launch.",
      accent: "from-amber-500/15 via-rose-500/10 to-purple-500/15",
    },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 bg-white/80 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-neutral-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Influencer management, done differently
          </div>
          <h2 className="mt-5 text-4xl sm:text-5xl font-bold text-neutral-900">
            Influencer campaigns backed by creator-first management.
          </h2>
          <p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-2xl">
            WEARD blends boutique attention with global scale as an influencer talent management
            agency for Asia, APAC, Thailand, Hong Kong, the UK, and the US. From onboarding to
            campaign delivery, we orchestrate cross-border influencer marketing so brands get
            standout creative and creators get long-term momentum. As WEARD influencer management
            and WEARD talent management, we operate as a WEARD Asia influencer agency and WEARD
            APAC influencer management partner for global growth.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-neutral-500">
            {["Strategy", "Creative", "Partnerships", "Reporting"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-neutral-200 bg-white/90 px-3 py-1 shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Roster snapshot</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Total creators</div>
              <div className="mt-2 text-3xl font-bold text-neutral-900">
                <CountTo to={totalCreators} />+
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Combined social following</div>
              <div className="mt-2 text-3xl font-bold text-neutral-900">
                <CountTo to={totalFollowing} format={shortFormat} />+
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {highlights.map((h) => (
          <div
            key={h.title}
            className="group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${h.accent} opacity-0 transition duration-300 group-hover:opacity-100`}
            />
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-neutral-100/70 blur-2xl transition duration-300 group-hover:bg-white/80" />
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white/90 shadow-sm">
                <Sparkles size={16} className="text-neutral-900" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-neutral-900">{h.title}</h3>
                <p className="text-[11px] uppercase tracking-[0.28em] text-neutral-400">
                  WEARD service
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{h.body}</p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-neutral-500">
              Explore details
              <ArrowRight size={12} className="transition group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-3xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <div className="text-center text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Brand partners</p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-semibold">Trusted by leading brands worldwide</h3>
          <p className="mt-2 text-sm text-white/70">
            From fast-growing disruptors to global icons, WEARD helps brands build creator campaigns that resonate.
          </p>
        </div>
        <div className="mt-6">
          <LogoCarousel />
        </div>
      </div>
      <button
        onClick={() => window.weardNav?.("contact")}
        className={`mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full text-white ${GRADIENT}`}
      >
        Join the roster <ArrowRight size={16} />
      </button>
      <WhereWeWork />
    </section>
  );
}

// ======= Flags =======
const CountryFlagIcon = ({ country }) => (
  <img
  src={FLAG_SRC[country]}
  alt={`${country} flag`}
  className="w-8 h-8 rounded-full ring-1 ring-black/10 object-cover"
  loading="lazy"
  decoding="async" 
     />
);

// ======= WHERE WE WORK (real map + glow) =======
function WhereWeWork() {
  const offices = [
    { country: "United Kingdom", city: "London", coords: [-0.1276, 51.5072] },
    { country: "Hong Kong", city: "Hong Kong", coords: [114.1694, 22.3193] },
    { country: "Thailand", city: "Bangkok / Phuket", coords: [100.5018, 13.7563] },
  ];
  const [hoverCountry, setHoverCountry] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.4 });
  const [mapRef, mapInView] = useInView({ rootMargin: "300px" });

  return (
    <div className="mt-12">
      <h3 className="text-[22px] sm:text-2xl font-semibold">Our Growing Reach</h3>
      <p className="mt-1 text-xs text-neutral-500">United Kingdom · Hong Kong · Thailand</p>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <div
          ref={mapRef}
          className="lg:col-span-2 p-2 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-inner"
        >
          <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] rounded-2xl overflow-hidden">
            {mapInView ? (
              <Suspense
                fallback={
                  <div className="absolute inset-0 grid place-items-center text-sm text-neutral-500">
                    Loading world map…
                  </div>
                }
              >
                <WorldMap
                  geoUrl={GEO_URL}
                  offices={offices}
                  hoverCountry={hoverCountry}
                  setHoverCountry={setHoverCountry}
                  position={position}
                  setPosition={setPosition}
                />
              </Suspense>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-neutral-500">
                Map ready when you scroll
              </div>
            )}
          </div>
        </div>

        {/* Office list */}
        <div className="grid gap-3">
          {offices.map((o) => (
            <button
              key={o.country}
              onMouseEnter={() => setHoverCountry(o.country)}
              onMouseLeave={() => setHoverCountry(null)}
              className={cn(
                "p-4 rounded-2xl border text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500",
                hoverCountry === o.country
                  ? "border-transparent bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                  : "border-neutral-200 dark:border-neutral-800"
              )}
            >
              <div className="flex items-start gap-3">
                <CountryFlagIcon country={o.country} />
                <div>
                  <div className="text-sm font-semibold">{o.country}</div>
                  <div className="text-xs text-neutral-500">{o.city}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketingLanding({
  title,
  primaryKeyword,
  secondaryKeywords = [],
  regionFocus,
  bridgeKeywords = [],
  onNav,
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950 p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">
          Regional influencer marketing
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold">{title}</h1>
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          WEARD Management delivers {primaryKeyword} with creator representation, influencer talent
          management, and brand-safe creator partnerships tailored to {regionFocus}. We build
          bridges between Asian and Western audiences through cross-border influencer marketing and
          performance-driven influencer campaigns.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Primary keyword</p>
            <p className="mt-2 text-sm font-semibold">{primaryKeyword}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Secondary focus</p>
            <ul className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
              {secondaryKeywords.map((keyword) => (
                <li key={keyword}>{keyword}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">Cross-border positioning</p>
          <ul className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            {bridgeKeywords.map((keyword) => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="font-semibold">End-to-end influencer management</p>
            <p className="mt-2">
              Campaign ideation to execution, paid social amplification, whitelisted content,
              and ROI-focused creator campaigns for global brand expansion.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="font-semibold">Always-on influencer strategy</p>
            <p className="mt-2">
              Localised creator strategy, multi-market activations, and performance reporting
              aligned with international influencer management goals.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SiteLink
            to="roster"
            onNav={onNav}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm"
          >
            Explore roster <ArrowRight size={14} />
          </SiteLink>
          <SiteLink
            to="brands"
            onNav={onNav}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm"
          >
            Brand partnerships <ArrowRight size={14} />
          </SiteLink>
          <button
            onClick={() => onNav?.("contact")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white ${GRADIENT}`}
          >
            Work with WEARD <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function BrandPartnerships({ onNav }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950 p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Brand partnerships</p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold">
          Brand-safe creator partnerships for global brand expansion
        </h1>
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
          WEARD Management delivers influencer talent management, creator representation, and
          performance-driven influencer marketing for brands looking to scale across Asia, APAC,
          Thailand, Hong Kong, the UK, and the US.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="font-semibold">Always-on influencer strategy</p>
            <p className="mt-2">
              Localised creator strategy, multi-market activations, and paid social amplification
              that deliver measurable ROI-focused creator campaigns.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="font-semibold">Campaign ideation to execution</p>
            <p className="mt-2">
              End-to-end influencer management with whitelisted content, reporting, and global
              influencer campaigns that connect Asian brands to UK and US creators.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SiteLink to="apac-influencer-marketing" onNav={onNav} className="underline text-sm">
            APAC influencer marketing
          </SiteLink>
          <SiteLink to="asia-to-uk-influencer-marketing" onNav={onNav} className="underline text-sm">
            UK influencer marketing
          </SiteLink>
          <SiteLink to="roster" onNav={onNav} className="underline text-sm">
            Explore creator roster
          </SiteLink>
          <button
            onClick={() => onNav?.("contact")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white ${GRADIENT}`}
          >
            Start a campaign <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ======= ROSTER =======
function Roster({ creators, onNav }) {
  const creatorsData = creators ?? [];

  // Category tabs
  const [tab, setTab] = useState("All");
  const tabs = useMemo(() => ["All", ...CATEGORIES.map((c) => c.label)], []);

  // Region filter tabs
  const [region, setRegion] = useState("All");
  const regions = ["All", "UK", "Asia", "USA"];

  const [search, setSearch] = useState("");

  // Filter creators
  const filtered = useMemo(() => {
    let data = creatorsData.filter((creator) => creator.rosterVisible !== false);

    // category filter
    if (tab !== "All") {
      const t = tab.toLowerCase();
      data = data.filter((c) => {
        const catMatch = c.category && c.category.toLowerCase() === t;
        const tags = Array.isArray(c.tags) ? c.tags : [];
        const tagMatch = tags.some((tag) => String(tag).toLowerCase() === t);
        return catMatch || tagMatch;
      });
    }

    // region filter
    if (region !== "All") {
      data = data.filter((c) => {
        const loc = c.location?.toLowerCase() || "";
        if (region === "UK") return loc.includes("uk") || loc.includes("united kingdom");
        if (region === "USA") return loc.includes("usa") || loc.includes("united states");
        if (region === "Asia")
          return (
            loc.includes("thailand") ||
            loc.includes("hong kong") ||
            loc.includes("china") ||
            loc.includes("asia")
          );
        return true;
      });
    }

    const query = search.trim().toLowerCase();
    const normalizedQuery = query.replace(/[^a-z0-9]/g, "");
    if (query) {
      data = data.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const normalizedName = name.replace(/[^a-z0-9]/g, "");
        const nameMatch =
          name.includes(query) || (normalizedQuery && normalizedName.includes(normalizedQuery));
        const handles = [
          getUsernameFromUrl(c.instagram),
          getUsernameFromUrl(c.tiktok),
          getUsernameFromUrl(c.youtube),
        ]
          .filter(Boolean)
          .map((handle) => handle.toLowerCase());
        const handleMatch =
          handles.some((handle) => handle.includes(query)) ||
          (normalizedQuery &&
            handles.some((handle) => handle.replace(/[^a-z0-9]/g, "").includes(normalizedQuery)));
        return nameMatch || handleMatch;
      });
    }

    data = data.sort((a, b) => {
      const totalA =
        (cleanNum(a.instagram_followers) || 0) +
        (cleanNum(a.tiktok_followers) || 0) +
        (cleanNum(a.youtube_subscribers) || 0) +
        (cleanNum(a.facebook_followers) || 0);
      const totalB =
        (cleanNum(b.instagram_followers) || 0) +
        (cleanNum(b.tiktok_followers) || 0) +
        (cleanNum(b.youtube_subscribers) || 0) +
        (cleanNum(b.facebook_followers) || 0);
      return totalB - totalA;
    });

    return data;
  }, [tab, region, creatorsData, search]);

  return (
    <section className="weard-section max-w-7xl mx-auto px-4 pt-10 pb-20">
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Talent</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">Roster</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-xl">
            A handpicked, global lineup built for high-performing creator campaigns.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Search
          </label>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search creators…"
            className={cn(INPUT_CLS, "mt-2")}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="
          sticky top-0 z-10
          -mx-4 px-4 py-3
          flex flex-wrap gap-2
          bg-white/90 dark:bg-neutral-950/90
          backdrop-blur supports-[backdrop-filter]:bg-white/70
          border-y border-neutral-200 dark:border-neutral-800
        "
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500",
              tab === t ? cn("text-white", GRADIENT, "border-transparent") : "border-neutral-300 dark:border-neutral-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Region tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "px-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500",
              region === r ? cn("text-white", GRADIENT, "border-transparent") : "border-neutral-300 dark:border-neutral-700"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Meet our featured talent.</p>

      <motion.div layout className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
  {filtered.map((p) => (
    <motion.div
      key={p.name}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <CreatorCard p={p} />
    </motion.div>
  ))}

        {/* Invite tile */}
        <div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-start justify-between bg-white/60 dark:bg-neutral-900/60 backdrop-blur">
          <div>
            <h3 className="text-lg font-semibold">Join the Roster</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              We’re always looking for exciting new talent to represent across Fashion, Beauty,
              Lifestyle, Sport, Travel and Family. If you’re building something special, let’s talk.
            </p>
          </div>
          <button
            onClick={() => window.weardNav?.("contact")}
            className="mt-6 inline-flex items-center gap-2 text-sm underline"
          >
            Submit your profile <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
      {filtered.length === 0 && (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          No creators match this search.
        </p>
      )}
      <CreatorDirectory creators={creatorsData} onNav={onNav} />
    </section>
  );
}

function CreatorDirectory({ creators = [], onNav }) {
  const directory = creators.map((creator) => {
    const handles = [
      getUsernameFromUrl(creator.instagram),
      getUsernameFromUrl(creator.tiktok),
      getUsernameFromUrl(creator.youtube),
    ]
      .filter(Boolean)
      .map((handle) => `@${handle}`)
      .join(" · ");
    return {
      name: creator.name,
      handles,
      location: creator.location,
      slug: slugify(creator.name || ""),
    };
  });

  return (
    <section className="sr-only" aria-label="Creator directory">
      <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Creator directory</p>
      <h3 className="mt-3 text-2xl font-semibold">
        Search WEARD, WEARDMGMT, and every creator name or handle
      </h3>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        Discover WEARD influencer management talent by full professional names and exact social usernames.
        This includes Emily Uddman (@emily.uddman), Zophia.zz (@zophia.zz), and every creator represented
        by WEARD across Asia, APAC, Thailand, Hong Kong, the UK, and the US.
      </p>
      <ul className="mt-3 grid gap-1 text-sm text-neutral-600 dark:text-neutral-400">
        <li>Sophia Price — sophiapriceyyy, XsophiapriceyX, xsophiapriceyx</li>
        <li>Emily Uddman — emily.uddman, Emily Janrawee Uddman</li>
        <li>Josefine Uddman — josefine.ku.ud, Josefine Kuanroethai Uddman, Bakhamnoi</li>
        <li>The Olive Tree Family — theolivetreefamily, TheOliveTreeFamily, W Ken | Lynsay | Chung Family</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-500">
        <SiteLink to="apac-influencer-marketing" onNav={onNav} className="underline">
          APAC influencer talent management
        </SiteLink>
        <SiteLink to="brands" onNav={onNav} className="underline">
          Brand partnerships
        </SiteLink>
        <SiteLink to="asia-to-uk-influencer-marketing" onNav={onNav} className="underline">
          UK influencer marketing
        </SiteLink>
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        {directory.map((entry) => (
          <li key={entry.slug} className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 p-3">
            <a
              href={`/creators/${entry.slug}`}
              onClick={(event) => {
                event.preventDefault();
                const creator = creators.find((item) => slugify(item.name) === entry.slug);
                window.weardOpenProfile?.(creator);
              }}
              className="font-semibold underline"
            >
              {entry.name}
            </a>
            {entry.handles && <div className="text-xs text-neutral-500">{entry.handles}</div>}
            {entry.location && (
              <div className="text-xs text-neutral-500">Location: {entry.location}</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SocialStat({ label, icon: Icon, url, value }) {
  const isLink = !!url;
  const Cmp = isLink ? "a" : "div";
  return (
    <Cmp
      href={isLink ? url : undefined}
      target={isLink ? "_blank" : undefined}
      rel={isLink ? "noopener noreferrer" : undefined}
      className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition block"
      aria-label={isLink ? `${label} — open profile` : label}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} aria-hidden="true" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </Cmp>
  );
}

function CreatorCard({ p }) {
  const avatar =
    p.profile_image ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(p.name)}&backgroundType=gradientLinear`;
  const hasVideo = Boolean(p.video);
  const videoRef = useRef(null);
  const [mediaRef, mediaInView] = useInView({ rootMargin: "180px" });
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [isTouchPlaying, setIsTouchPlaying] = useState(false);
  useEffect(() => {
    if (mediaInView && hasVideo) setShouldLoadVideo(true);
  }, [mediaInView, hasVideo]);
  const handleEnter = () => {
    if (!hasVideo) return;
    setShouldLoadVideo(true);
    setIsTouchPlaying(true);
    videoRef.current?.play();
  };
  const handleLeave = () => {
    setIsTouchPlaying(false);
    videoRef.current?.pause();
  };
  const ig = cleanNum(p.instagram_followers) ?? 0;
  const tt = cleanNum(p.tiktok_followers) ?? 0;
  const yts = cleanNum(p.youtube_subscribers) ?? 0;
  const total = (ig > 0 ? ig : 0) + (tt > 0 ? tt : 0) + (yts > 0 ? yts : 0);

  const defaultProfile = p.instagram || p.tiktok || p.youtube || undefined;
  const handle =
    getUsernameFromUrl(p.instagram) ||
    getUsernameFromUrl(p.tiktok) ||
    getUsernameFromUrl(p.youtube);
  // brand gradient
  const gradient = { backgroundImage: "linear-gradient(90deg,#4F46E5,#A855F7)" };

  // helpers so we don’t nest anchors inside the <a> cover link
  const open = (url) => url && window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white/90 dark:bg-neutral-950 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-indigo-300/60 transition will-change-transform">
      {/* Cover link */}
      <a
        ref={mediaRef}
        href={defaultProfile}
        target={defaultProfile ? "_blank" : undefined}
        rel={defaultProfile ? "noopener noreferrer" : undefined}
        aria-label={`Open ${p.name}'s profile`}
        className="relative block aspect-[3/5] bg-neutral-100 dark:bg-neutral-900"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onTouchStart={handleEnter}
        onTouchEnd={handleLeave}
      >
        {/* Base photo */}
        <img
          src={p.photo || avatar}
          alt={`${p.name} — WEARD Management creator`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Hover video */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={shouldLoadVideo ? p.video : undefined}
            muted
            playsInline
            loop
            preload="none"
            className={`absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ${
              isTouchPlaying ? "opacity-100" : "group-hover:opacity-100"
            }`}
          />
        )}

  {/* Gradients */}
  <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/45" />
  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />

  {/* Tags (top-left) */}
  {Array.isArray(p.tags) && p.tags.length > 0 && (
    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
      {p.tags.slice(0, 2).map((t) => (
        <span
          key={t}
          className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-full text-black/90"
          style={gradient}
        >
          {t}
        </span>
      ))}
    </div>
  )}

  {/* Location (top-right) */}
  {p.location && (
    <span className="absolute right-3 top-3 px-2 py-1 text-[11px] font-semibold rounded-full bg-white/85 dark:bg-black/60 backdrop-blur">
      {p.location}
    </span>
  )}

  {/* Name + handle (bottom-left) */}
  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
    <div className="rounded-xl px-3 py-2 sm:px-4 sm:py-3 bg-black/60 backdrop-blur">
      <div className="text-white font-extrabold leading-[1.05] text-2xl sm:text-3xl tracking-tight">
        {p.name}
      </div>
      {handle && <div className="text-white/90 text-xs sm:text-sm">@{handle}</div>}
    </div>
  </div>

  {/* Platform icons (bottom-right) */}
  <div className="absolute right-3 bottom-3 flex items-center gap-2">
  {p.instagram && (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); open(p.instagram); }}
      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 grid place-items-center shadow"
      aria-label="Open Instagram"
    >
      <Instagram size={16} />
    </button>
  )}
  {p.tiktok && (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); open(p.tiktok); }}
      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 grid place-items-center shadow"
      aria-label="Open TikTok"
    >
      <TikTokIcon />
    </button>
  )}
  {p.youtube && (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); open(p.youtube); }}
      className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 grid place-items-center shadow"
      aria-label="Open YouTube"
    >
      <Youtube size={16} />
    </button>
  )}
</div>
</a>


      {/* Meta panel */}
  <div className="p-4">
  <div className="flex items-start justify-between gap-3">
  <div /> {/* name now only appears on the media */}
  <a
    href={`/creators/${slugify(p.name)}`}
    onClick={(event) => {
      event.preventDefault();
      window.weardOpenProfile?.(p);
    }}
    className="text-sm font-semibold underline underline-offset-4 hover:opacity-80 text-indigo-600"
  >
    View Profile
  </a>
</div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
  {ig > 0 && (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5">
      <div className="text-xs text-neutral-500">Instagram</div>
      <div className="text-base font-semibold">
        <CountTo to={ig} format={shortFormat} />
      </div>
    </div>
  )}
  {tt > 0 && (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5">
      <div className="text-xs text-neutral-500">TikTok</div>
      <div className="text-base font-semibold">
        <CountTo to={tt} format={shortFormat} />
      </div>
    </div>
  )}
  {yts > 0 && (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5">
      <div className="text-xs text-neutral-500">YouTube</div>
      <div className="text-base font-semibold">
        <CountTo to={yts} format={shortFormat} />
      </div>
    </div>
  )}
</div>

        <div className="mt-2 text-xs text-neutral-500">
          Combined Following:{" "}
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
<CountTo to={total} format={(x) => x.toLocaleString()} />
          </span>
        </div>
      </div>
    </div>
  );
}
function HoverMedia({ photo, video, alt }) {
  const [playing, setPlaying] = useState(false);
  const vidRef = useRef(null);
  useEffect(() => {
    if (!vidRef.current) return;
    try {
      if (playing) {
        vidRef.current.currentTime = 0;
        const p = vidRef.current.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        vidRef.current.pause();
      }
    } catch {}
  }, [playing]);
  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPlaying(true)}
      onMouseLeave={() => setPlaying(false)}
      onTouchStart={() => setPlaying((v) => !v)}
    >
      <img
        src={photo}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          playing ? "opacity-0" : "opacity-100"
        )}
        loading="lazy"
        decoding="async"
      />
      <video
        ref={vidRef}
        src={video}
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          playing ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

// ======= LOGO CAROUSEL =======
const LOGO_LANES = [
  { id: "orbit-a", speedSec: 36, direction: "normal", offset: 0 },
];

function LogoCarousel({ rowHeight = 56 }) {
  const [carouselRef, carouselInView] = useInView({ rootMargin: "200px" });
  return (
    <div
      ref={carouselRef}
      className={cn(
        "weard-logo-carousel",
        !carouselInView && "weard-logo-carousel--paused"
      )}
      style={{ "--logo-row-height": `${rowHeight}px` }}
    >
      <div className="weard-logo-carousel__edges" aria-hidden="true">
        <div className="weard-logo-carousel__edge weard-logo-carousel__edge--left" />
        <div className="weard-logo-carousel__edge weard-logo-carousel__edge--right" />
      </div>
      <div className="weard-logo-carousel__lanes">
        {LOGO_LANES.map((lane, laneIndex) => {
          const start = lane.offset % BRAND_LOGOS.length;
          const ordered = [
            ...BRAND_LOGOS.slice(start),
            ...BRAND_LOGOS.slice(0, start),
          ];
          const rows = [...ordered, ...ordered];
          return (
            <div className="weard-logo-carousel__lane" key={lane.id}>
              <div
                className="weard-logo-carousel__track"
                style={{
                  "--duration": `${lane.speedSec}s`,
                  animationDirection: lane.direction,
                }}
              >
                {rows.map((logo, index) => (
                  <div
                    key={`${logo.src}-${laneIndex}-${index}`}
                    className="weard-logo-carousel__card"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      decoding="async"
                      className="weard-logo-carousel__logo"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy • WEARD Management";
    return () => { document.title = "WEARD Management"; };
  }, []);

  const updated = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <section className="max-w-3xl mx-auto px-4 pt-10 pb-20">
      <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-1 text-sm text-neutral-500">Last updated: {updated}</p>

      <p className="mt-6 text-neutral-700 dark:text-neutral-300">
        WEARD Management (“WEARD”, “we”, “our”, “us”) is committed to protecting your personal information and respecting your privacy.
        This Privacy Policy explains what information we collect, how we use it, and your rights under data protection law, including the UK GDPR.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Information We Collect</h2>
      <ul className="mt-3 list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
        <li>Your name, email address, and contact details if you contact us or work with us.</li>
        <li>Basic business information when entering into contracts or collaborations.</li>
        <li>Limited analytics data when you visit our website (e.g. cookies, browser type, pages visited).</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">How We Use Your Information</h2>
      <ul className="mt-3 list-disc pl-6 space-y-2 text-neutral-700 dark:text-neutral-300">
        <li>Respond to enquiries and manage communications.</li>
        <li>Carry out and manage collaborations, campaigns, or contracts.</li>
        <li>Maintain business records as legally required.</li>
        <li>Improve our website and services.</li>
      </ul>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        We do not sell or share your personal data with third parties for marketing purposes.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Data Retention</h2>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        We only retain your information for as long as is necessary for the purposes above, or as required by law.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Your Rights</h2>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        Under the UK GDPR, you have the right to access, correct, delete, or object to the processing of your personal data,
        and to request data portability.
      </p>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        To exercise your rights, please contact us at{" "}
        <a className="underline" href="mailto:info@weardmgmt.com">info@weardmgmt.com</a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Cookies</h2>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        Our website may use cookies or similar technologies for analytics and functionality. You can disable cookies in your browser settings if you prefer.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact Us</h2>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        If you have questions about this Privacy Policy or how we handle your data, contact{" "}
        <a className="underline" href="mailto:info@weardmgmt.com">info@weardmgmt.com</a>.
      </p>
    </section>
  );
  }
// ======= CONTACT =======
function Contact() {
  const [mode, setMode] = useState("brand");
  const [isSendingBrand, setIsSendingBrand] = useState(false);
  const [isSendingTalent, setIsSendingTalent] = useState(false);
  const [brandNotice, setBrandNotice] = useState("");
  const [talentNotice, setTalentNotice] = useState("");
  const [form, setForm] = useState({
    brand: "",
    role: "",
    email: "",
    number: "",
    budget: "",
    timeline: "",
    outline: "",
  });
  const [talent, setTalent] = useState({
    name: "",
    email: "",
    number: "",
    ig: "",
    tt: "",
    other: "",
    category: "",
    location: "",
    availability: "",
    notes: "",
  });

  function sendMailto(subject, body, fallbackMessage) {
    try {
      window.location.href = `mailto:info@weardmgmt.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    } catch {
      navigator.clipboard?.writeText(`${subject}\n\n${body}`);
      alert(fallbackMessage);
    }
  }

  async function sendEmail(templateId, templateParams) {
    const response = await fetch(EMAILJS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
    });

    if (!response.ok) {
      throw new Error("Email send failed");
    }
  }

  async function handleBrandSubmit(e) {
    e.preventDefault();
    if (!form.brand || !form.email || !form.outline) {
      alert("Please fill required fields.");
      return;
    }
    setBrandNotice("");
    const subject = `WEARD Brief – ${form.brand}`;
    const body =
      `Brand: ${form.brand}\n` +
      `Role: ${form.role}\n` +
      `Email: ${form.email}\n` +
      `Number: ${form.number}\n` +
      `Budget: ${form.budget}\n\n` +
      `Timeline: ${form.timeline}\n\n` +
      `Outline:\n${form.outline}`;

    try {
      if (EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && EMAILJS_BRAND_TEMPLATE_ID) {
        setIsSendingBrand(true);
        await sendEmail(EMAILJS_BRAND_TEMPLATE_ID, {
          subject,
          brand: form.brand,
          role: form.role,
          email: form.email,
          number: form.number,
          budget: form.budget,
          timeline: form.timeline,
          outline: form.outline,
          message: body,
        });
        setBrandNotice("Submission completed.");
      } else {
        sendMailto(
          subject,
          body,
          "We’ve copied your brief to the clipboard. Please paste it into an email to info@weardmgmt.com."
        );
        setBrandNotice(
          "Submission completed. Please send the email that opened to reach info@weardmgmt.com."
        );
      }
    } catch {
      sendMailto(
        subject,
        body,
        "We’ve copied your brief to the clipboard. Please paste it into an email to info@weardmgmt.com."
      );
      setBrandNotice(
        "Submission completed. We couldn’t auto-send, so we opened your email client."
      );
    } finally {
      setIsSendingBrand(false);
    }
  }

  async function handleTalentSubmit(e) {
    e.preventDefault();
    if (!talent.name || !talent.email) {
      alert("Please fill your name and email.");
      return;
    }
    setTalentNotice("");
    const subject = `Join the Roster – ${talent.name}`;
    const body =
      `Name: ${talent.name}\n` +
      `Email: ${talent.email}\n` +
      `Number: ${talent.number}\n` +
      `Instagram: ${talent.ig}\n` +
      `TikTok: ${talent.tt}\n` +
      `Other: ${talent.other}\n` +
      `Category: ${talent.category}\n\n` +
      `Location: ${talent.location}\n` +
      `Availability: ${talent.availability}\n\n` +
      `Notes:\n${talent.notes}`;

    try {
      if (EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY && EMAILJS_TALENT_TEMPLATE_ID) {
        setIsSendingTalent(true);
        await sendEmail(EMAILJS_TALENT_TEMPLATE_ID, {
          subject,
          name: talent.name,
          email: talent.email,
          number: talent.number,
          instagram: talent.ig,
          tiktok: talent.tt,
          other: talent.other,
          category: talent.category,
          location: talent.location,
          availability: talent.availability,
          notes: talent.notes,
          message: body,
        });
        setTalentNotice("Submission completed.");
      } else {
        sendMailto(
          subject,
          body,
          "We’ve copied your message to the clipboard. Please paste it into an email to info@weardmgmt.com."
        );
        setTalentNotice(
          "Submission completed. Please send the email that opened to reach info@weardmgmt.com."
        );
      }
    } catch {
      sendMailto(
        subject,
        body,
        "We’ve copied your message to the clipboard. Please paste it into an email to info@weardmgmt.com."
      );
      setTalentNotice(
        "Submission completed. We couldn’t auto-send, so we opened your email client."
      );
    } finally {
      setIsSendingTalent(false);
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20" id="contact">
      <div className="rounded-2xl overflow-hidden border border-black/10 shadow-sm">
        {/* Header + mode switch */}
        <div className="bg-neutral-900 text-white px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Contact</h2>
            <p className="mt-1 text-sm text-white/80">
              Quick brief for brands, or join the roster as talent.
            </p>
          </div>

          <div
            className="inline-flex rounded-full border border-white/20 p-1"
            role="tablist"
            aria-label="Contact mode"
          >
            <button
              onClick={() => setMode("brand")}
              className={`px-3 py-1.5 rounded-full text-sm ${
                mode === "brand"
                  ? "bg-white text-neutral-900"
                  : "text-white/80"
              }`}
              role="tab"
              aria-selected={mode === "brand"}
            >
              Brand / Agency
            </button>
            <button
              onClick={() => setMode("talent")}
              className={`px-3 py-1.5 rounded-full text-sm ${
                mode === "talent"
                  ? "bg-white text-neutral-900"
                  : "text-white/80"
              }`}
              role="tab"
              aria-selected={mode === "talent"}
            >
              Talent
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-neutral-950 px-6 py-6">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            {mode === "brand" ? (
              <form className="grid gap-4 max-w-2xl" onSubmit={handleBrandSubmit}>
              <label className="grid gap-1">
                <span className="text-sm font-medium">
                  Company / Brand <span className="text-red-500">*</span>
                </span>
                <input
                  required
                  placeholder="e.g., Weard Mgmt"
                  className={INPUT_CLS}
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  autoComplete="organization"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Your Role</span>
                  <input
                    placeholder="e.g., Brand Manager"
                    className={INPUT_CLS}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    autoComplete="organization-title"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Your Email <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    className={INPUT_CLS}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Your Number (optional)
                  </span>
                  <input
                    placeholder="+44 …"
                    className={INPUT_CLS}
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    inputMode="tel"
                    pattern="^[0-9+()\-.\s]{6,}$"
                    title="Please enter a valid phone number"
                    autoComplete="tel"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Budget Range (optional)
                  </span>
                  <select
                    className={INPUT_CLS}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="Under £5k">Under £5k</option>
                    <option value="£5k–£10k">£5k–£10k</option>
                    <option value="£10k–£25k">£10k–£25k</option>
                    <option value="£25k–£50k">£25k–£50k</option>
                    <option value="£50k+">£50k+</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Timeline (optional)</span>
                <input
                  placeholder="e.g., Launching in Q3"
                  className={INPUT_CLS}
                  value={form.timeline}
                  onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">
                  Campaign outline <span className="text-red-500">*</span>
                </span>
                <textarea
                  required
                  placeholder="Campaign goal, deliverables, timing…"
                  className={`${INPUT_CLS} min-h-36`}
                  value={form.outline}
                  onChange={(e) => setForm({ ...form, outline: e.target.value })}
                  maxLength={2000}
                  aria-describedby="brand-outline-count"
                />
                <span
                  id="brand-outline-count"
                  className="text-xs text-neutral-400 self-end"
                >
                  {form.outline.length}/2000
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  className={`${BTN_PRIMARY_CLS} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={isSendingBrand}
                >
                  {isSendingBrand ? "Sending..." : "Send Brief"}
                </button>
                <a href="mailto:info@weardmgmt.com" className="text-sm underline">
                  Email instead
                </a>
              </div>
              {brandNotice ? (
                <p className="text-sm text-neutral-500">{brandNotice}</p>
              ) : null}

              </form>
            ) : (
              <form className="grid gap-4 max-w-2xl" onSubmit={handleTalentSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    placeholder="e.g., Sophia Price"
                    className={INPUT_CLS}
                    value={talent.name}
                    onChange={(e) => setTalent({ ...talent, name: e.target.value })}
                    autoComplete="name"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Your Email <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="you@email.com"
                    className={INPUT_CLS}
                    value={talent.email}
                    onChange={(e) => setTalent({ ...talent, email: e.target.value })}
                    autoComplete="email"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Instagram URL</span>
                  <input
                    placeholder="https://instagram.com/username"
                    className={INPUT_CLS}
                    value={talent.ig}
                    onChange={(e) => setTalent({ ...talent, ig: e.target.value })}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">TikTok URL</span>
                  <input
                    placeholder="https://tiktok.com/@username"
                    className={INPUT_CLS}
                    value={talent.tt}
                    onChange={(e) => setTalent({ ...talent, tt: e.target.value })}
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Other (site/portfolio)</span>
                <input
                  placeholder="Link to portfolio, YouTube, etc."
                  className={INPUT_CLS}
                  value={talent.other}
                  onChange={(e) => setTalent({ ...talent, other: e.target.value })}
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Category</span>
                  <select
                    className={INPUT_CLS}
                    value={talent.category}
                    onChange={(e) =>
                      setTalent({ ...talent, category: e.target.value })
                    }
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.key}>{c.label}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Your Number (optional)</span>
                  <input
                    placeholder="+44 …"
                    className={INPUT_CLS}
                    value={talent.number}
                    onChange={(e) => setTalent({ ...talent, number: e.target.value })}
                    inputMode="tel"
                    pattern="^[0-9+()\-.\s]{6,}$"
                    title="Please enter a valid phone number"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Location</span>
                  <input
                    placeholder="e.g., London, UK"
                    className={INPUT_CLS}
                    value={talent.location}
                    onChange={(e) => setTalent({ ...talent, location: e.target.value })}
                    autoComplete="address-level1"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Availability</span>
                  <input
                    placeholder="e.g., Full-time, Weekends"
                    className={INPUT_CLS}
                    value={talent.availability}
                    onChange={(e) => setTalent({ ...talent, availability: e.target.value })}
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Notes</span>
                <textarea
                  placeholder="Niche, availability, recent work…"
                  className={`${INPUT_CLS} min-h-36`}
                  value={talent.notes}
                  onChange={(e) => setTalent({ ...talent, notes: e.target.value })}
                  maxLength={1500}
                  aria-describedby="talent-notes-count"
                />
                <span
                  id="talent-notes-count"
                  className="text-xs text-neutral-400 self-end"
                >
                  {talent.notes.length}/1500
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  className={`${BTN_PRIMARY_CLS} disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={isSendingTalent}
                >
                  {isSendingTalent ? "Sending..." : "Submit"}
                </button>
                <a href="mailto:info@weardmgmt.com" className="text-sm underline">
                  Email instead
                </a>
              </div>
              {talentNotice ? (
                <p className="text-sm text-neutral-500">{talentNotice}</p>
              ) : null}
              </form>
            )}

            <aside className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                  Prefer email?
                </h3>
                <p className="mt-2">
                  Send us a note at{" "}
                  <a className="underline" href="mailto:info@weardmgmt.com">
                    info@weardmgmt.com
                  </a>
                  .
                </p>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  We only use your details to respond to your enquiry.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
function Footer({ onNav }) {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-6 items-start">
        <div>
          <div className={cn("inline-block font-black tracking-widest", TEXT_GRAD)}>WEARD</div>
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Management</div>
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center md:text-left">
          <div>© {new Date().getFullYear()} WEARD Management. All rights reserved.</div>
          <div className="mt-1">Built for speed, ethics, and results.</div>
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-400">Markets</div>
          <div className="mt-2 grid gap-1">
            <SiteLink to="asia-to-uk-influencer-marketing" onNav={onNav} className="underline">
              UK influencer marketing
            </SiteLink>
            <SiteLink to="apac-influencer-marketing" onNav={onNav} className="underline">
              APAC influencer marketing
            </SiteLink>
          </div>
        </div>
        <div className="flex gap-4 text-sm justify-start md:justify-end">
          <button onClick={() => onNav("contact")} className="underline">
            Contact
          </button>
          <button onClick={() => onNav("brands")} className="underline">
            Brands
          </button>
           <button onClick={() => onNav("privacy")} className="underline">
           Privacy
           </button> {/* NEW */}
        </div>
      </div>
    </footer>
  );
}
