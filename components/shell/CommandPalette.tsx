"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { NAV_ITEMS } from "./Sidebar";
import { cn } from "@/lib/utils";

interface SearchResult {
  group: string;
  label: string;
  sub?: string;
  href: string;
}

export function CommandPalette() {
  const router = useRouter();
  const state = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActiveIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const navResults: SearchResult[] = NAV_ITEMS
      .filter((n) => !q || n.label.toLowerCase().includes(q))
      .map((n) => ({ group: "Navigation", label: n.label, href: n.href }));

    if (!q) return navResults;

    const match = (s: string) => s.toLowerCase().includes(q);
    const out: SearchResult[] = [...navResults];

    for (const m of state.skills) {
      for (const g of m.groups) {
        for (const i of g.items) {
          if (match(i.name)) {
            out.push({ group: "Skills", label: i.name, sub: `${m.name} · ${g.name} · ${i.status}`, href: "/skills" });
          }
        }
      }
    }
    for (const p of state.projects) {
      if (match(p.name) || match(p.description)) {
        out.push({ group: "Projects", label: p.name, sub: p.status, href: "/portfolio" });
      }
    }
    for (const c of state.certifications) {
      if (match(c.name) || match(c.provider)) {
        out.push({ group: "Certifications", label: c.name, sub: `${c.provider} · ${c.status}`, href: "/certifications" });
      }
    }
    for (const a of state.applications) {
      if (match(a.company) || match(a.role)) {
        out.push({ group: "Applications", label: `${a.company} — ${a.role}`, sub: a.status, href: "/jobs" });
      }
    }
    for (const c of state.contacts) {
      if (match(c.name) || match(c.company ?? "")) {
        out.push({ group: "Contacts", label: c.name, sub: `${c.company ?? ""} · ${c.status}`, href: "/jobs" });
      }
    }
    for (const s of state.stories) {
      if (match(s.title) || match(s.category)) {
        out.push({ group: "Interview Stories", label: s.title, sub: s.category, href: "/interviews" });
      }
    }
    for (const b of state.resumeBullets) {
      const text = [b.action, b.result, b.rawBefore].filter(Boolean).join(" ");
      if (match(text)) out.push({ group: "Resume Bullets", label: b.action ?? b.rawBefore ?? "Bullet", href: "/resume" });
    }
    return out.slice(0, 30);
  }, [query, state]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const r of results) {
      map.set(r.group, [...(map.get(r.group) ?? []), r]);
    }
    return Array.from(map.entries());
  }, [results]);

  const flat = grouped.flatMap(([, items]) => items);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh]"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div role="dialog" aria-modal="true" aria-label="Global search" className="card w-full max-w-xl overflow-hidden shadow-2xl">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flat.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
            if (e.key === "Enter" && flat[activeIndex]) { router.push(flat[activeIndex].href); setOpen(false); }
          }}
          placeholder="Search skills, projects, companies, stories…"
          className="w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
          aria-label="Search query"
        />
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {flat.length === 0 && <p className="p-4 text-center text-sm text-muted">No results for “{query}”</p>}
          {grouped.map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{group}</p>
              {items.map((r) => {
                const idx = flat.indexOf(r as SearchResult);
                return (
                  <button
                    key={`${group}-${r.label}-${idx}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => { router.push(r.href); setOpen(false); }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm",
                      idx === activeIndex ? "bg-emerald-600/10 text-emerald-500" : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    )}
                  >
                    <span className="truncate">{r.label}</span>
                    {r.sub && <span className="shrink-0 text-xs text-muted">{r.sub}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="border-t px-4 py-2 text-[11px] text-muted">
          ↑↓ navigate · Enter open · Esc close
        </div>
      </div>
    </div>
  );
}
