import type { Store } from "@/store/useStore";
import { PROJECT_COLUMNS, PROJECT_STATUSES } from "@/lib/tools";
import {
  APPLICATION_STATUSES, CONTACT_STATUSES, STORY_CATEGORIES,
} from "@/types";
import type {
  ApplicationStatus, CertStatus, ContactStatus, PostCategory, PostStatus,
  Priority, ProjectStatus, SkillStatus, StoryCategory,
} from "@/types";

export interface CareerAction {
  tool: string;
  args: Record<string, unknown>;
}

export interface ActionResult {
  ok: boolean;
  summary: string;
}

const SKILL_STATUSES: SkillStatus[] = ["Not Started", "Learning", "Practiced", "Project Applied", "Interview Ready"];
const CERT_STATUSES: CertStatus[] = ["Not Started", "Preparing", "Scheduled", "Certified"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High"];
const POST_STATUSES: PostStatus[] = ["Draft", "Scheduled", "Published"];

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;
const str = (v: unknown): string => (isStr(v) ? v.trim() : "");
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined =>
  isStr(v) ? allowed.find((a) => a.toLowerCase() === v.trim().toLowerCase()) : undefined;

const findApp = (store: Store, company: string, role?: string) =>
  store.applications
    .filter((a) => a.company.toLowerCase().includes(company.toLowerCase()))
    .filter((a) => !role || a.role.toLowerCase().includes(role.toLowerCase()))
    .sort((a, b) => (b.appliedDate ?? "").localeCompare(a.appliedDate ?? ""))[0];

const findProject = (store: Store, name: string) =>
  store.projects.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));

const findContact = (store: Store, name: string) =>
  store.contacts.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));

const findCert = (store: Store, name: string) =>
  store.certifications.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));

const toTechList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter(isStr).map((s) => s.trim());
  if (isStr(v)) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
};

/**
 * Deterministic, validating dispatcher. Every LLM-proposed action goes through
 * here before touching the store — malformed or unknown entities are rejected.
 */
export function executeCareerAction(store: Store, action: CareerAction): ActionResult {
  const a = action.args ?? {};

  switch (action.tool) {
    case "add_job_application": {
      const company = str(a.company);
      const role = str(a.role);
      if (!company || !role) return { ok: false, summary: "add_job_application requires 'company' and 'role'." };
      const status = oneOf(a.status, APPLICATION_STATUSES) ?? "Identified";
      store.addApplication({
        company, role, status,
        location: str(a.location) || undefined,
        salaryRange: str(a.salary_range) || undefined,
        companyTier: oneOf(a.company_tier, ["Tier 1", "Tier 2", "Startup", "GCC", "Service Co", "Other"]) ?? "Other",
        source: str(a.source) || undefined,
        jobUrl: str(a.job_url) || undefined,
        referralContact: str(a.referral_contact) || undefined,
        notes: str(a.notes) || undefined,
        appliedDate: status === "Applied" || status === "Identified" ? new Date().toISOString().slice(0, 10) : undefined,
        quality: {
          resumeCustomized: false, recruiterContacted: false, referralAttempted: false,
          jdAnalyzed: false, projectMapped: false, interviewPrepared: false,
        },
      });
      return { ok: true, summary: `Added application: ${company} — ${role} (${status}).` };
    }

    case "update_application_status": {
      const company = str(a.company);
      if (!company) return { ok: false, summary: "update_application_status requires 'company'." };
      const status = oneOf(a.status, APPLICATION_STATUSES);
      if (!status) return { ok: false, summary: `Invalid status. Allowed: ${APPLICATION_STATUSES.join(", ")}.` };
      const app = findApp(store, company, str(a.role) || undefined);
      if (!app) return { ok: false, summary: `No application found matching company "${company}".` };
      const old = app.status;
      store.updateApplication(app.id, {
        status,
        appliedDate: status === "Applied" && !app.appliedDate ? new Date().toISOString().slice(0, 10) : app.appliedDate,
      });
      return { ok: true, summary: `${app.company} — ${app.role}: ${old} → ${status}.` };
    }

    case "add_project": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "add_project requires 'name'." };
      const status = oneOf(a.status, PROJECT_STATUSES) ?? "Idea";
      store.addProject({
        name,
        description: str(a.description) || "",
        status,
        technologies: toTechList(a.technologies),
        completion: Math.min(100, Math.max(0, num(a.completion) ?? 0)),
        quality: {
          Architecture: 0, Documentation: 0, Deployment: 0, Testing: 0,
          Observability: 0, Security: 0, Metrics: 0, "Interview Explainability": 0,
        },
      });
      return { ok: true, summary: `Added project "${name}" (${status}).` };
    }

    case "update_project_status": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "update_project_status requires 'name'." };
      const status = oneOf(a.status, PROJECT_STATUSES);
      if (!status) return { ok: false, summary: `Invalid status. Allowed: ${PROJECT_STATUSES.join(", ")}.` };
      const p = findProject(store, name);
      if (!p) return { ok: false, summary: `No project found matching "${name}".` };
      store.moveProject(p.id, status);
      return { ok: true, summary: `Project "${p.name}": ${p.status} → ${status}.` };
    }

    case "set_project_completion": {
      const name = str(a.name);
      const completion = num(a.completion);
      if (!name || completion === undefined) return { ok: false, summary: "set_project_completion requires 'name' and numeric 'completion' (0-100)." };
      const p = findProject(store, name);
      if (!p) return { ok: false, summary: `No project found matching "${name}".` };
      const clamped = Math.min(100, Math.max(0, Math.round(completion)));
      store.updateProject(p.id, { completion: clamped });
      return { ok: true, summary: `Project "${p.name}" completion: ${p.completion}% → ${clamped}%.` };
    }

    case "set_skill_status": {
      const skill = str(a.skill);
      if (!skill) return { ok: false, summary: "set_skill_status requires 'skill'." };
      const status = oneOf(a.status, SKILL_STATUSES);
      if (!status) return { ok: false, summary: `Invalid status. Allowed: ${SKILL_STATUSES.join(", ")}.` };
      for (const m of store.skills) {
        for (const g of m.groups) {
          const item = g.items.find((i) => i.name.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(i.name.toLowerCase()));
          if (item) {
            store.setSkillStatus(m.id, g.id, item.id, status);
            return { ok: true, summary: `Skill "${item.name}": ${item.status} → ${status}.` };
          }
        }
      }
      const arch = store.ragArchitectures.find(
        (i) => i.name.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(i.name.toLowerCase()),
      );
      if (arch) {
        store.setRagItemStatus("ragArchitectures", arch.id, status);
        return { ok: true, summary: `RAG architecture "${arch.name}": ${arch.status} → ${status}.` };
      }
      const evalItem = store.ragEvals.find(
        (i) => i.name.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(i.name.toLowerCase()),
      );
      if (evalItem) {
        store.setRagItemStatus("ragEvals", evalItem.id, status);
        return { ok: true, summary: `RAG evaluation "${evalItem.name}": ${evalItem.status} → ${status}.` };
      }
      return { ok: false, summary: `No skill found matching "${skill}".` };
    }

    case "add_certification": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "add_certification requires 'name'." };
      store.addCertification({
        name,
        provider: str(a.provider) || "Unknown",
        category: oneOf(a.category, ["Cloud", "AI", "Other"]) ?? "Other",
        priority: oneOf(a.priority, PRIORITIES) ?? "Medium",
        status: oneOf(a.status, CERT_STATUSES) ?? "Not Started",
        notes: str(a.notes) || undefined,
      });
      return { ok: true, summary: `Added certification "${name}".` };
    }

    case "update_certification_status": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "update_certification_status requires 'name'." };
      const status = oneOf(a.status, CERT_STATUSES);
      if (!status) return { ok: false, summary: `Invalid status. Allowed: ${CERT_STATUSES.join(", ")}.` };
      const c = findCert(store, name);
      if (!c) return { ok: false, summary: `No certification found matching "${name}".` };
      store.updateCertification(c.id, { status });
      return { ok: true, summary: `${c.name}: ${c.status} → ${status}.` };
    }

    case "add_contact": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "add_contact requires 'name'." };
      store.addContact({
        name,
        company: str(a.company) || undefined,
        role: str(a.contact_role) || undefined,
        status: oneOf(a.status, CONTACT_STATUSES) ?? "Identified",
        linkedinUrl: str(a.linkedin_url) || undefined,
        notes: str(a.notes) || undefined,
      });
      return { ok: true, summary: `Added contact ${name}${str(a.company) ? ` (${str(a.company)})` : ""}.` };
    }

    case "update_contact_status": {
      const name = str(a.name);
      if (!name) return { ok: false, summary: "update_contact_status requires 'name'." };
      const status = oneOf(a.status, CONTACT_STATUSES);
      if (!status) return { ok: false, summary: `Invalid status. Allowed: ${CONTACT_STATUSES.join(", ")}.` };
      const c = findContact(store, name);
      if (!c) return { ok: false, summary: `No contact found matching "${name}".` };
      store.updateContact(c.id, { status });
      return { ok: true, summary: `${c.name}: ${c.status} → ${status}.` };
    }

    case "add_interview_story": {
      const title = str(a.title);
      if (!title) return { ok: false, summary: "add_interview_story requires 'title'." };
      const category = (oneOf(a.category, STORY_CATEGORIES) ?? "System Design") as StoryCategory;
      store.addStory({
        title, category,
        situation: str(a.situation) || undefined,
        task: str(a.task) || undefined,
        action: str(a.action) || undefined,
        result: str(a.result) || undefined,
        metrics: str(a.metrics) || undefined,
        technologies: str(a.technologies) || undefined,
      });
      return { ok: true, summary: `Added interview story "${title}" (${category}).` };
    }

    case "add_resume_bullet": {
      const actionText = str(a.action);
      if (!actionText) return { ok: false, summary: "add_resume_bullet requires 'action'." };
      store.addBullet({
        action: actionText,
        situation: str(a.situation) || undefined,
        task: str(a.task) || undefined,
        result: str(a.result) || undefined,
        metrics: str(a.metrics) || undefined,
      });
      return { ok: true, summary: "Saved resume bullet." };
    }

    case "add_linkedin_post": {
      const title = str(a.title);
      if (!title) return { ok: false, summary: "add_linkedin_post requires 'title'." };
      const categories: PostCategory[] = ["Architecture", "Project Build", "Lessons Learned", "AI Experiment", "System Design", "Career Transition", "Technical Deep Dive"];
      store.addPost({
        title,
        category: oneOf(a.category, categories) ?? "Project Build",
        status: oneOf(a.status, POST_STATUSES) ?? "Draft",
        url: str(a.url) || undefined,
        date: new Date().toISOString().slice(0, 10),
      });
      return { ok: true, summary: `Added LinkedIn post "${title}" (Draft).` };
    }

    case "add_keyword": {
      const keyword = str(a.keyword);
      if (!keyword) return { ok: false, summary: "add_keyword requires 'keyword'." };
      store.addKeyword(keyword);
      return { ok: true, summary: `Added keyword "${keyword}".` };
    }

    case "get_status_report": {
      return { ok: true, summary: "__REPORT__" };
    }

    default:
      return { ok: false, summary: `Unknown action "${action.tool}".` };
  }
}

export function buildStatusReport(store: Store): string {
  const apps = store.applications;
  const byStatus = APPLICATION_STATUSES.map((s) => `${s}: ${apps.filter((x) => x.status === s).length}`).join("; ");
  return [
    `Applications: ${apps.length} total. ${byStatus}`,
    `Projects: ${store.projects.length}; deployed: ${store.projects.filter((p) => p.status === "Deployed").length}; building: ${store.projects.filter((p) => p.status === "Building").length}.`,
    `Certifications: ${store.certifications.filter((c) => c.status === "Certified").length} certified, ${store.certifications.filter((c) => c.status === "Preparing").length} preparing.`,
    `Interview stories: ${store.stories.length}.`,
    `Contacts: ${store.contacts.length}.`,
    `Kanban columns: ${PROJECT_COLUMNS.join(", ")}.`,
  ].join("\n");
}
