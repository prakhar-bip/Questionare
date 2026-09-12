import { useState } from "react";
import JSZip from "jszip";
import { toast } from "sonner";
import {
  Monitor,
  Tablet,
  Smartphone,
  Palette,
  Sparkles,
  ExternalLink,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import type {
  Blueprint,
  ProductionCodebase,
  PrototypeData,
  PrototypeFile,
  PrototypeScreen,
  StudentProfile,
} from "@/lib/types";
import { generateProductionBatch, generateProductionManifest } from "@/lib/quest.functions";

type DeviceMode = "desktop" | "tablet" | "mobile";

interface ThemeStyleConfig {
  id: string;
  name: string;
  badge: string;
  container: string;
  deviceFrame: string;
  header: string;
  card: string;
  innerCard: string;
  button: string;
  badgeTag: string;
  input: string;
  metricValue: string;
  subtext: string;
  accentText: string;
  activeNavTab: string;
  inactiveNavTab: string;
  browserBg: string;
  browserDotRed: string;
  browserDotYellow: string;
  browserDotGreen: string;
  urlBar: string;
}

const THEME_STYLES: Record<string, ThemeStyleConfig> = {
  "neo-brutalism": {
    id: "neo-brutalism",
    name: "Neo-Brutalism",
    badge: "BRUTALIST VIBES",
    container: "bg-[#fef9c3] text-[#121212] font-sans",
    deviceFrame: "border-4 border-black shadow-[8px_8px_0_0_#000] bg-[#fef08a]",
    header: "border-b-4 border-black bg-[#facc15] text-black",
    card: "rounded-xl border-3 border-black bg-white shadow-[5px_5px_0_0_#000] text-black",
    innerCard: "rounded-lg border-2 border-black bg-[#fef08a]/60 shadow-[2px_2px_0_0_#000] text-black",
    button: "rounded-lg border-3 border-black bg-[#38bdf8] font-black text-black shadow-[3px_3px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_0_#000] active:translate-y-[2px] transition-all",
    badgeTag: "border-2 border-black bg-[#a7f3d0] font-mono text-black font-bold px-2 py-0.5 rounded",
    input: "rounded-lg border-3 border-black bg-white focus:bg-[#fef9c3] font-semibold text-black focus:outline-none p-2.5",
    metricValue: "font-display font-black text-black text-3xl",
    subtext: "text-zinc-800 font-medium",
    accentText: "text-black font-black",
    activeNavTab: "bg-black text-white shadow-[2px_2px_0_0_#444] border-2 border-black font-black",
    inactiveNavTab: "border-2 border-black bg-white text-black hover:bg-amber-200 font-bold",
    browserBg: "bg-[#fde047] border-b-4 border-black",
    browserDotRed: "bg-black border border-black",
    browserDotYellow: "bg-white border-2 border-black",
    browserDotGreen: "bg-[#4ade80] border-2 border-black",
    urlBar: "border-2 border-black bg-white text-black font-mono font-bold shadow-[2px_2px_0_0_#000]",
  },
  "cyberpunk": {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    badge: "HUD TELEMETRY",
    container: "bg-[#05050c] text-cyan-100 font-mono",
    deviceFrame: "border-2 border-cyan-500/60 shadow-[0_0_40px_rgba(0,240,255,0.25)] bg-[#070714]",
    header: "border-b border-cyan-500/50 bg-[#090918] text-cyan-300 shadow-[0_4px_20px_rgba(0,240,255,0.15)]",
    card: "rounded-lg border border-cyan-500/40 bg-[#0c0d20]/95 shadow-[0_0_20px_rgba(0,240,255,0.12)] text-cyan-100",
    innerCard: "rounded border border-cyan-500/30 bg-[#12132a]/90 text-cyan-200",
    button: "rounded border border-cyan-400 bg-cyan-500/25 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)] hover:bg-cyan-400 hover:text-black transition-all tracking-wider uppercase",
    badgeTag: "border border-pink-500/60 bg-pink-950/60 text-pink-400 shadow-[0_0_10px_rgba(255,0,128,0.4)] font-mono px-2 py-0.5 rounded",
    input: "rounded border border-cyan-500/50 bg-[#090a18] text-cyan-200 placeholder:text-cyan-700 focus:border-cyan-300 focus:shadow-[0_0_12px_rgba(0,240,255,0.5)] focus:outline-none p-2.5",
    metricValue: "font-mono font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)] text-3xl",
    subtext: "text-cyan-400/70",
    accentText: "text-cyan-400",
    activeNavTab: "border border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)] font-bold",
    inactiveNavTab: "border border-cyan-500/20 bg-[#0c0d1e] text-cyan-500/80 hover:text-cyan-300 hover:border-cyan-500/50",
    browserBg: "bg-[#080816] border-b border-cyan-500/40",
    browserDotRed: "bg-red-500 shadow-[0_0_8px_#ef4444]",
    browserDotYellow: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    browserDotGreen: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
    urlBar: "border border-cyan-500/40 bg-[#050510] text-cyan-400 font-mono shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]",
  },
  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Minimal SaaS",
    badge: "CLEAN GEOMETRIC",
    container: "bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans",
    deviceFrame: "border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900",
    header: "border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white backdrop-blur",
    card: "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100",
    innerCard: "rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200",
    button: "rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm hover:shadow transition-all",
    badgeTag: "rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold px-2.5 py-0.5",
    input: "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 focus:outline-none p-2.5",
    metricValue: "font-display font-extrabold text-slate-900 dark:text-white text-3xl",
    subtext: "text-slate-500 dark:text-slate-400",
    accentText: "text-indigo-600 dark:text-indigo-400 font-bold",
    activeNavTab: "bg-indigo-600 text-white shadow-sm font-semibold",
    inactiveNavTab: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
    browserBg: "bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800",
    browserDotRed: "bg-rose-400",
    browserDotYellow: "bg-amber-400",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono",
  },
  "glassmorphism": {
    id: "glassmorphism",
    name: "Glassmorphism & Aurora",
    badge: "FROSTED AURORA",
    container: "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100 font-sans relative overflow-hidden",
    deviceFrame: "border border-white/20 shadow-2xl bg-white/5 backdrop-blur-2xl",
    header: "border-b border-white/15 bg-white/10 backdrop-blur-xl text-white shadow-lg",
    card: "rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl text-white",
    innerCard: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-white/90",
    button: "rounded-2xl border border-white/30 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all",
    badgeTag: "rounded-full border border-pink-400/40 bg-pink-500/20 text-pink-200 backdrop-blur-md font-semibold px-2.5 py-0.5",
    input: "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-white text-3xl",
    subtext: "text-white/70",
    accentText: "text-pink-300 font-bold",
    activeNavTab: "border border-white/30 bg-white/25 text-white shadow-md backdrop-blur font-bold",
    inactiveNavTab: "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10",
    browserBg: "bg-white/10 backdrop-blur-xl border-b border-white/15",
    browserDotRed: "bg-pink-400 shadow-[0_0_8px_#f472b6]",
    browserDotYellow: "bg-amber-300 shadow-[0_0_8px_#fcd34d]",
    browserDotGreen: "bg-cyan-300 shadow-[0_0_8px_#67e8f9]",
    urlBar: "border border-white/20 bg-white/10 backdrop-blur-md text-white/80 font-mono",
  },
  "warm-editorial": {
    id: "warm-editorial",
    name: "Warm Editorial & Craft",
    badge: "EDITORIAL CRAFT",
    container: "bg-[#fcfaf6] text-[#2c2825] font-serif",
    deviceFrame: "border-2 border-[#e6e1d6] shadow-xl bg-[#ffffff]",
    header: "border-b-2 border-[#e6e1d6] bg-[#f5f1e8] text-[#2c2825]",
    card: "rounded-xl border-2 border-[#e6e1d6] bg-[#ffffff] shadow-sm text-[#2c2825]",
    innerCard: "rounded-lg border border-[#e8e4db] bg-[#faf7f2] text-[#2c2825]",
    button: "rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white font-serif font-bold shadow-sm transition-all",
    badgeTag: "rounded border border-[#fed7aa] bg-[#fff7ed] text-[#9a3412] font-sans text-[11px] font-bold px-2 py-0.5",
    input: "rounded-lg border-2 border-[#e6e1d6] bg-[#ffffff] text-[#2c2825] focus:border-[#b45309] focus:outline-none font-sans p-2.5",
    metricValue: "font-serif font-bold text-[#b45309] text-3xl",
    subtext: "text-[#78716c] font-sans",
    accentText: "text-[#b45309] font-bold",
    activeNavTab: "bg-[#b45309] text-white font-sans font-bold",
    inactiveNavTab: "border border-[#e6e1d6] bg-[#f5f1e8] text-[#57534e] hover:text-[#2c2825] font-sans",
    browserBg: "bg-[#f3ede2] border-b-2 border-[#e6e1d6]",
    browserDotRed: "bg-[#c2410c]",
    browserDotYellow: "bg-[#d97706]",
    browserDotGreen: "bg-[#15803d]",
    urlBar: "border border-[#e6e1d6] bg-white text-[#78716c] font-mono",
  },
  "enterprise-navy": {
    id: "enterprise-navy",
    name: "Enterprise Navy & Emerald",
    badge: "INSTITUTIONAL PRECISION",
    container: "bg-[#081220] text-slate-100 font-sans",
    deviceFrame: "border border-emerald-900/40 shadow-2xl bg-[#0a182b]",
    header: "border-b border-emerald-500/30 bg-[#0c1b30] text-slate-100 shadow-md",
    card: "rounded-xl border border-slate-700/80 bg-[#0e223d] shadow-lg text-slate-100",
    innerCard: "rounded-lg border border-slate-700/50 bg-[#122b4d] text-slate-200",
    button: "rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition-all",
    badgeTag: "rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] px-2 py-0.5",
    input: "rounded-lg border border-slate-700 bg-[#0a182b] text-slate-100 focus:border-emerald-500 focus:outline-none p-2.5",
    metricValue: "font-mono font-bold text-emerald-400 text-3xl",
    subtext: "text-slate-400",
    accentText: "text-emerald-400 font-bold",
    activeNavTab: "bg-emerald-600 text-white shadow-sm font-semibold",
    inactiveNavTab: "bg-[#0c1b30] border border-slate-700 text-slate-400 hover:text-slate-200",
    browserBg: "bg-[#0c1b30] border-b border-emerald-500/30",
    browserDotRed: "bg-red-500/80",
    browserDotYellow: "bg-amber-400/80",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-slate-700 bg-[#071322] text-emerald-400 font-mono",
  },
  "clinical-precision": {
    id: "clinical-precision",
    name: "Clinical Precision & Bio-Slate",
    badge: "CLINICAL GRADE",
    container: "bg-[#f8fafc] text-slate-900 font-sans",
    deviceFrame: "border-2 border-sky-300 shadow-2xl bg-white",
    header: "border-b border-sky-200 bg-sky-950 text-white shadow-sm",
    card: "rounded-xl border border-sky-200 bg-white shadow-sm text-slate-900",
    innerCard: "rounded-lg border border-sky-100 bg-sky-50/60 text-slate-800",
    button: "rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-sm transition-all",
    badgeTag: "rounded bg-sky-100 text-sky-800 border border-sky-300 font-semibold px-2 py-0.5",
    input: "rounded-xl border border-sky-200 bg-white text-slate-900 focus:border-sky-500 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-sky-700 text-3xl",
    subtext: "text-slate-500",
    accentText: "text-sky-600 font-bold",
    activeNavTab: "bg-sky-600 text-white shadow font-semibold",
    inactiveNavTab: "bg-sky-100/70 text-sky-900 hover:bg-sky-200",
    browserBg: "bg-sky-900 border-b border-sky-800",
    browserDotRed: "bg-red-400",
    browserDotYellow: "bg-amber-300",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-sky-700 bg-sky-950 text-sky-200 font-mono",
  },
  "terra-botanical": {
    id: "terra-botanical",
    name: "Terra Verdant & Botanical Tech",
    badge: "AGRO-TECH VERIFIED",
    container: "bg-[#f4f7f4] text-stone-900 font-sans",
    deviceFrame: "border-2 border-emerald-700 shadow-2xl bg-white",
    header: "border-b-2 border-emerald-800 bg-[#14532d] text-emerald-50 shadow-sm",
    card: "rounded-xl border-2 border-emerald-800/30 bg-white shadow-sm text-stone-900",
    innerCard: "rounded-lg border border-emerald-200 bg-emerald-50/70 text-stone-800",
    button: "rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold shadow transition-all",
    badgeTag: "rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5",
    input: "rounded-xl border border-emerald-300 bg-white text-stone-900 focus:border-emerald-600 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-emerald-800 text-3xl",
    subtext: "text-stone-600",
    accentText: "text-emerald-700 font-bold",
    activeNavTab: "bg-[#15803d] text-white shadow font-bold",
    inactiveNavTab: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
    browserBg: "bg-[#14532d] border-b border-emerald-800",
    browserDotRed: "bg-red-400",
    browserDotYellow: "bg-amber-300",
    browserDotGreen: "bg-emerald-300",
    urlBar: "border border-emerald-700 bg-[#0f3e22] text-emerald-200 font-mono",
  },
  "vault-platinum": {
    id: "vault-platinum",
    name: "Vault Platinum & High-Trust Slate",
    badge: "INSTITUTIONAL TRUST",
    container: "bg-[#060c18] text-slate-100 font-sans",
    deviceFrame: "border border-slate-700 shadow-2xl bg-[#091426]",
    header: "border-b border-slate-800 bg-[#0b172c] text-white shadow-md",
    card: "rounded-xl border border-slate-700 bg-[#0d1c36] shadow-md text-slate-100",
    innerCard: "rounded-lg border border-slate-700/80 bg-[#122547] text-slate-200",
    button: "rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black shadow transition-all",
    badgeTag: "rounded bg-emerald-950 text-emerald-400 border border-emerald-500/50 font-mono text-[11px] px-2 py-0.5",
    input: "rounded-xl border border-slate-700 bg-[#071120] text-slate-100 focus:border-emerald-500 focus:outline-none p-2.5",
    metricValue: "font-mono font-black text-emerald-400 text-3xl",
    subtext: "text-slate-400",
    accentText: "text-emerald-400 font-bold",
    activeNavTab: "bg-emerald-500 text-emerald-950 shadow font-bold",
    inactiveNavTab: "bg-[#0c182e] border border-slate-700 text-slate-300 hover:text-white",
    browserBg: "bg-[#081222] border-b border-slate-800",
    browserDotRed: "bg-rose-500",
    browserDotYellow: "bg-amber-400",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-slate-700 bg-[#050b16] text-emerald-400 font-mono",
  },
  "zero-trust-stealth": {
    id: "zero-trust-stealth",
    name: "Zero-Trust Stealth Terminal",
    badge: "SOC OPERATIONS",
    container: "bg-[#050608] text-emerald-300 font-mono",
    deviceFrame: "border border-emerald-900/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-[#090b0e]",
    header: "border-b border-emerald-900/80 bg-[#0a0d12] text-emerald-400 shadow-sm",
    card: "rounded-lg border border-emerald-900/60 bg-[#0d1117] text-emerald-200 shadow-sm",
    innerCard: "rounded border border-emerald-900/40 bg-[#11161f] text-emerald-300",
    button: "rounded border border-emerald-500/60 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold transition-all uppercase tracking-wider",
    badgeTag: "rounded border border-red-500/50 bg-red-950/60 text-red-400 font-mono text-[10px] px-2 py-0.5",
    input: "rounded border border-emerald-900/60 bg-[#080a0e] text-emerald-200 focus:border-emerald-400 focus:outline-none p-2.5",
    metricValue: "font-mono font-black text-emerald-400 text-3xl drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]",
    subtext: "text-emerald-600",
    accentText: "text-emerald-400 font-bold",
    activeNavTab: "border border-emerald-500 bg-emerald-950/90 text-emerald-300 font-bold",
    inactiveNavTab: "border border-emerald-950 bg-[#090c10] text-emerald-700 hover:text-emerald-400",
    browserBg: "bg-[#080a0e] border-b border-emerald-900/60",
    browserDotRed: "bg-red-500 shadow-[0_0_6px_#ef4444]",
    browserDotYellow: "bg-amber-400",
    browserDotGreen: "bg-emerald-400 shadow-[0_0_6px_#10b981]",
    urlBar: "border border-emerald-900/60 bg-[#050608] text-emerald-400 font-mono",
  },
  "campus-playful-bento": {
    id: "campus-playful-bento",
    name: "Campus Bento & Playful Mint",
    badge: "HIGH ENGAGEMENT",
    container: "bg-[#fefce8] text-purple-950 font-sans",
    deviceFrame: "border-3 border-purple-900 shadow-xl bg-white",
    header: "border-b-3 border-purple-900 bg-[#7c3aed] text-white shadow-sm",
    card: "rounded-2xl border-2 border-purple-900 bg-white shadow-[4px_4px_0_0_#4c1d95] text-purple-950",
    innerCard: "rounded-xl border border-purple-200 bg-purple-50 text-purple-900",
    button: "rounded-xl border-2 border-purple-900 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold shadow-[2px_2px_0_0_#4c1d95] transition-all",
    badgeTag: "rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2.5 py-0.5",
    input: "rounded-xl border-2 border-purple-900 bg-white text-purple-950 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-purple-900 text-3xl",
    subtext: "text-purple-700",
    accentText: "text-purple-700 font-bold",
    activeNavTab: "bg-[#7c3aed] text-white font-bold shadow-sm",
    inactiveNavTab: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    browserBg: "bg-[#7c3aed] border-b-2 border-purple-900",
    browserDotRed: "bg-rose-400",
    browserDotYellow: "bg-amber-300",
    browserDotGreen: "bg-emerald-300",
    urlBar: "border-2 border-purple-900 bg-white text-purple-900 font-mono",
  },
  "neural-aurora": {
    id: "neural-aurora",
    name: "Neural Aurora & Deep Indigo",
    badge: "NEURAL CORE",
    container: "bg-[#0b0f19] text-indigo-100 font-sans",
    deviceFrame: "border border-indigo-500/40 shadow-[0_0_35px_rgba(99,102,241,0.2)] bg-[#0d1322]",
    header: "border-b border-indigo-500/30 bg-[#0f172a]/95 text-white backdrop-blur",
    card: "rounded-2xl border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-xl shadow-xl text-white",
    innerCard: "rounded-xl border border-indigo-500/20 bg-indigo-900/30 text-indigo-200",
    button: "rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold shadow-md hover:shadow-indigo-500/25 transition-all",
    badgeTag: "rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold px-2.5 py-0.5",
    input: "rounded-xl border border-indigo-500/30 bg-indigo-950/60 text-white placeholder:text-indigo-400/50 focus:border-indigo-400 focus:outline-none p-2.5",
    metricValue: "font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 text-3xl",
    subtext: "text-indigo-300/80",
    accentText: "text-indigo-400 font-bold",
    activeNavTab: "bg-indigo-600 text-white shadow font-bold",
    inactiveNavTab: "bg-indigo-950/60 text-indigo-300 hover:text-white",
    browserBg: "bg-[#0c1220] border-b border-indigo-500/30",
    browserDotRed: "bg-pink-400",
    browserDotYellow: "bg-amber-300",
    browserDotGreen: "bg-cyan-400",
    urlBar: "border border-indigo-500/30 bg-[#080d18] text-indigo-300 font-mono",
  },
};

function getThemeConfig(themeKey?: string): ThemeStyleConfig {
  if (!themeKey) return THEME_STYLES["modern-minimal"];
  const normalized = themeKey.toLowerCase().replace(/\s+/g, "-");
  if (THEME_STYLES[normalized]) return THEME_STYLES[normalized];

  // Domain-specific keyword matching
  if (/clinical|medical|health|caregiver|spectral|bio/.test(normalized)) {
    return THEME_STYLES["clinical-precision"];
  }
  if (/terra|botanical|agro|farm|crop|plant|soil|green|eco/.test(normalized)) {
    return THEME_STYLES["terra-botanical"];
  }
  if (/vault|fintech|bank|pay|crypto|token|ledger|trade/.test(normalized)) {
    return THEME_STYLES["vault-platinum"];
  }
  if (/zero-trust|stealth|recon|cyber|packet|security|soc|terminal/.test(normalized)) {
    return THEME_STYLES["zero-trust-stealth"];
  }
  if (/campus|edtech|student|learn|quiz|bento|playful|tutor/.test(normalized)) {
    return THEME_STYLES["campus-playful-bento"];
  }
  if (/neural|aurora|ai|cognitive|vector|latent/.test(normalized)) {
    return THEME_STYLES["neural-aurora"];
  }
  if (/brutal/.test(normalized)) {
    return THEME_STYLES["neo-brutalism"];
  }
  if (/cyber/.test(normalized)) {
    return THEME_STYLES["cyberpunk"];
  }
  if (/glass/.test(normalized)) {
    return THEME_STYLES["glassmorphism"];
  }
  if (/editorial|craft|paper|academic|codex/.test(normalized)) {
    return THEME_STYLES["warm-editorial"];
  }

  const match = Object.keys(THEME_STYLES).find(
    (k) => normalized.includes(k) || k.includes(normalized),
  );
  if (match) return THEME_STYLES[match];

  return {
    id: "custom",
    name: themeKey,
    badge: "CUSTOM THEME",
    container: "bg-zinc-950 text-zinc-100 font-sans",
    deviceFrame: "border-2 border-accent/60 shadow-2xl bg-zinc-900",
    header: "border-b border-zinc-800 bg-zinc-900 text-white",
    card: "rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm text-zinc-100",
    innerCard: "rounded-xl border border-zinc-800/80 bg-zinc-950/80 text-zinc-300",
    button: "rounded-xl bg-accent text-accent-foreground font-bold hover:opacity-90 shadow transition-all",
    badgeTag: "rounded-full bg-accent/20 text-accent border border-accent/40 font-semibold px-2 py-0.5",
    input: "rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:border-accent focus:outline-none p-2.5",
    metricValue: "font-display font-black text-accent text-3xl",
    subtext: "text-zinc-400",
    accentText: "text-accent font-bold",
    activeNavTab: "bg-accent text-accent-foreground font-bold shadow-sm",
    inactiveNavTab: "bg-zinc-800 text-zinc-400 hover:text-white",
    browserBg: "bg-zinc-900 border-b border-zinc-800",
    browserDotRed: "bg-red-500",
    browserDotYellow: "bg-amber-400",
    browserDotGreen: "bg-emerald-400",
    urlBar: "border border-zinc-800 bg-zinc-950 text-zinc-300 font-mono",
  };
}

export function PrototypeSandbox({
  prototype,
  blueprint,
  profile,
  onBackToBlueprint,
  onSelectNewTheme,
}: {
  prototype: PrototypeData;
  blueprint: Blueprint;
  profile: StudentProfile | null;
  onBackToBlueprint: () => void;
  onSelectNewTheme?: () => void;
}) {
  const screens = prototype?.screens || [];
  const codeFiles = prototype?.codeFiles || [];
  const runInstructions = prototype?.runInstructions || [];

  const [activeTab, setActiveTab] = useState<"preview" | "code" | "guide" | "production">("preview");
  const [activeScreenId, setActiveScreenId] = useState<string>(
    screens[0]?.id || "dashboard"
  );
  // Active theme and device viewport mode
  const [activeThemeId, setActiveThemeId] = useState<string>(
    prototype?.theme || "neo-brutalism"
  );
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const themeConfig = getThemeConfig(activeThemeId);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Production Engine State (Manifest + Batch Loop)
  const [productionCodebase, setProductionCodebase] = useState<ProductionCodebase | null>(
    prototype?.productionCodebase || null
  );
  const [isBuildingProduction, setIsBuildingProduction] = useState(false);
  const [productionStepMsg, setProductionStepMsg] = useState<string>("");
  const [selectedProdFileIndex, setSelectedProdFileIndex] = useState<number>(0);
  const [isProdZipping, setIsProdZipping] = useState(false);
  const [copiedProdFile, setCopiedProdFile] = useState(false);
  const [prodViewMode, setProdViewMode] = useState<"files" | "contract">("files");

  // Interactive mock form state
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  const activeScreen: PrototypeScreen | undefined =
    screens.find((s) => s.id === activeScreenId) || screens[0];

  const selectedFile = codeFiles[selectedFileIndex] || codeFiles[0];

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      toast.loading("Preparing starter ZIP package...", { id: "starter-zip" });

      let zip: any;
      try {
        const C: any = typeof JSZip === "function" ? JSZip : (JSZip as any).default || JSZip;
        zip = typeof C === "function" ? new C() : C;
      } catch {
        const dynamicZip: any = await import("jszip");
        const C2 = dynamicZip.default?.default || dynamicZip.default || dynamicZip;
        zip = new C2();
      }

      if (!zip || typeof zip.file !== "function") {
        const dynamicZip: any = await import("jszip");
        const C3 = dynamicZip.default?.default || dynamicZip.default || dynamicZip;
        zip = new C3();
      }

      // Add all AI generated code files
      if (codeFiles && codeFiles.length > 0) {
        for (const file of codeFiles) {
          if (file?.path && typeof file?.code === "string") {
            const cleanPath = file.path.replace(/^[/\\]+/, "");
            zip.file(cleanPath, file.code);
          }
        }
      } else {
        zip.file(
          "README.md",
          `# ${prototype?.title || "Project Prototype"}\n\n${prototype?.architectureSummary || "Interactive Prototype Codebase"}\n`,
        );
      }

      // Add run instructions as RUN_GUIDE.md
      const instructionsList = (runInstructions && runInstructions.length > 0
        ? runInstructions
        : ["npm install", "npm run dev"]
      )
        .map((inst, i) => `${i + 1}. \`${inst}\``)
        .join("\n");
      const runGuide = `# Quick Start Guide for ${prototype?.title || "Sarthi Prototype"}\n\n## Architecture Overview\n${prototype?.architectureSummary || "Interactive Prototype"}\n\n## Setup Instructions\n${instructionsList}\n\nGenerated by Sarthi AI Project Charioteer.`;
      zip.file("RUN_GUIDE.md", runGuide);

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const sanitizedName = (prototype?.title || "sarthi-prototype")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.setAttribute("download", `${sanitizedName}-starter.zip`);
      document.body.appendChild(a);
      a.click();

      window.setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 4000);

      toast.success("Starter ZIP downloaded! Check your downloads folder.", { id: "starter-zip" });
    } catch (err) {
      console.error("Failed to create ZIP package:", err);
      toast.error(
        "Failed to create ZIP package: " + (err instanceof Error ? err.message : String(err)),
        { id: "starter-zip" },
      );
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = async () => {
    if (!selectedFile) return;
    try {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopiedFile(true);
      toast.success(`Copied ${selectedFile.path} to clipboard!`);
      setTimeout(() => setCopiedFile(false), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeScreen?.inputForm) {
      const msg = activeScreen.inputForm.successMessage || "Action simulated successfully (200 OK)";
      setFormFeedback(msg);
      toast.success("Simulation update: " + msg);
      const logEntry = `[${new Date().toLocaleTimeString()}] Form submitted: ${JSON.stringify(formValues)}`;
      setSimulatedLogs((prev) => [logEntry, ...prev.slice(0, 5)]);
    }
  };

  const handleActionClick = (mockResponse: string, label: string) => {
    toast.success(`Triggered "${label}"!`);
    const logEntry = `[${new Date().toLocaleTimeString()}] Triggered "${label}": ${mockResponse}`;
    setSimulatedLogs((prev) => [logEntry, ...prev.slice(0, 5)]);
  };

  const handleStartProductionBuild = async () => {
    const effectiveProfile: StudentProfile = profile || {
      name: "Student Developer",
      fieldOfStudy: "Computer Science & Engineering",
      yearOfStudy: "Final Year",
      skills: ["Full Stack", "TypeScript", "Python"],
      interests: ["Software Architecture", "AI Systems"],
      ambition: "Build a production-grade software prototype",
      weeklyHours: 15,
      hasHardware: false,
    };
    try {
      setIsBuildingProduction(true);
      toast.info("Starting production manifest synthesis...");
      setProductionStepMsg("Phase 1: Establishing Shared Architectural Contract & Batch Schedule...");

      // Step 1: Manifest Generation
      const manifest = await generateProductionManifest({
        data: { profile, blueprint },
      });

      let currentFiles: PrototypeFile[] = [];
      const completedBatchIds: string[] = [];

      setProductionCodebase({
        manifest,
        files: currentFiles,
        completedBatchIds,
        isGenerating: true,
        currentBatchIndex: 0,
      });

      // Step 2: Batch Loop
      for (let i = 0; i < manifest.batches.length; i++) {
        const batch = manifest.batches[i];
        setProductionStepMsg(
          `Phase 2: Compiling ${batch.layerName} (${batch.targetFiles.length} files)...`
        );

        const batchFiles = await generateProductionBatch({
          data: {
            batch,
            manifestContract: {
              databaseContract: manifest.databaseContract,
              apiContract: manifest.apiContract,
              envContract: manifest.envContract,
            },
            blueprint,
            profile,
          },
        });

        currentFiles = [...currentFiles, ...batchFiles];
        completedBatchIds.push(batch.id);

        setProductionCodebase({
          manifest,
          files: currentFiles,
          completedBatchIds,
          isGenerating: i < manifest.batches.length - 1,
          currentBatchIndex: i + 1,
        });
      }

      setProductionStepMsg("✓ Full production-grade application successfully generated!");
    } catch (err) {
      console.error("Production build failed:", err);
      setProductionStepMsg(
        `Error during generation: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsBuildingProduction(false);
    }
  };

  const handleDownloadProductionZip = async () => {
    if (!productionCodebase) return;
    try {
      setIsProdZipping(true);
      toast.loading("Preparing production full-stack ZIP...", { id: "prod-zip" });

      let zip: any;
      try {
        const C: any = typeof JSZip === "function" ? JSZip : (JSZip as any).default || JSZip;
        zip = typeof C === "function" ? new C() : C;
      } catch {
        const dynamicZip: any = await import("jszip");
        const C2 = dynamicZip.default?.default || dynamicZip.default || dynamicZip;
        zip = new C2();
      }

      if (!zip || typeof zip.file !== "function") {
        const dynamicZip: any = await import("jszip");
        const C3 = dynamicZip.default?.default || dynamicZip.default || dynamicZip;
        zip = new C3();
      }

      // Add all completed files
      for (const file of productionCodebase.files) {
        const cleanPath = (file?.path || "file.txt").replace(/^[/\\]+/, "");
        zip.file(cleanPath, file?.code || "");
      }

      if (!productionCodebase.files.some((f) => f.path === "database/schema.sql")) {
        zip.file("database/schema.sql", productionCodebase.manifest.databaseContract);
      }
      if (!productionCodebase.files.some((f) => f.path === ".env.example")) {
        zip.file(".env.example", productionCodebase.manifest.envContract.join("\n"));
      }

      // Add architecture summary
      const archMarkdown = `# ${productionCodebase.manifest.title}
${productionCodebase.manifest.description}

## REST API Endpoints Contract
| Method | Path | Summary |
|---|---|---|
${productionCodebase.manifest.apiContract
  .map((ep) => `| \`${ep.method}\` | \`${ep.path}\` | ${ep.summary} |`)
  .join("\n")}

## Environment Variables
\`\`\`bash
${productionCodebase.manifest.envContract.join("\n")}
\`\`\`

## Database Schema (PostgreSQL DDL)
\`\`\`sql
${productionCodebase.manifest.databaseContract}
\`\`\`

Generated via Sarthi Manifest + Batch Loop Engine.
`;
      zip.file("ARCHITECTURE.md", archMarkdown);

      const blob = await zip.generateAsync({
        type: "blob",
        mimeType: "application/zip",
      });

      const url = window.URL.createObjectURL(blob);
      const sanitizedName = (productionCodebase.manifest.title || "production-app")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.setAttribute("download", `${sanitizedName}-production-fullstack.zip`);
      document.body.appendChild(a);
      a.click();

      window.setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        window.URL.revokeObjectURL(url);
      }, 4000);

      toast.success("Production codebase ZIP downloaded successfully!", { id: "prod-zip" });
    } catch (err) {
      console.error("Failed to download production zip:", err);
      toast.error(
        "Failed to download production zip: " + (err instanceof Error ? err.message : String(err)),
        { id: "prod-zip" },
      );
    } finally {
      setIsProdZipping(false);
    }
  };

  const handleCopyProdCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedProdFile(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedProdFile(false), 2000);
    } catch {
      toast.error("Failed to copy code to clipboard.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="panel q-rise overflow-hidden border-2 border-border">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-border bg-gradient-to-r from-accent/20 via-background to-accent/10 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mono-label rounded-full bg-accent px-2.5 py-0.5 font-bold text-accent-foreground">
                STAGE 7: PROTOTYPE FORGE
              </span>
              <span className="mono-label rounded-full border border-border bg-background px-2.5 py-0.5 font-bold text-foreground flex items-center gap-1.5 shadow-xs">
                <Palette className="size-3 text-accent" />
                <span>THEME: {themeConfig.name.toUpperCase()}</span>
              </span>
              {onSelectNewTheme && (
                <button
                  type="button"
                  onClick={onSelectNewTheme}
                  className="mono-label rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                  title="Choose a different theme with Sarthi"
                >
                  Change Theme →
                </button>
              )}
            </div>
            <h2 className="font-display mt-1 text-3xl font-extrabold">{prototype.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground italic">{prototype.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBackToBlueprint();
              }}
              className="btn-brutal bg-background text-xs sm:text-sm px-3.5 py-2 cursor-pointer"
            >
              ← Back to Blueprint
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleDownloadZip();
              }}
              disabled={isZipping}
              className="btn-brutal flex items-center gap-2 bg-accent px-4 py-2 text-xs sm:text-sm font-bold text-accent-foreground shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>📦</span>
              <span>{isZipping ? "Packaging ZIP..." : "Download Starter ZIP"}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b-2 border-border bg-sunken px-6">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🖥️</span>
            <span>Interactive Live Sandbox</span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">Live</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "code"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>💻</span>
            <span>Codebase Explorer</span>
            <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-mono">
              {codeFiles.length} files
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("production")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "production"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>⚡</span>
            <span>Production Hub (Manifest Engine)</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400 font-mono font-bold">
              {productionCodebase && productionCodebase.files.length > 0
                ? `${productionCodebase.files.length} Files`
                : "Batch Loop"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === "guide"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>🚀</span>
            <span>Local Setup & Guide</span>
          </button>
        </div>
      </div>

      {/* Architecture Context Banner */}
      <div className="panel border-2 border-border bg-sunken px-5 py-3.5 text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">🧭</span>
          <span className="font-bold text-foreground">Sarthi's Architecture Translation:</span>
          <span className="truncate">{prototype?.architectureSummary || "Interactive Prototype Sandbox"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {((blueprint?.stack || (blueprint as any)?.techStack || []) as any[]).slice(0, 4).map((tech: any) => {
            const name = typeof tech === "string" ? tech : tech?.name;
            if (!name) return null;
            return (
              <span
                key={name}
                className="mono-label rounded-md bg-background border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground"
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>

      {/* TAB 1: INTERACTIVE LIVE PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          {/* Showcase Control Toolbar: Device Viewport + Theme Switcher */}
          <div className="panel border-2 border-border bg-sunken px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Left: Device Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="mono-label font-bold text-xs text-foreground flex items-center gap-1.5 mr-1">
                <span>VIEWPORT:</span>
              </span>
              <div className="flex items-center rounded-lg border-2 border-border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => setDeviceMode("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "desktop"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop Full Screen"
                >
                  <Monitor className="size-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "tablet"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Tablet Viewport (768px)"
                >
                  <Tablet className="size-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceMode("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    deviceMode === "mobile"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile Viewport (390px)"
                >
                  <Smartphone className="size-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Right: Live Theme Selector Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <Palette className="size-3.5 text-accent" />
                <span className="mono-label font-bold text-xs text-foreground">THEME:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.keys(THEME_STYLES).map((key) => {
                  const t = THEME_STYLES[key]!;
                  const isCur = activeThemeId === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveThemeId(key)}
                      className={`mono-label px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${
                        isCur
                          ? "bg-accent text-accent-foreground border-accent shadow-xs scale-105"
                          : "bg-background border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {t.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>

              {onSelectNewTheme && (
                <button
                  onClick={onSelectNewTheme}
                  className="mono-label text-[10px] text-accent underline hover:opacity-80 ml-2"
                >
                  Regenerate Code in New Theme →
                </button>
              )}
            </div>
          </div>

          {/* Viewport Frame Container */}
          <div
            className={`mx-auto transition-all duration-300 ${
              deviceMode === "mobile"
                ? "max-w-[420px] p-3 rounded-[48px] border-[10px] border-zinc-900 bg-zinc-950 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] my-4"
                : deviceMode === "tablet"
                  ? "max-w-3xl rounded-2xl border-4 border-zinc-800 shadow-2xl overflow-hidden my-3"
                  : "w-full rounded-2xl overflow-hidden shadow-2xl"
            }`}
          >
            {/* Mobile Speaker Notch */}
            {deviceMode === "mobile" && (
              <div className="w-full flex justify-center py-2">
                <div className="h-4 w-28 rounded-full bg-zinc-800 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-zinc-700" />
                </div>
              </div>
            )}

            {/* Mock Browser Window Container with Active Theme Styling */}
            <div className={`overflow-hidden transition-all ${themeConfig.deviceFrame}`}>
              {/* Browser Window Chrome */}
              <div
                className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 ${themeConfig.browserBg}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className={`size-3 rounded-full ${themeConfig.browserDotRed}`} />
                    <div className={`size-3 rounded-full ${themeConfig.browserDotYellow}`} />
                    <div className={`size-3 rounded-full ${themeConfig.browserDotGreen}`} />
                  </div>
                  <div
                    className={`ml-2 flex items-center gap-2 rounded-md px-3 py-1 text-xs ${themeConfig.urlBar}`}
                  >
                    <span className="text-emerald-500">🔒</span>
                    <span className="truncate max-w-[180px] sm:max-w-none">
                      https://app.sarthi.live/{activeScreen?.id}
                    </span>
                  </div>
                </div>

                {/* In-App Screen Navigation Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {screens.map((screen) => (
                    <button
                      key={screen.id}
                      onClick={() => {
                        setActiveScreenId(screen.id);
                        setFormFeedback(null);
                      }}
                      className={`rounded-lg px-3 py-1 text-xs transition-all ${
                        activeScreenId === screen.id
                          ? themeConfig.activeNavTab
                          : themeConfig.inactiveNavTab
                      }`}
                    >
                      {screen.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Live View Body (Imbued with the chosen theme) */}
              {activeScreen && (
                <div className={`p-6 space-y-6 min-h-[500px] ${themeConfig.container}`}>
                  {/* Screen Header */}
                  <div className={`border-b pb-4 ${themeConfig.header}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${themeConfig.badgeTag}`}>
                        VIEW: {activeScreen.id.toUpperCase()}
                      </span>
                      <span className={`text-[11px] opacity-80 ${themeConfig.subtext}`}>
                        Theme: {themeConfig.name}
                      </span>
                    </div>
                    <h3 className={`text-2xl sm:text-3xl ${themeConfig.accentText}`}>
                      {activeScreen.title}
                    </h3>
                    <p className={`mt-1 text-sm ${themeConfig.subtext}`}>
                      {activeScreen.subtitle}
                    </p>
                  </div>

                  {/* Metrics Row (Styled with Selected Theme) */}
                  {activeScreen.metrics && activeScreen.metrics.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {activeScreen.metrics.map((m) => (
                        <div
                          key={m.label}
                          className={`p-4 space-y-1 transition-all ${themeConfig.innerCard}`}
                        >
                          <p className={`text-xs uppercase font-bold tracking-wider ${themeConfig.subtext}`}>
                            {m.label}
                          </p>
                          <div className="flex items-baseline justify-between pt-1">
                            <p className={themeConfig.metricValue}>{m.value}</p>
                            {m.change && (
                              <span className={`text-xs ${themeConfig.badgeTag}`}>
                                {m.change}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column: Interactive Input Form or Action Center */}
                    {activeScreen.inputForm ? (
                      <div className={`p-5 space-y-4 ${themeConfig.card}`}>
                        <div>
                          <h4 className={`text-lg font-bold ${themeConfig.accentText}`}>
                            {activeScreen.inputForm.title}
                          </h4>
                          <p className={`text-xs mt-0.5 ${themeConfig.subtext}`}>
                            {activeScreen.inputForm.description}
                          </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3">
                          {activeScreen.inputForm.fields.map((field) => (
                            <div key={field.name} className="space-y-1">
                              <label className={`text-xs font-semibold block ${themeConfig.subtext}`}>
                                {field.label}
                              </label>
                              {field.type === "select" ? (
                                <select
                                  value={formValues[field.name] || ""}
                                  onChange={(e) =>
                                    setFormValues({ ...formValues, [field.name]: e.target.value })
                                  }
                                  className={`w-full text-sm ${themeConfig.input}`}
                                >
                                  <option value="">Select an option...</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt} className="text-black">
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  rows={2}
                                  value={formValues[field.name] || ""}
                                  onChange={(e) =>
                                    setFormValues({ ...formValues, [field.name]: e.target.value })
                                  }
                                  placeholder={field.placeholder}
                                  className={`w-full text-sm ${themeConfig.input}`}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={formValues[field.name] || ""}
                                  onChange={(e) =>
                                    setFormValues({ ...formValues, [field.name]: e.target.value })
                                  }
                                  placeholder={field.placeholder}
                                  className={`w-full text-sm ${themeConfig.input}`}
                                />
                              )}
                            </div>
                          ))}

                          <button
                            type="submit"
                            className={`w-full py-2.5 text-sm font-bold ${themeConfig.button}`}
                          >
                            {activeScreen.inputForm.submitLabel}
                          </button>
                        </form>

                        {formFeedback && (
                          <div className={`p-3 text-xs rounded-lg border animate-fadeIn ${themeConfig.innerCard}`}>
                            <p className="font-bold flex items-center gap-1.5">
                              <span>✓</span> State Updated Successfully
                            </p>
                            <p className="mt-1 opacity-90">{formFeedback}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-5 space-y-4 ${themeConfig.card}`}>
                        <h4 className={`text-lg font-bold ${themeConfig.accentText}`}>
                          Interactive Simulation Triggers
                        </h4>
                        <p className={`text-xs ${themeConfig.subtext}`}>
                          Execute simulated workflow events, pipeline triggers, and async operations.
                        </p>
                        {activeScreen.actions && activeScreen.actions.length > 0 ? (
                          <div className="space-y-2">
                            {activeScreen.actions.map((act) => (
                              <div
                                key={act.id}
                                className={`flex items-center justify-between p-3 transition-all ${themeConfig.innerCard}`}
                              >
                                <div>
                                  <p className="text-sm font-bold">{act.label}</p>
                                  <p className={`text-xs ${themeConfig.subtext}`}>{act.description}</p>
                                </div>
                                <button
                                  onClick={() => handleActionClick(act.mockResponse, act.label)}
                                  className={`text-xs px-3 py-1.5 ${themeConfig.button}`}
                                >
                                  Run
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-xs italic ${themeConfig.subtext}`}>
                            No triggers defined for this view.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Right Column: Mock Data Stream & Activity */}
                    <div className="space-y-4">
                      {activeScreen.sampleItems && activeScreen.sampleItems.length > 0 && (
                        <div className={`p-5 space-y-3 ${themeConfig.card}`}>
                          <h4 className={`text-lg font-bold ${themeConfig.accentText}`}>
                            Live Data Feed Simulation
                          </h4>
                          <div className="space-y-2">
                            {activeScreen.sampleItems.map((item, idx) => (
                              <div
                                key={item.title + idx}
                                className={`flex items-start justify-between p-3 text-xs ${themeConfig.innerCard}`}
                              >
                                <div className="space-y-0.5">
                                  <p className="font-bold text-sm">{item.title}</p>
                                  <p className={themeConfig.subtext}>{item.detail}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-bold ${themeConfig.badgeTag}`}>
                                    {item.category}
                                  </span>
                                  <p className={`text-[10px] mt-1 font-mono ${themeConfig.subtext}`}>
                                    {item.status}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Action Trigger Buttons if InputForm exists */}
                      {activeScreen.inputForm && activeScreen.actions && activeScreen.actions.length > 0 && (
                        <div className={`p-4 space-y-2 ${themeConfig.innerCard}`}>
                          <p className={`text-xs font-bold uppercase tracking-wider ${themeConfig.subtext}`}>
                            Quick Simulation Triggers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {activeScreen.actions.map((act) => (
                              <button
                                key={act.id}
                                onClick={() => handleActionClick(act.mockResponse, act.label)}
                                className={`px-3 py-1 text-xs font-medium ${themeConfig.button}`}
                              >
                                ⚡ {act.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Simulated Activity Console Logs */}
                  {simulatedLogs.length > 0 && (
                    <div className={`p-4 space-y-2 rounded-xl border ${themeConfig.innerCard}`}>
                      <div className="flex items-center justify-between border-b pb-2 border-current/20">
                        <span className="text-xs flex items-center gap-1.5 font-mono font-bold">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVITY & WEBSOCKET LOGS ({themeConfig.name})
                        </span>
                        <button
                          onClick={() => setSimulatedLogs([])}
                          className="text-[11px] underline opacity-75 hover:opacity-100"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                        {simulatedLogs.map((log, i) => (
                          <p key={i} className="leading-relaxed opacity-90">
                            <span>▸</span> {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CODEBASE EXPLORER */}
      {activeTab === "code" && (
        <div className="panel overflow-hidden border-2 border-border shadow-2xl">
          <div className="grid lg:grid-cols-4 min-h-[580px]">
            {/* Left File Tree Sidebar */}
            <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-border bg-sunken p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="mono-label font-bold text-xs">PROJECT REPO FILES</span>
                <span className="mono-label text-[11px] text-muted-foreground">
                  {codeFiles.length} files
                </span>
              </div>
              <div className="space-y-1.5">
                {codeFiles.map((f, i) => (
                  <button
                    key={f.path}
                    onClick={() => {
                      setSelectedFileIndex(i);
                      setCopiedFile(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors ${
                      selectedFileIndex === i
                        ? "bg-foreground text-background font-bold shadow"
                        : "hover:bg-background text-foreground/80"
                    }`}
                  >
                    <span>{f.language === "python" ? "🐍" : f.language === "typescript" ? "⚛️" : f.language === "sql" ? "🗄️" : "📄"}</span>
                    <span className="truncate">{f.path}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 mt-6 border-t border-border text-center">
                <p className="text-[11px] text-muted-foreground">
                  Use the <strong>Download Starter ZIP</strong> button in the header toolbar to download all files.
                </p>
              </div>
            </div>

            {/* Right Code Display */}
            <div className="lg:col-span-3 flex flex-col bg-background">
              {selectedFile && (
                <>
                  {/* File Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-sunken px-5 py-3">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-sm font-bold">
                        <span>{selectedFile.path}</span>
                        <span className="mono-label text-[10px] rounded bg-background border px-1.5 py-0.5">
                          {selectedFile.language.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedFile.description}
                      </p>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="btn-brutal bg-background text-xs px-3 py-1.5 font-bold"
                    >
                      {copiedFile ? "✓ Copied to Clipboard!" : "📋 Copy Code"}
                    </button>
                  </div>

                  {/* Code Block */}
                  <div className="flex-1 p-4 font-mono text-xs bg-zinc-950 text-zinc-100 overflow-x-auto leading-relaxed max-h-[600px]">
                    <pre className="whitespace-pre">
                      <code>{selectedFile.code}</code>
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL SETUP & GUIDE */}
      {activeTab === "guide" && (
        <div className="space-y-6">
          <div className="panel border-2 border-border p-6 space-y-4">
            <div className="border-b border-border pb-3">
              <span className="mono-label text-accent font-bold">SARTHI RUNBOOK</span>
              <h3 className="font-display text-2xl font-extrabold">How to Run this Prototype Locally</h3>
              <p className="text-sm text-muted-foreground">
                Follow these terminal commands to boot your full-stack prototype on your local machine.
              </p>
            </div>

            <ol className="space-y-4">
              {runInstructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 rounded-xl border-2 border-border bg-sunken p-4"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent font-display text-sm font-extrabold text-accent-foreground">
                    {index + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-foreground">Step {index + 1}</p>
                    <p className="font-mono text-xs bg-background p-2 rounded border border-border text-accent">
                      {instruction}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Sarthi Guidance for College Guides */}
          <div className="panel border-2 border-border bg-gradient-to-r from-accent/10 via-background to-accent/5 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏹</span>
              <h4 className="font-display text-lg font-bold">
                How to Present this Prototype to Your College Guide
              </h4>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <span className="text-accent font-bold">1.</span>
                <span>
                  <strong>Demonstrate User Flow First:</strong> Open the <em>Interactive Live Sandbox</em> tab during your project review. Walk your guide through the mock screens to show the exact student/user experience before diving into technical details.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">2.</span>
                <span>
                  <strong>Show Architectural Grounding:</strong> Switch to the <em>Codebase Explorer</em> tab to prove that the database schemas, API routes, and components are already planned and scaffolded.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent font-bold">3.</span>
                <span>
                  <strong>Download Starter ZIP:</strong> Unzip the repo on your machine to begin implementing Phase 1 from your Blueprint roadmap!
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTION HUB (MANIFEST + BATCH LOOP) */}
      {activeTab === "production" && (
        <div className="space-y-6">
          {/* Top Control Panel */}
          <div className="panel border-2 border-border p-6 space-y-5 bg-gradient-to-r from-emerald-950/20 via-background to-teal-950/10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="mono-label rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                    ENTERPRISE ARCHITECTURE
                  </span>
                  <span className="mono-label text-muted-foreground text-xs">
                    Manifest + Batch Loop Engine
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
                  Production-Grade Full-Stack Repository
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl mt-1">
                  Compiles a fully interconnected 10-15 file production repository. The AI establishes an immutable database & API contract first, then topologically generates each layer to guarantee zero code conflicts or token cuts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartProductionBuild}
                  disabled={isBuildingProduction}
                  className="btn-brutal flex items-center gap-2 bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-950 shadow-md hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isBuildingProduction ? "⚙️" : "⚡"}</span>
                  <span>
                    {isBuildingProduction
                      ? "Assembling Layers..."
                      : productionCodebase
                      ? "Re-assemble Production App"
                      : "Manifest & Build Production App"}
                  </span>
                </button>

                {productionCodebase && productionCodebase.files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadProductionZip}
                    disabled={isProdZipping}
                    className="btn-brutal flex items-center gap-2 bg-accent px-4 py-2.5 text-xs sm:text-sm font-bold text-accent-foreground shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    <span>📦</span>
                    <span>{isProdZipping ? "Packaging ZIP..." : "Download Full Production ZIP"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Progress Bar and Step Tracker */}
            {(isBuildingProduction || productionStepMsg) && (
              <div className="rounded-xl border-2 border-border bg-sunken p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-foreground font-bold flex items-center gap-2">
                    {isBuildingProduction && <span className="animate-spin inline-block">⏳</span>}
                    {productionStepMsg}
                  </span>
                  {productionCodebase && (
                    <span className="text-accent font-bold">
                      {productionCodebase.completedBatchIds.length} / {productionCodebase.manifest.batches.length} Layers
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{
                      width: productionCodebase
                        ? `${Math.round((productionCodebase.completedBatchIds.length / productionCodebase.manifest.batches.length) * 100)}%`
                        : isBuildingProduction
                        ? "15%"
                        : "100%",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* If No Codebase Generated Yet: Architectural Walkthrough */}
          {!productionCodebase && !isBuildingProduction && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="panel border-2 border-border p-5 space-y-2 bg-sunken">
                <div className="flex items-center gap-2 font-display font-bold text-base text-foreground">
                  <span className="grid size-6 place-items-center rounded bg-accent text-accent-foreground text-xs font-mono">
                    1
                  </span>
                  <span>Manifest Contract Engine</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Establishes the single source of truth: PostgreSQL DDL schemas, REST API endpoints, and environment variables.
                </p>
              </div>

              <div className="panel border-2 border-border p-5 space-y-2 bg-sunken">
                <div className="flex items-center gap-2 font-display font-bold text-base text-foreground">
                  <span className="grid size-6 place-items-center rounded bg-accent text-accent-foreground text-xs font-mono">
                    2
                  </span>
                  <span>Topological Batch Compiler</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generates layers in dependency order (Database → FastAPI Backend → React Client → Docker Orchestration).
                </p>
              </div>

              <div className="panel border-2 border-border p-5 space-y-2 bg-sunken">
                <div className="flex items-center gap-2 font-display font-bold text-base text-foreground">
                  <span className="grid size-6 place-items-center rounded bg-accent text-accent-foreground text-xs font-mono">
                    3
                  </span>
                  <span>Production Ready Export</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Downloads a comprehensive multi-folder codebase with docker-compose, ready for local execution and deployment.
                </p>
              </div>
            </div>
          )}

          {/* When Codebase Exists: Explorer and Contract Viewer */}
          {productionCodebase && (
            <div className="space-y-4">
              {/* View Switcher Toggle */}
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProdViewMode("files")}
                    className={`btn-brutal text-xs px-3.5 py-1.5 font-bold cursor-pointer ${
                      prodViewMode === "files"
                        ? "bg-accent text-accent-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    📁 Production Files ({productionCodebase.files.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdViewMode("contract")}
                    className={`btn-brutal text-xs px-3.5 py-1.5 font-bold cursor-pointer ${
                      prodViewMode === "contract"
                        ? "bg-accent text-accent-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    📜 Shared Contracts (DB & APIs)
                  </button>
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                  {productionCodebase.completedBatchIds.length} Layers Compiled
                </div>
              </div>

              {/* FILES VIEW */}
              {prodViewMode === "files" && (
                <div className="panel border-2 border-border overflow-hidden grid lg:grid-cols-[280px_1fr] min-h-[500px]">
                  {/* File List */}
                  <div className="border-r-2 border-border bg-sunken p-3 space-y-1 overflow-y-auto max-h-[650px]">
                    <div className="px-2 py-1 text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      Repository Tree
                    </div>
                    {productionCodebase.files.map((file, idx) => {
                      const isSelected = idx === selectedProdFileIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedProdFileIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-accent text-accent-foreground font-bold shadow-sm"
                              : "hover:bg-background/80 text-foreground"
                          }`}
                        >
                          <span className="truncate">{file.path}</span>
                          <span className="mono-label text-[10px] opacity-75 shrink-0">
                            {file.language}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Code Editor Preview */}
                  <div className="flex flex-col bg-zinc-950">
                    {productionCodebase.files[selectedProdFileIndex] ? (
                      <>
                        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900 px-5 py-3 text-zinc-100">
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {productionCodebase.files[selectedProdFileIndex].path}
                            </span>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {productionCodebase.files[selectedProdFileIndex].description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleCopyProdCode(
                                productionCodebase.files[selectedProdFileIndex].code
                              )
                            }
                            className="btn-brutal bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1.5 text-zinc-200 border-zinc-700"
                          >
                            {copiedProdFile ? "✓ Copied" : "📋 Copy"}
                          </button>
                        </div>
                        <div className="flex-1 p-4 font-mono text-xs text-zinc-100 overflow-x-auto leading-relaxed max-h-[600px]">
                          <pre className="whitespace-pre">
                            <code>{productionCodebase.files[selectedProdFileIndex].code}</code>
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center text-sm text-zinc-500 font-mono">
                        Select a file from the repository tree to inspect.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CONTRACT VIEW */}
              {prodViewMode === "contract" && (
                <div className="space-y-6">
                  {/* API Endpoints Contract */}
                  <div className="panel border-2 border-border p-5 space-y-3">
                    <h4 className="font-display text-lg font-bold flex items-center gap-2">
                      <span>🔗</span>
                      <span>REST API Contract ({productionCodebase.manifest.apiContract.length} Endpoints)</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border border-border">
                        <thead className="bg-sunken text-muted-foreground uppercase font-mono text-[10px]">
                          <tr>
                            <th className="px-3 py-2 border-b border-border">Method</th>
                            <th className="px-3 py-2 border-b border-border">Path</th>
                            <th className="px-3 py-2 border-b border-border">Summary</th>
                            <th className="px-3 py-2 border-b border-border">Payload Models</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {productionCodebase.manifest.apiContract.map((ep, i) => (
                            <tr key={i} className="hover:bg-sunken/50">
                              <td className="px-3 py-2 font-mono font-bold">
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] ${
                                    ep.method === "GET"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : ep.method === "POST"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : ep.method === "DELETE"
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {ep.method}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-foreground font-bold">
                                {ep.path}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{ep.summary}</td>
                              <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                                {ep.requestBody ? `Req: ${ep.requestBody}` : "Req: None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Database Schema DDL Contract */}
                  <div className="panel border-2 border-border p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-display text-lg font-bold flex items-center gap-2">
                        <span>🗄️</span>
                        <span>Database DDL Schema (PostgreSQL)</span>
                      </h4>
                      <button
                        onClick={() => handleCopyProdCode(productionCodebase.manifest.databaseContract)}
                        className="btn-brutal text-xs px-3 py-1 font-bold bg-background"
                      >
                        📋 Copy DDL
                      </button>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-lg font-mono text-xs text-zinc-100 overflow-x-auto max-h-[350px]">
                      <pre className="whitespace-pre">
                        <code>{productionCodebase.manifest.databaseContract}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Environment Variables Contract */}
                  <div className="panel border-2 border-border p-5 space-y-3">
                    <h4 className="font-display text-lg font-bold flex items-center gap-2">
                      <span>⚙️</span>
                      <span>Environment Variables Template (.env.example)</span>
                    </h4>
                    <div className="bg-zinc-950 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
                      <pre className="whitespace-pre">
                        <code>{productionCodebase.manifest.envContract.join("\n")}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
