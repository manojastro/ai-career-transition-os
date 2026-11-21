"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { copyToClipboard } from "@/lib/utils";
import { Card, CardTitle, Button, Input, Field, Textarea } from "@/components/shared/ui";
import { Sparkles, Copy, Save } from "lucide-react";

/**
 * Deterministic STAR bullet transformer — no AI, no API.
 * Rewrites raw duty text into outcome-oriented engineering language.
 * CRITICAL RULE: never invents numeric metrics. Qualitative phrases only
 * unless the user explicitly supplies a metric.
 */

const VERB_UPGRADES: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bhandled\b/gi, replacement: "Engineered" },
  { pattern: /\bmanaged\b/gi, replacement: "Orchestrated" },
  { pattern: /\bmaintained\b/gi, replacement: "Operated and hardened" },
  { pattern: /\bmonitored\b/gi, replacement: "Observed" },
  { pattern: /\bresponsible for\b/gi, replacement: "Owned" },
  { pattern: /\bworked on\b/gi, replacement: "Delivered" },
  { pattern: /\bhelped\b/gi, replacement: "Partnered with teams to" },
  { pattern: /\bassisted (?:with|in)\b/gi, replacement: "Drove" },
  { pattern: /\bdid\b/gi, replacement: "Executed" },
  { pattern: /\bfixed\b/gi, replacement: "Diagnosed and resolved" },
  { pattern: /\bresolved\b/gi, replacement: "Root-caused and resolved" },
  { pattern: /\binstalled\b/gi, replacement: "Provisioned and configured" },
  { pattern: /\bcreated\b/gi, replacement: "Designed and built" },
  { pattern: /\bmade\b/gi, replacement: "Built" },
  { pattern: /\bused\b/gi, replacement: "Leveraged" },
];

const PHRASE_UPGRADES: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /checked (?:the )?monitoring logs|checked logs|checked monitoring/gi,
    replacement: "performed structured log analysis to improve operational visibility",
  },
  {
    pattern: /restarted servers/gi,
    replacement: "executed recovery procedures to restore service availability",
  },
  {
    pattern: /service desk tickets|level ?1 tickets|l1 tickets/gi,
    replacement: "incidents through a structured triage workflow",
  },
  {
    pattern: /answered (?:phone )?calls/gi,
    replacement: "handled stakeholder communications",
  },
  {
    pattern: /ran reports/gi,
    replacement: "generated operational reports to surface recurring failure patterns",
  },
  {
    pattern: /manual(?:ly)? (?:work|process|processes|tasks)/gi,
    replacement: "repetitive manual workflows targeted for automation",
  },
  {
    pattern: /escalated (?:tickets|issues|incidents)/gi,
    replacement: "escalated high-severity incidents with precise diagnostic context",
  },
  {
    pattern: /updated (?:the )?documentation|documented/gi,
    replacement: "authored runbooks and knowledge-base documentation to reduce repeat incidents",
  },
];

const QUALITATIVE_OUTCOMES = [
  "reducing manual effort",
  "improving incident turnaround",
  "improving operational visibility",
];

function transformBullet(raw: string, metrics: string): string {
  let text = raw.trim().replace(/\s+/g, " ").replace(/[.;]+$/, "");
  if (!text) return "";

  // Capitalize first letter so verb upgrades sit at sentence start.
  const lead = text.charAt(0).toUpperCase() + text.slice(1);

  let upgraded = PHRASE_UPGRADES.reduce((acc, r) => acc.replace(r.pattern, r.replacement), lead);
  upgraded = VERB_UPGRADES.reduce((acc, r) => acc.replace(r.pattern, r.replacement), upgraded);

  // Choose a qualitative outcome phrase not already present.
  const lower = upgraded.toLowerCase();
  const outcome =
    QUALITATIVE_OUTCOMES.find((o) => lower.includes(o.split(" ").slice(-2).join(" "))) ??
    "reducing manual effort";

  const parts: string[] = [upgraded];
  const m = metrics.trim();
  if (m) {
    parts.push(`delivering ${m.replace(/^delivered\s+/i, "")}`);
  } else {
    parts.push(outcome);
  }
  return parts.join(", ") + ".";
}

export default function BulletTransformer() {
  const [raw, setRaw] = useState("");
  const [metrics, setMetrics] = useState("");
  const [improved, setImproved] = useState("");
  const addBullet = useStore((s) => s.addBullet);
  const push = useToast().push;

  const canPreview = raw.trim().length > 0;

  const handlePreview = () => {
    const result = transformBullet(raw, metrics);
    setImproved(result);
    if (result) push("Improved bullet generated", "success");
  };

  const handleCopy = async () => {
    if (!improved) return;
    const ok = await copyToClipboard(improved);
    push(ok ? "Bullet copied to clipboard" : "Copy failed", ok ? "success" : "error");
  };

  const handleSave = () => {
    if (!improved) return;
    addBullet({ rawBefore: raw.trim(), action: improved, metrics: metrics.trim() || undefined });
    push("Bullet saved to resume library", "success");
  };

  return (
    <Card>
      <CardTitle right={<span className="text-xs text-muted">Deterministic · no AI calls</span>}>
        STAR Bullet Transformer
      </CardTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <Field label="Before — raw duty bullet" hint="Paste a plain duty description">
            <Textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Handled Level 1 service desk tickets, restarted servers, and checked monitoring logs."
              aria-label="Raw duty bullet"
            />
          </Field>
          <Field label="Metrics (optional)" hint="Left empty, no numbers are invented">
            <Input
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              placeholder="e.g. 40% faster resolution across 200+ monthly tickets"
              aria-label="Optional metrics"
            />
          </Field>
          <Button variant="primary" onClick={handlePreview} disabled={!canPreview}>
            <Sparkles className="h-4 w-4" aria-hidden /> Preview
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Improved — outcome-oriented bullet">
            <div
              className="min-h-[80px] w-full rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-sm"
              aria-live="polite"
            >
              {improved || <span className="text-muted">Click Preview to generate the improved bullet.</span>}
            </div>
          </Field>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy} disabled={!improved}>
              <Copy className="h-4 w-4" aria-hidden /> Copy
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!improved}>
              <Save className="h-4 w-4" aria-hidden /> Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
