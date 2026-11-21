"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { copyToClipboard } from "@/lib/utils";
import type { ResumeBullet } from "@/types";
import {
  Card, CardTitle, Button, Input, Textarea, Field, Modal, ConfirmDialog, EmptyState,
} from "@/components/shared/ui";
import { Eye, Copy, Save, Pencil, Trash2, ListChecks } from "lucide-react";

interface StarForm {
  situation: string;
  task: string;
  action: string;
  technologies: string;
  result: string;
  metrics: string;
  businessImpact: string;
}

const EMPTY_FORM: StarForm = {
  situation: "", task: "", action: "", technologies: "", result: "", metrics: "", businessImpact: "",
};

function composeBullet(f: StarForm): string {
  const parts: string[] = [];
  if (f.action.trim()) parts.push(f.action.trim().replace(/\.$/, ""));
  if (f.technologies.trim()) parts.push(`using ${f.technologies.trim()}`);
  const results = [f.result.trim().replace(/\.$/, ""), f.metrics.trim().replace(/\.$/, "")]
    .filter(Boolean)
    .join(" and ");
  if (results) parts.push(`resulting in ${results}`);
  if (f.businessImpact.trim()) parts.push(`delivering ${f.businessImpact.trim().replace(/\.$/, "")}`);
  if (f.situation.trim() || f.task.trim()) {
    const ctx = [f.situation.trim(), f.task.trim()].filter(Boolean).join(" — ");
    parts.push(`(${ctx})`);
  }
  return parts.length ? parts.join(", ") + "." : "";
}

function bulletText(b: ResumeBullet): string {
  return composeBullet({
    situation: b.situation ?? "", task: b.task ?? "", action: b.action ?? "",
    technologies: b.technologies ?? "", result: b.result ?? "",
    metrics: b.metrics ?? "", businessImpact: b.businessImpact ?? "",
  }) || b.rawBefore || "";
}

export default function StarBuilder() {
  const bullets = useStore((s) => s.resumeBullets);
  const addBullet = useStore((s) => s.addBullet);
  const updateBullet = useStore((s) => s.updateBullet);
  const deleteBullet = useStore((s) => s.deleteBullet);
  const push = useToast().push;

  const [form, setForm] = useState<StarForm>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState<ResumeBullet | null>(null);
  const [editForm, setEditForm] = useState<StarForm>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<ResumeBullet | null>(null);

  const set = (key: keyof StarForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePreview = () => {
    const text = composeBullet(form);
    setPreview(text);
    push(text ? "ATS-style bullet composed" : "Fill in at least the Action field", text ? "success" : "error");
  };

  const handleCopy = async () => {
    if (!preview) return;
    const ok = await copyToClipboard(preview);
    push(ok ? "Bullet copied" : "Copy failed", ok ? "success" : "error");
  };

  const handleSave = () => {
    if (!composeBullet(form)) {
      push("Nothing to save — fill in at least the Action field", "error");
      return;
    }
    addBullet({ ...form });
    setForm(EMPTY_FORM);
    setPreview("");
    push("Bullet saved to resume library", "success");
  };

  const copySaved = async (b: ResumeBullet) => {
    const ok = await copyToClipboard(bulletText(b));
    push(ok ? "Bullet copied" : "Copy failed", ok ? "success" : "error");
  };

  const openEdit = (b: ResumeBullet) => {
    setEditing(b);
    setEditForm({
      situation: b.situation ?? "", task: b.task ?? "", action: b.action ?? "",
      technologies: b.technologies ?? "", result: b.result ?? "",
      metrics: b.metrics ?? "", businessImpact: b.businessImpact ?? "",
    });
  };

  const handleEditSave = () => {
    if (!editing) return;
    updateBullet(editing.id, { ...editForm, rawBefore: editing.rawBefore });
    setEditing(null);
    push("Bullet updated", "success");
  };

  const setEdit = (key: keyof StarForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm((f) => ({ ...f, [key]: e.target.value }));

  const formFields = (f: StarForm, onChange: (key: keyof StarForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Situation"><Textarea value={f.situation} onChange={onChange("situation")} placeholder="Context: what was happening" /></Field>
      <Field label="Task"><Textarea value={f.task} onChange={onChange("task")} placeholder="Your responsibility in that context" /></Field>
      <Field label="Action *"><Textarea value={f.action} onChange={onChange("action")} placeholder="What you specifically engineered or executed" /></Field>
      <Field label="Technologies"><Input value={f.technologies} onChange={onChange("technologies")} placeholder="Python, FastAPI, LangChain…" /></Field>
      <Field label="Result"><Textarea value={f.result} onChange={onChange("result")} placeholder="Qualitative outcome (system shipped, incidents reduced)" /></Field>
      <div className="space-y-4">
        <Field label="Metrics (optional)" hint="Only appears if you provide it"><Input value={f.metrics} onChange={onChange("metrics")} placeholder="e.g. 99.9% uptime" /></Field>
        <Field label="Business Impact"><Input value={f.businessImpact} onChange={onChange("businessImpact")} placeholder="e.g. lower ops cost, faster onboarding" /></Field>
      </div>
    </div>
  );

  return (
    <Card>
      <CardTitle>STAR Builder</CardTitle>
      {formFields(form, set)}

      {preview && (
        <div className="mt-4 rounded-md border border-cyan-500/30 bg-cyan-500/5 px-3 py-2 text-sm" aria-live="polite">
          {preview}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={handlePreview} disabled={!form.action.trim() && !form.result.trim()}>
          <Eye className="h-4 w-4" aria-hidden /> Preview Bullet
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!preview}>
          <Copy className="h-4 w-4" aria-hidden /> Copy
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Save className="h-4 w-4" aria-hidden /> Save
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Saved Bullets ({bullets.length})
        </h3>
        {bullets.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="h-8 w-8" aria-hidden />}
            title="No saved bullets yet"
            description="Compose a bullet above with the STAR form or the transformer, then save it here."
          />
        ) : (
          <ul className="space-y-2">
            {bullets.map((b) => (
              <li key={b.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-sm">{bulletText(b) || <span className="text-muted">(incomplete bullet)</span>}</p>
                {b.rawBefore && <p className="mt-1 text-xs text-muted">Before: {b.rawBefore}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" onClick={() => copySaved(b)}>
                    <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                  </Button>
                  <Button variant="ghost" onClick={() => openEdit(b)}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
                  </Button>
                  <Button variant="ghost" className="text-red-500 hover:text-red-400" onClick={() => setDeleting(b)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit Bullet" wide>
        {editing && (
          <>
            {formFields(editForm, setEdit)}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteBullet(deleting.id);
            push("Bullet deleted", "info");
          }
        }}
        title="Delete Bullet"
        message="This bullet will be permanently removed from your resume library."
        confirmLabel="Delete"
      />
    </Card>
  );
}
