"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { isValidUrl } from "@/lib/utils";
import { POST_CATEGORIES, type PostCategory, type PostStatus, type LinkedInPost } from "@/types";
import {
  Card, CardTitle, Button, Input, Select, Field, Modal, ConfirmDialog, EmptyState, Badge,
} from "@/components/shared/ui";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";

const STATUSES: PostStatus[] = ["Draft", "Scheduled", "Published"];

const statusTone = (s: PostStatus): "gray" | "amber" | "green" =>
  s === "Published" ? "green" : s === "Scheduled" ? "amber" : "gray";

interface PostForm {
  title: string;
  category: PostCategory;
  status: PostStatus;
  url: string;
  date: string;
}

const emptyForm = (): PostForm => ({ title: "", category: "Project Build", status: "Draft", url: "", date: "" });

export default function PostsPlanner() {
  const posts = useStore((s) => s.linkedinPosts);
  const addPost = useStore((s) => s.addPost);
  const updatePost = useStore((s) => s.updatePost);
  const deletePost = useStore((s) => s.deletePost);
  const push = useToast().push;

  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<PostForm>(emptyForm);
  const [addError, setAddError] = useState("");
  const [editing, setEditing] = useState<LinkedInPost | null>(null);
  const [editForm, setEditForm] = useState<PostForm>(emptyForm);
  const [editError, setEditError] = useState("");
  const [deleting, setDeleting] = useState<LinkedInPost | null>(null);

  const validate = (f: PostForm): string => {
    if (!f.title.trim()) return "Title is required.";
    if (!isValidUrl(f.url.trim())) return "URL must start with http:// or https://.";
    return "";
  };

  const handleAdd = () => {
    const err = validate(addForm);
    setAddError(err);
    if (err) return;
    addPost({
      title: addForm.title.trim(),
      category: addForm.category,
      status: addForm.status,
      url: addForm.url.trim() || undefined,
      date: addForm.date || undefined,
    });
    setAdding(false);
    setAddForm(emptyForm());
    push("Post added to planner", "success");
  };

  const openEdit = (p: LinkedInPost) => {
    setEditing(p);
    setEditError("");
    setEditForm({
      title: p.title, category: p.category, status: p.status,
      url: p.url ?? "", date: p.date ?? "",
    });
  };

  const handleEditSave = () => {
    if (!editing) return;
    const err = validate(editForm);
    setEditError(err);
    if (err) return;
    updatePost(editing.id, {
      title: editForm.title.trim(),
      category: editForm.category,
      status: editForm.status,
      url: editForm.url.trim() || undefined,
      date: editForm.date || undefined,
    });
    setEditing(null);
    push("Post updated", "success");
  };

  const fields = (
    f: PostForm,
    onChange: (patch: Partial<PostForm>) => void,
    error: string,
  ) => (
    <div className="space-y-4">
      <Field label="Title *">
        <Input value={f.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="How I designed a self-healing RAG pipeline" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <Select value={f.category} onChange={(e) => onChange({ category: e.target.value as PostCategory })}>
            {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={f.status} onChange={(e) => onChange({ status: e.target.value as PostStatus })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="URL" hint="Must be http(s) if provided">
        <Input value={f.url} onChange={(e) => onChange({ url: e.target.value })} placeholder="https://linkedin.com/pulse/…" />
      </Field>
      <Field label="Date">
        <Input type="date" value={f.date} onChange={(e) => onChange({ date: e.target.value })} />
      </Field>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
    </div>
  );

  return (
    <Card>
      <CardTitle
        right={
          <Button variant="primary" onClick={() => { setAdding(true); setAddError(""); }}>
            <Plus className="h-4 w-4" aria-hidden /> Add Post
          </Button>
        }
      >
        Building-in-Public Planner
      </CardTitle>

      {posts.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-8 w-8" aria-hidden />}
          title="No posts planned yet"
          description="Plan building-in-public posts to grow visibility while you transition."
          action={
            <Button variant="primary" onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first post
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-muted dark:border-zinc-800 dark:bg-zinc-900/50">
                <th scope="col" className="px-4 py-2.5">Title</th>
                <th scope="col" className="px-3 py-2.5">Category</th>
                <th scope="col" className="px-3 py-2.5">Status</th>
                <th scope="col" className="px-3 py-2.5">URL</th>
                <th scope="col" className="px-3 py-2.5">Date</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-2.5 font-medium">{p.title}</td>
                  <td className="px-3 py-2.5 text-muted">{p.category}</td>
                  <td className="px-3 py-2.5"><Badge tone={statusTone(p.status)}>{p.status}</Badge></td>
                  <td className="px-3 py-2.5">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Link</a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-muted">{p.date || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                      <Button variant="ghost" className="text-red-500 hover:text-red-400" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`}>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add Post">
        {fields(addForm, (patch) => setAddForm((f) => ({ ...f, ...patch })), addError)}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAdd}>Add Post</Button>
        </div>
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Edit Post">
        {editing && (
          <>
            {fields(editForm, (patch) => setEditForm((f) => ({ ...f, ...patch })), editError)}
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
            deletePost(deleting.id);
            push("Post deleted", "info");
          }
        }}
        title="Delete Post"
        message={`Remove "${deleting?.title ?? ""}" from your planner?`}
        confirmLabel="Delete"
      />
    </Card>
  );
}
