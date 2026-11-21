"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Settings2, Trash2, X, CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { Button, Input, Field, Modal } from "@/components/shared/ui";
import { runAgentTurn, isConfigured } from "@/lib/agent";
import { cn } from "@/lib/utils";

const PRESETS = [
  { label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "openai/gpt-4o-mini" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  { label: "Ollama (local)", baseUrl: "http://localhost:11434/v1", model: "llama3.1" },
];

export function ChatWidget() {
  const store = useStore();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [store.chat, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    store.addChatMessage({ role: "user", content: text });
    setBusy(true);
    try {
      const result = await runAgentTurn(store, text);
      store.addChatMessage({ role: "assistant", content: result.content, actions: result.applied });
      const okCount = result.applied.filter((a) => a.ok).length;
      if (okCount > 0) push(`Assistant applied ${okCount} update${okCount > 1 ? "s" : ""}.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error contacting the assistant.";
      store.addChatMessage({ role: "assistant", content: message, error: true });
      push("Assistant error — see the chat for details.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={cn(
          "fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition-colors",
          "bg-emerald-600 text-white hover:bg-emerald-500",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "AI Assistant"}</span>
        {!open && !isConfigured(store) && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400" aria-label="Needs configuration" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <section
          aria-label="AI career assistant chat"
          className="card fixed bottom-20 right-4 z-40 flex max-h-[70vh] w-[min(92vw,420px)] flex-col overflow-hidden p-0 shadow-2xl"
        >
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden />
              <div>
                <p className="text-sm font-semibold leading-tight">AI Career Assistant</p>
                <p className="text-[11px] text-muted">Tell me what changed — I&apos;ll update your workspace</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setSettingsOpen(true)} aria-label="Assistant settings" className="rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Settings2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (window.confirm("Clear the entire chat history?")) store.clearChat(); }}
                aria-label="Clear chat"
                className="rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" role="log" aria-live="polite">
            {store.chat.length === 0 && (
              <div className="space-y-2 text-sm text-muted">
                <p>Try things like:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>“New application at Google for Senior AI Engineer”</li>
                  <li>“Zoho recruiter called me — moved to recruiter screening”</li>
                  <li>“Moved Enterprise RAG to Building, 60% done”</li>
                  <li>“I finished learning LangGraph — mark it practiced”</li>
                  <li>“Scheduled my AWS SAA exam”</li>
                  <li>“What&apos;s my current pipeline status?”</li>
                </ul>
                {!isConfigured(store) && (
                  <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-500">
                    Not configured yet — click the gear icon to connect an LLM API.
                  </p>
                )}
              </div>
            )}
            {store.chat.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                    m.role === "user" && "bg-emerald-600 text-white",
                    m.role === "assistant" && !m.error && "bg-zinc-100 dark:bg-zinc-800",
                    m.role === "assistant" && m.error && "border border-red-500/50 bg-red-500/10 text-red-500",
                  )}
                >
                  {m.content}
                  {m.actions && m.actions.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-black/10 pt-2 dark:border-white/10">
                      {m.actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs">
                          {a.ok ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden />
                          )}
                          <span>{a.summary}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Working…
              </div>
            )}
          </div>

          <footer className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="e.g. Applied at Infosys for AIOps Engineer"
                aria-label="Message the AI assistant"
                disabled={busy}
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <Button variant="primary" onClick={() => void send()} disabled={busy || !input.trim()} aria-label="Send message">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </section>
      )}

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Assistant LLM Settings">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Quick presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  onClick={() => store.setLLM({ baseUrl: p.baseUrl, model: p.model })}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <Field label="API Base URL" hint="Any OpenAI-compatible endpoint, e.g. https://openrouter.ai/api/v1">
            <Input
              value={store.llm.baseUrl}
              onChange={(e) => store.setLLM({ baseUrl: e.target.value })}
              placeholder="https://openrouter.ai/api/v1"
            />
          </Field>
          <Field label="API Key" hint="Stored only in this browser's localStorage and sent only to the endpoint above. Never committed to code.">
            <Input
              type="password"
              value={store.llm.apiKey}
              onChange={(e) => store.setLLM({ apiKey: e.target.value })}
              placeholder="sk-…"
            />
          </Field>
          <Field label="Model" hint="Pick a model that supports tool/function calling, e.g. openai/gpt-4o-mini">
            <Input
              value={store.llm.model}
              onChange={(e) => store.setLLM({ model: e.target.value })}
              placeholder="openai/gpt-4o-mini"
            />
          </Field>
          <p className="text-xs text-muted">
            The assistant proposes structured updates; the app validates every action against your data before
            applying it. You&apos;ll see a confirmation chip for each change.
          </p>
        </div>
      </Modal>
    </>
  );
}
