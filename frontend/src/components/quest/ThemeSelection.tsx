import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mascot } from "./Mascot";
import { Sparkles, Palette, ArrowLeft, Check, Wand2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Blueprint, StudentProfile } from "@/lib/types";
import {
  suggestThemes,
  generateProjectThemedSuggestions,
  type AiThemeSuggestion,
} from "@/lib/quest.functions";

export type ThemeOption = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  badge: string;
  palette: string[];
  cardPreviewClass: string;
  sampleMetric: { label: string; value: string; badge: string };
  themeRationale?: string;
};

export function ThemeSelection({
  blueprint,
  profile,
  onSelectTheme,
  onBack,
  isGenerating = false,
}: {
  blueprint: Blueprint;
  profile: StudentProfile | null;
  onSelectTheme: (themeId: string) => void;
  onBack: () => void;
  isGenerating?: boolean;
}) {
  // Generate domain-tailored suggestions immediately on initial state so themes are NEVER identical across projects
  const initialProjectThemes = generateProjectThemedSuggestions(blueprint, profile);

  const [aiSuggestions, setAiSuggestions] = useState<AiThemeSuggestion[]>(initialProjectThemes);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    initialProjectThemes[0]?.id || "project-theme-1",
  );
  const [customTheme, setCustomTheme] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  const doSuggestThemes = useServerFn(suggestThemes);

  // Automatically fetch AI suggestions in background on mount if not already enriched
  useEffect(() => {
    let isSubscribed = true;
    const fetchBespokeThemes = async () => {
      if (!blueprint) return;
      setIsSuggesting(true);
      try {
        const res = await doSuggestThemes({
          data: { profile: profile || ({} as any), blueprint },
        });
        if (isSubscribed && res?.suggestions && res.suggestions.length > 0) {
          setAiSuggestions(res.suggestions);
          setSelectedThemeId(res.suggestions[0].id);
          setIsCustom(false);
        }
      } catch (err) {
        console.warn("Using smart domain-tailored theme suggestions for project:", err);
      } finally {
        if (isSubscribed) setIsSuggesting(false);
      }
    };

    fetchBespokeThemes();
    return () => {
      isSubscribed = false;
    };
  }, [blueprint.title]);

  const handleRerollThemes = async () => {
    if (!blueprint) return;
    setIsSuggesting(true);
    try {
      const res = await doSuggestThemes({
        data: { profile: profile || ({} as any), blueprint },
      });
      if (res?.suggestions && res.suggestions.length > 0) {
        setAiSuggestions(res.suggestions);
        setSelectedThemeId(res.suggestions[0].id);
        setIsCustom(false);
        toast.success(`Sarthi designed fresh bespoke themes for "${blueprint.title}"!`);
      }
    } catch (err) {
      console.error("Failed to regenerate themes:", err);
      toast.error("Could not reach AI model. Using tailored project themes.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectedTheme =
    aiSuggestions.find((t) => t.id === selectedThemeId) || aiSuggestions[0] || initialProjectThemes[0];

  const handleProceed = () => {
    if (isCustom && customTheme.trim()) {
      onSelectTheme(customTheme.trim());
    } else if (selectedTheme) {
      const richThemeDesc = `${selectedTheme.name} (${selectedTheme.tagline} — colors: ${selectedTheme.palette.join(", ")})`;
      onSelectTheme(richThemeDesc);
    } else {
      onSelectTheme("modern-minimal");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sarthi Header Banner - Only ONE Back button */}
      <div className="panel q-rise overflow-hidden border-2 border-border bg-gradient-to-r from-accent/20 via-background to-accent/10 p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="q-pop shrink-0">
              <Mascot className="size-16 sm:size-20" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mono-label rounded-full bg-accent px-3 py-1 font-bold text-accent-foreground">
                  STAGE 6: THEME SELECTION
                </span>
                <span className="mono-label text-muted-foreground">
                  bespoke visual soul
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black">
                Sarthi asks: <span className="text-accent">"What is the visual soul of this build?"</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Themes formulated specifically for{" "}
                <span className="font-bold text-foreground">"{blueprint.title}"</span>. Sarthi analyzed your project's domain, target users, and technical architecture to recommend distinctive visual identities that captivate college evaluators and hackathon judges.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBack();
              }}
              className="btn-brutal flex items-center gap-2 bg-background px-4 py-2.5 text-xs sm:text-sm cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sarthi's Bespoke Themes Section - Formulated specifically for this finalized project */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-7 place-items-center rounded-lg bg-accent text-accent-foreground shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-black text-foreground">
                Themes Formulated Specifically for "{blueprint.title}"
              </h3>
              <p className="mono-label text-[10px] text-muted-foreground">
                Target users: {blueprint.overview?.targetUsers || "General"} · Architecture: {blueprint.stack?.map((s) => s.name).slice(0, 3).join(", ")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRerollThemes}
            disabled={isSuggesting}
            className="btn-brutal flex items-center gap-1.5 bg-background px-3.5 py-1.5 text-xs font-bold text-foreground cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isSuggesting ? "animate-spin text-accent" : ""}`} />
            <span>{isSuggesting ? "Synthesizing..." : "Reroll AI Themes"}</span>
          </button>
        </div>

        {/* 3 Tailored Project Theme Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {aiSuggestions.map((theme, idx) => {
            const isSelected = !isCustom && selectedThemeId === theme.id;
            return (
              <div
                key={theme.id + idx}
                onClick={() => {
                  setSelectedThemeId(theme.id);
                  setIsCustom(false);
                }}
                className={`panel cursor-pointer p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-accent bg-accent/15 shadow-[0_5px_0_0_var(--accent)] scale-[1.02]"
                    : "border-2 border-border bg-card/60 hover:border-accent hover:bg-card"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm">
                    <Check className="size-4 stroke-[3]" />
                  </div>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="mono-label rounded-md bg-accent/20 border border-accent/40 px-2 py-0.5 text-[9px] font-bold text-accent">
                      {theme.badge || `RECOMMENDED #${idx + 1}`}
                    </span>
                  </div>

                  <h4 className="font-display text-xl font-extrabold">{theme.name}</h4>
                  <p className="text-xs font-semibold text-accent leading-snug">{theme.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {theme.description}
                  </p>

                  {/* Sarthi's Project Rationale */}
                  {theme.themeRationale && (
                    <div className="rounded-lg border border-border bg-sunken p-2.5 text-[11px] leading-relaxed mt-2">
                      <strong className="text-accent block font-bold mb-0.5">Why Sarthi recommends this:</strong>
                      <span className="text-foreground/90">{theme.themeRationale}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-border/70 space-y-2">
                  {/* Palette Color Swatches */}
                  <div className="flex items-center gap-2">
                    <span className="mono-label text-[9px]">Palette:</span>
                    <div className="flex items-center gap-1.5">
                      {theme.palette.map((color, i) => (
                        <span
                          key={i}
                          className="size-4.5 rounded-full border border-border shadow-xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Best for:</strong> {theme.bestFor}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Theme Showcase Simulator */}
      <div className="panel border-2 border-border bg-sunken p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-accent" />
            <span className="mono-label font-bold text-foreground">LIVE THEME SHOWCASE SIMULATOR</span>
          </div>
          <span className="mono-label text-accent font-semibold">
            Active: {isCustom ? `Custom: "${customTheme || "Your Aesthetic"}"` : selectedTheme?.name}
          </span>
        </div>

        {/* Live Mock Cards Styled in the chosen theme */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Box 1: Theme Identity */}
          <div className="p-4 rounded-xl border-2 border-border bg-background shadow-sm space-y-1">
            <span className="mono-label text-[10px] uppercase font-bold text-accent">
              {isCustom ? "CUSTOM DESIGN" : selectedTheme?.badge || "ACTIVE THEME"}
            </span>
            <p className="font-display text-lg font-black text-foreground">
              {isCustom ? (customTheme || "Custom Aesthetic") : selectedTheme?.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {isCustom ? "Custom guidelines supplied directly to code generator." : selectedTheme?.description}
            </p>
          </div>

          {/* Box 2: Domain Sample Metric */}
          <div className="p-4 rounded-xl border-2 border-border bg-background shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="mono-label text-[10px] uppercase text-muted-foreground">
                {blueprint.mvpFeatures?.[0]?.name ? `${blueprint.mvpFeatures[0].name.slice(0, 16)} STATUS` : "SYSTEM TELEMETRY"}
              </span>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent border border-accent/30">
                ACTIVE
              </span>
            </div>
            <p className="font-display text-2xl font-black text-foreground mt-1">
              99.8% Accurate
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Derived for {blueprint.overview?.targetUsers || "evaluators"}
            </p>
          </div>

          {/* Box 3: Palette & Sample Action */}
          <div className="p-4 rounded-xl border-2 border-border bg-background shadow-sm flex flex-col justify-between">
            <span className="mono-label text-[10px] uppercase text-muted-foreground">HARMONY PALETTE</span>
            <div className="flex items-center gap-1.5 my-1.5">
              {!isCustom &&
                selectedTheme?.palette?.map((hex, idx) => (
                  <span
                    key={idx}
                    className="size-5 rounded-full border border-black/20 shadow-xs"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              {isCustom && <span className="text-xs font-mono text-accent">Dynamic Generative Palette</span>}
            </div>
            <div className="rounded-md bg-accent/20 py-1 px-2.5 text-center text-xs font-bold text-accent border border-accent/30">
              Interactive Component Preview
            </div>
          </div>
        </div>
      </div>

      {/* Custom Theme Option Card - ONE button to set active style */}
      <div
        onClick={() => setIsCustom(true)}
        className={`panel cursor-pointer p-5 transition-all relative overflow-hidden ${
          isCustom
            ? "border-2 border-accent bg-accent/10 shadow-[0_4px_0_0_var(--accent)]"
            : "border-2 border-dashed border-border hover:border-foreground/50 hover:bg-sunken"
        }`}
      >
        {isCustom && (
          <div className="absolute top-3 right-3 grid size-6 place-items-center rounded-full bg-accent text-accent-foreground shadow-sm">
            <Check className="size-4 stroke-[3]" />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <span className="font-display text-base font-bold">Have a Specific Visual Style in Mind?</span>
            <span className="mono-label rounded bg-sunken border border-border px-2 py-0.5 text-[9px]">
              CUSTOM PROMPT
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Type any visual style, theme, or reference aesthetic for "{blueprint.title}" (e.g. "Apple VisionOS Frosted Dark Mode", "Terminal Matrix Green", "Stripe Clean Fintech"):
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customTheme}
              onChange={(e) => {
                setCustomTheme(e.target.value);
                setIsCustom(true);
              }}
              onFocus={() => setIsCustom(true)}
              placeholder="e.g., Clinical High-Contrast Dark Mode with Cyan Highlights"
              className="flex-1 rounded-xl border-2 border-border bg-background px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (customTheme.trim()) {
                  setIsCustom(true);
                  toast.success(`Active theme set to: "${customTheme.trim()}"`);
                }
              }}
              disabled={isGenerating || !customTheme.trim()}
              className="btn-brutal bg-accent px-5 py-2.5 text-xs font-bold text-accent-foreground shrink-0 cursor-pointer disabled:opacity-50"
            >
              Set Custom Aesthetic
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Floating Proceed Bar - The ONE AND ONLY Manifest Prototype Button */}
      <div className="panel border-2 border-accent bg-background p-4 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-accent animate-pulse" />
          <div>
            <p className="text-xs sm:text-sm font-bold">
              Selected Theme:{" "}
              <span className="text-accent underline font-extrabold">
                {isCustom ? (customTheme.trim() || "Custom Aesthetic") : selectedTheme?.name}
              </span>
            </p>
            <p className="mono-label text-[10px] text-muted-foreground hidden sm:block">
              Sarthi will synthesize interactive prototype mockups and production starter files styled in this identity.
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleProceed}
            disabled={isGenerating}
            className="btn-brutal flex items-center gap-2 bg-accent px-6 py-3 font-extrabold text-accent-foreground shadow-lg hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="size-4" />
            <span>
              {isGenerating
                ? "Manifesting Prototype with Sarthi AI..."
                : `Manifest Prototype in ${isCustom && customTheme.trim() ? "Custom Style" : selectedTheme?.name} →`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
