"use client";

import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useStore } from "@/store/useStore";
import { projectQuality } from "@/lib/readiness";
import type { Project } from "@/types";
import { Badge, Button, ProgressBar, Select } from "@/components/shared/ui";
import { PROJECT_STATUSES, statusToneFor } from "@/components/portfolio/PortfolioView";

export function ProjectCard({ project, onEdit }: { project: Project; onEdit: () => void }) {
  const moveProject = useStore((s) => s.moveProject);
  const idx = PROJECT_STATUSES.indexOf(project.status);
  const quality = projectQuality(project);

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-zinc-100">{project.name}</h3>
        {project.isSample && <Badge tone="indigo">Sample</Badge>}
      </div>
      {project.description && <p className="mb-2 line-clamp-2 text-xs text-muted">{project.description}</p>}

      <div className="mb-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">Done</span>
          <ProgressBar value={project.completion} className="h-1.5" />
          <span className="w-8 text-right text-[10px] text-muted">{project.completion}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[10px] uppercase tracking-wide text-zinc-500">Quality</span>
          <ProgressBar value={quality} tone="bg-cyan-500" className="h-1.5" />
          <span className="w-8 text-right text-[10px] text-muted">{quality}%</span>
        </div>
      </div>

      {project.technologies.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {project.technologies.map((t) => (
            <span key={t} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-1 border-t border-zinc-800 pt-2">
        <Button
          variant="ghost"
          className="px-1.5"
          disabled={idx <= 0}
          aria-label={`Move ${project.name} left`}
          onClick={() => moveProject(project.id, PROJECT_STATUSES[idx - 1])}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Select
          aria-label={`Status for ${project.name}`}
          value={project.status}
          onChange={(e) => moveProject(project.id, e.target.value as Project["status"])}
          className="w-28 border-zinc-700 bg-zinc-900 py-1 text-xs"
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <div className="flex items-center gap-1">
          <Badge tone={statusToneFor(project.status)} className="hidden xl:inline-flex">{project.status}</Badge>
          <Button
            variant="ghost"
            className="px-1.5"
            aria-label={`Edit ${project.name}`}
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          className="px-1.5"
          disabled={idx >= PROJECT_STATUSES.length - 1}
          aria-label={`Move ${project.name} right`}
          onClick={() => moveProject(project.id, PROJECT_STATUSES[idx + 1])}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
