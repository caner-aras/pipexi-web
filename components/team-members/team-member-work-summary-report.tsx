"use client";

import {
  CalendarDays,
  Clock3,
  Coffee,
  Loader2,
  MapPin,
  MessageSquareText,
  MoreHorizontalIcon,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDatePickerLabel,
  getCurrentMonthDateRangeUtc,
} from "@/lib/date-format";
import {
  formatDuration,
  formatShiftTime,
  getDurationMinutes,
  getShiftDetailHref,
  getTimelinePosition,
  getTimelineWidth,
} from "@/lib/shift-format";
import {
  formatTimelineMinutes,
  getDayOfWeekFromDateKey,
  parseTimeStringToMinutes,
} from "@/lib/shift-schedule-timeline";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/location";
import type { LocationWorkingHour } from "@/types/location-working-hour";
import type {
  TeamMemberWorkSummary,
  WorkSummaryDay,
  WorkSummaryMember,
  WorkSummaryShift,
  WorkSummaryTimeEntry,
  WorkSummaryTimeEntryBreak,
} from "@/types/team-member-work-summary";

interface TeamMemberWorkSummaryReportProps {
  organizationId: string;
  teamMemberId: string;
}

function getDayMetrics(day: WorkSummaryDay) {
  return day.shifts.reduce(
    (totals, shift) => ({
      scheduledMinutes: totals.scheduledMinutes + shift.shiftDurationMinutes,
      workedMinutes: totals.workedMinutes + shift.workedDurationMinutes,
      shiftCount: totals.shiftCount + 1,
    }),
    { scheduledMinutes: 0, workedMinutes: 0, shiftCount: 0 }
  );
}

function formatShortDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatWeekdayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

function getWorkingHoursTimelineWindow(
  dateKey: string,
  timezone: string,
  workingHours?: LocationWorkingHour[]
): { startMinutes: number; endMinutes: number } {
  if (workingHours?.length) {
    const dayOfWeek = getDayOfWeekFromDateKey(dateKey, timezone);
    const workingHour = workingHours.find((hour) => hour.dayOfWeek === dayOfWeek);

    if (
      workingHour &&
      !workingHour.isClosed &&
      workingHour.opensAt &&
      workingHour.closesAt
    ) {
      return {
        startMinutes: parseTimeStringToMinutes(workingHour.opensAt),
        endMinutes: parseTimeStringToMinutes(workingHour.closesAt),
      };
    }
  }

  return { startMinutes: 6 * 60, endMinutes: 22 * 60 };
}

function resolveShiftLocation(
  shift: WorkSummaryShift,
  locationById: Record<string, Location>,
  workingHoursByLocationId: Record<string, LocationWorkingHour[]>
): { timezone: string; workingHours?: LocationWorkingHour[]; name?: string } {
  const locationId = shift.timeEntries[0]?.locationId;

  if (!locationId) {
    return { timezone: "UTC" };
  }

  const location = locationById[locationId];

  return {
    timezone: location?.timezone ?? "UTC",
    workingHours: workingHoursByLocationId[locationId],
    name: location?.name,
  };
}

function WorkSummaryStatsGrid({
  member,
  fromDate,
  toDate,
}: {
  member: WorkSummaryMember;
  fromDate: string;
  toDate: string;
}) {
  const items = [
    {
      label: "Scheduled",
      value: member.totals.totalShiftDurationText,
      hint: `${member.totals.totalShiftCount} shifts`,
      icon: Timer,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      label: "Worked",
      value: member.totals.totalWorkedDurationText,
      hint: `${member.totals.totalTimeEntryCount} time entries`,
      icon: Clock3,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Breaks",
      value: member.totals.totalBreakDurationText,
      icon: Coffee,
      iconClassName: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Report range",
      value: `${formatDatePickerLabel(fromDate)} – ${formatDatePickerLabel(toDate)}`,
      icon: CalendarDays,
      iconClassName: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-sm border border-border/50 bg-background px-3 py-3"
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-sm",
                item.iconClassName
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums">
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.hint}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkSummaryDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <DatePicker
        value={value}
        onChange={onChange}
        showIcon
        buttonClassName="bg-background"
      />
    </div>
  );
}

function getFirstDayWithDetail(days: WorkSummaryDay[]): string | null {
  return days.find((day) => day.shifts.length > 0)?.date ?? null;
}

function WorkSummaryChart({
  member,
  selectedDateKey,
  onSelectDateKey,
}: {
  member: WorkSummaryMember;
  selectedDateKey: string | null;
  onSelectDateKey: (dateKey: string) => void;
}) {
  const dayButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const shouldScrollInstantlyRef = useRef(true);

  const chartDays = useMemo(() => {
    return member.days.map((day) => ({
      ...day,
      metrics: getDayMetrics(day),
    }));
  }, [member.days]);

  const maxScheduledMinutes = useMemo(() => {
    return Math.max(
      ...chartDays.map((day) => day.metrics.scheduledMinutes),
      1
    );
  }, [chartDays]);

  useEffect(() => {
    shouldScrollInstantlyRef.current = true;
  }, [member.days]);

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }

    const dayButton = dayButtonRefs.current.get(selectedDateKey);

    if (!dayButton) {
      return;
    }

    const scroller = dayButton.closest(
      "[data-chart-scroll]"
    ) as HTMLElement | null;

    if (!scroller) {
      return;
    }

    const buttonRect = dayButton.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const nextScrollLeft =
      scroller.scrollLeft +
      (buttonRect.left - scrollerRect.left) -
      (scrollerRect.width - buttonRect.width) / 2;

    scroller.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior: shouldScrollInstantlyRef.current ? "instant" : "smooth",
    });
    shouldScrollInstantlyRef.current = false;
  }, [selectedDateKey, chartDays]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          Scheduled
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          Worked
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible pb-1 pt-1" data-chart-scroll>
        <div className="flex min-w-max items-end gap-3 px-1">
          {chartDays.map((day) => {
            const scheduledHeight =
              (day.metrics.scheduledMinutes / maxScheduledMinutes) * 88;
            const workedHeight =
              day.metrics.scheduledMinutes > 0
                ? (day.metrics.workedMinutes / day.metrics.scheduledMinutes) *
                scheduledHeight
                : 0;
            const isSelected = selectedDateKey === day.date;

            return (
              <button
                key={day.date}
                ref={(node) => {
                  if (node) {
                    dayButtonRefs.current.set(day.date, node);
                  } else {
                    dayButtonRefs.current.delete(day.date);
                  }
                }}
                type="button"
                onClick={() => onSelectDateKey(day.date)}
                className={cn(
                  "group flex w-14 flex-col items-center gap-2.5 rounded-sm px-1.5 pb-2 pt-3 transition-all",
                  "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected && "bg-primary/5 ring-1 ring-primary/30"
                )}
                title={`${formatDatePickerLabel(day.date)} · Scheduled ${formatDuration(day.metrics.scheduledMinutes)} · Worked ${formatDuration(day.metrics.workedMinutes)}`}
                aria-pressed={isSelected}
                aria-label={formatDatePickerLabel(day.date)}
              >
                <div className="relative flex h-36 w-full items-end justify-center overflow-visible">
                  <div
                    className="absolute bottom-0 w-5 rounded-sm bg-muted-foreground/15"
                    style={{ height: `${Math.max(scheduledHeight, day.metrics.scheduledMinutes > 0 ? 6 : 0)}%` }}
                  />
                  {day.metrics.workedMinutes > 0 ? (
                    <div
                      className="absolute bottom-0 w-5 rounded-sm bg-primary"
                      style={{ height: `${Math.max(workedHeight, 4)}%` }}
                    />
                  ) : null}
                </div>
                <div className="text-center leading-tight">
                  <p
                    className={cn(
                      "text-sm text-muted-foreground",
                      isSelected && "font-medium text-primary"
                    )}
                  >
                    {formatWeekdayLabel(day.date)}
                  </p>
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {formatShortDayLabel(day.date).split(" ")[1]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WorkSummaryShiftTimeline({
  shift,
  timezone,
  timelineWindow,
  className,
}: {
  shift: WorkSummaryShift;
  timezone: string;
  timelineWindow: { startMinutes: number; endMinutes: number };
  className?: string;
}) {
  const { startMinutes, endMinutes } = timelineWindow;
  const scheduledLeft = getTimelinePosition(
    shift.startAt,
    timezone,
    startMinutes,
    endMinutes
  );
  const scheduledWidth = getTimelineWidth(
    shift.startAt,
    shift.endAt,
    timezone,
    startMinutes,
    endMinutes
  );

  return (
    <div className={cn("relative rounded-sm bg-muted", className)}>
      <div
        className="absolute top-0 h-full rounded-sm bg-primary/40"
        style={{ left: `${scheduledLeft}%`, width: `${scheduledWidth}%` }}
      />
      {shift.timeEntries.map((entry) => {
        const workedLeft = getTimelinePosition(
          entry.clockInAt,
          timezone,
          startMinutes,
          endMinutes
        );
        const workedWidth = getTimelineWidth(
          entry.clockInAt,
          entry.clockOutAt,
          timezone,
          startMinutes,
          endMinutes
        );

        return (
          <div key={entry.id}>
            <div
              className="absolute top-0 h-full rounded-sm bg-primary/80"
              style={{ left: `${workedLeft}%`, width: `${workedWidth}%` }}
            />
            {entry.breaks.map((breakItem) => {
              const breakLeft = getTimelinePosition(
                breakItem.startAt,
                timezone,
                startMinutes,
                endMinutes
              );
              const breakWidth = getTimelineWidth(
                breakItem.startAt,
                breakItem.endAt,
                timezone,
                startMinutes,
                endMinutes
              );

              return (
                <div
                  key={breakItem.id}
                  className="absolute top-0 h-full rounded-sm bg-amber-400/90"
                  style={{ left: `${breakLeft}%`, width: `${breakWidth}%` }}
                  title={`Break ${formatShiftTime(breakItem.startAt, timezone)} – ${formatShiftTime(breakItem.endAt, timezone)}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function WorkSummaryBreakItem({
  breakItem,
  timezone,
}: {
  breakItem: WorkSummaryTimeEntryBreak;
  timezone: string;
}) {
  const durationMinutes = getDurationMinutes(breakItem.startAt, breakItem.endAt);

  return (
    <div className="flex items-center gap-3 rounded-sm border border-border/50 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-amber-400/15 text-amber-600 dark:text-amber-400">
        <Coffee className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium tabular-nums">
          {formatShiftTime(breakItem.startAt, timezone)} –{" "}
          {formatShiftTime(breakItem.endAt, timezone)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDuration(durationMinutes)}
        </p>
      </div>
      <Badge variant={breakItem.isPaid ? "secondary" : "outline"} className="shrink-0">
        {breakItem.isPaid ? "Paid" : "Unpaid"}
      </Badge>
    </div>
  );
}

function WorkSummaryTimeEntryItem({
  entry,
  timezone,
}: {
  entry: WorkSummaryTimeEntry;
  timezone: string;
}) {
  const durationMinutes = getDurationMinutes(entry.clockInAt, entry.clockOutAt);
  const breakMinutes = entry.breaks.reduce(
    (total, breakItem) =>
      total + getDurationMinutes(breakItem.startAt, breakItem.endAt),
    0
  );

  return (
    <div className="space-y-2 rounded-sm border border-border/50">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Clock3 className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tabular-nums">
            {formatShiftTime(entry.clockInAt, timezone)} –{" "}
            {formatShiftTime(entry.clockOutAt, timezone)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDuration(durationMinutes)} worked
            {breakMinutes > 0
              ? ` · ${formatDuration(breakMinutes)} breaks`
              : ""}
          </p>
        </div>
        <StatusIndicator status={entry.status} className="shrink-0" />
      </div>

      {(entry.employeeNote || entry.managerNote) && (
        <div className="space-y-3 border-t border-border/50 px-3 py-3">
          {entry.employeeNote ? (
            <div className="flex gap-3">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Employee note
                </p>
                <p className="mt-1 text-sm leading-relaxed">{entry.employeeNote}</p>
              </div>
            </div>
          ) : null}
          {entry.managerNote ? (
            <div className="flex gap-3">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Manager note
                </p>
                <p className="mt-1 text-sm leading-relaxed">{entry.managerNote}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {entry.breaks.length > 0 ? (
        <div className="space-y-1.5 border-t border-border/50 px-3 py-3">
          {entry.breaks.map((breakItem) => (
            <WorkSummaryBreakItem
              key={breakItem.id}
              breakItem={breakItem}
              timezone={timezone}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function WorkSummaryShiftCard({
  shift,
  dateKey,
  locationById,
  workingHoursByLocationId,
}: {
  shift: WorkSummaryShift;
  dateKey: string;
  locationById: Record<string, Location>;
  workingHoursByLocationId: Record<string, LocationWorkingHour[]>;
}) {
  const locationContext = resolveShiftLocation(
    shift,
    locationById,
    workingHoursByLocationId
  );
  const timezone = locationContext.timezone;
  const timelineWindow = getWorkingHoursTimelineWindow(
    dateKey,
    timezone,
    locationContext.workingHours
  );
  const totalBreakCount = shift.timeEntries.reduce(
    (total, entry) => total + entry.breaks.length,
    0
  );
  const shiftDetailHref = getShiftDetailHref(shift.shiftId);

  return (
    <div className="flex flex-col rounded-sm border border-border/50 bg-card text-sm">
      <div className="flex items-start gap-2 border-b border-border/50 pl-4 pr-1.5 pt-1.5 pb-3">
        <div className="min-w-0 flex-1 space-y-1 pt-1.5">
          <h4 className="text-base font-medium leading-snug">Shift</h4>
          <p className="text-sm text-muted-foreground">
            {formatShiftTime(shift.startAt, timezone)} –{" "}
            {formatShiftTime(shift.endAt, timezone)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
              />
            }
          >
            <MoreHorizontalIcon />
            <span className="sr-only">Open shift menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={shiftDetailHref} />}>
              View shift
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTimelineMinutes(timelineWindow.startMinutes)}</span>
            <span>Timeline</span>
            <span>{formatTimelineMinutes(timelineWindow.endMinutes)}</span>
          </div>
          <WorkSummaryShiftTimeline
            shift={shift}
            timezone={timezone}
            timelineWindow={timelineWindow}
            className="h-3"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(shift.shiftDurationMinutes)}
            </p>
          </div>
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Work time</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(shift.workedDurationMinutes)}
            </p>
          </div>
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Breaks</p>
            <p className="mt-1 text-sm font-medium">{totalBreakCount}</p>
          </div>
        </div>

        {locationContext.name ? (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0 font-medium text-foreground">
              {locationContext.name}
            </span>
          </div>
        ) : null}

        <div className="flex h-5 items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5 shrink-0" />
          <span className="truncate tabular-nums">
            {shift.timeEntries.length > 0
              ? shift.timeEntries.length === 1
                ? "1 entry logged"
                : `${shift.timeEntries.length} entries logged`
              : "No time entry yet"}
          </span>
        </div>

        {shift.timeEntries.length > 0 ? (
          <div className="space-y-1.5">
            {shift.timeEntries.map((entry) => (
              <WorkSummaryTimeEntryItem
                key={entry.id}
                entry={entry}
                timezone={timezone}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActivityEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-sm border border-dashed border-border/50 bg-muted/15 px-6 py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-background ring-1 ring-border/60">
        <CalendarDays className="size-5 text-muted-foreground" />
      </div>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}

function WorkSummaryActivityPanel({
  member,
  selectedDateKey,
  locationById,
  workingHoursByLocationId,
}: {
  member: WorkSummaryMember;
  selectedDateKey: string | null;
  locationById: Record<string, Location>;
  workingHoursByLocationId: Record<string, LocationWorkingHour[]>;
}) {
  if (!selectedDateKey) {
    return (
      <ActivityEmptyState message="Select a day from the chart to explore shifts and time entries." />
    );
  }

  const selectedDay = member.days.find((day) => day.date === selectedDateKey);

  if (!selectedDay) {
    return <ActivityEmptyState message="No data found for the selected day." />;
  }

  if (selectedDay.shifts.length === 0) {
    return (
      <ActivityEmptyState
        message={`No shifts scheduled on ${formatDatePickerLabel(selectedDay.date)}.`}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Selected day
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight">
            {formatDatePickerLabel(selectedDay.date)}
          </p>
        </div>
        <Badge variant="secondary">
          {selectedDay.shifts.length} shift{selectedDay.shifts.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="space-y-4">
        {selectedDay.shifts.map((shift) => (
          <WorkSummaryShiftCard
            key={shift.shiftId}
            shift={shift}
            dateKey={selectedDay.date}
            locationById={locationById}
            workingHoursByLocationId={workingHoursByLocationId}
          />
        ))}
      </div>
    </div>
  );
}

function WorkSummarySkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-sm" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <Skeleton className="h-64 rounded-sm xl:col-span-3" />
        <Skeleton className="h-64 rounded-sm xl:col-span-2" />
      </div>
    </div>
  );
}

export function TeamMemberWorkSummaryReport({
  organizationId,
  teamMemberId,
}: TeamMemberWorkSummaryReportProps) {
  const defaultRange = getCurrentMonthDateRangeUtc();
  const [fromDate, setFromDate] = useState(defaultRange.fromDate);
  const [toDate, setToDate] = useState(defaultRange.toDate);
  const [summary, setSummary] = useState<TeamMemberWorkSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [locationById, setLocationById] = useState<Record<string, Location>>({});
  const [workingHoursByLocationId, setWorkingHoursByLocationId] = useState<
    Record<string, LocationWorkingHour[]>
  >({});

  useEffect(() => {
    let active = true;

    async function loadLocationContext() {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/locations`
        );
        const body = (await response.json()) as { data?: Location[] };

        if (!response.ok || !body.data) {
          return;
        }

        const locations = body.data;
        const workingHoursEntries = await Promise.all(
          locations.map(async (location) => {
            try {
              const workingHoursResponse = await fetch(
                `/api/organizations/${organizationId}/locations/${location.id}/working-hours`
              );
              const workingHoursBody = (await workingHoursResponse.json()) as {
                data?: LocationWorkingHour[];
              };

              return [
                location.id,
                workingHoursResponse.ok
                  ? (workingHoursBody.data ?? [])
                  : [],
              ] as const;
            } catch {
              return [location.id, []] as const;
            }
          })
        );

        if (!active) {
          return;
        }

        setLocationById(Object.fromEntries(locations.map((location) => [location.id, location])));
        setWorkingHoursByLocationId(Object.fromEntries(workingHoursEntries));
      } catch {
        if (!active) {
          return;
        }

        setLocationById({});
        setWorkingHoursByLocationId({});
      }
    }

    void loadLocationContext();

    return () => {
      active = false;
    };
  }, [organizationId]);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      if (fromDate > toDate) {
        if (!active) {
          return;
        }

        setError("From date must be before or equal to to date.");
        setSummary(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          teamMemberId,
          fromDate,
          toDate,
        });

        const response = await fetch(
          `/api/organizations/${organizationId}/teams/members/work-summary?${params.toString()}`
        );
        const body = (await response.json()) as {
          data?: TeamMemberWorkSummary;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load work summary.");
        }

        if (!active) {
          return;
        }

        setSummary(body.data ?? null);

        const loadedMember = body.data?.members.find(
          (item) => item.teamMemberId === teamMemberId
        );
        setSelectedDateKey(
          loadedMember ? getFirstDayWithDetail(loadedMember.days) : null
        );
      } catch (err) {
        if (!active) {
          return;
        }

        setSummary(null);
        setError(
          err instanceof Error ? err.message : "Failed to load work summary."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      active = false;
    };
  }, [fromDate, organizationId, refreshKey, teamMemberId, toDate]);

  const member = useMemo(
    () => summary?.members.find((item) => item.teamMemberId === teamMemberId),
    [summary, teamMemberId]
  );

  return (
    <Card className="overflow-visible rounded-sm shadow-none">
      <CardHeader className="gap-2 border-b pb-6">
        <CardTitle>Work summary</CardTitle>
        <CardDescription>
          Compare scheduled hours against actual time entries for any date range.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        <div className="flex flex-col gap-4 rounded-sm bg-muted/25 p-5 ring-1 ring-border/50 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <WorkSummaryDatePicker
              label="From date"
              value={fromDate}
              onChange={setFromDate}
            />
            <WorkSummaryDatePicker
              label="To date"
              value={toDate}
              onChange={setToDate}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={isLoading}
            className="w-full bg-background lg:w-auto"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CalendarDays className="size-4" />
            )}
            Refresh report
          </Button>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {isLoading ? <WorkSummarySkeleton /> : null}

        {!isLoading && member ? (
          <>
            <WorkSummaryStatsGrid
              member={member}
              fromDate={summary!.fromDate}
              toDate={summary!.toDate}
            />

            <div className="grid items-start gap-6 xl:grid-cols-5">
              <section className="space-y-4 overflow-visible rounded-sm bg-muted/20 p-5 pt-6 ring-1 ring-border/50 xl:col-span-3">
                <div>
                  <p className="text-sm font-medium">Daily overview</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tap a day to load its shift and time entry details.
                  </p>
                </div>
                <WorkSummaryChart
                  member={member}
                  selectedDateKey={selectedDateKey}
                  onSelectDateKey={setSelectedDateKey}
                />
              </section>

              <section className="flex min-h-0 flex-col space-y-4 xl:col-span-2">
                <div>
                  <p className="text-sm font-medium">Day details</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shifts, clock-ins, notes, and breaks for the selected day.
                  </p>
                </div>
                <div className="rounded-sm">
                  <WorkSummaryActivityPanel
                    member={member}
                    selectedDateKey={selectedDateKey}
                    locationById={locationById}
                    workingHoursByLocationId={workingHoursByLocationId}
                  />
                </div>
              </section>
            </div>
          </>
        ) : null}

        {!isLoading && !error && summary && !member ? (
          <p className={cn("text-sm text-muted-foreground")}>
            No work summary data found for this team member.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
