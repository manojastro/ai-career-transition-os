"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/store/useToast";
import { isValidUrl } from "@/lib/utils";
import { applicationQualityScore } from "@/lib/readiness";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type CompanyTier,
  type JobApplication,
} from "@/types";
import {
  Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, Field, Input,
  Modal, Select, Textarea,
} from "@/components/shared/ui";

const TIERS: CompanyTier[] = ["Tier 1", "Tier 2", "Startup", "GCC", "Service Co", "Other"];

const QUALITY_KEYS = [
  { key: "resumeCustomized", label: "Resume customized" },
  { key: "recruiterContacted", label: "Recruiter contacted" },
  { key: "referralAttempted", label: "Referral attempted" },
  { key: "jdAnalyzed", label: "JD analyzed" },
  { key: "projectMapped", label: "Project mapped" },
  { key: "interviewPrepared", label: "Interview prepared" },
] as const;

type QualityKey = (typeof QUALITY_KEYS)[number]["key"];

interface FormState {
  company: string;
  companyTier: CompanyTier;
  role: string;
  location: string;
  salaryRange: string;
  referralContact: string;
  source: string;
  jobUrl: string;
  appliedDate: string;
  followUpDate: string;
  status: ApplicationStatus;
  notes: string;
  quality: JobApplication["quality"];
}

const emptyForm: FormState = {
  company: "", companyTier: "Other", role: "", location: "", salaryRange: "",
  referralContact: "", source: "", jobUrl: "", appliedDate: "", followUpDate: "",
  status: "Identified", notes: "",
  quality: {
    resumeCustomized: false, recruiterContacted: false, referralAttempted: false,
    jdAnalyzed: false, projectMapped: false, interviewPrepared: false,
  },
};

function QualityBadge({ score }: { score: number }) {
  const tone = score >= 80 ? "green" : score >= 50 ? "amber" : "red";
  return <Badge tone={tone}>{score}%</Badge>;
}

export default function ApplicationsSection({
  applications,
  addApplication,
  updateApplication,
  deleteApplication,
}: {
  applications: JobApplication[];
  addApplication: (app: Omit<JobApplication, "id">) => void;
  updateApplication: (id: string, patch: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => void;
}) {
  const toast = useToast((s) => s.push);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ company?: string; role?: string; jobUrl?: string }>({});
  const [deleting, setDeleting] = useState<JobApplication | null>(null);
  const [popoverFor, setPopoverFor] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...applications].sort((a, b) => (b.appliedDate ?? "").localeCompare(a.appliedDate ?? "")),
    [applications],
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (app: JobApplication) => {
    setEditing(app);
    setForm({
      company: app.company, companyTier: app.companyTier, role: app.role,
      location: app.location ?? "", salaryRange: app.salaryRange ?? "",
      referralContact: app.referralContact ?? "", source: app.source ?? "",
      jobUrl: app.jobUrl ?? "", appliedDate: app.appliedDate ?? "",
      followUpDate: app.followUpDate ?? "", status: app.status, notes: app.notes ?? "",
      quality: { ...app.quality },
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const errs: typeof errors = {};
    if (!form.company.trim()) errs.company = "Company is required.";
    if (!form.role.trim()) errs.role = "Role is required.";
    if (form.jobUrl && !isValidUrl(form.jobUrl.trim())) errs.jobUrl = "Job URL must be a valid http(s) URL.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      company: form.company.trim(), companyTier: form.companyTier, role: form.role.trim(),
      location: form.location.trim() || undefined, salaryRange: form.salaryRange.trim() || undefined,
      referralContact: form.referralContact.trim() || undefined, source: form.source.trim() || undefined,
      jobUrl: form.jobUrl.trim() || undefined, appliedDate: form.appliedDate || undefined,
      followUpDate: form.followUpDate || undefined, status: form.status,
      notes: form.notes.trim() || undefined, quality: form.quality,
    };
    if (editing) {
      updateApplication(editing.id, payload);
      toast("Application updated", "success");
    } else {
      addApplication(payload);
      toast("Application added", "success");
    }
    setModalOpen(false);
  };

  const toggleQuality = (appId: string, key: QualityKey) =>
    updateApplication(appId, {
      quality: {
        ...applications.find((a) => a.id === appId)!.quality,
        [key]: !applications.find((a) => a.id === appId)!.quality[key],
      },
    });

  return (
    <Card className="mb-6">
      <CardTitle
        right={
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        }
      >
        Applications ({applications.length})
      </CardTitle>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-10 w-10" />}
          title="No applications yet"
          description="Add highly relevant, customized applications — quality over quantity."
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Application
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Salary Range</th>
                <th className="px-3 py-2">Referral</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Job URL</th>
                <th className="px-3 py-2">Applied</th>
                <th className="px-3 py-2">Follow-Up</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Quality</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((app) => {
                const score = applicationQualityScore(app);
                const done = Object.values(app.quality).filter(Boolean).length;
                return (
                  <tr key={app.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30">
                    <td className="px-3 py-2 font-medium">{app.company}</td>
                    <td className="px-3 py-2"><Badge tone={app.companyTier === "Tier 1" ? "indigo" : "gray"}>{app.companyTier}</Badge></td>
                    <td className="px-3 py-2">{app.role}</td>
                    <td className="px-3 py-2 text-muted">{app.location || "—"}</td>
                    <td className="px-3 py-2 text-muted">{app.salaryRange || "—"}</td>
                    <td className="px-3 py-2 text-muted">{app.referralContact || "—"}</td>
                    <td className="px-3 py-2 text-muted">{app.source || "—"}</td>
                    <td className="px-3 py-2">
                      {app.jobUrl ? (
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Link</a>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-3 py-2 text-muted">{app.appliedDate || "—"}</td>
                    <td className="px-3 py-2 text-muted">{app.followUpDate || "—"}</td>
                    <td className="px-3 py-2">
                      <label className="sr-only" htmlFor={`status-${app.id}`}>Status for {app.company}</label>
                      <Select
                        id={`status-${app.id}`}
                        value={app.status}
                        onChange={(e) => updateApplication(app.id, { status: e.target.value as ApplicationStatus })}
                        className="w-40"
                      >
                        {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </Select>
                    </td>
                    <td className="relative px-3 py-2">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2 py-1 text-xs hover:bg-zinc-800"
                        onClick={() => setPopoverFor(popoverFor === app.id ? null : app.id)}
                        aria-expanded={popoverFor === app.id}
                        aria-label={`Quality checklist for ${app.company} (${done}/6 done)`}
                      >
                        <QualityBadge score={score} />
                        <span className="text-muted">{done}/6</span>
                      </button>
                      {popoverFor === app.id && (
                        <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Quality Checklist</p>
                          <ul className="space-y-1.5">
                            {QUALITY_KEYS.map(({ key, label }) => (
                              <li key={key}>
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={app.quality[key]}
                                    onChange={() => toggleQuality(app.id, key)}
                                    className="h-4 w-4 accent-emerald-500"
                                  />
                                  {label}
                                </label>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="mt-2 w-full justify-center" onClick={() => setPopoverFor(null)}>Close</Button>
                        </div>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-2 text-muted" title={app.notes}>{app.notes || "—"}</td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(app)} aria-label={`Edit ${app.company} application`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(app)} aria-label={`Delete ${app.company} application`}>
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Application" : "Add Application"} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company *">
            <Input value={form.company} onChange={(e) => setField("company", e.target.value)} placeholder="e.g. Zomato" aria-required="true" />
            {errors.company && <span className="block text-xs text-red-400">{errors.company}</span>}
          </Field>
          <Field label="Company Tier">
            <Select value={form.companyTier} onChange={(e) => setField("companyTier", e.target.value as CompanyTier)}>
              {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Role *">
            <Input value={form.role} onChange={(e) => setField("role", e.target.value)} placeholder="e.g. Senior AI Engineer" aria-required="true" />
            {errors.role && <span className="block text-xs text-red-400">{errors.role}</span>}
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="e.g. Bengaluru (Remote)" />
          </Field>
          <Field label="Salary Range">
            <Input value={form.salaryRange} onChange={(e) => setField("salaryRange", e.target.value)} placeholder="e.g. 30-45 LPA" />
          </Field>
          <Field label="Referral Contact">
            <Input value={form.referralContact} onChange={(e) => setField("referralContact", e.target.value)} placeholder="Name of referrer" />
          </Field>
          <Field label="Source">
            <Input value={form.source} onChange={(e) => setField("source", e.target.value)} placeholder="e.g. LinkedIn, Referral" />
          </Field>
          <Field label="Job URL">
            <Input value={form.jobUrl} onChange={(e) => setField("jobUrl", e.target.value)} placeholder="https://..." />
            {errors.jobUrl && <span className="block text-xs text-red-400">{errors.jobUrl}</span>}
          </Field>
          <Field label="Applied Date">
            <Input type="date" value={form.appliedDate} onChange={(e) => setField("appliedDate", e.target.value)} />
          </Field>
          <Field label="Follow-Up Date">
            <Input type="date" value={form.followUpDate} onChange={(e) => setField("followUpDate", e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setField("status", e.target.value as ApplicationStatus)}>
              {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Why this company, tailoring notes..." />
            </Field>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Quality Checklist</legend>
            <ul className="grid gap-2 sm:grid-cols-2">
              {QUALITY_KEYS.map(({ key, label }) => (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.quality[key]}
                      onChange={() => setField("quality", { ...form.quality, [key]: !form.quality[key] })}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            <Check className="h-4 w-4" /> {editing ? "Save Changes" : "Add"}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteApplication(deleting.id);
            toast("Application deleted", "info");
          }
        }}
        title="Delete Application"
        message={`Delete the application for "${deleting?.role}" at ${deleting?.company}? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </Card>
  );
}
