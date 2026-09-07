import { useState } from "react";
import type { StudentProfile } from "@/lib/types";
import { SparkLine } from "./Mascot";

const SKILLS = [
  "Web development",
  "Mobile apps",
  "Data analysis",
  "Machine learning",
  "Computer vision",
  "NLP",
  "Cloud / DevOps",
  "Databases",
  "Embedded / IoT",
  "Cybersecurity",
  "Game development",
  "UI/UX design",
];
const LANGS = ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "R", "SQL"];
const FRAMEWORKS = [
  "React",
  "Next.js",
  "Node.js",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Flutter",
  "TensorFlow",
  "PyTorch",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
];
const INTERESTS = [
  "Healthcare",
  "Education",
  "Finance",
  "Sustainability",
  "Agriculture",
  "Accessibility",
  "Social good",
  "Sports",
  "Music & media",
  "Robotics",
  "Smart cities",
  "E-commerce",
];
const DOMAINS = ["AI / ML", "Full-stack web", "Mobile", "Data engineering", "IoT & hardware", "Security", "AR / VR", "Automation"];
const RESOURCES = ["Laptop only", "GPU access", "Cloud credits", "Sensors / hardware", "Real dataset", "University lab", "Mentor / supervisor"];

const STEPS = ["Who you are", "What you can build", "What excites you", "Where you're headed", "Your constraints"];

function Chips({
  options,
  value,
  onChange,
  tone = "primary",
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  tone?: "primary" | "accent" | "grape";
}) {
  const toneOn =
    tone === "accent"
      ? "bg-accent text-accent-foreground"
      : tone === "grape"
        ? "bg-grape text-grape-foreground"
        : "bg-primary text-primary-foreground";
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(on ? value.filter((v) => v !== opt) : [...value, opt])}
            className={`rounded-full border-2 border-foreground px-3 py-1.5 text-sm font-medium transition-transform duration-150 hover:-translate-y-0.5 ${
              on ? `${toneOn} shadow-[0_3px_0_0_var(--foreground)]` : "bg-surface text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2">
        <span className="mono-label">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function Discovery({
  busy,
  onComplete,
  initialName = "",
}: {
  busy: boolean;
  onComplete: (p: StudentProfile) => void;
  initialName?: string;
}) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<StudentProfile>({
    name: initialName || "",
    fieldOfStudy: "Computer Science",
    yearOfStudy: "Final year",
    skills: [],
    languages: [],
    frameworks: [],
    aiKnowledge: "Some coursework",
    previousProjects: "",
    experienceLevel: "Intermediate",
    interests: [],
    domains: [],
    careerGoal: "",
    projectType: "Product / application",
    hoursPerWeek: 12,
    weeks: 10,
    teamSize: "Solo",
    resources: ["Laptop only"],
    complexity: "Challenging but doable",
    ownIdeas: "",
  });

  const set = <K extends keyof StudentProfile>(k: K, v: StudentProfile[K]) =>
    setP((prev) => ({ ...prev, [k]: v }));

  const canContinue =
    step === 0
      ? p.name.trim().length > 0
      : step === 1
        ? p.skills.length > 0 || p.languages.length > 0
        : step === 2
          ? p.interests.length > 0
          : step === 3
            ? p.careerGoal.trim().length > 0
            : true;

  return (
    <section className="panel mx-auto max-w-3xl overflow-hidden">
      <div className="flex items-center justify-between border-b-2 border-border bg-sunken px-6 py-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold">{STEPS[step]}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === step ? "w-7 bg-accent" : i < step ? "w-2.5 bg-primary" : "w-2.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div key={step} className="q-rise space-y-6 px-6 py-6">
        {step === 0 && (
          <>
            <Field label="What should we call you?">
              <input
                className={inputCls}
                value={p.name}
                placeholder="Your name"
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Field of study">
                <input className={inputCls} value={p.fieldOfStudy} onChange={(e) => set("fieldOfStudy", e.target.value)} />
              </Field>
              <Field label="Year of study">
                <select className={inputCls} value={p.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)}>
                  {["Third year", "Final year", "Masters", "Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Experience level">
              <Chips
                options={["Beginner", "Intermediate", "Advanced"]}
                value={[p.experienceLevel]}
                onChange={(v) => set("experienceLevel", v.filter((x) => x !== p.experienceLevel)[0] ?? p.experienceLevel)}
                tone="accent"
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Technical skills" hint="pick everything you've actually used">
              <Chips options={SKILLS} value={p.skills} onChange={(v) => set("skills", v)} />
            </Field>
            <Field label="Programming languages">
              <Chips options={LANGS} value={p.languages} onChange={(v) => set("languages", v)} tone="grape" />
            </Field>
            <Field label="Frameworks & tools">
              <Chips options={FRAMEWORKS} value={p.frameworks} onChange={(v) => set("frameworks", v)} tone="accent" />
            </Field>
            <Field label="AI / ML knowledge">
              <Chips
                options={["None yet", "Some coursework", "Built a few models", "Comfortable end-to-end"]}
                value={[p.aiKnowledge]}
                onChange={(v) => set("aiKnowledge", v.filter((x) => x !== p.aiKnowledge)[0] ?? p.aiKnowledge)}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Areas of interest">
              <Chips options={INTERESTS} value={p.interests} onChange={(v) => set("interests", v)} tone="accent" />
            </Field>
            <Field label="Preferred project domains">
              <Chips options={DOMAINS} value={p.domains} onChange={(v) => set("domains", v)} tone="grape" />
            </Field>
            <Field
              label="Your own project ideas"
              hint="optional — write any idea you already have in mind"
            >
              <textarea
                className={`${inputCls} min-h-24 resize-none`}
                value={p.ownIdeas}
                placeholder="e.g. an app that helps my college manage lab equipment bookings…"
                onChange={(e) => set("ownIdeas", e.target.value)}
              />
            </Field>
            <Field label="Previous projects" hint="optional — anything you've built before">
              <textarea
                className={`${inputCls} min-h-24 resize-none`}
                value={p.previousProjects}
                placeholder="e.g. a course scheduling web app, a CNN for leaf disease detection…"
                onChange={(e) => set("previousProjects", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Career goal" hint="what job or path is this project feeding?">
              <input
                className={inputCls}
                value={p.careerGoal}
                placeholder="e.g. Machine learning engineer at a health-tech company"
                onChange={(e) => set("careerGoal", e.target.value)}
              />
            </Field>
            <Field label="Project preference">
              <Chips
                options={["Product / application", "Research-flavoured", "Data-heavy", "Hardware / IoT", "Open-source tool"]}
                value={[p.projectType]}
                onChange={(v) => set("projectType", v.filter((x) => x !== p.projectType)[0] ?? p.projectType)}
              />
            </Field>
            <Field label="Preferred complexity">
              <Chips
                options={["Keep it safe", "Challenging but doable", "Push me hard"]}
                value={[p.complexity]}
                onChange={(v) => set("complexity", v.filter((x) => x !== p.complexity)[0] ?? p.complexity)}
                tone="accent"
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label={`Hours per week — ${p.hoursPerWeek}`}>
                <input
                  type="range"
                  min={2}
                  max={40}
                  value={p.hoursPerWeek}
                  onChange={(e) => set("hoursPerWeek", Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
              <Field label={`Weeks available — ${p.weeks}`}>
                <input
                  type="range"
                  min={4}
                  max={32}
                  value={p.weeks}
                  onChange={(e) => set("weeks", Number(e.target.value))}
                  className="w-full accent-[var(--accent)]"
                />
              </Field>
            </div>
            <Field label="Team size">
              <Chips
                options={["Solo", "Pair", "Team of 3-4", "Team of 5+"]}
                value={[p.teamSize]}
                onChange={(v) => set("teamSize", v.filter((x) => x !== p.teamSize)[0] ?? p.teamSize)}
                tone="grape"
              />
            </Field>
            <Field label="Resources you can use">
              <Chips options={RESOURCES} value={p.resources} onChange={(v) => set("resources", v)} />
            </Field>
            <SparkLine className="h-8 w-full opacity-70" />
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t-2 border-border bg-sunken px-6 py-4">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || busy}
          className="mono-label rounded-full border-2 border-border px-4 py-2 disabled:opacity-40"
        >
          back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canContinue}
            className="pop-btn bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={() => onComplete(p)}
            disabled={busy}
            className="pop-btn bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground"
          >
            {busy ? "Creating your profile…" : "Create my profile"}
          </button>
        )}
      </div>
    </section>
  );
}
