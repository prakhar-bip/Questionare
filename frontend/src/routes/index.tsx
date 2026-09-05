import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
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
import { QuestHud } from "@/components/quest/QuestHud";
import { QuestScrollPanel } from "@/components/quest/QuestScroll";
import { useJourney } from "@/lib/journey";
import {
  analyzeFeasibility,
  buildProfile,
  generateBlueprint,
  generateIdeas,
  refineIdeas,
  summarizeBlueprint,
  updateBlueprint,
} from "@/lib/quest.functions";
import type { ProjectIdea, StudentProfile } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Questline — AI final-year project planner for students" },
      {
        name: "description",
        content:
          "Turn your skills, interests and goals into a matched final-year project idea, a feasibility check and a full build blueprint — guided by an AI mentor.",
      },
      { property: "og:title", content: "Questline — AI final-year project planner" },
      {
        property: "og:description",
        content:
          "Discover, score, refine and plan your final-year project with an AI architect and mentor.",
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

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-4xl px-1 py-10 text-center">
      <div className="q-pop mx-auto mb-6 w-fit">
        <Mascot className="size-28" />
      </div>
      <span className="mono-label">final-year project planner</span>
      <h1 className="q-rise mt-2 font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">
        Stop guessing your
        <span className="text-accent"> final-year project.</span>
      </h1>
      <SparkLine className="mx-auto mt-3 h-10 w-72" />
      <p className="q-rise mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
        Answer a few short questions. Get project ideas scored around your skills, time and career
        goal — then an honest reality check, a full build plan, and a mentor who updates the plan as
        you talk to it.
      </p>
      <button
        onClick={onStart}
        className="pop-btn q-pop mt-8 bg-accent px-8 py-3.5 font-display text-lg font-extrabold text-accent-foreground"
        style={{ animationDelay: "220ms" }}
      >
        Get started →
      </button>
      <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
        {[
          ["01 · Discover", "A few short questions turn your skills, interests, time and goals into a profile."],
          ["02 · See ideas", "Four scored project ideas, each explained against your profile."],
          ["03 · Build the plan", "A reality check, a full plan, and a mentor that keeps updating it."],
        ].map(([tag, text], i) => (
          <div key={tag} className="panel q-rise px-4 py-4" style={{ animationDelay: `${300 + i * 90}ms` }}>
            <span className="mono-label">{tag}</span>
            <p className="mt-1 text-sm">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { state, update, award, reset, hydrated } = useJourney();
  const [busy, setBusy] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [scrollBusy, setScrollBusy] = useState(false);
  const [askSeed, setAskSeed] = useState<{ text: string; n: number } | null>(null);
  const [dockOpen, setDockOpen] = useState(false);

  const doBuildProfile = useServerFn(buildProfile);
  const doGenerateIdeas = useServerFn(generateIdeas);
  const doRefineIdeas = useServerFn(refineIdeas);
  const doFeasibility = useServerFn(analyzeFeasibility);
  const doBlueprint = useServerFn(generateBlueprint);
  const doUpdateBlueprint = useServerFn(updateBlueprint);
  const doSummarize = useServerFn(summarizeBlueprint);

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

  async function handleFeedback(idea: ProjectIdea, action: string) {
    if (!state.profile) return;
    setBusy("Updating ideas from your feedback…");
    try {
      const feedback = [...state.feedbackLog, `${action} (re: ${idea.name})`];
      const ideas = await doRefineIdeas({
        data: { profile: state.profile, idea, action, feedback: state.feedbackLog },
      });
      update({ ideas, feedbackLog: feedback, selectedIdeaId: null });
      award(60, "tinkerer");
      toast.success("New ideas based on your feedback.");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleSelect(idea: ProjectIdea) {
    if (!state.profile) return;
    setBusy("Running the reality check…");
    update({ selectedIdeaId: idea.id });
    try {
      const feasibility = await doFeasibility({ data: { profile: state.profile, idea } });
      update({ feasibility, stage: "feasibility", selectedIdeaId: idea.id });
      award(150, "realist");
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleDirection(direction: string, label: string) {
    if (!state.profile || !selected) return;
    setBusy("Writing your full project plan…");
    try {
      const blueprint = await doBlueprint({
        data: {
          profile: state.profile,
          idea: selected,
          feasibility: state.feasibility,
          feedback: state.feedbackLog,
          direction,
        },
      });
      update({
        blueprint,
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
    if (!state.profile || !state.blueprint) return;
    setScrollBusy(true);
    try {
      const scroll = await doSummarize({
        data: { profile: state.profile, blueprint: state.blueprint },
      });
      update({ scroll });
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
    if (!state.profile || !state.blueprint || applying) return;
    setApplying(true);
    try {
      const res = await doUpdateBlueprint({
        data: { profile: state.profile, blueprint: state.blueprint, request },
      });
      update({
        blueprint: res.blueprint,
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

  if (!hydrated) return null;

  return (
    <div className="min-h-screen">
      {state.stage !== "intro" && (
        <QuestHud stage={state.stage} badges={state.badges} onReset={reset} />
      )}

      <main className="mx-auto max-w-6xl px-5 py-8">
        {state.stage === "intro" && <Intro onStart={() => update({ stage: "discovery" })} />}

        {busy && (
          <div className="py-6">
            <Loader label={busy} />
          </div>
        )}

        {!busy && state.stage === "discovery" && (
          <Discovery busy={false} onComplete={handleDiscovery} />
        )}

        {!busy && state.stage === "profile" && state.profile && (
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

        {!busy && state.stage === "ideas" && state.profile && (
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

        {!busy && state.stage === "feasibility" && selected && state.feasibility && (
          <FeasibilityPanel
            idea={selected}
            f={state.feasibility}
            busy={false}
            onChoose={handleDirection}
            onBack={() => update({ stage: "ideas" })}
          />
        )}

        {!busy && state.stage === "blueprint" && state.blueprint && state.profile && (
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
            <BlueprintView b={state.blueprint} changeLog={state.changeLog} />
            <MentorDock
              profile={state.profile}
              blueprint={state.blueprint}
              askSeed={askSeed}
              open={dockOpen}
              onToggle={setDockOpen}
              onAsked={() => award(40, "apprentice")}
            />

          </div>
        )}


        {!busy && state.stage === "mentor" && state.blueprint && state.profile && (
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
              <BlueprintView b={state.blueprint} changeLog={state.changeLog} />
            </div>
            <div className="order-1 lg:order-2 lg:sticky lg:top-36 lg:h-fit">
              <Mentor
                profile={state.profile}
                blueprint={state.blueprint}
                askSeed={askSeed}
                onAsked={() => award(40, "apprentice")}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
