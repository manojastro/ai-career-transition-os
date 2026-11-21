"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import type { Project, ProjectStatus } from "@/types";
import { Badge, Button, Modal, PageHeader } from "@/components/shared/ui";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ProjectForm } from "@/components/portfolio/ProjectForm";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Idea", "Backlog", "Planning", "Building", "Testing", "Deployed",
];

const STATUS_TONES: Record<ProjectStatus, "gray" | "indigo" | "cyan" | "amber" | "green"> = {
  Idea: "gray",
  Backlog: "gray",
  Planning: "indigo",
  Building: "cyan",
  Testing: "amber",
  Deployed: "green",
};

export function statusToneFor(s: ProjectStatus) {
  return STATUS_TONES[s];
}

export default function PortfolioView() {
  const projects = useStore((s) => s.projects);
  const addProject = useStore((s) => s.addProject);
  const toast = useToast((s) => s.push);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div>
      <PageHeader
        title="Portfolio"
        subtitle="Kanban of your project pipeline — from idea to deployed, interview-ready systems."
        actions={
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-900/50 bg-gradient-to-r from-emerald-950/50 to-cyan-950/30 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
        <p className="text-sm font-medium text-emerald-200">
          Five deeply understood, deployed systems are more valuable than ten shallow tutorial clones.
        </p>
      </div>

      <div className="-mx-2 overflow-x-auto px-2 pb-4">
        <div className="flex min-w-max gap-4">
          {PROJECT_STATUSES.map((status) => {
            const items = projects.filter((p) => p.status === status);
            return (
              <section
                key={status}
                aria-label={`${status} column`}
                className="flex w-72 min-w-[17rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900/40"
              >
                <header className="flex items-center justify-between border-b border-zinc-800 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <Badge tone={statusToneFor(status)}>{status}</Badge>
                  </span>
                  <span className="text-xs text-muted">{items.length}</span>
                </header>
                <div className="flex-1 space-y-2 p-2">
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-6 text-center text-xs text-muted">
                      No projects here
                    </p>
                  ) : (
                    items.map((p) => (
                      <ProjectCard key={p.id} project={p} onEdit={() => setEditing(p)} />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Project">
        <ProjectForm
          onCancel={() => setAddOpen(false)}
          onSave={(data) => {
            addProject(data);
            toast("Project added", "success");
            setAddOpen(false);
          }}
        />
      </Modal>

      {editing && (
        <Modal open onClose={() => setEditing(null)} title={`Edit — ${editing.name}`} wide>
          <ProjectForm
            project={editing}
            onCancel={() => setEditing(null)}
            onSave={(data) => {
              useStore.getState().updateProject(editing.id, data);
              toast("Project updated", "success");
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
