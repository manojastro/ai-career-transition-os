"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { isValidUrl } from "@/lib/utils";
import { QUALITY_DIMENSIONS, type Project } from "@/types";
import { Button, ConfirmDialog, Field, Input, Select, Textarea } from "@/components/shared/ui";
import { PROJECT_STATUSES } from "@/components/portfolio/PortfolioView";

const emptyQuality = (): Project["quality"] => ({
  Architecture: 0, Documentation: 0, Deployment: 0, Testing: 0,
  Observability: 0, Security: 0, Metrics: 0, "Interview Explainability": 0,
});

interface FormValues {
  name: string;
  description: string;
  status: Project["status"];
  githubUrl: string;
  demoUrl: string;
  technologies: string; // comma-separated
  architectureNotes: string;
  problemsSolved: string;
  tradeoffs: string;
  metrics: string;
  interviewPitch: string;
  startDate: string;
  targetDate: string;
  completion: number;
  quality: Project["quality"];
}

const toForm = (p?: Project): FormValues => ({
  name: p?.name ?? "",
  description: p?.description ?? "",
  status: p?.status ?? "Idea",
  githubUrl: p?.githubUrl ?? "",
  demoUrl: p?.demoUrl ?? "",
  technologies: p?.technologies.join(", ") ?? "",
  architectureNotes: p?.architectureNotes ?? "",
  problemsSolved: p?.problemsSolved ?? "",
  tradeoffs: p?.tradeoffs ?? "",
  metrics: p?.metrics ?? "",
  interviewPitch: p?.interviewPitch ?? "",
  startDate: p?.startDate ?? "",
  targetDate: p?.targetDate ?? "",
  completion: p?.completion ?? 0,
  quality: p ? { ...p.quality } : emptyQuality(),
});

export function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project?: Project;
  onSave: (data: Omit<Project, "id">) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(() => toForm(project));
  const [errors, setErrors] = useState<{ name?: string; githubUrl?: string; demoUrl?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteProject = useStore((s) => s.deleteProject);
  const toast = useToast((s) => s.push);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!isValidUrl(values.githubUrl)) next.githubUrl = "Enter a valid http(s) URL.";
    if (!isValidUrl(values.demoUrl)) next.demoUrl = "Enter a valid http(s) URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      name: values.name.trim(),
      description: values.description.trim(),
      status: values.status,
      githubUrl: values.githubUrl.trim() || undefined,
      demoUrl: values.demoUrl.trim() || undefined,
      technologies: values.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      architectureNotes: values.architectureNotes || undefined,
      problemsSolved: values.problemsSolved || undefined,
      tradeoffs: values.tradeoffs || undefined,
      metrics: values.metrics || undefined,
      interviewPitch: values.interviewPitch || undefined,
      startDate: values.startDate || undefined,
      targetDate: values.targetDate || undefined,
      completion: Math.min(100, Math.max(0, Math.round(values.completion))),
      quality: values.quality,
      isSample: project?.isSample,
    });
  };

  const err = (m?: string) =>
    m ? <span role="alert" className="block text-xs text-red-400">{m}</span> : null;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name">
            <Input value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
            {err(errors.name)}
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
        <Field label="Status">
          <Select value={values.status} onChange={(e) => set("status", e.target.value as Project["status"])}>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Technologies" hint="Comma-separated">
          <Input value={values.technologies} onChange={(e) => set("technologies", e.target.value)} placeholder="Python, FastAPI, pgvector" />
        </Field>
        <Field label="GitHub URL">
          <Input value={values.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/..." inputMode="url" aria-invalid={!!errors.githubUrl} />
          {err(errors.githubUrl)}
        </Field>
        <Field label="Demo URL">
          <Input value={values.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} placeholder="https://..." inputMode="url" aria-invalid={!!errors.demoUrl} />
          {err(errors.demoUrl)}
        </Field>
        <Field label="Start date">
          <Input type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </Field>
        <Field label="Target date">
          <Input type="date" value={values.targetDate} onChange={(e) => set("targetDate", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label={`Completion — ${values.completion}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={values.completion}
              onChange={(e) => set("completion", Number(e.target.value))}
              className="w-full accent-emerald-500"
              aria-label="Completion percentage"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Architecture notes">
            <Textarea value={values.architectureNotes} onChange={(e) => set("architectureNotes", e.target.value)} />
          </Field>
        </div>
        <Field label="Problems solved">
          <Textarea value={values.problemsSolved} onChange={(e) => set("problemsSolved", e.target.value)} />
        </Field>
        <Field label="Trade-offs">
          <Textarea value={values.tradeoffs} onChange={(e) => set("tradeoffs", e.target.value)} />
        </Field>
        <Field label="Metrics">
          <Textarea value={values.metrics} onChange={(e) => set("metrics", e.target.value)} />
        </Field>
        <Field label="Interview pitch">
          <Textarea value={values.interviewPitch} onChange={(e) => set("interviewPitch", e.target.value)} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Quality dimensions (0–5)</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUALITY_DIMENSIONS.map((d) => (
            <label key={d} className="block space-y-1">
              <span className="text-xs text-zinc-300">{d}</span>
              <Select
                aria-label={`${d} score`}
                value={values.quality[d]}
                onChange={(e) => set("quality", { ...values.quality, [d]: Number(e.target.value) })}
                className="py-1 text-xs"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-800 pt-4">
        {project ? (
          <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        ) : <span />}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary">{project ? "Save Changes" : "Add Project"}</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (project) {
            deleteProject(project.id);
            toast("Project deleted", "info");
          }
          onCancel();
        }}
        title="Delete project"
        message={`Are you sure you want to delete "${project?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </form>
  );
}
