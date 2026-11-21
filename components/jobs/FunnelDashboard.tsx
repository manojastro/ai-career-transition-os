"use client";

import React, { useMemo } from "react";
import { Target } from "lucide-react";
import { Card } from "@/components/shared/ui";
import type { ApplicationStatus } from "@/types";

interface FunnelProps {
  applications: {
    id: string;
    company: string;
    status: ApplicationStatus;
    referralContact?: string;
  }[];
  contacts: {
    id: string;
    name: string;
    status: string;
  }[];
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center">
      <p className={`text-2xl font-bold ${accent ?? ""}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function rate(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default function FunnelDashboard({ applications, contacts }: FunnelProps) {
  const stats = useMemo(() => {
    const companies = new Set(applications.map((a) => a.company.toLowerCase())).size;
    const count = (statuses: ApplicationStatus[]) =>
      applications.filter((a) => statuses.includes(a.status)).length;

    const applied = count(["Applied", "Recruiter Screening", "Technical Round", "Manager Round", "Final Round", "Offer", "Rejected"]);
    const screening = count(["Recruiter Screening", "Technical Round", "Manager Round", "Final Round", "Offer"]);
    const technical = count(["Technical Round", "Manager Round", "Final Round", "Offer"]);
    const final = count(["Final Round", "Offer"]);
    const offers = count(["Offer"]);
    const rejections = count(["Rejected"]);

    const referralNames = new Set<string>();
    applications
      .filter((a) => a.status === "Referral Requested" || a.status === "Referred")
      .forEach((a) => referralNames.add(a.referralContact?.toLowerCase() || `${a.company.toLowerCase()}-app`));
    contacts
      .filter((c) => c.status === "Referral Requested" || c.status === "Referred")
      .forEach((c) => referralNames.add(c.name.toLowerCase()));
    const referrals = referralNames.size;

    const interviews = count(["Technical Round", "Manager Round", "Final Round"]);

    return {
      companies,
      total: applications.length,
      referrals,
      interviews,
      offers,
      rejections,
      appToScreening: rate(screening, applied),
      screeningToTechnical: rate(technical, screening),
      technicalToFinal: rate(final, technical),
      finalToOffer: rate(offers, final),
    };
  }, [applications, contacts]);

  return (
    <Card className="mb-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Funnel Dashboard</h2>
        <p className="flex items-center gap-2 rounded-md border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-xs font-medium text-emerald-300">
          <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Prioritize approximately 10 highly relevant, customized applications over 100 generic submissions.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Companies Targeted" value={stats.companies} />
        <Stat label="Applications" value={stats.total} />
        <Stat label="Referrals" value={stats.referrals} accent="text-emerald-400" />
        <Stat label="Interviews" value={stats.interviews} accent="text-cyan-400" />
        <Stat label="Offers" value={stats.offers} accent="text-emerald-400" />
        <Stat label="Rejections" value={stats.rejections} accent="text-red-400" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Application → Screening" value={stats.appToScreening} />
        <Stat label="Screening → Technical" value={stats.screeningToTechnical} />
        <Stat label="Technical → Final" value={stats.technicalToFinal} />
        <Stat label="Final → Offer" value={stats.finalToOffer} />
      </div>
    </Card>
  );
}
