"use client";

import { PageHeader } from "@/components/shared/ui";
import NarrativeValidator from "./NarrativeValidator";
import BulletTransformer from "./BulletTransformer";
import StarBuilder from "./StarBuilder";

export default function ResumeView() {
  return (
    <div>
      <PageHeader
        title="Resume Lab"
        subtitle="Align your narrative across every surface and turn duties into outcome-oriented STAR bullets."
      />
      <div className="space-y-6">
        <NarrativeValidator />
        <BulletTransformer />
        <StarBuilder />
      </div>
    </div>
  );
}
