import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Mail, ExternalLink, ArrowRight, Globe, Menu, X, Sparkles } from "lucide-react";
// Simple TikTok icon (outline) to match lucide style
const TikTokIcon = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M16 8.5c2.1 1.8 4 2 4 2V14c-2.2 0-4.2-1-6-2.5V16a6 6 0 1 1-6-6 6.5 6.5 0 0 0 3 .7"/>
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
  },
};

const WEARE_WORDS = ["DIFFERENT", "DISRUPTIVE", "DYNAMIC", "DISTINCT", "DRIVEN", "DECISIVE", "DEFIANT"];

const STARTER_CREATORS = [
  {
     name: "Sophia Price",
  category: "Fashion",
  instagram: "https://www.instagram.com/xsophiapriceyx",
  tiktok: "https://www.tiktok.com/@sophiapriceyyy",
  email: "sophia@weardmgmt.com",
  instagram_followers: 717000,
  tiktok_followers: 586600,
  profile_image: MEDIA.creators.Sophia.hero,   // static profile image
  photo: MEDIA.creators.Sophia.poster,         // still frame before hover
  tags: ["Fashion", "Beauty", "Travel"],
  video: MEDIA.creators.Sophia.video,
  bio: "Sophia Pricey is a Thai–British fashion, beauty, and travel creator celebrated for her effortless style and trend-defining content. With a natural flair for posing and a photographer’s eye, she transforms playful ideas into polished, captivating visuals that resonate across global audiences.",
  top_audience: ["United States", "Thailand"],   // 👈 add this line

  },
{
  name: "Amelie Wyg",
  category: "Fashion",
  instagram: "https://www.instagram.com/ameliewyg",
  tiktok: "https://www.tiktok.com/@ameliewyg",
  email: "amy@weardmgmt.com",
  instagram_followers: 350000,
  tiktok_followers: 245000,
  profile_image: MEDIA.creators.Amy.hero,
  photo: MEDIA.creators.Amy.poster,
  tags: ["Fashion", "Beauty", "Lifestyle"],
  video: MEDIA.creators.Amy.video,
  bio: "Amy is a Thai–German fashion, beauty, and lifestyle creator whose content radiates confidence and creativity. Blending cultural influences with a sharp eye for style, she captivates audiences whether she’s curating standout outfits or sharing beauty insights.",
  top_audience: ["United States", "Thailand"],        // 👈 add this line

},
   {name: "The Peacocks",
  category: "Family",
  instagram: "https://www.instagram.com/itsthepeacocks",
  tiktok: "https://www.tiktok.com/@itsthepeacocks",
  email: "itsthepeacocks@weardmgmt.com",
  instagram_followers: 133000,
  tiktok_followers: 68200,
  profile_image: MEDIA.creators.Peacocks.hero,   // static profile image
  photo: MEDIA.creators.Peacocks.poster,         // still frame before hover
  tags: ["Family", "Lifestyle", "Travel"],
  video: MEDIA.creators.Peacocks.video,
  bio: "Daniel and Ellen, known as The Peacocks, are a Northern Irish–Hong Kong duo now raising their family in Northern Ireland. Blending their love of family life, food, and culture, they create warm, engaging content that highlights Cantonese language, lifestyle, and music. From home cooking to classic Cantonese songs, their content brings heritage and everyday family moments together in a way that resonates with audiences worldwide.",
  top_audience: ["United Kingdom", "United States", "China"], // 👈 add this line

   },
     {name: "Josefine Uddman",
  category: "Beauty",
  instagram: "https://www.instagram.com/josefine.ku.ud/",
  tiktok: "https://www.tiktok.com/@josefineuddman",
  email: "josefine@weardmgmt.com",
  instagram_followers: 8148,
  tiktok_followers: 80200,
  profile_image: MEDIA.creators.Josefine.hero, // static profile image
  photo: MEDIA.creators.Josefine.poster,          // still frame before hover
  tags: ["Beauty", "Lifestyle"],
  video: MEDIA.creators.Josefine.video,  
  bio: "Josefine is a Swedish–Thai fashion, beauty, and lifestyle creator whose content blends elegance and playfulness. Drawing on her dual heritage, she brings a unique cultural perspective to her work, curating standout looks and sharing authentic beauty insights that resonate with global audiences.",
  top_audience: ["Thailand", "Sweden"],
}, // ← close Josefine
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
  const navigate = (k) => {
    setActivePage(k);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // expose simple global nav so buttons can jump pages without prop drilling
  useEffect(() => {
    window.weardNav = (k) => navigate(k);
    return () => {
      delete window.weardNav;
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

// ======= HOME =======
function Home({ onExploreRoster, onWorkWithUs }) {
  const slides = [
    { title: "Influence Differently.", subtitle: "WEARD. Because Normal Doesn’t Trend.", image: MEDIA.creators.Sophia.photo },
    { title: "Global Talent Shaping Our Culture.", subtitle: "Authentic Voices And Meaningful Opportunities.", image: MEDIA.creators.Amy.photo },
  ];
  return (
    <section className="relative overflow-hidden">
      <HeroSlider slides={slides} />
      <div className="max-w-7xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            WE ARE <RotatingWords words={WEARE_WORDS} />
          </h1>
         <p className="mt-5 text-base sm:text-lg text-neutral-700 dark:text-neutral-200 max-w-prose">
  Global Influence. Global Campaigns. Global Talent. We Champion Our Creators And Amplify Their Voices.
</p>
          <div className="mt-8 flex flex-wrap gap-3">
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
  const [tab, setTab] = useState("All");
  const tabs = useMemo(() => ["All", ...CATEGORIES.map((c) => c.label)], []);
  const filtered = useMemo(
    () => (tab === "All" ? creators : creators.filter((c) => {
      const t = tab.toLowerCase();
      const catMatch = c.category && c.category.toLowerCase() === t;
      const tags = Array.isArray(c.tags) ? c.tags : [];
      const tagMatch = tags.some((tag) => String(tag).toLowerCase() == t);
      return catMatch || tagMatch;
    })),
    [tab, creators]
  );
  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold">Roster</h2>
        <div className="flex flex-wrap gap-2">
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
      </div>
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">Meet Our Talent</p>
      <motion.div layout className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.25 }}>
            <CreatorCard p={p} />
          </motion.div>
        ))}

       {/* Invite tile */}
<div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-start justify-between">
  <div>
    <h3 className="text-lg font-semibold">Join the Roster</h3>
    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
      We’re always looking for exciting new talent to represent across Fashion, Beauty, Lifestyle, Sport, Travel and Family. If you’re building something special, let’s talk.
    </p>
  </div>
  <button onClick={() => window.weardNav?.("contact")} className="mt-6 inline-flex items-center gap-2 text-sm underline">
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
  const [open, setOpen] = useState(false);
  const avatar =
    p.profile_image ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(p.name)}&backgroundType=gradientLinear`;
  const hasHoverMedia = p.photo && p.video;

  const ig = cleanNum(p.instagram_followers) ?? 0;
  const tt = cleanNum(p.tiktok_followers) ?? 0;
  const total = ig + tt;

  const defaultProfile = p.instagram || p.tiktok || undefined;
useEffect(() => {
  if (!open) return; // ✅ only inject when modal is open

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": p.name,
    "jobTitle": `${p.category} Creator`,
    "email": p.email || undefined,
    "url": p.instagram || p.tiktok || undefined,
    "sameAs": [p.instagram, p.tiktok].filter(Boolean)
  };

  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.text = JSON.stringify(data);
  document.head.appendChild(s);

  return () => {
    if (s.parentNode) s.parentNode.removeChild(s);
  };
}, [open, p]);
  return (
    <div className="p-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden group">
      <a href={defaultProfile} target={defaultProfile ? "_blank" : undefined} rel={defaultProfile ? "noreferrer" : undefined} className="relative aspect-[9/16] w-full md:w-[220px] mx-auto block bg-neutral-100 dark:bg-neutral-900">
        {!hasHoverMedia ? (
          <img src={avatar} alt={p.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        ) : (
          <HoverMedia photo={p.photo} video={p.video} alt={p.name} />
        )}
      </a>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{p.name}</h3>
            <p className="text-xs text-neutral-500">{(getUsernameFromUrl(p.instagram) || getUsernameFromUrl(p.tiktok) || "").toLowerCase()}</p>
          </div>
            <div className="flex items-center gap-3">
            <a href={p.instagram || p.tiktok || "#"} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 underline">
              View Profile <ExternalLink size={14} />
            </a>
            <button onClick={() => setOpen(true)} className="text-sm underline">
              More
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <SocialStat
            label="Instagram"
            icon={Instagram}
            url={p.instagram}
            value={<CountTo to={ig} format={shortFormat} />}
          />
          <SocialStat
            label="TikTok"
            icon={TikTokIcon}
            url={p.tiktok}
            value={<CountTo to={tt} format={shortFormat} />}
          />
        </div>

        <div className="mt-2 text-xs text-neutral-500">
          Total: <span className="font-semibold text-neutral-700 dark:text-neutral-200"><CountTo to={total} format={(x) => x.toLocaleString()} /></span>
        </div>

        {p.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-xs border border-neutral-200 dark:border-neutral-800">
                {t}
              </span>
            ))}
          </div>
        ) : null}
       {p.email && (
  <a
    href={`mailto:${p.email}`}
    className="mt-4 flex flex-wrap items-center gap-2 text-sm underline break-all"
  >
    Email {p.name.split(" ")[0]} ({p.email}) <Mail size={14} aria-hidden="true" />
  </a>
)}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 grid place-items-center p-4"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="relative aspect-[9/16] w-full md:w-[280px] mx-auto">
                <VideoHover
  src={p.video}
  poster={p.photo}
  className="absolute inset-0 w-full h-full object-cover"
/>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <p className="text-xs uppercase tracking-widest text-neutral-500">{p.category}</p>
                  </div>
                  <button onClick={() => setOpen(false)} className="px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    Close
                  </button>
                </div>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
                  {p.bio || "Add a 'bio' column in the Sheet to populate this section automatically."}
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  <div className="mb-3 sm:col-span-3 text-sm">
                    <div className="font-semibold">Top Audience</div>
                    {p.top_audience?.length ? (
    <div className="text-neutral-600 dark:text-neutral-400">
      {p.top_audience.join(" · ")}
    </div>
  ) : (
    <div className="text-neutral-400 italic">Not available</div>
  )}
                  </div>
                  <a
                    href={p.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 inline-flex items-center justify-center gap-2"
                  >
                    <Instagram size={14} aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href={p.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 inline-flex items-center justify-center gap-2"
                  >
                    <TikTokIcon />
                    TikTok
                  </a>
                  {p.email && (
                    <a
                      href={`mailto:${p.email}`}
                      className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 inline-flex items-center justify-center gap-2"
                    >
                      <Mail size={14} aria-hidden="true" />
                      Email ({p.email})
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [form, setForm] = useState({ brand: "", email: "", number: "", budget: "", outline: "" });
  const [talent, setTalent] = useState({ name: "", email: "", number: "", ig: "", tt: "", other: "", category: "", notes: "" });

  function handleBrandSubmit(e) {
    e.preventDefault();
    if (!form.brand || !form.email || !form.outline) {
      alert("Please fill required fields.");
      return;
    }
    const subject = `WEARD Brief - ${form.brand}`;
    const body = `Brand: ${form.brand}\\nEmail: ${form.email}\\nNumber: ${form.number}\\nBudget: ${form.budget}\\n\\nOutline:\\n${form.outline}`;
    window.location.href = `mailto:info@weardmgmt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function handleTalentSubmit(e) {
    e.preventDefault();
    if (!talent.name || !talent.email) {
      alert("Please fill your name and email.");
      return;
    }
    const subject = `Join the Roster - ${talent.name}`;
    const body = `Name: ${talent.name}\\nEmail: ${talent.email}\\nNumber: ${talent.number}\\nInstagram: ${talent.ig}\\nTikTok: ${talent.tt}\\nOther: ${talent.other}\\nCategory: ${talent.category}\\n\\nNotes:\\n${talent.notes}`;
    window.location.href = `mailto:info@weardmgmt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-20" id="contact">
      <div className="rounded-2xl overflow-hidden border border-black/10">
        <div className="bg-neutral-900 text-white px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold">Contact</h2>
            <p className="mt-1 text-sm text-white/80">Quick brief for brands, or join the roster as talent.</p>
          </div>
          <div className="inline-flex rounded-full border border-white/20 p-1" role="tablist" aria-label="Contact mode">
            <button
              onClick={() => setMode("brand")}
              className={`px-3 py-1.5 rounded-full text-sm ${mode === "brand" ? "bg-white text-neutral-900" : "text-white/80"}`}
              role="tab"
              aria-selected={mode === "brand"}
            >
              Brand / Agency
            </button>
            <button
              onClick={() => setMode("talent")}
              className={`px-3 py-1.5 rounded-full text-sm ${mode === "talent" ? "bg-white text-neutral-900" : "text-white/80"}`}
              role="tab"
              aria-selected={mode === "talent"}
            >
              Talent
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-950 px-6 py-6">
          {mode === "brand" ? (
            <form className="grid gap-4 max-w-2xl" onSubmit={handleBrandSubmit}>
              <input
                required
                placeholder="Company / Brand"
                className={INPUT_CLS}
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  className={INPUT_CLS}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  placeholder="Your Number (optional)"
                  className={INPUT_CLS}
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </div>
              <input
                placeholder="Budget Range (optional)"
                className={INPUT_CLS}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
              <textarea
                required
                placeholder="Campaign outline, deliverables, timing"
                className={`${INPUT_CLS} min-h-36`}
                value={form.outline}
                onChange={(e) => setForm({ ...form, outline: e.target.value })}
              />
              <div className="flex items-center gap-3">
                <button className={BTN_PRIMARY_CLS}>Send Brief</button>
                <a href="mailto:info@weardmgmt.com" className="text-sm underline">
                  Email instead
                </a>
              </div>
            </form>
          ) : (
            <form className="grid gap-4 max-w-2xl" onSubmit={handleTalentSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full Name"
                  className={INPUT_CLS}
                  value={talent.name}
                  onChange={(e) => setTalent({ ...talent, name: e.target.value })}
                />
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  className={INPUT_CLS}
                  value={talent.email}
                  onChange={(e) => setTalent({ ...talent, email: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  placeholder="Instagram URL"
                  className={INPUT_CLS}
                  value={talent.ig}
                  onChange={(e) => setTalent({ ...talent, ig: e.target.value })}
                />
                <input
                  placeholder="TikTok URL"
                  className={INPUT_CLS}
                  value={talent.tt}
                  onChange={(e) => setTalent({ ...talent, tt: e.target.value })}
                />
              </div>
              <input
                placeholder="Other (site/portfolio)"
                className={INPUT_CLS}
                value={talent.other}
                onChange={(e) => setTalent({ ...talent, other: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <select className={INPUT_CLS} value={talent.category} onChange={(e) => setTalent({ ...talent, category: e.target.value })}>
                  <option value="">Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key}>{c.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Your Number (optional)"
                  className={INPUT_CLS}
                  value={talent.number}
                  onChange={(e) => setTalent({ ...talent, number: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Notes (niche, availability, recent work)"
                className={`${INPUT_CLS} min-h-36`}
                value={talent.notes}
                onChange={(e) => setTalent({ ...talent, notes: e.target.value })}
              />
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
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
