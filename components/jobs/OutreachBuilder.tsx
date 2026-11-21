"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/store/useToast";
import { copyToClipboard } from "@/lib/utils";
import { Button, Card, CardTitle, Field, Textarea } from "@/components/shared/ui";

const DEFAULT_CONTEXT =
  "I have 8.5 years of enterprise IT operations experience and am currently building production-oriented AIOps and agentic AI systems.";

export default function OutreachBuilder() {
  const toast = useToast((s) => s.push);
  const [context, setContext] = useState(DEFAULT_CONTEXT);
  const [connection, setConnection] = useState("");
  const [ask, setAsk] = useState("");

  const message = [context.trim(), connection.trim(), ask.trim()].filter(Boolean).join("\n\n");

  const copy = async () => {
    if (!message) {
      toast("Nothing to copy yet", "error");
      return;
    }
    const ok = await copyToClipboard(message);
    toast(ok ? "Message copied to clipboard" : "Copy failed", ok ? "success" : "error");
  };

  return (
    <Card>
      <CardTitle>Outreach Message Builder</CardTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Field label="Context" hint="Who you are — background and current focus.">
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} aria-label="Context" />
          </Field>
          <Field label="Specific Connection" hint="Why this person specifically — their work, post, team.">
            <Textarea value={connection} onChange={(e) => setConnection(e.target.value)} placeholder="I saw your talk on..." aria-label="Specific connection" />
          </Field>
          <Field label="Low-Friction Ask" hint="Small, easy to say yes to — a 15-minute chat, a pointer.">
            <Textarea value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Would you be open to a quick 15-minute chat..." aria-label="Low-friction ask" />
          </Field>
        </div>
        <div className="flex flex-col">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Live Preview</p>
          <div className="flex-1 whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
            {message || <span className="text-muted">Your message will appear here as you type...</span>}
          </div>
          <div className="mt-3 flex justify-end">
            <Button variant="primary" onClick={copy}>
              <Copy className="h-4 w-4" /> Copy Message
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
