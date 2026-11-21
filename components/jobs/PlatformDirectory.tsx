"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { Badge, Card, CardTitle } from "@/components/shared/ui";

export default function PlatformDirectory({
  platforms,
}: {
  platforms: { id: string; name: string; url: string; category: string }[];
}) {
  return (
    <Card className="mb-6">
      <CardTitle>Job Platform Directory ({platforms.length})</CardTitle>
      {platforms.length === 0 ? (
        <p className="text-sm text-muted">No platforms configured.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-emerald-700 hover:bg-zinc-800/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <Badge tone="indigo" className="mt-1">{p.category}</Badge>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
