import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BlueprintView } from "@/components/quest/BlueprintView";
import { Discovery } from "@/components/quest/Discovery";
import { FeasibilityPanel } from "@/components/quest/FeasibilityPanel";
import { IdeaDeck } from "@/components/quest/IdeaDeck";
import { Mascot, SparkLine } from "@/components/quest/Mascot";
import { Mentor } from "@/components/quest/Mentor";
import { MentorDock } from "@/components/quest/MentorDock";
import { PlanChangeBar } from "@/components/quest/PlanChangeBar";
import { ProfileCard } from "@/components/quest/ProfileCard";
import { PrototypeSandbox } from "@/components/quest/PrototypeSandbox";
import { ThemeSelection } from "@/components/quest/ThemeSelection";
import { QuestHud } from "@/components/quest/QuestHud";
import { QuestScrollPanel } from "@/components/quest/QuestScroll";
import { useJourney } from "@/lib/journey";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogOut, Sparkles, ShieldCheck } from "lucide-react";
import {
  analyzeFeasibility,
  buildProfile,
  generateBlueprint,
  generateIdeas,
  generatePrototype,
  refineIdeas,
  summarizeBlueprint,
  updateBlueprint,
} from "@/lib/quest.functions";
import type { ProjectIdea, StudentProfile } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sarthi — AI Final-Year Project Planner for Students" },
      {
        name: "description",
        content:
          "Sarthi: Turn your skills, interests and goals into a matched final-year project idea, a feasibility check and a full build blueprint — guided by an AI charioteer and mentor.",
      },
      { property: "og:title", content: "Sarthi — AI Final-Year Project Planner" },
      {
        property: "og:description",
        content:
          "Discover, score, refine and plan your final-year project with Sarthi — your AI architect and mentor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Loader({ label }: { label: string }) {
  return (
    <div className="panel q-pop flex flex-col items-center gap-4 px-8 py-14 text-center">
      <Mascot className="size-20" />
      <p className="font-display text-xl font-extrabold">{label}</p>
      <div className="h-3 w-56 overflow-hidden rounded-full border-2 border-foreground bg-sunken">
        <div className="q-shine h-full w-full bg-primary" />
      </div>
      <p className="mono-label">this takes a few seconds…</p>
    </div>
  );
}

function LandingNavbar({
  onOpenAuth,
}: {
  onOpenAuth: (tab: "login" | "register") => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b-2 border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Mascot className="size-10 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-tight">Sarthi</span>
              <span className="mono-label rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground border border-accent/30">
                सारथी
              </span>
            </div>
            <p className="mono-label text-[11px] text-muted-foreground hidden sm:block">
              AI Project Charioteer & Architect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/20 px-3 py-1 text-xs">
                <span className="grid size-6 place-items-center rounded-full bg-accent font-black text-accent-foreground text-xs shadow-sm">
                  {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                </span>
                <span className="font-bold text-foreground max-w-[120px] truncate sm:max-w-none">
                  {user.fullName || user.email.split("@")[0]}
                </span>
                <span className="mono-label text-[10px] text-muted-foreground hidden md:inline">
                  {user.isGuest ? "· Guest" : "· Student"}
                </span>
              </div>
              <button
                onClick={logout}
                className="mono-label flex items-center gap-1.5 rounded-full border-2 border-foreground bg-destructive/15 px-3 py-1.5 text-xs font-bold text-foreground transition-all hover:bg-destructive hover:text-destructive-foreground shadow-[2px_2px_0_0_var(--foreground)]"
                title="Log Out of Sarthi"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth("login")}
                className="mono-label rounded-full border-2 border-border px-3.5 py-1.5 text-xs font-bold transition-all hover:bg-sunken hover:border-foreground"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="pop-btn bg-accent px-4 py-1.5 font-display text-xs font-black text-accent-foreground shadow-[2px_2px_0_0_var(--foreground)]"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function Intro({
  onStart,
  onOpenAuth,
}: {
  onStart: () => void;
  onOpenAuth: (tab: "login" | "register") => void;
}) {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="mx-auto max-w-6xl px-1 py-8 sm:py-12">
      {/* Top Banner on Landing Page */}
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left Hero Column */}
        <div className="text-left">
          <div className="mb-4 flex items-center gap-3">
            <div className="q-pop w-fit">
              <Mascot className="size-16 sm:size-20" />
            </div>
            <div>
              <span className="mono-label rounded-full bg-sunken px-3 py-1 border border-border">
                final-year project charioteer
              </span>
              {isAuthenticated && user && (
                <p className="mt-1.5 text-xs font-bold text-success flex items-center gap-1">
                  <span className="size-2 rounded-full bg-success animate-pulse inline-block" />
                  Signed in as {user.fullName || user.email}
                </p>
              )}
            </div>
          </div>

          <h1 className="q-rise font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl">
            Stop guessing your
            <span className="text-accent"> final-year project.</span>
          </h1>

          <SparkLine className="mt-3 h-8 w-64" />

          <p
            className="q-rise mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            Answer a few short questions. Get project ideas scored around your skills, time and career
            goal — then an honest reality check, a full build plan, and an AI mentor who updates the
            plan as you talk to it.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onStart}
              className="pop-btn q-pop bg-accent px-8 py-3.5 font-display text-base font-extrabold text-accent-foreground shadow-[4px_4px_0_0_var(--foreground)]"
              style={{ animationDelay: "220ms" }}
            >
              {isAuthenticated ? "Launch Project Discovery →" : "Get started →"}
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => onOpenAuth("login")}
                className="mono-label rounded-xl border-2 border-border bg-background px-5 py-3 text-xs font-bold transition-all hover:bg-sunken hover:border-foreground"
              >
                Already have an account? Sign In
              </button>
            )}
          </div>
        </div>

        {/* Right Auth Column: Embedded Auth Card right on the landing page */}
        <div className="w-full">
          <AuthCard onStartJourney={onStart} />
        </div>
      </div>

      {/* 3 Step Features */}
      <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
        {[
          [
            "01 · Authenticate & Discover",
            "Sign into your student account and answer a few quick questions to capture your skills, interests, and constraints.",
          ],
          [
            "02 · Scored Project Ideas",
            "Get tailored final-year capstone ideas ranked with multi-dimensional match scores and difficulty estimates.",
          ],
          [
            "03 · Build Plan & AI Mentor",
            "Unlock an honest reality check, complete system blueprint, and an interactive Krishna charioteer mentor.",
          ],
        ].map(([tag, text], i) => (
          <div
            key={tag}
            className="panel q-rise px-5 py-4 border-2 border-foreground"
            style={{ animationDelay: `${300 + i * 90}ms` }}
          >
            <span className="mono-label font-bold text-accent">{tag}</span>
            <p className="mt-1.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { state, update, award, reset, hydrated } = useJourney();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [scrollBusy, setScrollBusy] = useState(false);
  const [askSeed, setAskSeed] = useState<{ text: string; n: number } | null>(null);
  const [dockOpen, setDockOpen] = useState(false);

  // Strict session clearance & auth guard:
  // If not authenticated or after every session clearance, strictly reset and lock to landing page
  useEffect(() => {
    if (hydrated && !isLoading && !isAuthenticated) {
      if (state.stage !== "intro") {
        reset();
      }
    }
  }, [hydrated, isLoading, isAuthenticated, state.stage, reset]);

  const openAuth = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleStartJourney = () => {
    if (!isAuthenticated) {
      openAuth("login");
      toast.info("Please sign in or create an account to access the project discovery quest.");
    } else {
      update({ stage: "discovery" });
    }
  };

  const doBuildProfile = useServerFn(buildProfile);
  const doGenerateIdeas = useServerFn(generateIdeas);
  const doRefineIdeas = useServerFn(refineIdeas);
  const doFeasibility = useServerFn(analyzeFeasibility);
  const doBlueprint = useServerFn(generateBlueprint);
  const doUpdateBlueprint = useServerFn(updateBlueprint);
  const doSummarize = useServerFn(summarizeBlueprint);
  const doGeneratePrototype = useServerFn(generatePrototype);

  const selected = state.ideas.find((i) => i.id === state.selectedIdeaId) ?? null;

  const fail = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "Something went wrong.";
    toast.error(msg.includes("402") ? "The AI workspace is out of credits." : msg);
  };

  async function handleDiscovery(raw: StudentProfile) {
    setBusy("Building your profile…");
    try {
      const profile = await doBuildProfile({ data: { raw } });
      update({ profile, stage: "profile" });
      award(200, "explorer");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerateIdeas(profile: StudentProfile) {
    setBusy("Finding project ideas for you…");
    try {
      const ideas = await doGenerateIdeas({
        data: { profile, feedback: state.feedbackLog, exclude: state.ideas.map((i) => i.name) },
      });
      update({ ideas, stage: "ideas", selectedIdeaId: null });
      award(150, "strategist");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  const effectiveProfile: StudentProfile = state.profile || {
    name: user?.fullName || "Student Developer",
    fieldOfStudy: "Computer Science & Engineering",
    yearOfStudy: "Final Year",
    skills: ["Full Stack", "TypeScript", "Python"],
    interests: ["Software Architecture", "AI Systems"],
    ambition: "Build a production-grade software prototype",
    weeklyHours: 15,
    hasHardware: false,
  };

  async function handleFeedback(idea: ProjectIdea, action: string) {
    const prof = state.profile || effectiveProfile;
    setBusy("Updating ideas from your feedback…");
    try {
      const feedback = [...state.feedbackLog, `${action} (re: ${idea.name})`];
      const ideas = await doRefineIdeas({
        data: { profile: prof, idea, action, feedback: state.feedbackLog },
      });
      update({ ideas, feedbackLog: feedback, selectedIdeaId: null, profile: prof });
      award(60, "tinkerer");
      toast.success("New ideas based on your feedback.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSelect(idea: ProjectIdea) {
    const prof = state.profile || effectiveProfile;
    setBusy("Running the reality check…");
    update({ selectedIdeaId: idea.id });
    try {
      const feasibility = await doFeasibility({ data: { profile: prof, idea } });
      update({ feasibility, stage: "feasibility", selectedIdeaId: idea.id, profile: prof });
      award(150, "realist");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleDirection(direction: string, label: string) {
    if (!selected) return;
    const prof = state.profile || effectiveProfile;
    setBusy("Writing your full project plan…");
    try {
      const blueprint = await doBlueprint({
        data: {
          profile: prof,
          idea: selected,
          feasibility: state.feasibility,
          feedback: state.feedbackLog,
          direction,
        },
      });
      update({
        blueprint,
        profile: prof,
        stage: "blueprint",
        feedbackLog: [...state.feedbackLog, `chose the ${label} direction`],
      });
      award(300, "architect");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSummon() {
    if (!state.blueprint) return;
    const prof = state.profile || effectiveProfile;
    setScrollBusy(true);
    try {
      const scroll = await doSummarize({
        data: { profile: prof, blueprint: state.blueprint },
      });
      update({ scroll, profile: prof });
      award(80, "loremaster");
    } catch (e) {
      fail(e);
    } finally {
      setScrollBusy(false);
    }
  }

  function ask(text: string) {
    setDockOpen(true);
    setAskSeed({ text, n: Date.now() });
  }

  async function handleApply(request: string) {
    if (!state.blueprint || applying) return;
    const prof = state.profile || effectiveProfile;
    setApplying(true);
    try {
      const res = await doUpdateBlueprint({
        data: { profile: prof, blueprint: state.blueprint, request },
      });
      update({
        blueprint: res.blueprint,
        profile: prof,
        scroll: null,
        changeLog: [...state.changeLog, res.changeSummary],
      });
      award(120, "shipwright");
      toast.success(res.changeSummary);
    } catch (e) {
      fail(e);
    } finally {
      setApplying(false);
    }
  }

  async function handleGeneratePrototype(selectedTheme?: string) {
    if (!state.blueprint) {
      toast.error("Please create a blueprint first before generating a prototype.");
      return;
    }
    const theme = selectedTheme || state.selectedTheme || "neo-brutalism";
    setBusy(`Manifesting your ${theme} software prototype & codebase with Sarthi AI...`);
    try {
      const prototype = await doGeneratePrototype({
        data: { profile: effectiveProfile, blueprint: state.blueprint, theme },
      });
      update({
        prototype,
        profile: effectiveProfile,
        selectedTheme: theme,
        stage: "prototype",
      });
      award(350, "builder");
      toast.success(`Interactive prototype in ${theme} style ready!`);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  const handleStageNavigation = (targetStage: any) => {
    if (targetStage === state.stage) return;
    if (targetStage === "discovery") {
      update({ stage: "discovery" });
      return;
    }
    if (targetStage === "profile") {
      if (!state.profile) {
        toast.info("Please complete the project discovery questions first.");
        return;
      }
      update({ stage: "profile" });
      return;
    }
    if (targetStage === "ideas") {
      if (!state.ideas || state.ideas.length === 0) {
        toast.info("Please complete discovery to generate your tailored project ideas.");
        return;
      }
      update({ stage: "ideas" });
      return;
    }
    if (targetStage === "feasibility") {
      if (!state.feasibility) {
        toast.info("Please choose a project idea first to run the reality check.");
        return;
      }
      update({ stage: "feasibility" });
      return;
    }
    if (targetStage === "blueprint") {
      if (!state.blueprint) {
        toast.info("Please complete the reality check first to build your blueprint.");
        return;
      }
      update({ stage: "blueprint" });
      return;
    }
    if (targetStage === "theme") {
      if (!state.blueprint) {
        toast.info("Please create your blueprint before choosing a theme.");
        return;
      }
      update({ stage: "theme" });
      return;
    }
    if (targetStage === "prototype") {
      if (!state.prototype) {
        if (state.blueprint) {
          update({ stage: "theme" });
          toast.info("Select a design theme first to generate your prototype.");
        } else {
          toast.info("Please create your project blueprint first.");
        }
        return;
      }
      update({ stage: "prototype" });
      return;
    }
    update({ stage: targetStage });
  };

  if (!hydrated) return null;

  // Strict authentication guard: only render quest pipeline if user is verified and authenticated
  const showQuest = isAuthenticated && state.stage !== "intro";

  return (
    <div className="min-h-screen">
      {!showQuest && <LandingNavbar onOpenAuth={openAuth} />}

      {showQuest && (
        <QuestHud
          stage={state.stage}
          badges={state.badges}
          onReset={reset}
          onSelectStage={handleStageNavigation}
        />
      )}

      <main className="mx-auto max-w-6xl px-5 py-8">
        {!showQuest && (
          <Intro onStart={handleStartJourney} onOpenAuth={openAuth} />
        )}

        {showQuest && busy && (
          <div className="py-6">
            <Loader label={busy} />
          </div>
        )}

        {showQuest && !busy && state.stage === "discovery" && (
          <Discovery
            busy={false}
            onComplete={handleDiscovery}
            initialName={user?.fullName || ""}
          />
        )}

        {showQuest && !busy && state.stage === "profile" && state.profile && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <ProfileCard p={state.profile} />
            <div className="panel q-rise flex flex-col justify-center gap-4 px-6 py-8">
              <h2 className="font-display text-3xl font-extrabold">Your profile is ready.</h2>
              <p className="text-sm text-muted-foreground">
                Everything from here — ideas, scoring, the reality check, your plan and your mentor —
                is based on this profile.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleGenerateIdeas(state.profile!)}
                  className="pop-btn bg-accent px-6 py-3 font-display text-base font-extrabold text-accent-foreground"
                >
                  Show my project ideas
                </button>
                <button
                  onClick={() => update({ stage: "discovery" })}
                  className="mono-label rounded-full border-2 border-border px-4 py-2"
                >
                  edit answers
                </button>
              </div>
            </div>
          </div>
        )}

        {showQuest && !busy && state.stage === "ideas" && state.profile && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <ProfileCard p={state.profile} compact />
            </div>
            <IdeaDeck
              ideas={state.ideas}
              selectedId={state.selectedIdeaId}
              busy={false}
              onSelect={handleSelect}
              onFeedback={handleFeedback}
              onReroll={() => handleGenerateIdeas(state.profile!)}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "feasibility" && selected && state.feasibility && (
          <FeasibilityPanel
            idea={selected}
            f={state.feasibility}
            busy={false}
            onChoose={handleDirection}
            onBack={() => update({ stage: "ideas" })}
          />
        )}

        {showQuest && !busy && state.stage === "blueprint" && state.blueprint && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-extrabold">Your build plan</h2>
              </div>
            </div>
            <QuestScrollPanel
              scroll={state.scroll}
              busy={scrollBusy}
              onSummon={() => void handleSummon()}
              onAsk={ask}
            />
            <PlanChangeBar busy={applying} onSubmit={(req) => void handleApply(req)} />
            <BlueprintView
              b={state.blueprint}
              changeLog={state.changeLog}
              onGeneratePrototype={() => update({ stage: "theme" })}
              isGeneratingPrototype={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "theme" && state.blueprint && (
          <div className="space-y-6">
            <ThemeSelection
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              onSelectTheme={(theme) => {
                award(100, "stylist");
                void handleGeneratePrototype(theme);
              }}
              onBack={() => {
                setBusy(null);
                update({ stage: "blueprint" });
              }}
              isGenerating={Boolean(busy)}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}

        {showQuest && !busy && state.stage === "prototype" && state.prototype && state.blueprint && (
          <div className="space-y-6">
            <PrototypeSandbox
              prototype={state.prototype}
              blueprint={state.blueprint}
              profile={state.profile || effectiveProfile}
              onBackToBlueprint={() => {
                setBusy(null);
                update({ stage: "blueprint" });
              }}
              onSelectNewTheme={() => {
                setBusy(null);
                update({ stage: "theme" });
              }}
            />
            <MentorDock
              profile={state.profile || effectiveProfile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />
          </div>
        )}


        {showQuest && !busy && state.stage === "mentor" && state.blueprint && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
            <div className="order-2 space-y-6 lg:order-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl font-extrabold">{state.blueprint.title}</h2>
                </div>
                <button
                  onClick={() => update({ stage: "ideas" })}
                  className="mono-label rounded-full border-2 border-border px-4 py-2"
                >
                  back to ideas
                </button>
              </div>
              <QuestScrollPanel
                scroll={state.scroll}
                busy={scrollBusy}
                onSummon={() => void handleSummon()}
                onAsk={ask}
              />
              <BlueprintView
                b={state.blueprint}
                changeLog={state.changeLog}
                onGeneratePrototype={() => update({ stage: "theme" })}
                isGeneratingPrototype={Boolean(busy)}
              />
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-36 lg:h-fit">
              <Mentor
                profile={state.profile || effectiveProfile}
                blueprint={state.blueprint}
                askSeed={askSeed}
                onAsked={() => award(40, "apprentice")}
              />
            </div>
          </div>
        )}
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
        onSuccess={() => update({ stage: "discovery" })}
      />
    </div>
  );
}
