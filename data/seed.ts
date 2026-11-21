import type {
  AppSettings,
  CareerOSState,
  Certification,
  KeywordEntry,
  MarketMetric,
  Project,
  SkillItem,
  SkillModule,
} from "@/types";

export const SKILL_STATUSES = [
  "Not Started",
  "Learning",
  "Practiced",
  "Project Applied",
  "Interview Ready",
] as const;

export const STATUS_WEIGHT: Record<SkillItem["status"], number> = {
  "Not Started": 0,
  Learning: 0.25,
  Practiced: 0.5,
  "Project Applied": 0.75,
  "Interview Ready": 1,
};

const item = (name: string): SkillItem => ({ id: `sk-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, status: "Not Started" });

export const seedSkills: SkillModule[] = [
  {
    id: "mod-python",
    name: "Python",
    description: "Foundation and production-grade Python for AI engineering",
    groups: [
      {
        id: "grp-python-foundation",
        name: "Foundation",
        items: ["Collections", "Functions", "Modules", "JSON", "File handling", "Error handling", "REST APIs", "OOP"].map(item),
      },
      {
        id: "grp-python-production",
        name: "Production Python",
        items: [
          "Type hints", "Pydantic", "Async/await", "asyncio", "Logging", "Testing",
          "Dependency management", "Environment variables", "API retries", "Rate limiting",
        ].map(item),
      },
    ],
  },
  {
    id: "mod-agent",
    name: "Agent Engineering Roadmap",
    description: "Eight stages from LLM fundamentals to production observability",
    groups: [
      {
        id: "grp-stage-1",
        name: "Stage 01 — LLM Fundamentals",
        items: ["Tokens", "Context windows", "Inference", "Reasoning models", "Temperature", "Structured output", "Tool calling"].map(item),
      },
      {
        id: "grp-stage-2",
        name: "Stage 02 — Context Engineering",
        items: ["System prompts", "Prompt templates", "Structured instructions", "XML schemas", "JSON schemas", "Context management"].map(item),
      },
      {
        id: "grp-stage-3",
        name: "Stage 03 — Memory",
        items: ["Short-term memory", "Vector memory", "Episodic memory", "Semantic memory", "Mem0", "Cache strategies"].map(item),
      },
      {
        id: "grp-stage-4",
        name: "Stage 04 — Agentic Workflows",
        items: ["LangGraph", "CrewAI", "Pydantic AI", "State machines", "Multi-agent architectures"].map(item),
      },
      {
        id: "grp-stage-5",
        name: "Stage 05 — MCP & Tools",
        items: ["Model Context Protocol", "Tool servers", "Secure integrations", "Browser Use", "API tools"].map(item),
      },
      {
        id: "grp-stage-6",
        name: "Stage 06 — Gateways & Cost",
        items: ["LiteLLM", "OpenRouter", "Portkey", "Token accounting", "Model routing", "Fallback models"].map(item),
      },
      {
        id: "grp-stage-7",
        name: "Stage 07 — Safety",
        items: ["LlamaGuard", "NeMo Guardrails", "Guardrails AI", "Prompt injection protection", "Tool permissioning"].map(item),
      },
      {
        id: "grp-stage-8",
        name: "Stage 08 — Observability & Evaluation",
        items: ["Langfuse", "LangSmith", "Traces", "Evaluations", "LLM-as-a-judge", "Latency", "Token usage", "Cost monitoring"].map(item),
      },
    ],
  },
];

export const RAG_LIFECYCLE = [
  "Load", "Split", "Embed", "Store", "Query", "Embed Query",
  "Retrieve", "Re-rank", "Augment", "Generate",
] as const;

const emptyQuality = (): Project["quality"] => ({
  Architecture: 0, Documentation: 0, Deployment: 0, Testing: 0,
  Observability: 0, Security: 0, Metrics: 0, "Interview Explainability": 0,
});

const seedProject = (
  id: string,
  name: string,
  description: string,
  technologies: string[],
  status: Project["status"] = "Idea",
): Project => ({ id, name, description, technologies, status, completion: 0, quality: emptyQuality(), isSample: true });

export const seedProjects: Project[] = [
  seedProject("pj-chatbot", "AI Chatbot", "FastAPI + streaming + LLM gateway.", ["Python", "FastAPI", "WebSockets", "LiteLLM"]),
  seedProject("pj-rag", "Enterprise RAG", "SOP/KEDB semantic + hybrid retrieval over enterprise knowledge.", ["LangChain", "pgvector", "BM25", "FastAPI"]),
  seedProject("pj-coding-agent", "AI Coding Agent", "Tool calling and automated code repair.", ["LangGraph", "MCP", "GitHub API"]),
  seedProject("pj-voice", "Voice Agent", "Speech AI + WebRTC real-time voice assistant.", ["WebRTC", "Whisper", "TTS", "Python"]),
  seedProject("pj-mcp", "MCP Server", "Secure tool-access bridge for enterprise systems.", ["TypeScript", "MCP", "OAuth"]),
  seedProject("pj-research", "Deep Research Agent", "Multi-step research and synthesis workflow.", ["LangGraph", "Search APIs", "Structured output"]),
  seedProject("pj-browser", "Browser Agent", "Playwright-based automation agent.", ["Playwright", "Python", "Vision models"]),
  seedProject("pj-multimodal", "Multimodal AI Application", "Image + text analysis workflow.", ["Vision LLM", "FastAPI", "Queue workers"]),
  seedProject("pj-multi-agent-ops", "Multi-Agent Operations System", "Triage Agent → Technical Agent → Approval Agent → Execution Agent.", ["LangGraph", "Redis", "FastAPI"]),
  seedProject("pj-saas", "Production AI SaaS", "Auth, PostgreSQL, API, containers, monitoring, token metering, rate limiting, deployment.", ["Next.js", "PostgreSQL", "Docker", "Prometheus", "Redis"]),
];

export const seedCertifications: Certification[] = [
  { id: "ct-aws-saa", name: "AWS Solutions Architect Associate", provider: "AWS", category: "Cloud", priority: "High", status: "Not Started" },
  { id: "ct-az900", name: "AZ-900 Azure Fundamentals", provider: "Microsoft", category: "Cloud", priority: "Medium", status: "Not Started" },
  { id: "ct-az104", name: "AZ-104 Azure Administrator", provider: "Microsoft", category: "Cloud", priority: "Medium", status: "Not Started" },
  { id: "ct-gace", name: "Associate Cloud Engineer", provider: "Google Cloud", category: "Cloud", priority: "Medium", status: "Not Started" },
  { id: "ct-gpca", name: "Professional Cloud Architect", provider: "Google Cloud", category: "Cloud", priority: "Low", status: "Not Started" },
  { id: "ct-ai102", name: "AI-102 Azure AI Engineer", provider: "Microsoft", category: "AI", priority: "High", status: "Not Started" },
  { id: "ct-awsp", name: "AWS AI Practitioner", provider: "AWS", category: "AI", priority: "Medium", status: "Not Started" },
  { id: "ct-nvidia", name: "NVIDIA Generative AI", provider: "NVIDIA", category: "AI", priority: "Medium", status: "Not Started" },
  { id: "ct-databricks", name: "Databricks Generative AI", provider: "Databricks", category: "AI", priority: "Low", status: "Not Started" },
];

export const seedKeywords: KeywordEntry[] = [
  "RAG", "LangGraph", "AI Agents", "Vector Databases", "AI Deployment", "AI Infrastructure",
  "Fine-Tuning", "Semantic Search", "MCP", "Python", "FastAPI", "LLM Observability",
].map((k) => ({ keyword: k, surfaces: [] }));

export const seedMarketMetrics: MarketMetric[] = [
  { id: "mm-demand-ai-eng", label: "AI Engineer demand", note: "Enter your own research findings here. This is user-maintained reference data.", lastUpdated: "" },
  { id: "mm-demand-genai", label: "GenAI demand", note: "Enter your own research findings here. This is user-maintained reference data.", lastUpdated: "" },
  { id: "mm-demand-rag", label: "RAG demand", note: "Enter your own research findings here. This is user-maintained reference data.", lastUpdated: "" },
  { id: "mm-demand-agentic", label: "Agentic AI demand", note: "Enter your own research findings here. This is user-maintained reference data.", lastUpdated: "" },
  { id: "mm-demand-support-automation", label: "Traditional support automation trends", note: "Enter your own research findings here. This is user-maintained reference data.", lastUpdated: "" },
];

export const seedJobPlatforms = [
  { id: "pf-linkedin", name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/", category: "General" },
  { id: "pf-naukri", name: "Naukri", url: "https://www.naukri.com/", category: "India" },
  { id: "pf-instahyre", name: "Instahyre", url: "https://www.instahyre.com/", category: "India" },
  { id: "pf-wellfound", name: "Wellfound", url: "https://wellfound.com/jobs", category: "Startup" },
  { id: "pf-yc", name: "YC Jobs", url: "https://www.workatastartup.com/", category: "Startup" },
  { id: "pf-builtin", name: "Built In", url: "https://builtin.com/jobs", category: "General" },
  { id: "pf-indeed", name: "Indeed", url: "https://www.indeed.com/", category: "General" },
  { id: "pf-dice", name: "Dice", url: "https://www.dice.com/", category: "General" },
  { id: "pf-levels", name: "Levels.fyi", url: "https://www.levels.fyi/", category: "Compensation" },
  { id: "pf-glassdoor", name: "Glassdoor", url: "https://www.glassdoor.com/", category: "Compensation" },
  { id: "pf-remoteok", name: "Remote OK", url: "https://remoteok.com/", category: "Remote" },
  { id: "pf-flexjobs", name: "FlexJobs", url: "https://www.flexjobs.com/", category: "Remote" },
  { id: "pf-aijobs", name: "AIJobs", url: "https://aijobs.app/", category: "AI" },
  { id: "pf-ai-jobs", name: "AI-Jobs", url: "https://ai-jobs.net/", category: "AI" },
];

const ragItem = (prefix: string, name: string): SkillItem => ({
  id: `rag-${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name,
  status: "Not Started",
});

export const seedRagArchitectures: SkillItem[] = [
  "Naive Vector RAG", "Hybrid RAG", "BM25", "Graph RAG", "SQL RAG", "Reasoning RAG",
].map((n) => ragItem("arch", n));

export const seedRagEvals: SkillItem[] = [
  "Context Precision", "Context Recall", "Faithfulness", "Answer Relevance", "MRR", "NDCG",
].map((n) => ragItem("eval", n));

export const seedRagFailureModes: CareerOSState["ragFailureModes"] = [
  { id: "rf-retrieval", name: "Retrieval failure", symptom: "Answers miss relevant documents", cause: "Poor embeddings or index gaps", diagnosis: "Inspect retrieved chunks and scores", fix: "Tune chunking, embeddings, hybrid search", understood: false },
  { id: "rf-overflow", name: "Context overflow", symptom: "Prompt exceeds context window", cause: "Too many or too-large chunks", diagnosis: "Log token counts per query", fix: "Tighter top-k, compression, summarization", understood: false },
  { id: "rf-hallucination", name: "Hallucinations", symptom: "Model invents facts", cause: "Weak grounding or instructions", diagnosis: "Faithfulness evals, citation checks", fix: "Stricter prompts, citations, lower temperature", understood: false },
  { id: "rf-stale", name: "Stale indexes", symptom: "Answers reference outdated content", cause: "Ingestion pipeline not re-run", diagnosis: "Compare index vs source timestamps", fix: "Scheduled re-indexing, change data capture", understood: false },
  { id: "rf-injection", name: "Prompt injection", symptom: "Malicious content hijacks the model", cause: "Untrusted documents in context", diagnosis: "Red-team test corpus", fix: "Input sanitization, guardrails, output filtering", understood: false },
  { id: "rf-chunking", name: "Poor chunking", symptom: "Chunks cut mid-idea", cause: "Fixed-size splits ignore structure", diagnosis: "Manual chunk review", fix: "Structure-aware splitting, overlap tuning", understood: false },
  { id: "rf-embedding", name: "Embedding mismatch", symptom: "Query and doc embeddings misaligned", cause: "Different models or stale embeddings", diagnosis: "Check model versions and dimensionality", fix: "Re-embed corpus with one consistent model", understood: false },
  { id: "rf-latency", name: "Excessive latency", symptom: "Slow end-to-end answers", cause: "Serial retrieval + generation steps", diagnosis: "Trace per-stage timings", fix: "Caching, parallel retrieval, smaller models", understood: false },
];

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const createInitialState = (): Omit<CareerOSState, "schemaVersion"> & { schemaVersion: number } => ({
  schemaVersion: 1,
  settings: { theme: "dark", sidebarCollapsed: false } as AppSettings,
  profile: {
    name: "Your Name",
    yearsExperience: 8.5,
    baselineNote: "IT Operations / Service Desk / Enterprise Support",
    currentStageIndex: 1,
    targetStageIndex: 4,
  },
  salary: { baseline: 11, minimum: 18, preferredLow: 22, preferredHigh: 25, stretch: 30 },
  marketMetrics: seedMarketMetrics,
  skills: seedSkills,
  projects: seedProjects,
  certifications: seedCertifications,
  applications: [],
  contacts: [],
  stories: [],
  resumeBullets: [],
  narrativeChecklist: { resume: false, linkedin: false, github: false, portfolio: false, interview: false },
  linkedinChecklist: {
    headlineOptimized: false, aboutComplete: false, featuredGithub: false,
    architectureDemos: false, relevantSkills: false, recruiterKeywords: false,
    experienceRewritten: false, openToWorkReviewed: false,
  },
  linkedinHeadline:
    "AIOps & Agentic AI Engineer | 8.5 YOE Enterprise IT | RAG | AI Agents | LangGraph | Cloud AI",
  keywords: seedKeywords,
  linkedinPosts: [],
  ragArchitectures: seedRagArchitectures,
  ragEvals: seedRagEvals,
  ragFailureModes: seedRagFailureModes,
  jobPlatforms: seedJobPlatforms,
  dailyFocus: { date: todayISO(), items: [] },
  weeklyGoals: { skill: "", project: "", networking: "", applications: "", interview: "" },
  streak: { currentStreak: 0, history: [] },
  llm: { baseUrl: "", apiKey: "", model: "" },
  chat: [],
});
