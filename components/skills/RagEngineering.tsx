"use client";

import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { RAG_LIFECYCLE } from "@/data/seed";
import type { SkillItem } from "@/types";
import { Badge, Card, CardTitle, Input } from "@/components/shared/ui";
import { SkillItemRow } from "@/components/skills/SkillsView";

function RagList({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: SkillItem[];
  onSelect: (id: string, status: SkillItem["status"]) => void;
}) {
  return (
    <section aria-label={title}>
      <h3 className="mb-2 text-sm font-medium text-zinc-300">{title}</h3>
      <div className="grid gap-1.5 md:grid-cols-2">
        {items.map((item) => (
          <SkillItemRow key={item.id} item={item} onSelect={(status) => onSelect(item.id, status)} />
        ))}
      </div>
    </section>
  );
}

export function RagEngineering() {
  const ragArchitectures = useStore((s) => s.ragArchitectures);
  const ragEvals = useStore((s) => s.ragEvals);
  const ragFailureModes = useStore((s) => s.ragFailureModes);
  const setRagItemStatus = useStore((s) => s.setRagItemStatus);
  const toggleFailureMode = useStore((s) => s.toggleFailureMode);
  const updateFailureMode = useStore((s) => s.updateFailureMode);

  return (
    <Card className="mt-6">
      <CardTitle right={<Badge tone="cyan">Deep Dive</Badge>}>RAG Engineering Module</CardTitle>

      {/* Lifecycle pipeline */}
      <section aria-label="RAG lifecycle pipeline">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">RAG Lifecycle Pipeline</h3>
        <div className="flex flex-wrap items-center gap-y-2">
          {RAG_LIFECYCLE.map((step, i) => (
            <span key={step} className="flex items-center">
              <span className="rounded-full border border-cyan-800/60 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300">
                {step}
              </span>
              {i < RAG_LIFECYCLE.length - 1 && (
                <ArrowRight className="mx-1 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden />
              )}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RagList
          title="Architecture knowledge"
          items={ragArchitectures}
          onSelect={(id, status) => setRagItemStatus("ragArchitectures", id, status)}
        />
        <RagList
          title="Evaluation knowledge"
          items={ragEvals}
          onSelect={(id, status) => setRagItemStatus("ragEvals", id, status)}
        />
      </div>

      {/* Failure modes */}
      <section aria-label="Production failure modes" className="mt-6">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Production Failure Modes</h3>
        <div className="grid gap-3 xl:grid-cols-2">
          {ragFailureModes.map((f) => (
            <div
              key={f.id}
              className={`rounded-lg border p-3 ${f.understood ? "border-emerald-900/60 bg-emerald-950/20" : "border-zinc-800 bg-zinc-900/60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{f.name}</p>
                  <p className="text-xs text-zinc-400">{f.symptom}</p>
                </div>
                <button
                  onClick={() => toggleFailureMode(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    f.understood
                      ? "border-emerald-700 bg-emerald-900/40 text-emerald-300"
                      : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                  aria-pressed={f.understood}
                  aria-label={`Mark ${f.name} as understood`}
                >
                  {f.understood ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  Understood
                </button>
              </div>
              <dl className="mt-2 space-y-1 text-xs">
                <div className="flex gap-2"><dt className="w-20 shrink-0 text-zinc-500">Cause</dt><dd className="text-zinc-300">{f.cause}</dd></div>
                <div className="flex gap-2"><dt className="w-20 shrink-0 text-zinc-500">Diagnosis</dt><dd className="text-zinc-300">{f.diagnosis}</dd></div>
                <div className="flex gap-2"><dt className="w-20 shrink-0 text-zinc-500">Fix</dt><dd className="text-zinc-300">{f.fix}</dd></div>
              </dl>
              <div className="mt-3 flex items-center gap-2">
                <label htmlFor={`practice-${f.id}`} className="shrink-0 text-xs text-zinc-500">
                  Practiced in
                </label>
                <Input
                  id={`practice-${f.id}`}
                  value={f.practicedInProject ?? ""}
                  placeholder="project name"
                  onChange={(e) => updateFailureMode(f.id, { practicedInProject: e.target.value })}
                  className="py-1 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 text-xs text-muted">
        Mark each failure mode as understood once you can explain symptom, cause, diagnosis and fix in an interview.
      </p>
    </Card>
  );
}
