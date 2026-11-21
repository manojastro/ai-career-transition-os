import { APPLICATION_STATUSES, CONTACT_STATUSES, STORY_CATEGORIES } from "@/types";

export const PROJECT_COLUMNS = ["Idea", "Backlog", "Planning", "Building", "Testing", "Deployed"] as const;
export const PROJECT_STATUSES = PROJECT_COLUMNS;
export const SKILL_STATUSES = ["Not Started", "Learning", "Practiced", "Project Applied", "Interview Ready"] as const;
export const CERT_STATUSES = ["Not Started", "Preparing", "Scheduled", "Certified"] as const;

type ToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  };
};

export const CAREER_TOOLS: ToolSchema[] = [
  {
    type: "function",
    function: {
      name: "add_job_application",
      description: "Add a new job application / target company to the pipeline.",
      parameters: {
        type: "object",
        properties: {
          company: { type: "string", description: "Company name" },
          role: { type: "string", description: "Job title, e.g. Senior AI Engineer" },
          status: { type: "string", enum: [...APPLICATION_STATUSES], description: "Pipeline status" },
          location: { type: "string" },
          salary_range: { type: "string", description: "e.g. 20-28 LPA" },
          company_tier: { type: "string", enum: ["Tier 1", "Tier 2", "Startup", "GCC", "Service Co", "Other"] },
          source: { type: "string" },
          job_url: { type: "string" },
          referral_contact: { type: "string" },
          notes: { type: "string" },
        },
        required: ["company", "role"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_application_status",
      description: "Update the status of an existing job application. Match by company (and role if ambiguous).",
      parameters: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string", description: "Optional role to disambiguate multiple applications at one company" },
          status: { type: "string", enum: [...APPLICATION_STATUSES] },
        },
        required: ["company", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_project",
      description: "Add a new portfolio project.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          technologies: { type: "array", items: { type: "string" } },
          status: { type: "string", enum: [...PROJECT_STATUSES] },
          completion: { type: "number", description: "0-100" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_project_status",
      description: "Move a portfolio project to a different Kanban stage.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: [...PROJECT_STATUSES] },
        },
        required: ["name", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_project_completion",
      description: "Set a portfolio project's completion percentage.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          completion: { type: "number", description: "0-100" },
        },
        required: ["name", "completion"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_skill_status",
      description: "Update a skill's mastery status in the skills tree (Python items, agent roadmap, RAG knowledge).",
      parameters: {
        type: "object",
        properties: {
          skill: { type: "string", description: "Skill name, e.g. LangGraph or Pydantic" },
          status: { type: "string", enum: [...SKILL_STATUSES] },
        },
        required: ["skill", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_certification",
      description: "Add a certification to track.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          provider: { type: "string" },
          category: { type: "string", enum: ["Cloud", "AI", "Other"] },
          priority: { type: "string", enum: ["Low", "Medium", "High"] },
          status: { type: "string", enum: [...CERT_STATUSES] },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_certification_status",
      description: "Update a tracked certification's status.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: [...CERT_STATUSES] },
        },
        required: ["name", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_contact",
      description: "Add a networking contact to the CRM.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          company: { type: "string" },
          contact_role: { type: "string", description: "Their job title" },
          status: { type: "string", enum: [...CONTACT_STATUSES] },
          linkedin_url: { type: "string" },
          notes: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_contact_status",
      description: "Update a networking contact's relationship status.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          status: { type: "string", enum: [...CONTACT_STATUSES] },
        },
        required: ["name", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_interview_story",
      description: "Add a STAR interview story to the story bank.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string", enum: [...STORY_CATEGORIES] },
          situation: { type: "string" },
          task: { type: "string" },
          action: { type: "string" },
          result: { type: "string" },
          metrics: { type: "string" },
          technologies: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_resume_bullet",
      description: "Save an ATS-style resume bullet. Never invent numeric metrics the user did not state.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "The achievement, outcome-oriented phrasing" },
          situation: { type: "string" },
          task: { type: "string" },
          result: { type: "string" },
          metrics: { type: "string" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_linkedin_post",
      description: "Add a planned LinkedIn building-in-public post.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: {
            type: "string",
            enum: ["Architecture", "Project Build", "Lessons Learned", "AI Experiment", "System Design", "Career Transition", "Technical Deep Dive"],
          },
          status: { type: "string", enum: ["Draft", "Scheduled", "Published"] },
          url: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_keyword",
      description: "Add a recruiter keyword to track in the LinkedIn keyword matrix.",
      parameters: {
        type: "object",
        properties: { keyword: { type: "string" } },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_status_report",
      description: "Read a summary of the current workspace (applications, projects, certifications, stories, contacts) to answer status questions.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export const SYSTEM_PROMPT = `You are the AI Career Assistant inside the "AI Career & Transition OS" app.
The user is an IT professional with 8.5 years of enterprise IT experience transitioning into AI engineering (target: AIOps / Agentic AI / Senior AI Engineer roles, ~₹11 LPA baseline, ₹20-25+ LPA target).

Your job:
- When the user describes a task update (a new job application, a status change, a new project, a skill they learned, a certification, a contact, a story, a resume bullet, a LinkedIn post), ALWAYS use the matching tool. Never just talk about it.
- For status questions ("where am I?", "how many applications?", "what's deployed?"), call get_status_report first, then answer from its data.
- Map the user's casual wording to the exact allowed status enums. Examples: "I applied at Google" → update/add_job_application status "Applied"; "got a recruiter call from Zoho" → status "Recruiter Screening"; "moved my RAG project to building" → update_project_status "Building"; "finished learning LangGraph" → set_skill_status "Practiced" or "Project Applied" depending on context; "scheduled my AWS exam" → update_certification_status "Scheduled".
- If the user's intent is ambiguous between two statuses, pick the most literal match and mention what you chose.
- Be concise and confirm each change you made in a short list.
- Never fabricate metrics, certifications, offers, or achievements the user did not state.`;
