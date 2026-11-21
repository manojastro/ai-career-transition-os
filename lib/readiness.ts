import type { CareerOSState, InterviewStory, Project } from "@/types";
import { STATUS_WEIGHT } from "@/data/seed";

export interface PillarScore {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number;
}

export const skillsCompletion = (s: CareerOSState): number => {
  const items = [...s.ragArchitectures, ...s.ragEvals];
  const treeItems = s.skills.flatMap((m) => m.groups.flatMap((g) => g.items));
  const all = [...items, ...treeItems];
  if (all.length === 0) return 0;
  const total = all.reduce((sum, i) => sum + STATUS_WEIGHT[i.status], 0);
  return Math.round((total / all.length) * 100);
};

export const portfolioCompletion = (s: CareerOSState): number => {
  if (s.projects.length === 0) return 0;
  const deployedish = s.projects.filter((p) => p.status === "Deployed").length;
  const avgCompletion = s.projects.reduce((sum, p) => sum + p.completion, 0) / s.projects.length / 100;
  const deploymentRatio = deployedish / Math.max(s.projects.length, 1);
  // Weight: 70% average completion progress, 30% deployment evidence
  return Math.round((avgCompletion * 0.7 + deploymentRatio * 0.3) * 100);
};

export const interviewStoryCompletion = (s: CareerOSState): number => {
  const target = 15;
  const readyStories = s.stories.filter((st) => storyReadiness(st) === "Interview Ready" || storyReadiness(st) === "Excellent").length;
  return Math.min(100, Math.round((readyStories / target) * 100));
};

export const networkingProgress = (s: CareerOSState): number => {
  const contactScore = Math.min(1, s.contacts.length / 20);
  const appScore = Math.min(1, s.applications.length / 10);
  const activeContacts = s.contacts.filter((c) => c.status !== "Identified").length / Math.max(s.contacts.length, 1);
  return Math.round((contactScore * 0.4 + appScore * 0.4 + activeContacts * 0.2) * 100);
};

export const certificationProgress = (s: CareerOSState): number => {
  if (s.certifications.length === 0) return 0;
  const weight: Record<string, number> = { "Not Started": 0, Preparing: 0.4, Scheduled: 0.7, Certified: 1 };
  const total = s.certifications.reduce((sum, c) => sum + weight[c.status], 0);
  return Math.round((total / s.certifications.length) * 100);
};

export const jobPipelineProgress = (s: CareerOSState): number => {
  const targetCompanies = 50;
  const uniqueCompanies = new Set(s.applications.map((a) => a.company.toLowerCase())).size;
  const advanced = s.applications.filter((a) =>
    ["Recruiter Screening", "Technical Round", "Manager Round", "Final Round", "Offer"].includes(a.status),
  ).length;
  const coverage = Math.min(1, uniqueCompanies / targetCompanies);
  const momentum = Math.min(1, advanced / 5);
  return Math.round((coverage * 0.6 + momentum * 0.4) * 100);
};

export const pillars = (s: CareerOSState): PillarScore[] => [
  { key: "skills", label: "Skills", score: skillsCompletion(s), weight: 0.25 },
  { key: "portfolio", label: "Portfolio", score: portfolioCompletion(s), weight: 0.3 },
  { key: "interview", label: "Interview Stories", score: interviewStoryCompletion(s), weight: 0.15 },
  { key: "networking", label: "Networking & Pipeline", score: Math.round((networkingProgress(s) + jobPipelineProgress(s)) / 2), weight: 0.15 },
  { key: "certifications", label: "Certifications", score: certificationProgress(s), weight: 0.15 },
];

export const overallReadiness = (s: CareerOSState): number => {
  const p = pillars(s);
  return Math.round(p.reduce((sum, x) => sum + x.score * x.weight, 0));
};

export const projectQuality = (p: Project): number => {
  const dims = Object.values(p.quality);
  return Math.round((dims.reduce((a, b) => a + b, 0) / (dims.length * 5)) * 100);
};

export const storyReadiness = (st: InterviewStory): "Not Ready" | "Developing" | "Interview Ready" | "Excellent" => {
  const core = [st.situation, st.task, st.action, st.result].filter(Boolean).length;
  const depth = [st.metrics, st.architecture, st.tradeoffs, st.lessons].filter(Boolean).length;
  const total = core + depth;
  if (total <= 3) return "Not Ready";
  if (total <= 6) return "Developing";
  if (total <= 7) return "Interview Ready";
  return "Excellent";
};

export const applicationQualityScore = (a: CareerOSState["applications"][number]): number => {
  const checks = Object.values(a.quality);
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const linkedinReadiness = (s: CareerOSState): number => {
  const checks = Object.values(s.linkedinChecklist);
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

export const keywordCoverage = (s: CareerOSState): number => {
  const slots = s.keywords.length * 4;
  if (slots === 0) return 0;
  const filled = s.keywords.reduce((sum, k) => sum + k.surfaces.length, 0);
  return Math.round((filled / slots) * 100);
};

export interface Recommendation {
  title: string;
  reason: string;
}

export const nextBestActions = (s: CareerOSState): Recommendation[] => {
  const recs: Recommendation[] = [];
  const p = {
    skills: skillsCompletion(s),
    portfolio: portfolioCompletion(s),
    interview: interviewStoryCompletion(s),
    networking: networkingProgress(s),
    certifications: certificationProgress(s),
    applications: s.applications.length,
    deployed: s.projects.filter((pr) => pr.status === "Deployed").length,
  };

  if (p.skills > 70 && p.portfolio < 40) {
    recs.push({
      title: "Stop adding courses temporarily and ship another portfolio project.",
      reason: `Skills are at ${p.skills}% but portfolio is only ${p.portfolio}%. Deployed production evidence is your weakest pillar right now.`,
    });
  }
  if (p.portfolio > 60 && p.applications < 20 && p.deployed >= 2) {
    recs.push({
      title: "Begin targeted applications and recruiter outreach.",
      reason: `Portfolio progress is ${p.portfolio}% with ${p.deployed} deployed projects. Your evidence base now supports focused applications.`,
    });
  }
  if (p.interview < 50 && p.applications > 5) {
    recs.push({
      title: "Increase interview preparation before the application funnel accelerates.",
      reason: `Interview stories are at ${p.interview}% readiness while you already have ${p.applications} applications in flight.`,
    });
  }
  if (p.skills < 40) {
    recs.push({
      title: "Focus on core skill foundations before expanding scope.",
      reason: `Overall skill completion is ${p.skills}%. Foundational skills compound — every later project gets faster.`,
    });
  }
  if (p.deployed === 0 && s.projects.length > 0) {
    recs.push({
      title: "Take one project all the way to Deployed.",
      reason: "A single deployed, documented system with observability is stronger interview evidence than several half-built ones.",
    });
  }
  if (p.networking < 30) {
    recs.push({
      title: "Start networking: identify 5 relevant contacts this week.",
      reason: `Networking progress is ${p.networking}%. Referrals dramatically outperform cold applications.`,
    });
  }

  const weakest = pillars(s).sort((a, b) => a.score * a.weight - b.score * b.weight)[0];
  recs.push({
    title: `Your lowest-weighted pillar is ${weakest.label} (${weakest.score}%). Improving it produces the largest readiness gain.`,
    reason: `${weakest.label} carries ${Math.round(weakest.weight * 100)}% of the overall readiness score.`,
  });

  return recs.slice(0, 4);
};
