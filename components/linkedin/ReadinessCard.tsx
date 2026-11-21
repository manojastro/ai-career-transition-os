"use client";

import { useStore } from "@/store/useStore";
import { linkedinReadiness } from "@/lib/readiness";
import type { LinkedInChecklist } from "@/types";
import { Card, CardTitle, ProgressRing } from "@/components/shared/ui";
import { CheckCircle2, Circle } from "lucide-react";

const ITEMS: { key: keyof LinkedInChecklist; label: string }[] = [
  { key: "headlineOptimized", label: "Headline optimized" },
  { key: "aboutComplete", label: "About section complete" },
  { key: "featuredGithub", label: "Featured GitHub projects" },
  { key: "architectureDemos", label: "Architecture demos" },
  { key: "relevantSkills", label: "Relevant skills" },
  { key: "recruiterKeywords", label: "Recruiter keywords" },
  { key: "experienceRewritten", label: "Experience rewritten" },
  { key: "openToWorkReviewed", label: "Open-to-work strategy reviewed" },
];

export default function ReadinessCard() {
  const state = useStore();
  const score = linkedinReadiness(state);
  const checklist = state.linkedinChecklist;
  const toggle = useStore((s) => s.toggleLinkedinChecklist);
  const done = ITEMS.filter((i) => checklist[i.key]).length;

  return (
    <Card>
      <CardTitle right={<span className="text-xs text-muted">{done}/8 items</span>}>
        LinkedIn Readiness
      </CardTitle>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="shrink-0 text-center">
          <ProgressRing value={score} label="ready" />
        </div>
        <ul className="w-full space-y-1">
          {ITEMS.map((item) => {
            const checked = checklist[item.key];
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  aria-pressed={checked}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                >
                  {checked ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
                  )}
                  <span className={checked ? "text-emerald-400" : ""}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}
