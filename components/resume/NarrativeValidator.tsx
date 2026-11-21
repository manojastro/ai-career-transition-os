"use client";

import { useStore } from "@/store/useStore";
import type { NarrativeChecklist } from "@/types";
import { Card, CardTitle, ProgressBar, Badge } from "@/components/shared/ui";
import { CheckCircle2, Circle } from "lucide-react";

const ITEMS: { key: keyof NarrativeChecklist; label: string; hint: string }[] = [
  { key: "resume", label: "Resume", hint: "Bullet points reflect senior AI engineering outcomes, not support duties" },
  { key: "linkedin", label: "LinkedIn", hint: "Headline, About and Experience tell the same positioning story" },
  { key: "github", label: "GitHub", hint: "Pinned repos demonstrate architecture, deployment and observability" },
  { key: "portfolio", label: "Portfolio", hint: "Case studies mirror the resume narrative with live demos" },
  { key: "interview", label: "Interview Narrative", hint: "STAR stories align with the positioning across all surfaces" },
];

export default function NarrativeValidator() {
  const checklist = useStore((s) => s.narrativeChecklist);
  const toggleNarrative = useStore((s) => s.toggleNarrative);

  const aligned = Object.values(checklist).filter(Boolean).length;
  const pct = Math.round((aligned / ITEMS.length) * 100);
  const complete = aligned === ITEMS.length;

  return (
    <Card>
      <CardTitle
        right={
          <Badge tone={complete ? "green" : "gray"}>Aligned {aligned}/{ITEMS.length}</Badge>
        }
      >
        Career Narrative Validator
      </CardTitle>

      <ProgressBar value={pct} className="mb-4" />

      <ul className="space-y-1">
        {ITEMS.map((item) => {
          const done = checklist[item.key];
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => toggleNarrative(item.key)}
                aria-pressed={done}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
                )}
                <span>
                  <span className={`block text-sm font-medium ${done ? "text-emerald-400" : ""}`}>
                    {item.label}
                  </span>
                  <span className="block text-xs text-muted">{item.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {complete && (
        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-400">
            All surfaces aligned — your resume, LinkedIn, GitHub, portfolio and interview stories
            now communicate one consistent senior AI engineering positioning.
          </p>
        </div>
      )}
    </Card>
  );
}
