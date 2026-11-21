"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Linkedin, Braces, FolderKanban, Award,
  Briefcase, MessageSquareText, PanelLeftClose, PanelLeftOpen, Rocket,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/linkedin", label: "LinkedIn", icon: Linkedin },
  { href: "/skills", label: "Skills", icon: Braces },
  { href: "/portfolio", label: "Portfolio", icon: FolderKanban },
  { href: "/certifications", label: "Certifications", icon: Award },
  { href: "/jobs", label: "Job Pipeline", icon: Briefcase },
  { href: "/interviews", label: "Interview Stories", icon: MessageSquareText },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useStore((s) => s.settings.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-600/10 text-emerald-500"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-[var(--surface)] transition-all md:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Rocket className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight">Career OS</p>
              <p className="truncate text-[11px] text-muted">AI Transition · 2026</p>
            </div>
          )}
        </div>
        {nav}
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="border-t p-3 text-muted hover:text-current"
        >
          {collapsed ? <PanelLeftOpen className="mx-auto h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile drawer toggle — rendered in TopBar via hidden input trick not needed; use a fixed button */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onMouseDown={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" aria-hidden />
          <aside
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r bg-[var(--surface)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b px-4 py-4">
              <Rocket className="h-5 w-5 text-emerald-500" aria-hidden />
              <p className="text-sm font-bold">Career OS</p>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <MobileNavButton onOpen={() => setMobileOpen(true)} />
    </>
  );
}

function MobileNavButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      aria-label="Open navigation menu"
      className="fixed bottom-4 left-4 z-30 rounded-full bg-emerald-600 p-3 text-white shadow-lg md:hidden"
    >
      <PanelLeftOpen className="h-5 w-5" />
    </button>
  );
}
