"use client";

import React, { useState } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { useToast } from "@/store/useToast";
import { isValidUrl } from "@/lib/utils";
import {
  CONTACT_STATUSES,
  type Contact,
  type ContactStatus,
} from "@/types";
import {
  Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, Field, Input,
  Modal, Select, Textarea,
} from "@/components/shared/ui";

const STATUS_TONE: Record<ContactStatus, "gray" | "green" | "cyan" | "indigo" | "amber"> = {
  Identified: "gray",
  Connected: "cyan",
  "Conversation Started": "indigo",
  Mentor: "green",
  "Referral Potential": "amber",
  "Referral Requested": "amber",
  Referred: "green",
};

interface FormState {
  name: string;
  company: string;
  role: string;
  linkedinUrl: string;
  status: ContactStatus;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
}

const emptyForm: FormState = {
  name: "", company: "", role: "", linkedinUrl: "", status: "Identified",
  lastContact: "", nextFollowUp: "", notes: "",
};

export default function NetworkingCRM({
  contacts,
  addContact,
  updateContact,
  deleteContact,
}: {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, "id">) => void;
  updateContact: (id: string, patch: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
}) {
  const toast = useToast((s) => s.push);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<{ name?: string; linkedinUrl?: string }>({});
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({
      name: c.name, company: c.company ?? "", role: c.role ?? "",
      linkedinUrl: c.linkedinUrl ?? "", status: c.status,
      lastContact: c.lastContact ?? "", nextFollowUp: c.nextFollowUp ?? "",
      notes: c.notes ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (form.linkedinUrl && !isValidUrl(form.linkedinUrl.trim()))
      errs.linkedinUrl = "LinkedIn URL must be a valid http(s) URL.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(), company: form.company.trim() || undefined,
      role: form.role.trim() || undefined, linkedinUrl: form.linkedinUrl.trim() || undefined,
      status: form.status, lastContact: form.lastContact || undefined,
      nextFollowUp: form.nextFollowUp || undefined, notes: form.notes.trim() || undefined,
    };
    if (editing) {
      updateContact(editing.id, payload);
      toast("Contact updated", "success");
    } else {
      addContact(payload);
      toast("Contact added", "success");
    }
    setModalOpen(false);
  };

  return (
    <Card className="mb-6">
      <CardTitle
        right={
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        }
      >
        Networking CRM ({contacts.length})
      </CardTitle>

      {contacts.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No contacts yet"
          description="Build your referral network — referrals dramatically outperform cold applications."
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Contact
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">LinkedIn</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last Contact</th>
                <th className="px-3 py-2">Next Follow-up</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-muted">{c.company || "—"}</td>
                  <td className="px-3 py-2 text-muted">{c.role || "—"}</td>
                  <td className="px-3 py-2">
                    {c.linkedinUrl ? (
                      <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Profile</a>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2"><Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge></td>
                  <td className="px-3 py-2 text-muted">{c.lastContact || "—"}</td>
                  <td className="px-3 py-2 text-muted">{c.nextFollowUp || "—"}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-muted" title={c.notes}>{c.notes || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Contact" : "Add Contact"}>
        <div className="space-y-4">
          <Field label="Name *">
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full name" aria-required="true" />
            {errors.name && <span className="block text-xs text-red-400">{errors.name}</span>}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <Input value={form.company} onChange={(e) => setField("company", e.target.value)} />
            </Field>
            <Field label="Role">
              <Input value={form.role} onChange={(e) => setField("role", e.target.value)} />
            </Field>
          </div>
          <Field label="LinkedIn URL">
            <Input value={form.linkedinUrl} onChange={(e) => setField("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
            {errors.linkedinUrl && <span className="block text-xs text-red-400">{errors.linkedinUrl}</span>}
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setField("status", e.target.value as ContactStatus)}>
              {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Last Contact">
              <Input type="date" value={form.lastContact} onChange={(e) => setField("lastContact", e.target.value)} />
            </Field>
            <Field label="Next Follow-up">
              <Input type="date" value={form.nextFollowUp} onChange={(e) => setField("nextFollowUp", e.target.value)} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
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
            deleteContact(deleting.id);
            toast("Contact deleted", "info");
          }
        }}
        title="Delete Contact"
        message={`Delete "${deleting?.name}" from your network? This cannot be undone.`}
        confirmLabel="Delete"
      />
    </Card>
  );
}
