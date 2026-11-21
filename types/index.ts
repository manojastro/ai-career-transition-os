// ---------- Skills ----------
export type SkillStatus =
  | "Not Started"
  | "Learning"
  | "Practiced"
  | "Project Applied"
  | "Interview Ready";

export interface SkillItem {
  id: string;
  name: string;
  status: SkillStatus;
}

export interface SkillGroup {
  id: string;
  name: string;
  items: SkillItem[];
}

export interface SkillModule {
  id: string;
  name: string;
  description?: string;
  groups: SkillGroup[];
}

// ---------- Projects ----------
export type ProjectStatus =
  | "Idea"
  | "Backlog"
  | "Planning"
  | "Building"
  | "Testing"
  | "Deployed";

export type QualityDimension =
  | "Architecture"
  | "Documentation"
  | "Deployment"
  | "Testing"
  | "Observability"
  | "Security"
  | "Metrics"
  | "Interview Explainability";

export const QUALITY_DIMENSIONS: QualityDimension[] = [
  "Architecture",
  "Documentation",
  "Deployment",
  "Testing",
  "Observability",
  "Security",
  "Metrics",
  "Interview Explainability",
];

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  githubUrl?: string;
  demoUrl?: string;
  technologies: string[];
  architectureNotes?: string;
  problemsSolved?: string;
  tradeoffs?: string;
  metrics?: string;
  interviewPitch?: string;
  startDate?: string;
  targetDate?: string;
  completion: number; // 0-100
  quality: Record<QualityDimension, number>; // 0-5
  isSample?: boolean;
}

// ---------- Certifications ----------
export type CertStatus = "Not Started" | "Preparing" | "Scheduled" | "Certified";
export type Priority = "Low" | "Medium" | "High";

export interface Certification {
  id: string;
  name: string;
  provider: string;
  category: "Cloud" | "AI" | "Other";
  priority: Priority;
  status: CertStatus;
  targetDate?: string;
  credentialUrl?: string;
  notes?: string;
}

// ---------- Jobs ----------
export const APPLICATION_STATUSES = [
  "Identified",
  "Contacted",
  "Referral Requested",
  "Referred",
  "Applied",
  "Recruiter Screening",
  "Technical Round",
  "Manager Round",
  "Final Round",
  "Offer",
  "Rejected",
  "Paused",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type CompanyTier = "Tier 1" | "Tier 2" | "Startup" | "GCC" | "Service Co" | "Other";

export interface JobApplication {
  id: string;
  company: string;
  companyTier: CompanyTier;
  role: string;
  location?: string;
  salaryRange?: string;
  referralContact?: string;
  source?: string;
  jobUrl?: string;
  appliedDate?: string;
  followUpDate?: string;
  status: ApplicationStatus;
  notes?: string;
  quality: {
    resumeCustomized: boolean;
    recruiterContacted: boolean;
    referralAttempted: boolean;
    jdAnalyzed: boolean;
    projectMapped: boolean;
    interviewPrepared: boolean;
  };
}

// ---------- Networking ----------
export const CONTACT_STATUSES = [
  "Identified",
  "Connected",
  "Conversation Started",
  "Mentor",
  "Referral Potential",
  "Referral Requested",
  "Referred",
] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export interface Contact {
  id: string;
  name: string;
  company?: string;
  role?: string;
  linkedinUrl?: string;
  status: ContactStatus;
  lastContact?: string;
  nextFollowUp?: string;
  notes?: string;
}

// ---------- Interview stories ----------
export const STORY_CATEGORIES = [
  "System Design",
  "Production Incident",
  "Root Cause Analysis",
  "Ownership",
  "Automation",
  "Failure",
  "Stakeholder Management",
  "Technical Trade-off",
  "Security",
  "Cost Optimization",
  "Performance",
  "AI/RAG Architecture",
] as const;
export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export type StoryReadiness = "Not Ready" | "Developing" | "Interview Ready" | "Excellent";

export interface InterviewStory {
  id: string;
  title: string;
  category: StoryCategory;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  metrics?: string;
  architecture?: string;
  tradeoffs?: string;
  scaling?: string;
  security?: string;
  lessons?: string;
  technologies?: string;
}

// ---------- Resume ----------
export interface ResumeBullet {
  id: string;
  rawBefore?: string;
  situation?: string;
  task?: string;
  action?: string;
  technologies?: string;
  result?: string;
  metrics?: string;
  businessImpact?: string;
}

export interface NarrativeChecklist {
  resume: boolean;
  linkedin: boolean;
  github: boolean;
  portfolio: boolean;
  interview: boolean;
}

// ---------- LinkedIn ----------
export interface LinkedInChecklist {
  headlineOptimized: boolean;
  aboutComplete: boolean;
  featuredGithub: boolean;
  architectureDemos: boolean;
  relevantSkills: boolean;
  recruiterKeywords: boolean;
  experienceRewritten: boolean;
  openToWorkReviewed: boolean;
}

export type KeywordSurface = "Resume" | "LinkedIn" | "GitHub" | "Portfolio";

export interface KeywordEntry {
  keyword: string;
  surfaces: KeywordSurface[];
}

export const POST_CATEGORIES = [
  "Architecture",
  "Project Build",
  "Lessons Learned",
  "AI Experiment",
  "System Design",
  "Career Transition",
  "Technical Deep Dive",
] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostStatus = "Draft" | "Scheduled" | "Published";

export interface LinkedInPost {
  id: string;
  title: string;
  category: PostCategory;
  status: PostStatus;
  url?: string;
  date?: string;
}

// ---------- Positioning / salary / market ----------
export const POSITIONING_STAGES = [
  "IT Service Desk",
  "ITSM Automation",
  "AIOps Engineer",
  "Agentic Operations Engineer",
  "Senior AI Engineer",
  "AI Solutions Architect / Forward Deployed AI Engineer",
] as const;

export interface SalaryConfig {
  baseline: number;
  minimum: number;
  preferredLow: number;
  preferredHigh: number;
  stretch: number;
}

export interface MarketMetric {
  id: string;
  label: string;
  note: string;
  lastUpdated: string; // ISO date entered by user
}

// ---------- Productivity ----------
export interface DailyFocus {
  date: string; // YYYY-MM-DD
  items: { id: string; text: string; done: boolean }[];
}

export interface WeeklyGoals {
  skill: string;
  project: string;
  networking: string;
  applications: string;
  interview: string;
}

export interface StreakState {
  lastActiveDate?: string;
  currentStreak: number;
  history: string[]; // dates with completed meaningful tasks
}

// ---------- RAG failure modes ----------
export interface RagFailureMode {
  id: string;
  name: string;
  symptom: string;
  cause: string;
  diagnosis: string;
  fix: string;
  practicedInProject?: string;
  understood: boolean;
}

// ---------- AI Assistant ----------
export interface LLMConfig {
  baseUrl: string; // OpenAI-compatible endpoint, e.g. https://openrouter.ai/api/v1
  apiKey: string;
  model: string;
}

export interface AppliedActionSummary {
  tool: string;
  summary: string;
  ok: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AppliedActionSummary[];
  error?: boolean;
  createdAt: number;
}

// ---------- Root state ----------
export interface AppSettings {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
}

export interface CareerOSState {
  schemaVersion: number;
  settings: AppSettings;
  profile: {
    name: string;
    yearsExperience: number;
    baselineNote: string;
    currentStageIndex: number;
    targetStageIndex: number;
  };
  salary: SalaryConfig;
  marketMetrics: MarketMetric[];
  skills: SkillModule[];
  projects: Project[];
  certifications: Certification[];
  applications: JobApplication[];
  contacts: Contact[];
  stories: InterviewStory[];
  resumeBullets: ResumeBullet[];
  narrativeChecklist: NarrativeChecklist;
  linkedinChecklist: LinkedInChecklist;
  linkedinHeadline: string;
  keywords: KeywordEntry[];
  linkedinPosts: LinkedInPost[];
  ragArchitectures: SkillItem[];
  ragEvals: SkillItem[];
  ragFailureModes: RagFailureMode[];
  jobPlatforms: { id: string; name: string; url: string; category: string }[];
  dailyFocus: DailyFocus;
  weeklyGoals: WeeklyGoals;
  streak: StreakState;
  llm: LLMConfig;
  chat: ChatMessage[];
}
