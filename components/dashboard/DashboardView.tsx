"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Flame, Target, TrendingUp } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useToast } from "@/store/useToast";
import {
  Badge,
  Card,
  CardTitle,
  Field,
  Input,
  PageHeader,
  ProgressBar,
  ProgressRing,
  Select,
  Textarea,
} from "@/components/shared/ui";
import { POSITIONING_STAGES } from "@/types";
import { todayISO } from "@/data/seed";
import {
  certificationProgress,
  interviewStoryCompletion,
  jobPipelineProgress,
  networkingProgress,
  nextBestActions,
  overallReadiness,
  pillars,
  portfolioCompletion,
  skillsCompletion,
} from "@/lib/readiness";

const PillarChart = dynamic(() => import("./PillarChart"), { ssr: false });

const SALARY_FIELDS = [
  { key: "baseline", label: "Baseline (current, LPA)" },
  { key: "minimum", label: "Minimum acceptable (LPA)" },
  { key: "preferredLow", label: "Preferred low (LPA)" },
  { key: "preferredHigh", label: "Preferred high (LPA)" },
  { key: "stretch", label: "Stretch (LPA)" },
] as const;

type SalaryKey = (typeof SALARY_FIELDS)[number]["key"];

const WEEKLY_GOAL_FIELDS = [
  { key: "skill", label: "Skill goal" },
  { key: "project", label: "Project goal" },
  { key: "networking", label: "Networking goal" },
  { key: "applications", label: "Applications goal" },
  { key: "interview", label: "Interview goal" },
] as const;

type WeeklyGoalKey = (typeof WEEKLY_GOAL_FIELDS)[number]["key"];

function uplift(current: number, baseline: number): string {
  if (baseline <= 0) return "—";
  const pct = ((current - baseline) / baseline) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%`;
}

function fmtDate(iso: string): string {
  if (!iso) return "Not set";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "Not set";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardView() {
  const state = useStore();
  const toast = useToast((t) => t.push);

  const [salaryDraft, setSalaryDraft] = useState<Record<SalaryKey, string>>(() => ({
    baseline: String(state.salary.baseline),
    minimum: String(state.salary.minimum),
    preferredLow: String(state.salary.preferredLow),
    preferredHigh: String(state.salary.preferredHigh),
    stretch: String(state.salary.stretch),
  }));

  const pillarScores = useMemo(() => pillars(state), [state]);
  const overall = useMemo(() => overallReadiness(state), [state]);
  const actions = useMemo(() => nextBestActions(state), [state]);

  const isToday = state.dailyFocus.date === todayISO();
  const focusItems = isToday ? state.dailyFocus.items : [];
  const focusTexts = [0, 1, 2].map((i) => focusItems[i]?.text ?? "");
  const focusIds = [0, 1, 2].map((i) => focusItems[i]?.id ?? "");

  const onSalaryChange = (key: SalaryKey, raw: string) => {
    setSalaryDraft((d) => ({ ...d, [key]: raw }));
    const num = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(num) && num >= 0) {
      state.updateSalary({ [key]: num });
    }
  };

  const onFocusChange = (index: number, text: string) => {
    const next = focusTexts.map((t, i) => (i === index ? text : t));
    state.setDailyFocus(next);
  };

  const onToggleFocus = (itemId: string, done: boolean) => {
    state.toggleDailyFocusItem(itemId);
    if (!done) {
      state.recordStreakActivity();
      toast("Focus item completed — streak activity recorded.", "success");
    }
  };

  const stageOptions = POSITIONING_STAGES.map((s, i) => (
    <option key={s} value={i}>
      {s}
    </option>
  ));

  const readinessCards = [
    { label: "Skills Progress", value: skillsCompletion(state), weight: 0.25 },
    { label: "Portfolio Progress", value: portfolioCompletion(state), weight: 0.3 },
    { label: "Interview Preparation", value: interviewStoryCompletion(state), weight: 0.15 },
    { label: "Job Pipeline", value: jobPipelineProgress(state), weight: 0.15 },
    { label: "Networking Progress", value: networkingProgress(state), weight: 0.15 },
    { label: "Certification Progress", value: certificationProgress(state), weight: 0.15 },
  ] as const;

  const scenarioCards: {
    label: string;
    range: string;
    value: number;
    tone: "cyan" | "indigo" | "green";
  }[] = [
    {
      label: "Minimum",
      range: `${state.salary.minimum} LPA`,
      value: state.salary.minimum,
      tone: "cyan",
    },
    {
      label: "Preferred range",
      range: `${state.salary.preferredLow}–${state.salary.preferredHigh} LPA`,
      value: (state.salary.preferredLow + state.salary.preferredHigh) / 2,
      tone: "indigo",
    },
    {
      label: "Stretch",
      range: `${state.salary.stretch} LPA`,
      value: state.salary.stretch,
      tone: "green",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Dashboard"
        subtitle={`${state.profile.name} — ${state.profile.baselineNote}`}
        actions={
          state.streak.currentStreak > 0 ? (
            <Badge tone="amber">
              <Flame className="mr-1 h-3 w-3" aria-hidden />
              {state.streak.currentStreak} day streak
            </Badge>
          ) : undefined
        }
      />

      {/* Section A — Career Readiness */}
      <section aria-labelledby="sec-readiness">
        <h2 id="sec-readiness" className="mb-3 text-lg font-semibold">
          Career Readiness
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="flex flex-col items-center justify-center gap-2">
            <ProgressRing value={overall} label="Overall" />
            <p className="text-xs text-muted">Weighted across all pillars</p>
          </Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            {readinessCards.map((p) => (
              <Card key={p.label}>
                <CardTitle right={<Badge tone="gray">{Math.round(p.weight * 100)}% weight</Badge>}>
                  {p.label}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="w-10 text-right text-lg font-semibold tabular-nums">
                    {p.value}%
                  </span>
                  <ProgressBar
                    value={p.value}
                    aria-label={`${p.label}: ${p.value}%`}
                    tone={
                      p.value >= 60
                        ? "bg-emerald-500"
                        : p.value >= 30
                          ? "bg-cyan-500"
                          : "bg-indigo-500"
                    }
                  />
                </div>
              </Card>
            ))}
          </div>
          <Card className="lg:col-span-3">
            <CardTitle>Pillar Scores</CardTitle>
            <PillarChart data={pillarScores} />
          </Card>
        </div>
      </section>

      {/* Section B — Positioning Strategy */}
      <section aria-labelledby="sec-positioning">
        <h2 id="sec-positioning" className="mb-3 text-lg font-semibold">
          Positioning Strategy
        </h2>
        <Card>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Current stage">
              <Select
                aria-label="Current stage"
                value={state.profile.currentStageIndex}
                onChange={(e) =>
                  state.updateProfile({ currentStageIndex: Number(e.target.value) })
                }
              >
                {stageOptions}
              </Select>
            </Field>
            <Field label="Target stage">
              <Select
                aria-label="Target stage"
                value={state.profile.targetStageIndex}
                onChange={(e) =>
                  state.updateProfile({ targetStageIndex: Number(e.target.value) })
                }
              >
                {stageOptions}
              </Select>
            </Field>
          </div>
          <ol className="space-y-2">
            {POSITIONING_STAGES.map((stage, i) => {
              const isCurrent = i === state.profile.currentStageIndex;
              const isTarget = i === state.profile.targetStageIndex;
              const passed = i < state.profile.currentStageIndex;
              return (
                <li
                  key={stage}
                  aria-current={isCurrent ? "step" : undefined}
                  className={[
                    "flex flex-col gap-1 rounded-lg border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
                    isCurrent
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : isTarget
                        ? "border-indigo-500/60 bg-indigo-500/10"
                        : "border-zinc-800 bg-zinc-900/50",
                    passed ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        isCurrent
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : isTarget
                            ? "border-indigo-500 bg-indigo-600 text-white"
                            : "border-zinc-700 text-muted",
                      ].join(" ")}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{stage}</span>
                  </div>
                  <div className="flex gap-2 pl-10 sm:pl-0">
                    {isCurrent && <Badge tone="green">Current</Badge>}
                    {isTarget && <Badge tone="indigo">Target</Badge>}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </section>

      {/* Section C — Salary Intelligence */}
      <section aria-labelledby="sec-salary">
        <h2 id="sec-salary" className="mb-3 text-lg font-semibold">
          Salary Intelligence
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle>Salary Configuration (LPA)</CardTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SALARY_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <Input
                    aria-label={f.label}
                    type="number"
                    min={0}
                    step={0.5}
                    inputMode="decimal"
                    value={salaryDraft[f.key]}
                    onChange={(e) => onSalaryChange(f.key, e.target.value)}
                  />
                </Field>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Salary should be anchored to role scope, market value, production evidence,
              company tier, and technical capabilities rather than only percentage increase
              over previous CTC.
            </p>
            <p className="mt-1 text-xs italic text-muted">
              Targets are exploratory, not guaranteed outcomes.
            </p>
          </Card>
          <Card>
            <CardTitle>Scenarios vs Baseline ({state.salary.baseline} LPA)</CardTitle>
            <div className="space-y-3">
              {scenarioCards.map((sc) => (
                <div
                  key={sc.label}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted" aria-hidden />
                    <span className="text-sm font-medium">{sc.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-muted">{sc.range}</span>
                    <Badge tone={sc.tone}>{uplift(sc.value, state.salary.baseline)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Section D — Market Intelligence */}
      <section aria-labelledby="sec-market">
        <h2 id="sec-market" className="mb-3 text-lg font-semibold">
          Market Intelligence
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.marketMetrics.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <p className="text-sm text-muted">No market metrics defined.</p>
            </Card>
          ) : (
            state.marketMetrics.map((m) => (
              <Card key={m.id}>
                <CardTitle right={<Badge tone="cyan">Reference / User-maintained data</Badge>}>
                  {m.label}
                </CardTitle>
                <Field label="Note">
                  <Textarea
                    aria-label={`Note for ${m.label}`}
                    value={m.note}
                    placeholder="Your research findings…"
                    onChange={(e) =>
                      state.updateMarketMetric(m.id, { note: e.target.value })
                    }
                  />
                </Field>
                <div className="mt-3">
                  <Field label="Last updated">
                    <Input
                      aria-label={`Last updated date for ${m.label}`}
                      type="date"
                      value={m.lastUpdated}
                      onChange={(e) =>
                        state.updateMarketMetric(m.id, { lastUpdated: e.target.value })
                      }
                    />
                  </Field>
                  <p className="mt-2 text-xs text-muted">
                    Last Updated: {fmtDate(m.lastUpdated)}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Next Best Action panel */}
      <section aria-labelledby="sec-nba">
        <h2 id="sec-nba" className="mb-3 text-lg font-semibold">
          Next Best Action
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {actions.length === 0 ? (
            <Card className="md:col-span-2">
              <p className="text-sm text-muted">
                No recommendations right now — your readiness profile is balanced.
              </p>
            </Card>
          ) : (
            actions.map((rec, i) => (
              <Card key={i} className="border-l-2 border-l-emerald-500">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-snug">{rec.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      <span className="font-semibold text-emerald-400">Why: </span>
                      {rec.reason}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Productivity */}
      <section aria-labelledby="sec-productivity">
        <h2 id="sec-productivity" className="mb-3 text-lg font-semibold">
          Productivity
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle right={<Badge tone="gray">{fmtDate(todayISO())}</Badge>}>
              Today&apos;s Top 3
            </CardTitle>
            {!isToday && (
              <p className="mb-3 text-xs text-muted">
                Previous focus items expired — starting fresh for today.
              </p>
            )}
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-600 accent-emerald-600"
                    aria-label={`Mark focus item ${i + 1} as done`}
                    checked={Boolean(focusItems[i]?.done)}
                    disabled={!focusItems[i]?.text}
                    onChange={() => {
                      const id = focusIds[i];
                      if (id) onToggleFocus(id, Boolean(focusItems[i]?.done));
                    }}
                  />
                  <Input
                    aria-label={`Focus item ${i + 1}`}
                    placeholder={`Focus item ${i + 1}`}
                    value={focusTexts[i]}
                    onChange={(e) => onFocusChange(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {state.streak.currentStreak > 0 && (
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
                <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                {state.streak.currentStreak} day streak — keep it alive.
              </p>
            )}
          </Card>
          <Card>
            <CardTitle right={<Target className="h-4 w-4 text-muted" aria-hidden />}>
              Weekly Goals
            </CardTitle>
            <div className="space-y-3">
              {WEEKLY_GOAL_FIELDS.map((g) => (
                <Field key={g.key} label={g.label}>
                  <Input
                    aria-label={g.label}
                    value={state.weeklyGoals[g.key]}
                    placeholder={g.label}
                    onChange={(e) =>
                      state.setWeeklyGoals({ [g.key]: e.target.value } as Partial<
                        Record<WeeklyGoalKey, string>
                      >)
                    }
                  />
                </Field>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
