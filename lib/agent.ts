import type { Store } from "@/store/useStore";
import { CAREER_TOOLS, SYSTEM_PROMPT } from "@/lib/tools";
import { executeCareerAction, buildStatusReport } from "@/lib/careerActions";
import { overallReadiness, pillars } from "@/lib/readiness";

export interface AppliedActionResult {
  tool: string;
  summary: string;
  ok: boolean;
}

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

interface ChatCompletionResponse {
  choices?: { message?: ChatCompletionMessage }[];
  error?: { message?: string };
}

export interface AgentTurnResult {
  content: string;
  applied: { tool: string; summary: string; ok: boolean }[];
}

const MAX_TOOL_ROUNDS = 5;

export function isConfigured(store: Store): boolean {
  return Boolean(store.llm.baseUrl && store.llm.apiKey && store.llm.model);
}

async function callLLM(
  llm: Store["llm"],
  messages: ChatCompletionMessage[],
): Promise<ChatCompletionResponse> {
  const base = llm.baseUrl.replace(/\/+$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llm.apiKey}`,
    },
    body: JSON.stringify({
      model: llm.model,
      messages,
      tools: CAREER_TOOLS,
      tool_choice: "auto",
      temperature: 0.2,
      max_tokens: 1200,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as ChatCompletionResponse;
  if (!res.ok) {
    const detail = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`LLM request failed: ${detail}`);
  }
  return body;
}

/**
 * Runs one assistant turn: user text → (tool call → execute → tool result)* → final reply.
 * All workspace mutations go through executeCareerAction, which validates every argument.
 */
export async function runAgentTurn(store: Store, userText: string): Promise<AgentTurnResult> {
  if (!isConfigured(store)) {
    throw new Error(
      "Assistant is not configured yet. Open the assistant settings (gear icon) and set the API endpoint, key, and model.",
    );
  }

  // Conversation history: only user/assistant text turns (tool exchanges stay within this turn).
  const history: ChatCompletionMessage[] = store.chat
    .filter((m) => !m.error && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));

  const messages: ChatCompletionMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nCurrent workspace snapshot — Overall readiness: ${overallReadiness(store)}%. Pillars: ${pillars(store)
        .map((p) => `${p.label} ${p.score}%`)
        .join(", ")}.`,
    },
    ...history,
  ];

  const applied: AppliedActionResult[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await callLLM(store.llm, messages);
    const msg = res.choices?.[0]?.message;
    if (!msg) throw new Error("LLM returned no message.");

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push({ role: "assistant", content: msg.content ?? "", tool_calls: msg.tool_calls });
      for (const call of msg.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        const result = executeCareerAction(store, { tool: call.function.name, args });
        const toolOutput =
          result.summary === "__REPORT__" ? buildStatusReport(store) : result.summary;
        applied.push({ tool: call.function.name, summary: result.summary === "__REPORT__" ? "Read workspace status report." : result.summary, ok: result.ok });
        messages.push({ role: "tool", tool_call_id: call.id, content: toolOutput });
      }
      continue; // let the model follow up (more tools or final text)
    }

    return { content: msg.content?.trim() || "(no response)", applied };
  }

  return {
    content: "I applied the changes above but hit the tool-call limit before finishing — please continue with another message if anything is missing.",
    applied,
  };
}
