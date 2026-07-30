import { NavLink as Link } from "@/components/ui/nav-link";
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
import {
  getOrganizationMemberPayments,
  getOrganizationMemberProfile,
} from "@/lib/server/services/organization-member-profile.service";
import { cn } from "@/lib/utils";
import {
  getActiveMemberPosition,
  getMemberPositionHistory,
} from "@/lib/server/services/member-position.service";
import { getOrganizationPositions } from "@/lib/server/services/position.service";
import type { MemberPositionHistory } from "@/types/member-position";
import type {
  OrganizationMemberPayment,
  OrganizationMemberProfile,
} from "@/types/organization-member-profile";
import type { Position } from "@/types/position";
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

type TeamMemberTab =
  | "work-summary"
  | "schedule"
  | "day-offs"
  | "position-history"
  | "profile"
  | "payments";

function resolveDefaultTab(
  tab: string | undefined,
  shiftId: string | undefined
): TeamMemberTab {
  if (
    tab === "work-summary" ||
    tab === "schedule" ||
    tab === "day-offs" ||
    tab === "position-history" ||
    tab === "profile" ||
    tab === "payments"
  ) {
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
  let positions: Position[] = [];
  let activePosition: MemberPositionHistory | null = null;
  let positionHistory: MemberPositionHistory[] = [];
  let profile: OrganizationMemberProfile | null = null;
  let payments: OrganizationMemberPayment[] = [];
  let error: string | null = null;

  try {
    const [loadedDetails, loadedDayOffs] = await Promise.all([
      getTeamMemberDetails(teamMemberId, fromDateIso),
      getTeamMemberDayOffs(teamMemberId, fromDateIso),
    ]);

    details = loadedDetails;
    dayOffs = loadedDayOffs;

    if (details) {
      const organizationMemberId = details.teamMember.organizationMember.id;
      const [orgPositions, activePos, posHistory, memberProfile, memberPayments] =
        await Promise.all([
          getOrganizationPositions(details.organizationId),
          getActiveMemberPosition(organizationMemberId),
          getMemberPositionHistory(organizationMemberId),
          getOrganizationMemberProfile(
            details.organizationId,
            organizationMemberId
          ),
          getOrganizationMemberPayments(
            details.organizationId,
            organizationMemberId
          ),
        ]);
      positions = orgPositions;
      activePosition = activePos;
      positionHistory = posHistory;
      profile = memberProfile;
      payments = memberPayments;
    }
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
            positions={positions}
            activePosition={activePosition}
            positionHistory={positionHistory}
            profile={profile}
            payments={payments}
          />
        ) : null}
      </div>
    </div>
  );
}
