"use client";

import React, { useMemo, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { storyReadiness } from "@/lib/readiness";
import {
  STORY_CATEGORIES,
  type InterviewStory,
  type StoryCategory,
  type StoryReadiness,
} from "@/types";
import {
  Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, Field, Input,
  Modal, PageHeader, ProgressRing, Select, Textarea,
} from "@/components/shared/ui";

const READINESS_TONE: Record<StoryReadiness, "red" | "amber" | "cyan" | "green"> = {
  "Not Ready": "red",
  Developing: "amber",
  "Interview Ready": "cyan",
  Excellent: "green",
};

const READINESS_LEVELS: StoryReadiness[] = ["Not Ready", "Developing", "Interview Ready", "Excellent"];

interface FormState {
  title: string;
  category: StoryCategory;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string;
  architecture: string;
  tradeoffs: string;
  scaling: string;
  security: string;
  lessons: string;
  technologies: string;
}

const emptyForm: FormState = {
  title: "", category: "System Design", situation: "", task: "", action: "",
  result: "", metrics: "", architecture: "", tradeoffs: "", scaling: "",
  security: "", lessons: "", technologies: "",
};

const TARGET_STORIES = 15;

export default function InterviewsView() {
  const stories = useStore((s) => s.stories);
  const addStory = useStore((s) => s.addStory);
  const updateStory = useStore((s) => s.updateStory);
  const deleteStory = useStore((s) => s.deleteStory);
  const toast = useToast((s) => s.push);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewStory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<InterviewStory | null>(null);

  const readiness = useMemo(
    () => stories.map((st) => ({ story: st, level: storyReadiness(st) })),
    [stories],
  );

  const readyCount = readiness.filter((r) => r.level === "Interview Ready" || r.level === "Excellent").length;
  const pct = Math.min(100, Math.round((readyCount / TARGET_STORIES) * 100));

  const countsByLevel = READINESS_LEVELS.map((level) => ({
    level,
    count: readiness.filter((r) => r.level === level).length,
  }));

  const coveredCategories = new Set(stories.map((st) => st.category));
  const coverageCount = STORY_CATEGORIES.filter((c) => coveredCategories.has(c)).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (story: InterviewStory) => {
    setEditing(story);
    setForm({
      title: story.title, category: story.category,
      situation: story.situation ?? "", task: story.task ?? "",
      action: story.action ?? "", result: story.result ?? "",
      metrics: story.metrics ?? "", architecture: story.architecture ?? "",
      tradeoffs: story.tradeoffs ?? "", scaling: story.scaling ?? "",
      security: story.security ?? "", lessons: story.lessons ?? "",
      technologies: story.technologies ?? "",
    });
    setError(null);
    setModalOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) {
      setError("Story title is required.");
      return;
    }
    const trim = (s: string) => s.trim() || undefined;
    const payload = {
      title: form.title.trim(), category: form.category,
      situation: trim(form.situation), task: trim(form.task),
      action: trim(form.action), result: trim(form.result),
      metrics: trim(form.metrics), architecture: trim(form.architecture),
      tradeoffs: trim(form.tradeoffs), scaling: trim(form.scaling),
      security: trim(form.security), lessons: trim(form.lessons),
      technologies: trim(form.technologies),
    };
    if (editing) {
      updateStory(editing.id, payload);
      toast("Story updated", "success");
    } else {
      addStory(payload);
      toast("Story added", "success");
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Interview Story Bank"
        subtitle={`Target 10–15 strong STAR stories with depth. You have ${stories.length}.`}
        actions={
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Story
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="flex items-center justify-center gap-6">
          <ProgressRing value={pct} label="Ready vs 15" />
          <div>
            <p className="text-sm font-semibold">{readyCount} / {TARGET_STORIES} ready</p>
            <p className="text-xs text-muted">Interview Ready + Excellent</p>
          </div>
        </Card>
        <Card>
          <CardTitle>Readiness Levels</CardTitle>
          <ul className="space-y-2">
            {countsByLevel.map(({ level, count }) => (
              <li key={level} className="flex items-center justify-between">
                <Badge tone={READINESS_TONE[level]}>{level}</Badge>
                <span className="text-sm text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardTitle>Category Coverage ({coverageCount}/{STORY_CATEGORIES.length})</CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {STORY_CATEGORIES.map((cat) => (
              <Badge key={cat} tone={coveredCategories.has(cat) ? "green" : "gray"}>{cat}</Badge>
            ))}
          </div>
        </Card>
      </div>

      {stories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="h-10 w-10" />}
            title="No stories yet"
            description="Create your first story — a concrete situation, your actions, and measurable results."
            action={
              <Button variant="primary" onClick={openAdd}>
                <Plus className="h-4 w-4" /> Create your first story
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {readiness.map(({ story, level }) => (
            <Card key={story.id} className="flex flex-col">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{story.title}</h3>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" onClick={() => openEdit(story)} aria-label={`Edit ${story.title}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(story)} aria-label={`Delete ${story.title}`}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Badge tone="indigo">{story.category}</Badge>
                <Badge tone={READINESS_TONE[level]}>{level}</Badge>
              </div>
              <dl className="space-y-1.5 text-sm">
                {story.situation && (<div><dt className="text-xs uppercase text-muted">Situation</dt><dd className="text-zinc-300">{story.situation}</dd></div>)}
                {story.task && (<div><dt className="text-xs uppercase text-muted">Task</dt><dd className="text-zinc-300">{story.task}</dd></div>)}
                {story.action && (<div><dt className="text-xs uppercase text-muted">Action</dt><dd className="text-zinc-300">{story.action}</dd></div>)}
                {story.result && (<div><dt className="text-xs uppercase text-muted">Result</dt><dd className="text-zinc-300">{story.result}</dd></div>)}
                {story.metrics && (<div><dt className="text-xs uppercase text-muted">Metrics</dt><dd className="text-emerald-400">{story.metrics}</dd></div>)}
                {story.technologies && (<div><dt className="text-xs uppercase text-muted">Technologies</dt><dd className="text-cyan-400">{story.technologies}</dd></div>)}
              </dl>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Story" : "Add Story"} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Story Title *">
            <Input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Diagnosed nightly batch failures" aria-required="true" />
            {error && <span className="block text-xs text-red-400">{error}</span>}
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setField("category", e.target.value as StoryCategory)}>
              {STORY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2"><Field label="Situation"><Textarea value={form.situation} onChange={(e) => setField("situation", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Task"><Textarea value={form.task} onChange={(e) => setField("task", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Action"><Textarea value={form.action} onChange={(e) => setField("action", e.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Result"><Textarea value={form.result} onChange={(e) => setField("result", e.target.value)} /></Field></div>
          <Field label="Metrics"><Textarea value={form.metrics} onChange={(e) => setField("metrics", e.target.value)} className="min-h-[60px]" /></Field>
          <Field label="Architecture"><Textarea value={form.architecture} onChange={(e) => setField("architecture", e.target.value)} className="min-h-[60px]" /></Field>
          <Field label="Trade-offs"><Textarea value={form.tradeoffs} onChange={(e) => setField("tradeoffs", e.target.value)} className="min-h-[60px]" /></Field>
          <Field label="Scaling"><Textarea value={form.scaling} onChange={(e) => setField("scaling", e.target.value)} className="min-h-[60px]" /></Field>
          <Field label="Security Considerations"><Textarea value={form.security} onChange={(e) => setField("security", e.target.value)} className="min-h-[60px]" /></Field>
          <Field label="Lessons Learned"><Textarea value={form.lessons} onChange={(e) => setField("lessons", e.target.value)} className="min-h-[60px]" /></Field>
          <div className="sm:col-span-2"><Field label="Technologies"><Textarea value={form.technologies} onChange={(e) => setField("technologies", e.target.value)} className="min-h-[60px]" /></Field></div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={submit}>{editing ? "Save Changes" : "Add"}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteStory(deleting.id);
            toast("Story deleted", "info");
          }
        }}
        title="Delete Story"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
