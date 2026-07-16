"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Layers3,
  ListTodo,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTodayDateKeyUtc } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import type {
  ReportDailyActivity,
  ReportDistributionItem,
  ReportShiftAssignment,
  ReportSignal,
  ReportSummary,
} from "@/types/report";

const TREND_DAY_OPTIONS = [
  { value: "7", label: "Past 7 days" },
  { value: "15", label: "Past 15 days" },
  { value: "30", label: "Past 30 days" },
] as const;

const FUTURE_DAY_OPTIONS = [
  { value: "0", label: "No upcoming" },
  { value: "7", label: "Next 7 days" },
  { value: "14", label: "Next 14 days" },
  { value: "30", label: "Next 30 days" },
] as const;

function formatDistributionLabel(key: string): string {
  if (!key) {
    return "Unknown";
  }

  return key
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatWeekday(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatMonthDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDayNumber(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatLongDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatShiftTime(time: string): string {
  if (/^\d{2}:\d{2}/.test(time)) {
    return time.slice(0, 5);
  }

  return time;
}

function getMemberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getSignalToneClass(tone: string): string {
  switch (tone.toLowerCase()) {
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "danger":
    case "destructive":
      return "text-destructive";
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    default:
      return "text-muted-foreground";
  }
}

function getSignalIcon(key: string): LucideIcon {
  switch (key) {
    case "open_tasks":
      return ListTodo;
    case "overdue_tasks":
      return AlertTriangle;
    case "active_shifts":
      return Clock3;
    case "missing_forms":
      return FileText;
    case "pending_leaves":
      return CalendarCheck2;
    default:
      return Layers3;
  }
}

interface OverviewStat {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
}

function buildOverviewStats(
  summary: ReportSummary,
  organizationId: string
): OverviewStat[] {
  const { overview } = summary;

  return [
    {
      label: "Members",
      value: overview.membersCount,
      icon: UsersRound,
      href: `/organizations/${organizationId}/members`,
    },
    {
      label: "Teams",
      value: overview.teamsCount,
      icon: Layers3,
      href: "/teams",
    },
    {
      label: "Active shifts",
      value: overview.activeShiftsNow,
      icon: Clock3,
      href: "/shifts",
    },
    {
      label: "Completed shifts",
      value: overview.completedShiftsCount,
      icon: CheckCircle2,
      href: "/shifts",
    },
    {
      label: "Clocked in today",
      value: overview.membersClockedInToday,
      icon: Clock3,
      href: "/shifts",
    },
    {
      label: "Open tasks",
      value: overview.openTasksCount,
      icon: ListTodo,
    },
    {
      label: "Overdue tasks",
      value: overview.overdueTasksCount,
      icon: AlertTriangle,
    },
    {
      label: "Tasks created today",
      value: overview.tasksCreatedToday,
      icon: ClipboardList,
    },
    {
      label: "Pending leave",
      value: overview.pendingLeaveRequests,
      icon: CalendarCheck2,
      href: "/leave-requests",
    },
    {
      label: "Approved leave",
      value: overview.approvedLeaveRequests,
      icon: CheckCircle2,
      href: "/leave-requests",
    },
    {
      label: "Forms today",
      value: overview.formSubmissionsToday,
      icon: FileText,
      href: "/forms",
    },
    {
      label: "Missing shift forms",
      value: overview.missingRequiredShiftForms,
      icon: FileText,
      href: "/shifts",
    },
  ];
}

function OverviewStatsList({ stats }: { stats: OverviewStat[] }) {
  return (
    <aside className="min-w-0 lg:pl-8">
      <h2 className="text-sm font-medium tracking-tight">Pulse</h2>
      <ul className="mt-4 space-y-0.5">
        {stats.map((item) => {
          const Icon = item.icon;
          const rowClassName =
            "group/stat -mx-2 grid grid-cols-[1fr_auto] items-center gap-x-3 rounded-md px-2 py-1.5 text-sm transition-colors";

          const content = (
            <>
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-muted-foreground group-hover/stat:text-foreground">
                  {item.label}
                </span>
                {item.href ? (
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </span>
              <span className="text-right font-medium tabular-nums text-foreground">
                {item.value}
              </span>
            </>
          );

          if (item.href) {
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(rowClassName, "hover:bg-muted/50")}
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <div className={rowClassName}>{content}</div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function SignalsRow({ signals }: { signals: ReportSignal[] }) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {signals.map((signal) => {
        const Icon = getSignalIcon(signal.key);

        return (
          <div
            key={signal.key}
            className="inline-flex items-center gap-1.5 text-sm"
          >
            <Icon
              className={cn("size-3.5", getSignalToneClass(signal.tone))}
            />
            <span className="text-muted-foreground">{signal.label}</span>
            <span
              className={cn(
                "font-medium tabular-nums",
                getSignalToneClass(signal.tone)
              )}
            >
              {signal.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DistributionList({
  title,
  items,
  emptyLabel,
  barClassName,
}: {
  title: string;
  items: ReportDistributionItem[];
  emptyLabel: string;
  barClassName: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="min-w-0 rounded-xl bg-muted/35 p-3">
      <h3 className="text-xs font-medium tracking-tight text-muted-foreground">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="mt-2.5 text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="mt-2.5 space-y-2">
          {items.map((item) => {
            const width = Math.max(
              (item.count / max) * 100,
              item.count > 0 ? 4 : 0
            );

            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">
                    {formatDistributionLabel(item.key)}
                  </span>
                  <span className="tabular-nums font-medium text-foreground">
                    {item.count}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-background/70">
                  <div
                    className={cn("h-full rounded-full", barClassName)}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScheduleAssignmentCard({
  assignment,
  onNavigate,
}: {
  assignment: ReportShiftAssignment;
  onNavigate?: () => void;
}) {
  const timeEntries = assignment.timeEntries ?? [];
  const hasClockActivity = timeEntries.length > 0;

  return (
    <li className="overflow-hidden rounded-xl bg-muted/35">
      <Link
        href={`/shifts/${assignment.shiftId}`}
        className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-muted/50"
        onClick={onNavigate}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tracking-wide text-foreground ring-1 ring-border/60">
          {getMemberInitials(assignment.memberName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{assignment.memberName}</p>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3 shrink-0" />
            <span className="tabular-nums">
              {formatShiftTime(assignment.startTime)} –{" "}
              {formatShiftTime(assignment.endTime)}
            </span>
            <span className="text-border">·</span>
            <span>Planned</span>
          </p>
        </div>
      </Link>

      <div className="border-t border-border/50 px-3.5 py-3">
        {hasClockActivity ? (
          <ul className="space-y-3">
            {timeEntries.map((entry) => (
              <li key={entry.timeEntryId} className="flex gap-3">
                <div className="flex w-4 flex-col items-center pt-1">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="mt-1 w-px flex-1 bg-border/50" />
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="min-w-0 flex-1 space-y-2 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Clock activity</p>
                    <StatusIndicator status={entry.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-background/70 px-2.5 py-2">
                      <p className="text-muted-foreground">Clock in</p>
                      <p className="mt-0.5 font-medium tabular-nums">
                        {formatShiftTime(entry.clockInTime)}
                      </p>
                    </div>
                    <div className="rounded-md bg-background/70 px-2.5 py-2">
                      <p className="text-muted-foreground">Clock out</p>
                      <p className="mt-0.5 font-medium tabular-nums">
                        {entry.clockOutTime
                          ? formatShiftTime(entry.clockOutTime)
                          : "In progress"}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p>Scheduled, but no time entry has been logged yet.</p>
          </div>
        )}
      </div>
    </li>
  );
}

function ScheduleFeed({
  days,
  todayKey,
}: {
  days: ReportDailyActivity[];
  todayKey: string;
}) {
  const [hideEmptyDays, setHideEmptyDays] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ReportDailyActivity | null>(
    null
  );

  const totalAssigned = useMemo(
    () =>
      days.reduce(
        (sum, day) => sum + (day.shiftAssignments?.length ?? 0),
        0
      ),
    [days]
  );

  const emptyDayCount = useMemo(
    () =>
      days.filter((day) => (day.shiftAssignments?.length ?? 0) === 0).length,
    [days]
  );

  const visibleDays = useMemo(() => {
    if (!hideEmptyDays) {
      return days;
    }

    return days.filter((day) => (day.shiftAssignments?.length ?? 0) > 0);
  }, [days, hideEmptyDays]);

  const selectedAssignments = selectedDay?.shiftAssignments ?? [];
  const isSelectedToday = selectedDay?.date === todayKey;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium tracking-tight">Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Day summaries. Open a day for coverage and clock activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {emptyDayCount > 0 ? (
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <Checkbox
                checked={hideEmptyDays}
                onCheckedChange={(checked) =>
                  setHideEmptyDays(checked === true)
                }
              />
              Hide empty days
            </label>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {totalAssigned}{" "}
            {totalAssigned === 1 ? "assignment" : "assignments"}
          </p>
        </div>
      </div>

      <div className="mt-6 max-h-[36rem] space-y-2.5 overflow-y-auto">
        {visibleDays.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/50 px-4 py-10 text-center">
            <UsersRound className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {days.length === 0
                ? "No scheduled coverage in this range."
                : "No scheduled days in this range."}
            </p>
          </div>
        ) : (
          visibleDays.map((day) => {
            const assignments = day.shiftAssignments ?? [];
            const isToday = day.date === todayKey;
            const isEmpty = assignments.length === 0;
            const clockedInCount = assignments.filter(
              (assignment) => (assignment.timeEntries?.length ?? 0) > 0
            ).length;
            const missingClockCount = assignments.length - clockedInCount;
            const isSelected = selectedDay?.date === day.date;
            const previewAssignments = assignments.slice(0, 4);
            const extraCount = Math.max(assignments.length - 4, 0);

            if (isEmpty) {
              return (
                <div
                  key={day.date}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-muted-foreground",
                    isToday && "border border-sky-500/40 bg-sky-500/5"
                  )}
                >
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/40">
                    <span className="text-xs font-medium uppercase tracking-wide">
                      {formatWeekday(day.date)}
                    </span>
                    <span className="text-xs tabular-nums">
                      {formatDayNumber(day.date)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{formatLongDate(day.date)}</span>
                      {isToday ? (
                        <span className="shrink-0 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
                          Today
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0">No coverage</span>
                </div>
              );
            }

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "group w-full overflow-hidden rounded-xl bg-muted/35 text-left transition-colors",
                  isToday
                    ? "border border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10"
                    : "hover:bg-muted/50",
                  isSelected && "ring-2 ring-sky-500/40 ring-offset-2"
                )}
              >
                <div className="flex items-start gap-3 px-3.5 py-3.5">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 flex-col items-center justify-center rounded-sm bg-background ring-1 ring-border/60",
                      isToday && "ring-teal-500/40"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium uppercase",
                        isToday && "text-sky-700 dark:text-sky-300"
                      )}
                    >
                      {formatWeekday(day.date)}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums tracking-tight",
                        isToday && "text-teal-700 dark:text-teal-300"
                      )}
                    >
                      {formatDayNumber(day.date)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm font-medium">
                            {formatMonthDay(day.date)}
                          </p>
                          {isToday ? (
                            <span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
                              Today
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {assignments.length}{" "}
                          {assignments.length === 1
                            ? "person scheduled"
                            : "people scheduled"}
                        </p>
                      </div>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background/70 text-muted-foreground ring-1 ring-border/50 transition-colors group-hover:text-foreground">
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {previewAssignments.map((assignment) => (
                          <div
                            key={assignment.shiftId}
                            className="flex size-8 items-center border border-border/50 justify-center rounded-full bg-background text-xs font-semibold tracking-wide ring-2 ring-muted/35"
                            title={assignment.memberName}
                          >
                            {getMemberInitials(assignment.memberName)}
                          </div>
                        ))}
                        {extraCount > 0 ? (
                          <div className="flex size-8 items-center justify-center rounded-full bg-background text-xs font-medium text-muted-foreground ring-2 ring-muted/35">
                            +{extraCount}
                          </div>
                        ) : null}
                      </div>
                      {missingClockCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="size-3 shrink-0" />
                          {missingClockCount} missing clock
                        </span>
                      ) : assignments.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3 shrink-0" />
                          All clocked
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-px border-t border-border/50 bg-border/40">
                  {[
                    {
                      label: "Shifts",
                      value: assignments.length,
                      icon: UsersRound,
                    },
                    {
                      label: "Clocked",
                      value: clockedInCount,
                      icon: Clock3,
                    },
                    {
                      label: "Tasks",
                      value: day.tasksCreated,
                      icon: ListTodo,
                    },
                    {
                      label: "Forms",
                      value: day.formSubmissionsCreated,
                      icon: FileText,
                    },
                  ].map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div
                        key={metric.label}
                        className="bg-muted/35 px-2 py-2.5 text-center"
                      >
                        <Icon className="mx-auto size-3 text-muted-foreground" />
                        <p className="mt-1 text-sm font-semibold tabular-nums tracking-tight">
                          {metric.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {metric.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })
        )}
      </div>

      <Drawer
        open={selectedDay != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDay(null);
          }
        }}
        swipeDirection="right"
      >
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader className="border-b border-border/50 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="text-base">
                  {selectedDay
                    ? formatLongDate(selectedDay.date)
                    : "Day details"}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  Scheduled coverage and clock activity.
                </DrawerDescription>
              </div>
              {isSelectedToday ? (
                <span className="shrink-0 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  Today
                </span>
              ) : null}
            </div>
          </DrawerHeader>

          {selectedDay ? (
            <div className="space-y-6 overflow-y-auto px-4 py-5">
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Tasks",
                    value: selectedDay.tasksCreated,
                    icon: ListTodo,
                  },
                  {
                    label: "Time",
                    value: selectedDay.timeEntriesCreated,
                    icon: Clock3,
                  },
                  {
                    label: "Forms",
                    value: selectedDay.formSubmissionsCreated,
                    icon: FileText,
                  },
                  {
                    label: "Shifts",
                    value: selectedAssignments.length,
                    icon: UsersRound,
                  },
                ].map((metric) => {
                  const Icon = metric.icon;

                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg bg-muted/40 px-2.5 py-3 text-center"
                    >
                      <Icon className="mx-auto size-3.5 text-muted-foreground" />
                      <p className="mt-2 text-lg font-semibold tabular-nums tracking-tight">
                        {metric.value}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Schedule</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAssignments.length} assigned
                  </p>
                </div>

                {selectedAssignments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/50 px-4 py-8 text-center">
                    <UsersRound className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No one is scheduled for this day.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedAssignments.map((assignment) => (
                      <ScheduleAssignmentCard
                        key={assignment.shiftId}
                        assignment={assignment}
                        onNavigate={() => setSelectedDay(null)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}


interface DashboardPageContentProps {
  organizationId: string;
  organizationName: string | null;
  initialTrendDays: number;
  initialFutureDays: number;
  summary: ReportSummary | null;
  error: string | null;
}

export function DashboardPageContent({
  organizationId,
  organizationName,
  initialTrendDays,
  initialFutureDays,
  summary: initialSummary,
  error: initialError,
}: DashboardPageContentProps) {
  const [trendDays, setTrendDays] = useState(String(initialTrendDays));
  const [futureDays, setFutureDays] = useState(String(initialFutureDays));
  const [summary, setSummary] = useState(initialSummary);
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const todayKey = useMemo(() => getTodayDateKeyUtc(), []);

  const overviewStats = useMemo(
    () => (summary ? buildOverviewStats(summary, organizationId) : []),
    [summary, organizationId]
  );

  const loadSummary = useCallback(
    async (nextTrendDays: string, nextFutureDays: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          organizationId,
          trendDays: nextTrendDays,
          futureDays: nextFutureDays,
        });
        const response = await fetch(`/api/report/summary?${params.toString()}`);
        const body = (await response.json()) as {
          data?: ReportSummary;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load report summary.");
        }

        setSummary(body.data ?? null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load report summary.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [organizationId]
  );

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          organizationName
            ? `Snapshot for ${organizationName}`
            : "Snapshot for the selected organization"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              items={TREND_DAY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={trendDays}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                setTrendDays(value);
                void loadSummary(value, futureDays);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-36" size="default">
                <SelectValue placeholder="Past" />
              </SelectTrigger>
              <SelectContent>
                {TREND_DAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={FUTURE_DAY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={futureDays}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                setFutureDays(value);
                void loadSummary(trendDays, value);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="w-36" size="default">
                <SelectValue placeholder="Upcoming" />
              </SelectTrigger>
              <SelectContent>
                {FUTURE_DAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !summary ? (
        <p className="text-sm text-muted-foreground">No report data available.</p>
      ) : (
        <div className={cn("space-y-10", isLoading && "opacity-60")}>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DistributionList
              title="Shifts"
              items={summary.shiftStatusDistribution}
              emptyLabel="No shift data yet."
              barClassName="bg-sky-500/70"
            />
            <DistributionList
              title="Leave"
              items={summary.leaveStatusDistribution}
              emptyLabel="No leave data yet."
              barClassName="bg-amber-500/70"
            />
            <DistributionList
              title="Tasks"
              items={summary.taskStatusDistribution}
              emptyLabel="No task data yet."
              barClassName="bg-emerald-500/70"
            />
            <DistributionList
              title="Priority"
              items={summary.taskPriorityDistribution}
              emptyLabel="No priority data yet."
              barClassName="bg-orange-500/70"
            />
          </section>

          <SignalsRow signals={summary.signals} />

          <section className="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_16rem] xl:grid-cols-[minmax(0,1fr)_18rem]">
            <ScheduleFeed
              days={summary.dailyActivity}
              todayKey={todayKey}
            />
            <OverviewStatsList stats={overviewStats} />
          </section>
        </div>
      )}
    </>
  );
}
