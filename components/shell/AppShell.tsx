"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { ChatWidget } from "@/components/chatbot/ChatWidget";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.settings.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading your career workspace…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <CommandPalette />
      <ChatWidget />
    </div>
  );
}
