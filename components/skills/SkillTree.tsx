"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { SkillModule } from "@/types";
import { Badge, Card, ProgressBar } from "@/components/shared/ui";
import {
  SkillItemRow,
  groupCompletion,
  moduleCompletion,
} from "@/components/skills/SkillsView";

export function SkillTree({
  openModules,
  setOpenModules,
}: {
  openModules: Record<string, boolean>;
  setOpenModules: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const modules = useStore((s) => s.skills);
  const setSkillStatus = useStore((s) => s.setSkillStatus);

  return (
    <div className="space-y-4">
      {modules.map((module: SkillModule) => {
        const open = !!openModules[module.id];
        const pct = moduleCompletion(module);
        return (
          <Card key={module.id} className="p-0">
            <button
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
              onClick={() => setOpenModules((s) => ({ ...s, [module.id]: !s[module.id] }))}
              aria-expanded={open}
            >
              <span className="flex items-center gap-2">
                {open ? <ChevronDown className="h-4 w-4 text-muted" /> : <ChevronRight className="h-4 w-4 text-muted" />}
                <span>
                  <span className="font-semibold text-zinc-100">{module.name}</span>
                  {module.description && (
                    <span className="ml-2 hidden text-xs text-muted lg:inline">— {module.description}</span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge tone={pct >= 80 ? "green" : pct >= 40 ? "cyan" : "gray"}>{pct}%</Badge>
              </span>
            </button>

            {open && (
              <div className="space-y-5 border-t border-zinc-800 p-4">
                {module.groups.map((group) => {
                  const gpct = groupCompletion(group);
                  return (
                    <section key={group.id} aria-label={group.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-zinc-300">{group.name}</h3>
                        <div className="flex w-40 items-center gap-2">
                          <ProgressBar value={gpct} className="h-1.5" />
                          <span className="w-9 text-right text-xs text-muted">{gpct}%</span>
                        </div>
                      </div>
                      <div className="grid gap-1.5 md:grid-cols-2">
                        {group.items.map((item) => (
                          <SkillItemRow
                            key={item.id}
                            item={item}
                            onSelect={(status) => setSkillStatus(module.id, group.id, item.id, status)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
