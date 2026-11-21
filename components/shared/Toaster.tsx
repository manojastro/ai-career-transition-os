"use client";

import { useToast } from "@/store/useToast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "card max-w-sm px-4 py-3 text-left text-sm shadow-lg",
            t.type === "success" && "border-emerald-500/50",
            t.type === "error" && "border-red-500/50",
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
