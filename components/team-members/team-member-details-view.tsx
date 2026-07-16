"use client";

import {
  Briefcase,
  CalendarDays,
  CalendarOff,
  CheckSquare,
  ChevronRight,
  Clock3,
  ExternalLink,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TeamMemberDayOffsPanel } from "@/components/team-members/team-member-day-offs-panel";
import { TeamMemberShiftsMasterDetail } from "@/components/team-members/team-member-shifts-master-detail";
import { TeamMemberTasksPanel } from "@/components/team-members/team-member-tasks-panel";
import { TeamMemberWorkSummaryReport } from "@/components/team-members/team-member-work-summary-report";
import { OrganizationDetailsDrawer } from "@/components/organizations/organization-details-drawer";
import { OrganizationDetailsTrigger } from "@/components/organizations/organization-details-trigger";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatDateRangeLabel,
} from "@/lib/date-format";
import { formatRecordStatusLabel } from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { TeamMemberDayOff } from "@/types/team-member-day-off";
import type { TeamMemberDetails } from "@/types/team-member-details";

interface TeamMemberDetailsViewProps {
  teamMemberId: string;
  fromDateKey: string;
  focusShiftId?: string | null;
  defaultTab?: "work-summary" | "schedule" | "day-offs";
  details: TeamMemberDetails;
  dayOffs: TeamMemberDayOff[];
}

function getMemberInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatMemberDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function MemberInfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-muted/30 px-6 py-6">
      <h5 className="text-sm font-medium text-foreground">{title}</h5>
      <div className="mt-5 divide-y divide-border/50">{children}</div>
    </section>
  );
}

function MemberInfoItem({
  label,
  value,
  hint,
  onClick,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10">
      <span className="shrink-0 text-sm text-muted-foreground sm:w-40">
        {label}
      </span>
      <div className="min-w-0 sm:text-right">
        {href ? (
          <Link
            href={href}
            className="inline-flex max-w-full items-center gap-1.5 text-sm text-foreground underline-offset-4 hover:underline"
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
          </Link>
        ) : onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="inline-flex max-w-full items-center gap-1.5 text-sm text-foreground underline-offset-4 hover:underline"
          >
            <span className="truncate">{value}</span>
            <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        ) : (
          <p className="truncate text-sm text-foreground">{value}</p>
        )}
        {hint ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

function MemberTimeline({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-lg bg-muted/30 px-6 py-6">
      <h5 className="text-sm font-medium text-foreground">Timeline</h5>
      <div className="mt-5 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {items.map((item) => (
          <div key={item.label} className="rounded-sm bg-muted/70 p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-1.5 text-sm text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MemberStat({
  icon: Icon,
  label,
  value,
  hint,
  href,
}: {
  icon: typeof Clock3;
  label: string;
  value: string | number;
  hint: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="flex size-8 items-center justify-center rounded-sm bg-background/80">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-1 flex-col justify-center gap-2 px-5 py-4 transition-colors hover:bg-muted/40 lg:px-6"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4 lg:px-6">
      {content}
    </div>
  );
}

export function TeamMemberDetailsView({
  teamMemberId,
  fromDateKey,
  focusShiftId = null,
  defaultTab = "work-summary",
  details,
  dayOffs,
}: TeamMemberDetailsViewProps) {
  const router = useRouter();
  const [organizationDrawerOpen, setOrganizationDrawerOpen] = useState(false);
  const { teamMember, shifts, timeEntries, totalTaskCount, organizationId, organizationName } =
    details;
  const memberName = getShiftMemberDisplayName(teamMember.organizationMember);
  const rangeLabel = formatDateRangeLabel(fromDateKey);
  const memberPhone = teamMember.organizationMember.user.phone;
  const memberAvatarUrl = teamMember.organizationMember.user.avatarUrl;
  const memberInitials = getMemberInitials(memberName) || "?";
  const teamManager = teamMember.team.managerMember;
  const teamManagerName = teamManager
    ? getShiftMemberDisplayName(teamManager)
    : null;
  const orgMemberUpdatedAt = teamMember.organizationMember.updatedAt;
  const teamMemberUpdatedAt = teamMember.updatedAt;
  const lastUpdatedAt = orgMemberUpdatedAt ?? teamMemberUpdatedAt;

  function handleFromDateChange(value: string) {
    if (!value) {
      return;
    }

    router.push(`/team-members/${teamMemberId}?fromDate=${value}`);
  }

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <Card className="overflow-hidden rounded-sm shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col xl:flex-row xl:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col gap-8 p-5 sm:p-6">
              <div className="flex gap-4 sm:gap-5">
                {memberAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={memberAvatarUrl}
                    alt={memberName}
                    className="size-16 shrink-0 rounded-sm object-cover sm:size-[4.5rem]"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-xl font-semibold text-primary sm:size-[4.5rem]">
                    {memberInitials}
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-lg font-semibold tracking-tight sm:text-xl">
                      {memberName}
                    </h4>
                    <StatusIndicator status={teamMember.status} showLabel />
                    <TeamMemberTasksPanel memberName={memberName} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <OrganizationDetailsTrigger
                      organizationId={organizationId}
                      organizationName={organizationName}
                    />
                    {teamMember.organizationMember.jobTitle ? (
                      <Badge variant="outline">
                        <Briefcase />
                        {teamMember.organizationMember.jobTitle}
                      </Badge>
                    ) : null}
                    <Badge variant="outline">
                      <Users />
                      {teamMember.team.name}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                <MemberInfoSection title="Contact">
                  <MemberInfoItem
                    label="Email"
                    value={teamMember.organizationMember.user.email}
                  />
                  {memberPhone ? (
                    <MemberInfoItem label="Phone" value={memberPhone} />
                  ) : null}
                  {teamMember.organizationMember.jobTitle ? (
                    <MemberInfoItem
                      label="Job title"
                      value={teamMember.organizationMember.jobTitle}
                    />
                  ) : null}
                  {teamManagerName ? (
                    <MemberInfoItem
                      label="Team manager"
                      value={teamManagerName}
                    />
                  ) : null}
                </MemberInfoSection>

                <MemberInfoSection title="Membership">
                  <MemberInfoItem
                    label="Organization"
                    value={organizationName}
                    onClick={() => setOrganizationDrawerOpen(true)}
                  />
                  <MemberInfoItem
                    label="Team"
                    value={teamMember.team.name}
                    hint={`Team ${formatRecordStatusLabel(teamMember.team.status)}`}
                    href={`/teams/${teamMember.team.id}`}
                  />
                  <MemberInfoItem
                    label="Organization member"
                    value={formatRecordStatusLabel(teamMember.organizationMember.status)}
                  />
                  <MemberInfoItem
                    label="Joined organization"
                    value={formatMemberDate(teamMember.organizationMember.createdAt)}
                  />
                  <MemberInfoItem
                    label="Joined team"
                    value={formatMemberDate(teamMember.createdAt)}
                  />
                </MemberInfoSection>
              </div>

              <MemberTimeline
                items={[
                  {
                    label: "Organization joined",
                    value: formatMemberDate(teamMember.organizationMember.createdAt),
                  },
                  {
                    label: "Team joined",
                    value: formatMemberDate(teamMember.createdAt),
                  },
                  {
                    label: "Last updated",
                    value: lastUpdatedAt
                      ? formatMemberDate(lastUpdatedAt)
                      : "No updates yet",
                  },
                ]}
              />
            </div>

            <div className="flex flex-col border-t border-border/50 bg-background xl:w-72 xl:border-t-0 xl:border-l">
              <div className="border-b border-border/50 px-5 py-4 sm:px-6">
                <p className="text-sm font-medium">Schedule range</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rangeLabel} · 7-day window
                </p>
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    From date
                  </p>
                  <DatePicker
                    value={fromDateKey}
                    onChange={handleFromDateChange}
                    showIcon
                    buttonClassName="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-border/30 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
                <MemberStat
                  icon={CalendarDays}
                  label="Shifts"
                  value={shifts.length}
                  hint="In selected range"
                />
                <MemberStat
                  icon={Clock3}
                  label="Time entries"
                  value={timeEntries.length}
                  hint="In selected range"
                />
                <MemberStat
                  icon={CheckSquare}
                  label="Tasks"
                  value={totalTaskCount}
                  hint="Assigned to member"
                  href={`/team-members/${teamMemberId}/tasks`}
                />
                <MemberStat
                  icon={CalendarOff}
                  label="Day offs"
                  value={dayOffs.length}
                  hint="In selected window"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab} className="gap-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
          <TabsTrigger value="work-summary" className="flex-none px-3">
            Work summary
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-none px-3">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="day-offs" className="flex-none px-3">
            Day offs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-summary" keepMounted>
          <TeamMemberWorkSummaryReport
            organizationId={teamMember.team.organizationId}
            teamMemberId={teamMemberId}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <TeamMemberShiftsMasterDetail
            key={`${fromDateKey}-${focusShiftId ?? ""}`}
            shifts={shifts}
            focusShiftId={focusShiftId}
          />
        </TabsContent>

        <TabsContent value="day-offs" className="min-h-[28rem]">
          <TeamMemberDayOffsPanel
            teamMemberId={teamMemberId}
            fromDateKey={fromDateKey}
            dayOffs={dayOffs}
          />
        </TabsContent>
      </Tabs>

      <OrganizationDetailsDrawer
        organizationId={organizationId}
        open={organizationDrawerOpen}
        onOpenChange={setOrganizationDrawerOpen}
      />
    </div>
  );
}
