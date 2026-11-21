"use client";

import { PageHeader } from "@/components/shared/ui";
import ReadinessCard from "./ReadinessCard";
import HeadlineEditor from "./HeadlineEditor";
import KeywordMatrix from "./KeywordMatrix";
import PostsPlanner from "./PostsPlanner";

export default function LinkedinView() {
  return (
    <div>
      <PageHeader
        title="LinkedIn Command Center"
        subtitle="Optimize your profile, track recruiter keyword coverage and plan building-in-public posts."
      />
      <div className="space-y-6">
        <ReadinessCard />
        <HeadlineEditor />
        <KeywordMatrix />
        <PostsPlanner />
      </div>
    </div>
  );
}
