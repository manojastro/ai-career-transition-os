"use client";

import React, { useMemo, useState } from "react";
import { Award, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { isValidUrl } from "@/lib/utils";
import { certificationProgress } from "@/lib/readiness";
import type { Certification, CertStatus, Priority } from "@/types";
import {
  Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, Field, Input,
  Modal, PageHeader, ProgressRing, Select, Textarea,
} from "@/components/shared/ui";

const CERT_STATUSES: CertStatus[] = ["Not Started", "Preparing", "Scheduled", "Certified"];
const CERT_CATEGORIES: Certification["category"][] = ["Cloud", "AI", "Other"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High"];

const STATUS_TONE: Record<CertStatus, "gray" | "amber" | "cyan" | "green"> = {
  "Not Started": "gray",
  Preparing: "amber",
  Scheduled: "cyan",
  Certified: "green",
};

const PRIORITY_TONE: Record<Priority, "gray" | "amber" | "red"> = {
  Low: "gray",
  Medium: "amber",
  High: "red",
};

interface FormState {
  name: string;
  provider: string;
  category: Certification["category"];
  priority: Priority;
  status: CertStatus;
  targetDate: string;
  credentialUrl: string;
  notes: string;
}

const emptyForm: FormState = {
  name: "", provider: "", category: "Other", priority: "Medium",
  status: "Not Started", targetDate: "", credentialUrl: "", notes: "",
};

export default function CertificationsView() {
  const certifications = useStore((s) => s.certifications);
  const addCertification = useStore((s) => s.addCertification);
  const updateCertification = useStore((s) => s.updateCertification);
  const deleteCertification = useStore((s) => s.deleteCertification);
  const toast = useToast((s) => s.push);

  const [filterCategory, setFilterCategory] = useState<"All" | Certification["category"]>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | CertStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ name?: string; provider?: string; credentialUrl?: string }>({});
  const [deleting, setDeleting] = useState<Certification | null>(null);

  const filtered = useMemo(
    () =>
      certifications.filter(
        (c) =>
          (filterCategory === "All" || c.category === filterCategory) &&
          (filterStatus === "All" || c.status === filterStatus),
      ),
    [certifications, filterCategory, filterStatus],
  );

  const progress = useMemo(() => certificationProgress({ certifications } as Parameters<typeof certificationProgress>[0]), [certifications]);
  const counts = useMemo(() => {
    const byStatus = CERT_STATUSES.map((st) => ({
      status: st,
      count: certifications.filter((c) => c.status === st).length,
    }));
    return byStatus;
  }, [certifications]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (cert: Certification) => {
    setEditing(cert);
    setForm({
      name: cert.name,
      provider: cert.provider,
      category: cert.category,
      priority: cert.priority,
      status: cert.status,
      targetDate: cert.targetDate ?? "",
      credentialUrl: cert.credentialUrl ?? "",
      notes: cert.notes ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Certification name is required.";
    if (!form.provider.trim()) errs.provider = "Provider is required.";
    if (form.credentialUrl && !isValidUrl(form.credentialUrl.trim()))
      errs.credentialUrl = "Credential URL must be a valid http(s) URL.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      provider: form.provider.trim(),
      category: form.category,
      priority: form.priority,
      status: form.status,
      targetDate: form.targetDate || undefined,
      credentialUrl: form.credentialUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) {
      updateCertification(editing.id, payload);
      toast("Certification updated", "success");
    } else {
      addCertification(payload);
      toast("Certification added", "success");
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Certifications"
        subtitle="Track certification prep, exam schedules and earned credentials."
        actions={
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Certification
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card className="flex items-center gap-6">
          <ProgressRing value={progress} label="Cert Progress" />
          <div className="space-y-1.5">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">By Status</p>
            {counts.map(({ status, count }) => (
              <div key={status} className="flex items-center gap-2 text-sm">
                <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                <span className="text-muted">{count}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex items-center justify-center">
          <p className="max-w-md text-center text-sm text-muted">
            Certifications validate foundational knowledge. Prioritize cloud and AI credentials that
            map directly to your target AIOps and agentic AI roles, and keep target dates realistic
            alongside project work.
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle
          right={
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="filter-cert-category" className="sr-only">Filter by category</label>
              <Select
                id="filter-cert-category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
                className="w-auto"
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>
                {CERT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <label htmlFor="filter-cert-status" className="sr-only">Filter by status</label>
              <Select
                id="filter-cert-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="w-auto"
                aria-label="Filter by status"
              >
                <option value="All">All Statuses</option>
                {CERT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          }
        >
          Certification Matrix ({filtered.length})
        </CardTitle>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Award className="h-10 w-10" />}
            title={certifications.length === 0 ? "No certifications yet" : "No matches for filters"}
            description={
              certifications.length === 0
                ? "Add your first certification target to start tracking prep and exam dates."
                : "Try clearing the category or status filters."
            }
            action={
              certifications.length === 0 ? (
                <Button variant="primary" onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Add Certification
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2">Certification</th>
                  <th className="px-3 py-2">Provider</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Target Date</th>
                  <th className="px-3 py-2">Credential</th>
                  <th className="px-3 py-2">Notes</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cert) => (
                  <tr key={cert.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30">
                    <td className="px-3 py-2 font-medium">{cert.name}</td>
                    <td className="px-3 py-2 text-muted">{cert.provider}</td>
                    <td className="px-3 py-2"><Badge tone={cert.category === "Cloud" ? "cyan" : cert.category === "AI" ? "indigo" : "gray"}>{cert.category}</Badge></td>
                    <td className="px-3 py-2"><Badge tone={PRIORITY_TONE[cert.priority]}>{cert.priority}</Badge></td>
                    <td className="px-3 py-2"><Badge tone={STATUS_TONE[cert.status]}>{cert.status}</Badge></td>
                    <td className="px-3 py-2 text-muted">{cert.targetDate || "—"}</td>
                    <td className="px-3 py-2">
                      {cert.credentialUrl ? (
                        <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                          Verify
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-muted" title={cert.notes}>{cert.notes || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(cert)} aria-label={`Edit ${cert.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(cert)} aria-label={`Delete ${cert.name}`}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Certification" : "Add Certification"}>
        <div className="space-y-4">
          <Field label="Certification Name *">
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. AWS Solutions Architect Associate"
              aria-required="true"
            />
            {errors.name && <span className="block text-xs text-red-400">{errors.name}</span>}
          </Field>
          <Field label="Provider *">
            <Input
              value={form.provider}
              onChange={(e) => setField("provider", e.target.value)}
              placeholder="e.g. Amazon Web Services"
              aria-required="true"
            />
            {errors.provider && <span className="block text-xs text-red-400">{errors.provider}</span>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setField("category", e.target.value as Certification["category"])}>
                {CERT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(e) => setField("priority", e.target.value as Priority)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setField("status", e.target.value as CertStatus)}>
                {CERT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Target Date">
              <Input type="date" value={form.targetDate} onChange={(e) => setField("targetDate", e.target.value)} />
            </Field>
          </div>
          <Field label="Credential URL">
            <Input
              value={form.credentialUrl}
              onChange={(e) => setField("credentialUrl", e.target.value)}
              placeholder="https://..."
            />
            {errors.credentialUrl && <span className="block text-xs text-red-400">{errors.credentialUrl}</span>}
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Study plan, exam code, resources..." />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit}>{editing ? "Save Changes" : "Add"}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteCertification(deleting.id);
            toast("Certification deleted", "info");
          }
        }}
        title="Delete Certification"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
