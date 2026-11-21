"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { skillsCompletion } from "@/lib/readiness";
import { SKILL_STATUSES, STATUS_WEIGHT } from "@/data/seed";
import type { SkillGroup, SkillItem, SkillModule } from "@/types";
import { Card, CardTitle, PageHeader, ProgressBar, ProgressRing, Select } from "@/components/shared/ui";
import { RagEngineering } from "@/components/skills/RagEngineering";
import { SkillTree } from "@/components/skills/SkillTree";

export function statusTone(status: SkillItem["status"]): string {
  switch (status) {
    case "Interview Ready":
      return "text-emerald-400";
    case "Project Applied":
      return "text-cyan-400";
    case "Practiced":
      return "text-indigo-400";
    case "Learning":
      return "text-amber-400";
    default:
      return "text-zinc-500";
  }
}

export function groupCompletion(group: SkillGroup): number {
  if (group.items.length === 0) return 0;
  const total = group.items.reduce((sum, i) => sum + STATUS_WEIGHT[i.status], 0);
  return Math.round((total / group.items.length) * 100);
}

export function moduleCompletion(module: SkillModule): number {
  const items = module.groups.flatMap((g) => g.items);
  if (items.length === 0) return 0;
  const total = items.reduce((sum, i) => sum + STATUS_WEIGHT[i.status], 0);
  return Math.round((total / items.length) * 100);
}

export function SkillItemRow({
  item,
  onSelect,
}: {
  item: SkillItem;
  onSelect: (status: SkillItem["status"]) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
      <span className="truncate text-sm text-zinc-200">{item.name}</span>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`hidden text-xs font-medium sm:inline ${statusTone(item.status)}`}>{item.status}</span>
        <Select
          aria-label={`Status for ${item.name}`}
          value={item.status}
          onChange={(e) => onSelect(e.target.value as SkillItem["status"])}
          className="w-36 border-zinc-700 bg-zinc-900 py-1 text-xs"
        >
          {SKILL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export default function SkillsView() {
  const state = useStore();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(state.skills.map((m, i) => [m.id, i === 0])),
  );

  const overall = skillsCompletion(state);

  return (
    <div>
      <PageHeader
        title="Skills Matrix"
        subtitle="Track mastery from Not Started to Interview Ready across every module."
      />

      <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <ProgressRing value={overall} label="Skills" />
        <Card className="flex-1 border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-cyan-950/20">
          <p className="text-sm text-muted">Overall completion across all modules, RAG architectures and evaluations.</p>
          <div className="mt-3 space-y-2">
            {state.skills.map((m) => (
              <button
                key={m.id}
                onClick={() => setOpenModules((s) => ({ ...s, [m.id]: !s[m.id] }))}
                className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1 text-left hover:bg-zinc-800/60"
                aria-expanded={openModules[m.id]}
              >
                <span className="text-sm font-medium text-zinc-200">{m.name}</span>
                <div className="flex w-40 items-center gap-2">
                  <ProgressBar value={moduleCompletion(m)} className="h-1.5" />
                  <span className="w-9 text-right text-xs text-muted">{moduleCompletion(m)}%</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <SkillTree openModules={openModules} setOpenModules={setOpenModules} />

      <RagEngineering />

      <Card className="mt-6">
        <CardTitle>Status Scale</CardTitle>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {SKILL_STATUSES.map((s) => (
            <span key={s} className="flex items-center gap-2">
              <span className={`font-medium ${statusTone(s)}`}>{s}</span>
              <span className="text-muted">({Math.round(STATUS_WEIGHT[s] * 100)}%)</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
