import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Mail, ExternalLink, ArrowRight, Globe, Menu, X, Sparkles, Youtube } from "lucide-react";
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

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

/**
 * WEARD Management - Vite + React + Tailwind
 * Final consolidated version with:
 * - Title-case hero copy
 * - Disruptive "Who We Are" copy
 * - Global nav helper (window.weardNav)
 * - Roster "Submit profile" + About "Join the roster" -> Contact page
 * - Real world map with geographic hover glow (react-simple-maps)
 * - Clickable social stat tiles + image header links to default profile
 * - Followers set for Sophia & Amelie, animated count-up + totals
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
// ======= CONFIG =======
const SHEET_URL =
  import.meta.env.VITE_SHEET_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSe2hqUTFYnlYQVFXLmR0G2bI_APH9kkJqL7XJIvFIloG7QEjBAJqXkxGrUBYrvoaTg7jS-ucCQ1Uzj/pub?output=csv";
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Accurate country flags
const FLAG_SRC = {
  "United Kingdom": "https://flagcdn.com/gb.svg",
  "United States": "https://flagcdn.com/us.svg",
  "Hong Kong": "https://flagcdn.com/hk.svg",
  Thailand: "https://flagcdn.com/th.svg",
};

// Accent utilities
const GRADIENT = "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600";
const TEXT_GRAD = "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent";
const INPUT_CLS =
  "w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const BTN_PRIMARY_CLS = `${GRADIENT} inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

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
      Peacocks: {
      hero: "/media/creators/peacocks/peacocks-hero.jpg",   // main profile image
      poster: "/media/creators/peacocks/peacocks-poster.jpg", // still frame before hover
      video: "/media/creators/peacocks/peacocks-hover.mp4",  // hover video
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
  },
};

const WEARE_WORDS = ["DIFFERENT", "DISRUPTIVE", "DYNAMIC", "DISTINCT", "DRIVEN", "DECISIVE", "DEFIANT"];

const STARTER_CREATORS = [
  {
     name: "Sophia Price",
  category: "Fashion",
  instagram: "https://www.instagram.com/xsophiapriceyx",
  tiktok: "https://www.tiktok.com/@sophiapriceyyy",
  youtube: "https://www.youtube.com/channel/UCKDFGIM9V-KRGxlISDODpPQ", 
  email: "sophia@weardmgmt.com",
location: "Thailand",
  instagram_followers: 720000,
  tiktok_followers: 613800,
  youtube_subscribers: 8310,                       
  profile_image: MEDIA.creators.Sophia.hero,   // static profile image
  photo: MEDIA.creators.Sophia.poster,         // still frame before hover
  tags: ["Fashion", "Beauty", "Travel"],
  video: MEDIA.creators.Sophia.video,
  bio: "Sophia Pricey is a Thai–British fashion, beauty and travel content creator known for her trend-setting style and high-engagement global audience. She shares fashion hauls, beauty tutorials and aspirational travel content across Instagram and TikTok, reaching over 1.3 million followers. With a photographer’s eye and a playful yet polished aesthetic, Sophia delivers visually striking campaigns for brands seeking authentic, cross-cultural influence.",
  top_audience: ["United States", "Thailand"],   // 👈 add this line

  },
{
  name: "Amelie Wyg",
  category: "Fashion",
  instagram: "https://www.instagram.com/ameliewyg",
  tiktok: "https://www.tiktok.com/@ameliewyg",
  email: "amy@weardmgmt.com",
  location: "Thailand",
  instagram_followers: 348000,
  tiktok_followers: 252300,
  profile_image: MEDIA.creators.Amy.hero,
  photo: MEDIA.creators.Amy.poster,
  tags: ["Fashion", "Beauty", "Lifestyle"],
  video: MEDIA.creators.Amy.video,
  bio: "Amy Wyg is a Thai–German fashion, beauty and lifestyle content creator whose work radiates confidence, creativity and cultural flair. Blending European and Asian influences with a sharp eye for style, she delivers trend-led fashion edits, skincare tips and aspirational lifestyle moments to an engaged global audience across Instagram and TikTok.",
  top_audience: ["United States", "Thailand"],    

},
   {name: "The Peacocks",
  category: "Family",
  instagram: "https://www.instagram.com/itsthepeacocks",
  tiktok: "https://www.tiktok.com/@itsthepeacocks",
  youtube: "https://www.youtube.com/@itsthepeacocks", 
  email: "itsthepeacocks@weardmgmt.com",
  location: "UK",
  instagram_followers: 133000,
  tiktok_followers: 68200,
  youtube_subscribers: 1730,                       
  profile_image: MEDIA.creators.Peacocks.hero,   // static profile image
  photo: MEDIA.creators.Peacocks.poster,         // still frame before hover
  tags: ["Family", "Lifestyle", "Travel"],
  video: MEDIA.creators.Peacocks.video,
  bio: "Daniel and Ellen, known online as The Peacocks, are a Northern Irish–Hong Kong family duo creating warm, culture-rich content from their home in Northern Ireland. Celebrating family life, food and Cantonese heritage, they share authentic recipes, classic songs and relatable parenting moments across Instagram and TikTok. Their mix of heritage storytelling, home cooking and everyday life resonates with audiences worldwide, making them a go-to for brands seeking cross-cultural, family-friendly influence.",
  top_audience: ["United Kingdom", "United States", "China"], // 👈 add this line

   },
     {name: "Josefine Uddman",
  category: "Beauty",
  instagram: "https://www.instagram.com/josefine.ku.ud/",
  tiktok: "https://www.tiktok.com/@josefineuddman",
  email: "josefine@weardmgmt.com",
  location: "Thailand",
  instagram_followers: 8610,
  tiktok_followers: 81500,
  profile_image: MEDIA.creators.Josefine.hero, // static profile image
  photo: MEDIA.creators.Josefine.poster,          // still frame before hover
  tags: ["Beauty", "Lifestyle"],
  video: MEDIA.creators.Josefine.video,  
  bio: "Josefine Uddman is a Swedish–Thai fashion, beauty and lifestyle content creator known for blending Scandinavian elegance with playful Asian influence. Drawing on her dual heritage, she shares trend-led outfits, skincare tips and authentic lifestyle insights across Instagram and TikTok, captivating a growing global audience and delivering culturally resonant campaigns for brands.",
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
  instagram_followers: 50300,
  tiktok_followers: 58600,
  youtube_subscribers: 5220,                       
 profile_image: MEDIA.creators.OliveTreeFamily.hero,
photo: MEDIA.creators.OliveTreeFamily.poster,
video: MEDIA.creators.OliveTreeFamily.video,
  tags: ["Family", "Lifestyle", "Travel"],
  bio: "The Olive Tree Family is a lively and engaging Scottish household turning everyday life into authentic stories. From delicious family food content and immersive experiences to travel adventures and comforting at-home moments, they create warm, relatable posts that resonate with families across the UK and beyond. Their thriving TikTok and Instagram community looks to them for genuine, family-friendly inspiration and everyday lifestyle ideas.",
  top_audience: ["United Kingdom"],
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


function getUsernameFromUrl(url) {
  if (!url) return null;
  try {
    // Handles full URLs like https://www.instagram.com/username/ and TikTok variations
    const u = new URL(url);
    let path = u.pathname || "";
    path = path.replace(/\/+$/,""); // strip trailing slash
    const parts = path.split("/").filter(Boolean);
    if (parts.length) return parts[0].toLowerCase();
    return null;
  } catch {
    // Handles plain strings that may not be valid URLs
    const m = String(url).match(/(?:instagram\.com|tiktok\.com)\/(?:@)?([A-Za-z0-9_.]+)/i);
    return m ? m[1].toLowerCase() : null;
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
          .map((r) => ({
            name: r.name,
            category: r.category || "Lifestyle",
            instagram: r.instagram || "",
            tiktok: r.tiktok || "",
            email: r.email || "",
            location: r.location || "",
            instagram_followers: cleanNum(r.instagram_followers),
            tiktok_followers: cleanNum(r.tiktok_followers),
            profile_image: r.profile_image || MEDIA.creators.Sophia.photo,
            tags: (r.tags || "").split("|").filter(Boolean),
            photo: r.photo || MEDIA.creators.Sophia.photo,
            video: r.video || MEDIA.creators.Sophia.video,
            bio: r.bio || "",
          }));

        // Fallbacks for Sophia & Amelie if sheet doesn’t supply numbers
        mapped = mapped.map((c) => {
          const name = c.name?.toLowerCase() || "";
          if (name.includes("sophia")) {
            c.instagram_followers ??= 721000;
            c.tiktok_followers ??= 552900;
          }
          if (name.includes("amelie") || name.includes("amy")) {
            c.instagram_followers ??= 350000;
            c.tiktok_followers ??= 240000;
          }
          return c;
        });

        if (!canceled && mapped.length) setCreators(mapped);
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
  const [activePage, setActivePage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const navigate = (k) => {
    setActivePage(k);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // expose simple global nav + openProfile
useEffect(() => {
  window.weardNav = (k) => navigate(k);
  window.weardOpenProfile = (creator) => {
    setSelectedCreator(creator);
    navigate("profile");
  };
  return () => {
    delete window.weardNav;
    delete window.weardOpenProfile;
  };
}, []);

  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "WEARD Management",
      "url": "https://weardmgmt.com",
      "logo": "https://weardmgmt.com/logo.png",
      "sameAs": [
        "https://www.instagram.com/weardmgmt",
        "https://www.tiktok.com/@weardmgmt"
      ],
      "email": "info@weardmgmt.com"
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.text = JSON.stringify(data);
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <Header onNav={navigate} active={activePage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main>
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
              <Roster />
            </motion.section>
          )}
          {activePage === "brands" && (
            <motion.section key="brands" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Brands />
            </motion.section>
          )}
          {activePage === "contact" && (
            <motion.section key="contact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Contact />
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
          
        </AnimatePresence>
      </main>

      <Footer onNav={navigate} />
    </div>
  );
}

function Header({ onNav, active, menuOpen, setMenuOpen }) {
  const nav = [
    { k: "home", label: "Home" },
    { k: "about", label: "About Us" },
    { k: "roster", label: "Roster" },
    { k: "brands", label: "Brands" },
    { k: "contact", label: "Contact" },
  ];
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
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <button
            aria-label="Open menu"
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
    document.title = creator?.name
      ? `${creator.name} • WEARD Management`
      : "Profile • WEARD Management";
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

  // Destructure fields from creator
  const {
    name,
    tags = [],
    photo,
    video,
    instagram,
    tiktok,
    email,
    location,
    bio,
    instagram_followers,
    tiktok_followers,
    top_audience = [],
  } = creator;

  const ig = cleanNum(instagram_followers) ?? 0;
  const tt = cleanNum(tiktok_followers) ?? 0;
  const total = ig + tt;

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
        <div className="rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 relative">
          <div className="relative aspect-[4/5] sm:aspect-[3/4]">
            <img
              src={photo || creator.profile_image}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {video && (
              <video
                src={video}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover opacity-0 hover:opacity-100 transition-opacity duration-300"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => e.currentTarget.pause()}
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
                  rel="noreferrer"
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
                  rel="noreferrer"
                  aria-label="Open Instagram"
                  title="Instagram"
                >
                  <Instagram size={16} />
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
        <div className="mt-8 grid grid-cols-2 gap-3">
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
    <div className="text-2xl font-extrabold">
      <CountTo to={tt} format={shortFormat} />
    </div>
    <div className="text-xs text-neutral-500 mt-1">TikTok Followers</div>
  </div>
  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
    <div className="text-2xl font-extrabold">
      <CountTo to={ig} format={shortFormat} />
    </div>
    <div className="text-xs text-neutral-500 mt-1">Instagram Followers</div>
  </div>
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
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700"
              >
                View Instagram <ExternalLink size={14} />
              </a>
            )}
            {tiktok && (
              <a
                href={tiktok}
                target="_blank"
                rel="noreferrer"
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

// ======= HOME =======
function Home({ onExploreRoster, onWorkWithUs }) {
  const slides = [
    { title: "WEARD", subtitle: "Because Normal Doesn’t Trend.", image: MEDIA.creators.Sophia.photo },
    { title: "WEARD", subtitle: "Influences Differently.", image: MEDIA.creators.Amy.photo },
  ];
  return (
    <section className="relative overflow-hidden">
      <HeroSlider slides={slides} />
     <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
    WE ARE <RotatingWords words={WEARE_WORDS} />
  </h1>
  <p className="mt-5 text-base sm:text-lg text-neutral-700 dark:text-neutral-200 max-w-prose">
    Global Influence. Global Campaigns. Global Talent.<br />
    We Champion Our Creators And Amplify Their Voices.
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
    </section>
  );
}

function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const t = useRef(null);
  useEffect(() => {
    t.current = setInterval(() => setI((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(t.current);
  }, [slides.length]);
  // ⭐ NEW prefetch effect
useEffect(() => {
  const next = (i + 1) % slides.length;
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "image";
  link.href = slides[next].image;
  document.head.appendChild(link);
  return () => {
    if (link.parentNode) link.parentNode.removeChild(link);
  };
  }, [i, slides]);
  return (
    <div className="relative">
      <div className="h-[50vh] sm:h-[58vh] md:h-[65vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="h-full w-full relative"
          >
            <div className="absolute inset-0">
             <img
  src={slides[i].image}
  alt={slides[i].title}
  width="1920"
  height="1080"
fetchPriority={i === 0 ? "high" : "auto"}
  loading={i === 0 ? "eager" : "lazy"}        // ⭐ First image eager, others lazy
  decoding="async"
  className="absolute inset-0 h-full w-full object-cover bg-neutral-900"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-end pb-10">
              <div className="text-white drop-shadow">
                <h2 className="text-3xl sm:text-4xl font-bold">{slides[i].title}</h2>
                <p className="mt-2 text-sm sm:text-base opacity-90">{slides[i].subtitle}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
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
  const highlights = [
    { title: "Global reach", body: "Social is global and so is WEARD. We connect creators and brands across cultures, borders, and audiences to deliver influence without limits." },
    { title: "Creator first", body: "We champion growth, longevity, and authentic brand alignment... turning influence into sustainable, long-term careers." },
    { title: "Creative Campaigns", body: "From bold concepts to fresh ideas, we craft campaigns that not only stand out but also leave a lasting impact." },
  ];
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
         <h2 className="text-4xl font-bold">What Is WEARD?</h2>
<p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-2xl">
WEARD is here to redefine the global creator economy. We aspire to represent a diverse roster of creators from every culture and corner of the world, connecting them with brands that share their vision, values, and audiences, and amplifying their stories on a global stage.</p>
<p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-2xl">
We’re building more than deals. Our goal is to offer creators a 360° management approach that focuses on long-term strategies, authentic brand alignment, and stand-out content that drives meaningful impact.</p>
<p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-2xl">
Our philosophy is simple: Global Creators. Global Reach. Global Impact. By blending cultural insight with commercial strategy, WEARD aims to help talent not only thrive in a fast-changing digital world but also shape it, while safeguarding their voice, values, and rights. From the first spark of an idea to the final delivery, our mission is to be a partner at every step, championing creators, celebrating diversity, and delivering campaigns that leave a lasting cultural mark.</p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-purple-500/0 hover:from-blue-500/5 hover:to-purple-500/5 transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className={TEXT_GRAD} aria-hidden="true" />
                  <h3 className="font-semibold text-base">{h.title}</h3>
                </div>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{h.body}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.weardNav?.("contact")}
            className={`mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full text-white ${GRADIENT}`}
          >
            Join the roster. <ArrowRight size={16} />
          </button>
        </div>
        <div className="rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
          <video
  src="/media/about/Animated_Logo_Announcement_WEARD.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
/>
        </div>
      </div>
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
    { country: "United States", city: "Los Angeles / NYC", coords: [-118.2437, 34.0522] },
    { country: "Hong Kong", city: "Hong Kong", coords: [114.1694, 22.3193] },
    { country: "Thailand", city: "Bangkok / Phuket", coords: [100.5018, 13.7563] },
  ];
  const [hoverCountry, setHoverCountry] = useState(null);
const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.4 });

  return (
    <div className="mt-12">
      <h3 className="text-[22px] sm:text-2xl font-semibold">Our Growing Reach</h3>
<p className="mt-1 text-xs text-neutral-500">United Kingdom · United States · Hong Kong · Thailand</p>
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Map */}
<div className="lg:col-span-2 p-2 sm:p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shadow-inner">
  <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] rounded-2xl overflow-hidden">
    <ComposableMap 
  projectionConfig={{ scale: 200 }} // higher = more zoomed in at start
  className="w-full h-full" 
  style={{ width: "100%", height: "100%" }}
>
  <ZoomableGroup 
    center={position.coordinates}
  zoom={position.zoom}
  minZoom={1}
  maxZoom={3}
  translateExtent={[[-1000, -500], [1000, 500]]}
  >
    <Geographies geography={GEO_URL}>
      {({ geographies }) =>
        geographies.map((geo) => {
          const nm = geo.properties.name;
          const active = hoverCountry && nm.toLowerCase().includes(hoverCountry.toLowerCase());
          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              onMouseEnter={() => setHoverCountry(nm)}
              onMouseLeave={() => setHoverCountry(null)}
              style={{
  default: {
    fill: active ? "#E8E9FF" : "#F3F4F6",
    stroke: "#D1D5DB",
    strokeWidth: 0.6,
    outline: "none",
  },
  hover: {
    fill: "#E0E7FF",
    cursor: "pointer",
  },
  pressed: { fill: "#C7D2FE" },
              }}
            />
          );
        })
      }
    </Geographies>

        {offices.map((o) => (
          <Marker key={o.country} coordinates={o.coords}
              onClick={() => setPosition({ coordinates: o.coords, zoom: 2 })} // 👈 zoom + center
>
            <g>
              <circle r={9} fill="rgba(99,102,241,0.22)">
                <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r={3.2} fill="rgba(99,102,241,1)" />
              {/* Label chip */}
              <g transform="translate(10,-12)">
                <rect rx="6" ry="6" width="110" height="18" fill="rgba(17,24,39,0.75)"></rect>
                <text x="8" y="12" fontSize="10" fill="#fff">{o.city}</text>
              </g>
            </g>
          </Marker>
        ))}
      </ZoomableGroup>
    </ComposableMap>
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

// ======= ROSTER =======
function Roster() {
  const creators = useRosterHydration();

  // Category tabs
  const [tab, setTab] = useState("All");
  const tabs = useMemo(() => ["All", ...CATEGORIES.map((c) => c.label)], []);

  // Region filter tabs
  const [region, setRegion] = useState("All");
  const regions = ["All", "UK", "Asia", "USA"];

  // Filter creators
  const filtered = useMemo(() => {
    let data = creators;

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

    return data;
  }, [tab, region, creators]);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold">Roster</h2>
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

      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Meet Our Talent</p>

      <motion.div layout className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
  {filtered.map((p) => (
    <motion.div
      key={p.name}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="scale-[0.95]"   // smaller card
    >
      <CreatorCard p={p} />
    </motion.div>
  ))}

        {/* Invite tile */}
        <div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-start justify-between">
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
      rel={isLink ? "noreferrer" : undefined}
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
const ig = cleanNum(p.instagram_followers) ?? 0;
const tt = cleanNum(p.tiktok_followers) ?? 0;
const yts = cleanNum(p.youtube_subscribers) ?? 0;   // NEW
const total = ig + tt + yts;   
  const defaultProfile = p.instagram || p.tiktok || undefined;
  const handle = getUsernameFromUrl(p.instagram) || getUsernameFromUrl(p.tiktok);

  // brand gradient
  const gradient = { backgroundImage: "linear-gradient(90deg,#4F46E5,#A855F7)" };

  // helpers so we don’t nest anchors inside the <a> cover link
  const open = (url) => url && window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition will-change-transform">
      {/* Cover link */}
<a
  href={defaultProfile}
  target={defaultProfile ? "_blank" : undefined}
  rel={defaultProfile ? "noreferrer" : undefined}
  aria-label={`Open ${p.name}'s profile`}
  className="relative block aspect-[3/5] bg-neutral-100 dark:bg-neutral-900"
  onMouseEnter={(e) => e.currentTarget.querySelector("video")?.play()}
  onMouseLeave={(e) => e.currentTarget.querySelector("video")?.pause()}
>
  {/* Base photo */}
  <img
    src={p.photo || avatar}
    alt={p.name}
    className="absolute inset-0 h-full w-full object-cover"
    loading="lazy"
    decoding="async"
  />

  {/* Hover video */}
  {hasVideo && (
    <video
      src={p.video}
      muted
      playsInline
      loop
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
  </div>
</a>


      {/* Meta panel */}
  <div className="p-4">
  <div className="flex items-start justify-between gap-3">
  <div /> {/* name now only appears on the media */}
  <button
  type="button"
  onClick={() => window.weardOpenProfile?.(p)}
  className="text-sm font-semibold underline underline-offset-4 hover:opacity-80 text-indigo-600"
>
  View Profile
</button>
</div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {ig > 0 && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5">
              <div className="text-xs text-neutral-500">Instagram</div>
              <div className="text-base font-semibold"><CountTo to={ig} format={shortFormat} /></div>
            </div>
          )}
          {tt > 0 && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2.5">
              <div className="text-xs text-neutral-500">TikTok</div>
              <div className="text-base font-semibold"><CountTo to={tt} format={shortFormat} /></div>
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
  decoding="async"   // ✅ new
      />
      <video
        ref={vidRef}
        src={video}
        muted
        loop
        playsInline
        preload="metadata"           // <— key change
  controls={false}
  disablePictureInPicture
  className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-300", playing ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

// ======= BRANDS =======
function Brands() {
  const logos = [
    { name: "Beauty – From skincare to luxury cosmetics, we partner with beauty brands to create content that inspires trust and authenticity." },
    { name: "Fashion – Whether high street or high-end, we deliver style-driven campaigns that set trends and capture attention." },
    { name: "Travel – Partnering with wanderlust-driven brands, we create immersive travel content that inspires audiences to explore." },
    { name: "Tech – From lifestyle gadgets to cutting-edge innovation, we help brands translate tech into everyday relevance." },
    { name: "Food – Bringing food culture to life through creators who spark cravings, conversations, and community." }
  ];

  const pillars = [
    {
      title: "Match",
      desc: "We connect brands with creators who share their vision, values, and audience — building authentic partnerships that truly resonate.",
      icon: "🎯"
    },
    {
      title: "Creativity",
      desc: "We turn brand briefs into scroll-stopping campaigns — blending cultural trends with authentic storytelling.",
      icon: "✨"
    },
    {
      title: "Results",
      desc: "From engagement to ROI, we track and report on the growth that matters most.",
      icon: "📊"
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold">Brands</h2>
      </div>

      {/* Intro */}
      <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-prose font-medium">
        We partner with brands worldwide to create campaigns that fit perfectly, perform powerfully, and uphold shared values. Every collaboration is more than a transaction — it’s a strategic alliance built on creative vision, trust, and measurable results.
      </p>

      {/* Pillars */}
      <div className="mt-10 grid sm:grid-cols-3 gap-6">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:shadow-lg transition"
          >
            <div className="text-4xl mb-4">{p.icon}</div>
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Brand types */}
      <div className="mt-10 text-sm text-neutral-600 dark:text-neutral-400 max-w-prose">
        From luxury fashion houses to beauty innovators and travel brands, every collaboration we create feels authentic to the creator and meaningful for the brand. From first concept to campaign delivery, we prioritise creative synergy, cultural relevance, and measurable performance, ensuring lasting brand impact.
      </div>

      {/* Logo showcase */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {logos.map((l) => (
          <motion.div
            key={l.name}
            initial={{ opacity: 0, y: 8 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="aspect-[3/2] rounded-2xl border border-neutral-200 dark:border-neutral-800 grid place-items-center text-center p-4 bg-white dark:bg-neutral-950 overflow-hidden"
          >
            <span className="font-semibold">{l.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Closing */}
      <p className="mt-10 text-lg text-neutral-600 dark:text-neutral-400 max-w-prose font-medium">
        Our goal is simple. We create brand partnerships that not only look good, but work — delivering campaigns that inspire, engage and leave a lasting impression.
      </p>
    </section>
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
  const [form, setForm] = useState({
    brand: "",
    email: "",
    number: "",
    budget: "",
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
    notes: "",
  });

  function handleBrandSubmit(e) {
    e.preventDefault();
    if (!form.brand || !form.email || !form.outline) {
      alert("Please fill required fields.");
      return;
    }
    const subject = `WEARD Brief – ${form.brand}`;
    const body =
      `Brand: ${form.brand}\n` +
      `Email: ${form.email}\n` +
      `Number: ${form.number}\n` +
      `Budget: ${form.budget}\n\n` +
      `Outline:\n${form.outline}`;

    try {
      window.location.href = `mailto:info@weardmgmt.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    } catch {
      navigator.clipboard?.writeText(`${subject}\n\n${body}`);
      alert(
        "We’ve copied your brief to the clipboard. Please paste it into an email to info@weardmgmt.com."
      );
    }
  }

  function handleTalentSubmit(e) {
    e.preventDefault();
    if (!talent.name || !talent.email) {
      alert("Please fill your name and email.");
      return;
    }
    const subject = `Join the Roster – ${talent.name}`;
    const body =
      `Name: ${talent.name}\n` +
      `Email: ${talent.email}\n` +
      `Number: ${talent.number}\n` +
      `Instagram: ${talent.ig}\n` +
      `TikTok: ${talent.tt}\n` +
      `Other: ${talent.other}\n` +
      `Category: ${talent.category}\n\n` +
      `Notes:\n${talent.notes}`;

    try {
      window.location.href = `mailto:info@weardmgmt.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    } catch {
      navigator.clipboard?.writeText(`${subject}\n\n${body}`);
      alert(
        "We’ve copied your message to the clipboard. Please paste it into an email to info@weardmgmt.com."
      );
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
          {mode === "brand" ? (
            <form className="grid gap-4 max-w-2xl" onSubmit={handleBrandSubmit}>
              <label className="grid gap-1">
                <span className="text-sm font-medium">
                  Company / Brand <span className="text-red-500">*</span>
                </span>
                <input
                  required
                  placeholder="e.g., Asda"
                  className={INPUT_CLS}
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
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
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Your Number (optional)</span>
                  <input
                    placeholder="+44 …"
                    className={INPUT_CLS}
                    value={form.number}
                    onChange={(e) => setForm({ ...form, number: e.target.value })}
                    inputMode="tel"
                    pattern="^[0-9+()\-.\s]{6,}$"
                    title="Please enter a valid phone number"
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Budget Range (optional)</span>
                <input
                  placeholder="e.g., £10k–£25k"
                  className={INPUT_CLS}
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
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
                <button className={BTN_PRIMARY_CLS}>Send Brief</button>
                <a href="mailto:info@weardmgmt.com" className="text-sm underline">
                  Email instead
                </a>
              </div>

              {/* Upfront payment policy note */}
              <p className="text-xs text-neutral-500 mt-2">
                Note: For new campaigns, WEARD requires payment upfront before
                campaign start to protect our talent.
              </p>
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
                <button className={BTN_PRIMARY_CLS}>Submit</button>
                <a href="mailto:info@weardmgmt.com" className="text-sm underline">
                  Email instead
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
function Footer({ onNav }) {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6 items-center">
        <div>
          <div className={cn("font-black tracking-widest", TEXT_GRAD)}>WEARD</div>
          <div className="text-xs uppercase tracking-[0.25em] text-neutral-500">Management</div>
        </div>
       <div className="text-sm text-neutral-600 dark:text-neutral-400 text-center col-span-3 md:col-span-1">
  <div>© {new Date().getFullYear()} WEARD Management. All rights reserved.</div>
  <div className="mt-1">Built for speed, ethics, and results.</div>
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
