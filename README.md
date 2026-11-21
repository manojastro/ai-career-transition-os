# AI Career & Transition Operating System

A persistent personal career operating system for an experienced IT professional transitioning into AI engineering (Senior AI Engineer, Agentic AI Engineer, AIOps, Forward Deployed AI Engineer). It combines readiness assessment, skill tracking, portfolio management, resume/LinkedIn positioning, job pipeline tracking, networking CRM, and interview preparation into one unified command center.

**Design philosophy:** Linear + Notion + GitHub Projects + modern SaaS analytics dashboard. Every control is functional and all data persists in the browser.

## Screenshots

_(placeholders — add after first run)_

| Dashboard | Portfolio Kanban |
|---|---|
| _docs/screenshots/dashboard.png_ | _docs/screenshots/portfolio.png_ |

## Architecture

- **Next.js 14 (App Router)** + React 18 + TypeScript (strict)
- **Tailwind CSS** design system with dark (default) / light themes via CSS variables
- **Zustand + persist middleware** for a schema-versioned, localStorage-backed store
- **Recharts** for the dashboard pillar chart (lazy-loaded, SSR disabled)
- **Lucide React** icons
- Pure **deterministic logic** for the readiness engine, next-best-action recommendations, and the STAR bullet transformer — no fake AI inference, no invented metrics

### Data layer

All state lives in a single typed Zustand store (`store/useStore.ts`) persisted to `localStorage` under the key `ai-career-os-state` with `schemaVersion: 1`. The store exposes pure data plus actions only — the UI never touches storage directly, so the persistence backend can later be swapped for Supabase/PostgreSQL/Firebase by replacing the persist middleware, without rewriting any views.

## Features

- **Executive Dashboard** — weighted readiness engine (25% skills, 30% portfolio, 15% interview stories, 15% networking/pipeline, 15% certifications), positioning-stage roadmap, editable salary scenarios, user-maintained market intelligence, deterministic next-best-action engine with explanations
- **Resume** — career narrative validator across 5 surfaces, STAR Bullet Transformer (deterministic rewrite, never invents metrics), STAR builder with saved bullet library
- **LinkedIn** — readiness checklist, headline editor, recruiter keyword matrix (Resume/LinkedIn/GitHub/Portfolio coverage), building-in-public post planner
- **Skills** — hierarchical skill tree (Python foundation + production, 8-stage Agent Engineering roadmap) with 5-level statuses; RAG module with lifecycle pipeline, architecture/evaluation knowledge tracking, and production failure-mode playbooks
- **Portfolio** — Kanban (Idea → Deployed) with the seeded 10-project portfolio, full CRUD, 8-dimension quality scoring (0–5 each)
- **Certifications** — full CRUD matrix with status progression and filters
- **Job Pipeline** — application tracking with 12 statuses, quality-first application scoring, funnel conversion metrics (no fabricated data), platform directory, networking CRM, outreach message builder
- **Interview Stories** — 12-competency STAR story bank with readiness scoring (Not Ready → Excellent) and category coverage
- **Productivity** — Today's Top 3, weekly goals, subtle daily streak
- **AI Assistant chatbot** — natural-language workspace updates powered by an LLM API you configure (OpenRouter / OpenAI / Groq / local Ollama — any OpenAI-compatible endpoint). Say things like “New application at Google for Senior AI Engineer”, “Zoho recruiter called me”, “Moved Enterprise RAG to Building”, “Scheduled my AWS exam” and the assistant updates the right records through a validated action layer
- **Global** — Ctrl/Cmd+K command palette searching every entity, JSON export/import with validation and confirmation, theme toggle, reset with confirmation

## Folder structure

```
app/                  # App Router pages (one per view)
components/
  dashboard/ skills/ portfolio/ resume/ linkedin/
  certifications/ jobs/ interviews/ shared/ shell/
data/                 # Seed data (skills, projects, certs, keywords, platforms)
lib/                  # Readiness engine, utils
store/                # Zustand store + toast store
types/                # All TypeScript interfaces
```

## Local setup

Requires Node.js 18+.

```bash
npm install
```

No environment variables are required — the app is fully client-side and stores data in the browser.

## Running locally

```bash
npm run dev        # http://localhost:3000
```

## Production build

```bash
npm run build
npm start
```

## AI Assistant (LLM chatbot)

The floating assistant (bottom-right) turns natural language into workspace updates:

1. Click the gear icon in the assistant panel and configure an **OpenAI-compatible endpoint** — quick presets for OpenRouter, OpenAI, Groq, and local Ollama. Your API key is stored only in this browser's `localStorage` and sent only to the endpoint you configure; it is never committed to code.
2. Type a task update in plain language. The LLM proposes structured tool calls; the app's deterministic dispatcher (`lib/careerActions.ts`) validates every argument (status enums, numeric ranges, entity matching) before touching the store, then shows a confirmation chip for each applied change.
3. Ask “What's my pipeline status?” for a read-only report generated from your actual data.

Supported actions: add/update job applications and statuses, add/move projects and set completion, set skill statuses, add/update certifications, add contacts and update relationship status, add interview stories, resume bullets, LinkedIn posts, and recruiter keywords.

## Data persistence & export/import

- Data persists across refreshes in `localStorage` (schema-versioned; malformed stored state falls back to the seeded initial state).
- **Export** (top bar download icon) downloads a full JSON backup.
- **Import** (upload icon) validates `schemaVersion`, `projects`, and `skills`, shows a summary, requires confirmation, and never silently overwrites — malformed files are rejected with a toast.
- **Reset** requires explicit confirmation and restores the seeded workspace.

## Future backend migration

The store's persist middleware is the single persistence seam. To move to Supabase/PostgreSQL: keep `CareerOSState` as the row shape, replace `createJSONStorage(() => localStorage)` with a storage adapter backed by your database + auth (Clerk / Auth.js / Supabase Auth). No view code changes required.

Future feature extension points (not implemented, by design): resume critique, JD matching, mock interviews, GitHub/LinkedIn/job-API integrations.

## Deployment

Any Node host or Vercel: `npm run build` → `npm start` (or import the repo into Vercel — zero config).

## Known limitations

- localStorage only (single browser profile); export/import is the cross-device story until a backend lands
- Market intelligence is user-maintained reference data — the app deliberately does not fabricate market statistics
- Job platform directory links out; no scraping (authentication/ToS differences make that a future integration)
- Seed projects/skills are marked as samples and contain no fabricated personal achievements
