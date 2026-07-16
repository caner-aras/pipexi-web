import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TeamMemberDetailsView } from "@/components/team-members/team-member-details-view";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  fromDateIsoToDateKey,
  getTodayDateKeyUtc,
  toFromDateIso,
} from "@/lib/date-format";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getTeamMemberDayOffs,
  getTeamMemberDetails,
} from "@/lib/server/services/team-member.service";
import { cn } from "@/lib/utils";
import type { TeamMemberDayOff } from "@/types/team-member-day-off";
import type { TeamMemberDetails } from "@/types/team-member-details";

interface TeamMemberPageProps {
  params: Promise<{ teamMemberId: string }>;
  searchParams: Promise<{
    fromDate?: string;
    shiftId?: string;
    tab?: string;
  }>;
}

function resolveDefaultTab(
  tab: string | undefined,
  shiftId: string | undefined
): "work-summary" | "schedule" | "day-offs" {
  if (tab === "work-summary" || tab === "schedule" || tab === "day-offs") {
    return tab;
  }

  if (shiftId) {
    return "schedule";
  }

  return "work-summary";
}

export default async function TeamMemberPage({
  params,
  searchParams,
}: TeamMemberPageProps) {
  const { teamMemberId } = await params;
  const { fromDate, shiftId, tab } = await searchParams;
  const fromDateIso = toFromDateIso(fromDate);
  const fromDateKey = fromDate ?? fromDateIsoToDateKey(fromDateIso);
  const defaultTab = resolveDefaultTab(tab, shiftId);

  let details: TeamMemberDetails | null = null;
  let dayOffs: TeamMemberDayOff[] = [];
  let error: string | null = null;

  try {
    const [loadedDetails, loadedDayOffs] = await Promise.all([
      getTeamMemberDetails(teamMemberId, fromDateIso),
      getTeamMemberDayOffs(teamMemberId, fromDateIso),
    ]);

    details = loadedDetails;
    dayOffs = loadedDayOffs;
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load team member details.";
    }
  }

  const memberName = details
    ? `${details.teamMember.organizationMember.user.firstName} ${details.teamMember.organizationMember.user.lastName}`.trim() ||
    details.teamMember.organizationMember.user.email
    : "Team member";

  const teamId = details?.teamMember.team.id;
  const backHref = teamId ? `/teams/${teamId}` : "/teams";
  const backLabel = teamId ? "Back to team" : "Back to teams";

  return (
    <div className="flex min-w-0 w-full flex-col gap-8 overflow-x-hidden p-6">
      <PageHeader
        className="shrink-0"
        leading={
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        }
        title={memberName}
        description="Team member schedule and activity details."
      />

      <div className="min-w-0 w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : details ? (
          <TeamMemberDetailsView
            teamMemberId={teamMemberId}
            fromDateKey={fromDateKey || getTodayDateKeyUtc()}
            focusShiftId={shiftId ?? null}
            defaultTab={defaultTab}
            details={details}
            dayOffs={dayOffs}
          />
        ) : null}
      </div>
    </div>
  );
}
