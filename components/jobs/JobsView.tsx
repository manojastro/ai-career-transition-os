"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import { PageHeader } from "@/components/shared/ui";
import FunnelDashboard from "./FunnelDashboard";
import ApplicationsSection from "./ApplicationsSection";
import PlatformDirectory from "./PlatformDirectory";
import NetworkingCRM from "./NetworkingCRM";
import OutreachBuilder from "./OutreachBuilder";

export default function JobsView() {
  const applications = useStore((s) => s.applications);
  const contacts = useStore((s) => s.contacts);
  const jobPlatforms = useStore((s) => s.jobPlatforms);
  const addApplication = useStore((s) => s.addApplication);
  const updateApplication = useStore((s) => s.updateApplication);
  const deleteApplication = useStore((s) => s.deleteApplication);
  const addContact = useStore((s) => s.addContact);
  const updateContact = useStore((s) => s.updateContact);
  const deleteContact = useStore((s) => s.deleteContact);

  return (
    <div>
      <PageHeader
        title="Job Search Command Center"
        subtitle="Focused applications, referral networking and outreach — all in one place."
      />
      <FunnelDashboard applications={applications} contacts={contacts} />
      <ApplicationsSection
        applications={applications}
        addApplication={addApplication}
        updateApplication={updateApplication}
        deleteApplication={deleteApplication}
      />
      <PlatformDirectory platforms={jobPlatforms} />
      <NetworkingCRM
        contacts={contacts}
        addContact={addContact}
        updateContact={updateContact}
        deleteContact={deleteContact}
      />
      <OutreachBuilder />
    </div>
  );
}
