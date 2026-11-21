"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { copyToClipboard } from "@/lib/utils";
import { Card, CardTitle, Button, Input, Field } from "@/components/shared/ui";
import { Copy } from "lucide-react";

const EXAMPLE =
  "Senior AI Engineer (in transition from AIOps) | RAG Architectures · Agentic Systems · Python | Building production AI ops";

export default function HeadlineEditor() {
  const headline = useStore((s) => s.linkedinHeadline);
  const setHeadline = useStore((s) => s.setHeadline);
  const push = useToast().push;
  const [draft, setDraft] = useState(headline);
  const dirty = draft !== headline;

  const handleCopy = async () => {
    const ok = await copyToClipboard(headline);
    push(ok ? "Headline copied" : "Copy failed", ok ? "success" : "error");
  };

  return (
    <Card>
      <CardTitle>Headline Editor</CardTitle>
      <div className="space-y-3">
        <Field label="LinkedIn headline" hint="220 characters max on LinkedIn — lead with target role, then proof keywords">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => setHeadline(draft)}
            placeholder={`e.g. ${EXAMPLE}`}
            aria-label="LinkedIn headline"
            maxLength={220}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" disabled={!dirty} onClick={() => { setHeadline(draft); push("Headline saved", "success"); }}>
            Save Headline
          </Button>
          <Button variant="outline" onClick={handleCopy} disabled={!headline}>
            <Copy className="h-4 w-4" aria-hidden /> Copy
          </Button>
          <span className="text-xs text-muted">{draft.length}/220</span>
        </div>
        {!headline && (
          <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted">
            Example: {EXAMPLE}
          </p>
        )}
      </div>
    </Card>
  );
}
