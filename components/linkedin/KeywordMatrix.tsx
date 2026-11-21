"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import { keywordCoverage } from "@/lib/readiness";
import type { KeywordSurface, KeywordEntry } from "@/types";
import { Card, CardTitle, Button, Input, ConfirmDialog, Badge, EmptyState } from "@/components/shared/ui";
import { Plus, Trash2, KeyRound } from "lucide-react";

const SURFACES: KeywordSurface[] = ["Resume", "LinkedIn", "GitHub", "Portfolio"];

export default function KeywordMatrix() {
  const keywords = useStore((s) => s.keywords);
  const toggleKeywordSurface = useStore((s) => s.toggleKeywordSurface);
  const addKeyword = useStore((s) => s.addKeyword);
  const deleteKeyword = useStore((s) => s.deleteKeyword);
  const state = useStore();
  const coverage = keywordCoverage(state);
  const push = useToast().push;

  const [newKeyword, setNewKeyword] = useState("");
  const [deleting, setDeleting] = useState<KeywordEntry | null>(null);

  const handleAdd = () => {
    const k = newKeyword.trim();
    if (!k) {
      push("Enter a keyword first", "error");
      return;
    }
    addKeyword(k);
    setNewKeyword("");
    push(`Keyword "${k}" added`, "success");
  };

  const countFor = (entry: KeywordEntry) => entry.surfaces.length;

  return (
    <Card>
      <CardTitle right={<Badge tone={coverage >= 75 ? "green" : coverage >= 40 ? "amber" : "gray"}>Coverage {coverage}%</Badge>}>
        Recruiter Keyword Matrix
      </CardTitle>

      <div className="mb-4 flex gap-2">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a custom keyword (e.g. LangGraph, RAG evaluation)"
          aria-label="New keyword"
        />
        <Button variant="primary" onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden /> Add
        </Button>
      </div>

      {keywords.length === 0 ? (
        <EmptyState
          icon={<KeyRound className="h-8 w-8" aria-hidden />}
          title="No keywords tracked"
          description="Add keywords recruiters search for and track which surfaces they appear on."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-muted dark:border-zinc-800 dark:bg-zinc-900/50">
                <th scope="col" className="px-4 py-2.5">Keyword</th>
                {SURFACES.map((s) => (
                  <th key={s} scope="col" className="px-3 py-2.5 text-center">{s}</th>
                ))}
                <th scope="col" className="px-3 py-2.5 text-center">x/4</th>
                <th scope="col" className="px-3 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((entry) => (
                <tr key={entry.keyword} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-2.5 font-medium">{entry.keyword}</td>
                  {SURFACES.map((surface) => {
                    const checked = entry.surfaces.includes(surface);
                    return (
                      <td key={surface} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleKeywordSurface(entry.keyword, surface)}
                          aria-label={`${entry.keyword} on ${surface}`}
                          className="h-4 w-4 cursor-pointer accent-emerald-500"
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2.5 text-center text-muted">{countFor(entry)}/4</td>
                  <td className="px-3 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => setDeleting(entry)}
                      aria-label={`Delete keyword ${entry.keyword}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteKeyword(deleting.keyword);
            push("Keyword deleted", "info");
          }
        }}
        title="Delete Keyword"
        message={`Remove "${deleting?.keyword ?? ""}" from your keyword matrix?`}
        confirmLabel="Delete"
      />
    </Card>
  );
}
