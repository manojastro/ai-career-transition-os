"use client";

import { useRef, useState } from "react";
import { Search, Download, Upload, RotateCcw, Moon, Sun } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { ConfirmDialog, Button } from "@/components/shared/ui";
import { formatLPA } from "@/lib/utils";
import {
  overallReadiness, storyReadiness,
} from "@/lib/readiness";
import type { CareerOSState } from "@/types";

// Strip zustand action functions — only serializable state is exported.
function stripFunctions(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "function") continue;
    out[k] = v;
  }
  return out;
}

export function TopBar() {
  const state = useStore();
  const { push } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const readiness = overallReadiness(state);
  const allSkillItems = [
    ...state.skills.flatMap((m) => m.groups.flatMap((g) => g.items)),
    ...state.ragArchitectures,
    ...state.ragEvals,
  ];
  const verifiedSkills = `${allSkillItems.filter((i) => i.status === "Interview Ready").length}/${allSkillItems.length}`;
  const deployed = state.projects.filter((p) => p.status === "Deployed").length;
  const companies = new Set(state.applications.map((a) => a.company.toLowerCase())).size;
  const readyStories = state.stories.filter((s) =>
    ["Interview Ready", "Excellent"].includes(storyReadiness(s)),
  ).length;

  const handleExport = () => {
    const data = stripFunctions(state as unknown as Record<string, unknown>);
    // Never export the assistant API key — backups may be shared.
    if (data.llm && typeof data.llm === "object") {
      data.llm = { ...(data.llm as Record<string, unknown>), apiKey: "" };
    }
    const blob = new Blob([JSON.stringify({ version: 1, ...data }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    push("Backup exported successfully.", "success");
  };

  const handleImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Record<string, unknown>;
      if (typeof parsed.schemaVersion !== "number") {
        push("Import failed: missing schemaVersion.", "error");
        return;
      }
      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.skills)) {
        push("Import failed: file does not look like a Career OS backup.", "error");
        return;
      }
      const summary = [
        `${(parsed.projects as unknown[]).length} projects`,
        `${(parsed.certifications as unknown[] | undefined)?.length ?? 0} certifications`,
        `${(parsed.applications as unknown[] | undefined)?.length ?? 0} applications`,
        `${(parsed.stories as unknown[] | undefined)?.length ?? 0} stories`,
      ].join(", ");
      if (!window.confirm(
        `Import backup?\n\nContains: ${summary}\n\nThis will REPLACE your current workspace data. Continue?`,
      )) {
        push("Import cancelled.", "info");
        return;
      }
      state.importState(parsed as unknown as CareerOSState);
      push("Workspace restored from backup.", "success");
    } catch {
      push("Import failed: malformed JSON file.", "error");
    }
  };

  const stats: { label: string; value: string; tone?: string }[] = [
    { label: "Readiness", value: `${readiness}% Ready`, tone: "text-emerald-500" },
    { label: "Profile", value: `${state.profile.yearsExperience} YOE · ${formatLPA(state.salary.baseline)} → ${formatLPA(state.salary.preferredHigh)}+` },
    { label: "Skills", value: verifiedSkills },
    { label: "Portfolio", value: `${deployed}/${state.projects.length} Deployed` },
    { label: "Companies", value: `${companies}/50 Targets` },
    { label: "Stories", value: `${readyStories}/15 Ready` },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--surface)]/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto text-xs">
          {stats.map((s) => (
            <div key={s.label} className="whitespace-nowrap">
              <span className="text-muted">{s.label} · </span>
              <span className={`font-semibold ${s.tone ?? ""}`}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))} aria-label="Global search (Ctrl+K)" title="Search (Ctrl+K)">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleExport} aria-label="Export data" title="Export JSON backup">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()} aria-label="Import data" title="Import JSON backup">
            <Upload className="h-4 w-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportFile(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            onClick={() => state.setTheme(state.settings.theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {state.settings.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmReset(true)} aria-label="Reset workspace" title="Reset workspace">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          state.resetWorkspace();
          push("Workspace reset to initial state.", "success");
        }}
        title="Reset Workspace"
        message="This permanently deletes ALL your tracked data (skills, projects, applications, stories) and restores the initial seeded workspace. Export a backup first if you need it. This cannot be undone."
        confirmLabel="Reset Everything"
      />
    </header>
  );
}
