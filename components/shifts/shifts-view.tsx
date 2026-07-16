"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Coffee,
  MapPin,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { ShiftsDateRangePicker } from "@/components/shifts/shifts-date-range-picker";
import { ShiftDayGroup, ShiftStats } from "@/components/shifts/shift-card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDatePickerLabel, getTodayDateKeyUtc } from "@/lib/date-format";
import {
  computeShiftStats,
  formatShiftDateLabel,
  formatShiftTime,
  getShiftAssigneeLabel,
  getShiftDetailHref,
  getShiftTeamId,
  getShiftTimezone,
  groupShiftsByDate,
} from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { Shift } from "@/types/shift";

function getShiftDaySectionId(dateKey: string): string {
  return `shift-day-${dateKey}`;
}

function getWeekDateKeys(fromDateKey: string, days = 7): string[] {
  const start = new Date(`${fromDateKey}T12:00:00.000Z`);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function formatWeekday(dateKey: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function formatMonthDay(dateKey: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function formatDayNumber(dateKey: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function formatLongDate(dateKey: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
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

interface ShiftsViewProps {
  shifts: Shift[];
  organizationName: string;
  fromDateKey: string;
  onFromDateChange: (fromDateKey: string) => void;
  isLoading?: boolean;
  teamMemberIdByKey?: Record<string, string>;
  teamMemberIdByOrganizationMemberId?: Record<string, string>;
  onLogTimeEntry?: (shift: Shift) => void;
}

export function ShiftsView({
  shifts,
  organizationName,
  fromDateKey,
  onFromDateChange,
  isLoading = false,
  teamMemberIdByKey,
  teamMemberIdByOrganizationMemberId,
  onLogTimeEntry,
}: ShiftsViewProps) {
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const [teamFilter, setTeamFilter] = useState<string | null>("all");
  const [locationFilter, setLocationFilter] = useState<string | null>("all");
  const [compactView, setCompactView] = useState(false);
  const [activeJumpKey, setActiveJumpKey] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const todayKey = useMemo(() => getTodayDateKeyUtc(), []);

  function scrollToShiftDay(dateKey: string) {
    const container = boardScrollRef.current;
    const column = document.getElementById(getShiftDaySectionId(dateKey));

    if (!container || !column) {
      return;
    }

    setActiveJumpKey(dateKey);

    const targetScrollLeft =
      container.scrollLeft +
      column.getBoundingClientRect().left -
      container.getBoundingClientRect().left;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }

  const teams = useMemo(() => {
    const map = new Map<string, string>();
    for (const shift of shifts) {
      if (!shift.team) {
        continue;
      }

      map.set(shift.team.id, shift.team.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [shifts]);

  const locations = useMemo(() => {
    const map = new Map<string, string>();
    for (const shift of shifts) {
      map.set(shift.location.id, shift.location.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [shifts]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const teamId = getShiftTeamId(shift);
      const matchesTeam =
        teamFilter === "all" || !teamFilter || teamId === teamFilter;
      const matchesLocation =
        locationFilter === "all" ||
        !locationFilter ||
        shift.location.id === locationFilter;

      return matchesTeam && matchesLocation;
    });
  }, [shifts, teamFilter, locationFilter]);

  const stats = useMemo(
    () => computeShiftStats(filteredShifts),
    [filteredShifts]
  );

  const groupedShifts = useMemo(
    () => groupShiftsByDate(filteredShifts),
    [filteredShifts]
  );

  const dateKeys = useMemo(
    () => Array.from(groupedShifts.keys()),
    [groupedShifts]
  );

  const weekDateKeys = useMemo(
    () => getWeekDateKeys(fromDateKey),
    [fromDateKey]
  );

  const selectedDayShifts = selectedDateKey
    ? (groupedShifts.get(selectedDateKey) ?? [])
    : [];
  const isSelectedToday = selectedDateKey === todayKey;

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-sm border border-border/50 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Schedule filters</p>
            <p className="text-xs text-muted-foreground">
              Viewing shifts for {organizationName} · up to 7 days from selected
              start date
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={compactView}
              onCheckedChange={(checked) => setCompactView(checked === true)}
            />
            Compact view
          </label>
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <ShiftsDateRangePicker
            fromDateKey={fromDateKey}
            onFromDateChange={onFromDateChange}
          />

          <Select
            items={[
              { value: "all", label: "All teams" },
              ...teams.map((team) => ({ value: team.id, label: team.name })),
            ]}
            value={teamFilter}
            onValueChange={(value) => setTeamFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={[
              { value: "all", label: "All locations" },
              ...locations.map((location) => ({
                value: location.id,
                label: location.name,
              })),
            ]}
            value={locationFilter}
            onValueChange={(value) => setLocationFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!compactView ? <ShiftStats stats={stats} /> : null}

      {!compactView && dateKeys.length > 0 ? (
        <div
          className="grid min-w-0 gap-2"
          style={{
            gridTemplateColumns: `repeat(${dateKeys.length}, minmax(0, 1fr))`,
          }}
        >
          {dateKeys.map((dateKey) => {
            const shiftCount = groupedShifts.get(dateKey)?.length ?? 0;
            const isToday = dateKey === todayKey;
            const isActive = activeJumpKey
              ? activeJumpKey === dateKey
              : isToday;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => scrollToShiftDay(dateKey)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "inline-flex min-w-0 items-center justify-center gap-2 rounded-sm border px-2.5 py-1.5 text-xs transition-colors",
                  isActive
                    ? "border-border/50 border-dashed bg-muted text-foreground"
                    : "border-border/50 bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <span className="truncate font-medium">
                  {formatShiftDateLabel(dateKey)}
                  {isToday ? " · Today" : ""}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {shiftCount}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        {filteredShifts.length === 0 && !compactView ? (
          <EmptyState
            title={
              shifts.length === 0
                ? "No shifts in this week"
                : "No shifts match the selected filters"
            }
            description={
              shifts.length === 0
                ? `No shifts between ${formatDatePickerLabel(fromDateKey)} and the next 6 days. Try another start date.`
                : undefined
            }
            filtered={shifts.length > 0}
          />
        ) : compactView ? (
          <ShiftsCompactFeed
            weekDateKeys={weekDateKeys}
            groupedShifts={groupedShifts}
            todayKey={todayKey}
            totalShifts={filteredShifts.length}
            selectedDateKey={selectedDateKey}
            onSelectDay={setSelectedDateKey}
          />
        ) : (
          <div ref={boardScrollRef} className="min-w-0 overflow-x-auto pb-2">
            <div className="flex min-h-[32rem] w-max items-start gap-5">
              {dateKeys.map((dateKey) => (
                <ShiftDayGroup
                  key={dateKey}
                  dateKey={dateKey}
                  dateLabel={formatShiftDateLabel(dateKey)}
                  todayKey={todayKey}
                  shifts={groupedShifts.get(dateKey) ?? []}
                  teamMemberIdByKey={teamMemberIdByKey}
                  teamMemberIdByOrganizationMemberId={
                    teamMemberIdByOrganizationMemberId
                  }
                  onLogTimeEntry={onLogTimeEntry}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Drawer
        open={selectedDateKey != null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDateKey(null);
          }
        }}
        swipeDirection="right"
      >
        <DrawerContent className="sm:max-w-md">
          <DrawerHeader className="border-b border-border/50 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="text-base">
                  {selectedDateKey
                    ? formatLongDate(selectedDateKey)
                    : "Day details"}
                </DrawerTitle>
                <DrawerDescription className="mt-1">
                  Scheduled coverage and clock activity.
                </DrawerDescription>
              </div>
              {isSelectedToday ? (
                <span className="shrink-0 rounded-full border border-dashed border-destructive px-2.5 py-1 text-xs font-medium text-destructive">
                  Today
                </span>
              ) : null}
            </div>
          </DrawerHeader>

          {selectedDateKey ? (
            <div className="space-y-6 overflow-y-auto px-4 py-5">
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Shifts",
                    value: selectedDayShifts.length,
                    icon: UsersRound,
                  },
                  {
                    label: "Clocked",
                    value: selectedDayShifts.filter(
                      (shift) => shift.timeEntries.length > 0
                    ).length,
                    icon: Clock3,
                  },
                  {
                    label: "Locations",
                    value: new Set(
                      selectedDayShifts.map((shift) => shift.location.id)
                    ).size,
                    icon: MapPin,
                  },
                  {
                    label: "Breaks",
                    value: selectedDayShifts.reduce(
                      (total, shift) => total + shift.breaks.length,
                      0
                    ),
                    icon: Coffee,
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
                    {selectedDayShifts.length} assigned
                  </p>
                </div>

                {selectedDayShifts.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/50 px-4 py-8 text-center">
                    <UsersRound className="mx-auto size-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No one is scheduled for this day.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {selectedDayShifts.map((shift) => (
                      <CompactShiftAssignmentCard
                        key={shift.id}
                        shift={shift}
                        onNavigate={() => setSelectedDateKey(null)}
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

function ShiftsCompactFeed({
  weekDateKeys,
  groupedShifts,
  todayKey,
  totalShifts,
  selectedDateKey,
  onSelectDay,
}: {
  weekDateKeys: string[];
  groupedShifts: Map<string, Shift[]>;
  todayKey: string;
  totalShifts: number;
  selectedDateKey: string | null;
  onSelectDay: (dateKey: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium tracking-tight">Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Day summaries. Open a day for coverage and clock activity.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {totalShifts} {totalShifts === 1 ? "shift" : "shifts"}
        </p>
      </div>

      <div className="mt-6 max-h-[36rem] space-y-2.5 overflow-y-auto">
        {weekDateKeys.map((dateKey) => {
          const dayShifts = groupedShifts.get(dateKey) ?? [];
          const isToday = dateKey === todayKey;
          const isEmpty = dayShifts.length === 0;
          const clockedInCount = dayShifts.filter(
            (shift) => shift.timeEntries.length > 0
          ).length;
          const missingClockCount = dayShifts.length - clockedInCount;
          const isSelected = selectedDateKey === dateKey;
          const previewShifts = dayShifts.slice(0, 4);
          const extraCount = Math.max(dayShifts.length - 4, 0);

          if (isEmpty) {
            return (
              <div
                key={dateKey}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-background px-3 py-2.5 text-xs text-muted-foreground",
                  isToday
                    ? "border-dashed border-destructive"
                    : "border-border/50"
                )}
              >
                <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-sm bg-muted/40 ring-1 ring-border/40">
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {formatWeekday(dateKey)}
                  </span>
                  <span className="text-xs tabular-nums">
                    {formatDayNumber(dateKey)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{formatLongDate(dateKey)}</span>
                    {isToday ? (
                      <span className="shrink-0 text-xs font-medium text-destructive">
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
              key={dateKey}
              type="button"
              onClick={() => onSelectDay(dateKey)}
              className={cn(
                "group w-full overflow-hidden rounded-md border text-left transition-colors hover:bg-muted/30",
                isToday
                  ? "border-dashed border-destructive"
                  : "border-border/50 bg-primary/5",
                isSelected && "ring-2 ring-border/50 ring-offset-2"
              )}
            >
              <div className="flex items-start gap-3 px-3.5 py-3.5">
                <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-sm bg-background ring-1 ring-border/40">
                  <span className="text-xs font-medium uppercase">
                    {formatWeekday(dateKey)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums tracking-tight">
                    {formatDayNumber(dateKey)}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="min-w-0 pr-10">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {formatMonthDay(dateKey)}
                      </p>
                      {isToday ? (
                        <span className="shrink-0 text-xs font-medium text-destructive">
                          Today
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {dayShifts.length}{" "}
                      {dayShifts.length === 1
                        ? "person scheduled"
                        : "people scheduled"}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3 border-l border-border/50 pl-10">
                    <div className="flex shrink-0 -space-x-2">
                      {previewShifts.map((shift) => {
                        const label = getShiftAssigneeLabel(shift);

                        return (
                          <div
                            key={shift.id}
                            className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-background text-xs font-semibold tracking-wide ring-2 ring-background"
                            title={label}
                          >
                            {getMemberInitials(label)}
                          </div>
                        );
                      })}
                      {extraCount > 0 ? (
                        <div className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-background text-xs font-medium text-muted-foreground ring-2 ring-background">
                          +{extraCount}
                        </div>
                      ) : null}
                    </div>
                    {missingClockCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3 shrink-0" />
                        {missingClockCount} missing clock
                      </span>
                    ) : dayShifts.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3 shrink-0" />
                        All clocked
                      </span>
                    ) : null}
                  </div>

                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground ring-1 ring-border/40 transition-colors group-hover:text-foreground">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompactShiftAssignmentCard({
  shift,
  onNavigate,
}: {
  shift: Shift;
  onNavigate?: () => void;
}) {
  const timezone = getShiftTimezone(shift);
  const assigneeLabel = getShiftAssigneeLabel(shift);
  const timeEntries = shift.timeEntries;
  const hasClockActivity = timeEntries.length > 0;

  return (
    <li className="overflow-hidden rounded-xl border border-border/50 bg-muted/30">
      <Link
        href={getShiftDetailHref(shift.id)}
        className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-muted/50"
        onClick={onNavigate}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tracking-wide text-foreground ring-1 ring-border/40">
          {getMemberInitials(assigneeLabel)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-medium">{assigneeLabel}</p>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
            <Clock3 className="size-3 shrink-0" />
            <span className="tabular-nums">
              {formatShiftTime(shift.startAt, timezone)} –{" "}
              {formatShiftTime(shift.endAt, timezone)}
            </span>
            <span className="text-border">·</span>
            <span className="truncate">{shift.title}</span>
          </p>
        </div>
      </Link>

      <div className="border-t border-border/50 px-3.5 py-3">
        {hasClockActivity ? (
          <ul className="space-y-3">
            {timeEntries.map((entry) => (
              <li key={entry.id} className="flex gap-3">
                <div className="flex w-4 flex-col items-center pt-1">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span className="mt-1 w-px flex-1 bg-border/40" />
                  <span className="size-2 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="min-w-0 flex-1 space-y-2 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Clock activity</p>
                    <StatusIndicator status={entry.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md border border-border/50 bg-background px-2.5 py-2">
                      <p className="text-muted-foreground">Clock in</p>
                      <p className="mt-0.5 font-medium tabular-nums">
                        {formatShiftTime(entry.clockInAt, timezone)}
                      </p>
                    </div>
                    <div className="rounded-md border border-border/50 bg-background px-2.5 py-2">
                      <p className="text-muted-foreground">Clock out</p>
                      <p className="mt-0.5 font-medium tabular-nums">
                        {entry.clockOutAt
                          ? formatShiftTime(entry.clockOutAt, timezone)
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
