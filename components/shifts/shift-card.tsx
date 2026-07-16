"use client";

import {
  CalendarDays,
  Clock3,
  Coffee,
  MapPin,
  MoreHorizontalIcon,
  User,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  computeShiftStats,
  formatDuration,
  formatShiftTime,
  getBreakDurationMinutes,
  getDurationMinutes,
  getShiftDetailHref,
  getShiftMemberDisplayName,
  getShiftTimezone,
  getShiftWorkMinutes,
  getTimelinePosition,
  getTimelineWidth,
} from "@/lib/shift-format";
import {
  buildTeamMemberDetailsHref,
  resolveShiftTeamMemberId,
} from "@/lib/team-member-navigation";
import {
  computeShiftDaySlotLayouts,
  computeShiftDayTimelineRange,
  computeShiftTimelineBlocks,
  formatTimelineMinutes,
  getShiftWorkingHoursTimelineWindow,
  SHIFT_CARD_ESTIMATED_HEIGHT_PX,
} from "@/lib/shift-schedule-timeline";
import { cn } from "@/lib/utils";
import type { Shift, ShiftBreak } from "@/types/shift";

interface ShiftCardProps {
  shift: Shift;
  teamMemberId?: string | null;
  teamMemberIdByKey?: Record<string, string>;
  teamMemberIdByOrganizationMemberId?: Record<string, string>;
  className?: string;
  onLogTimeEntry?: (shift: Shift) => void;
  onEditShiftBreak?: (breakItem: ShiftBreak) => void;
  onDeleteShiftBreak?: (breakItem: ShiftBreak) => void;
  showDetailLink?: boolean;
}


function ShiftTimeline({
  shift,
  timezone,
  timelineWindow,
  className,
}: {
  shift: Shift;
  timezone: string;
  timelineWindow: { startMinutes: number; endMinutes: number };
  className?: string;
}) {
  const { startMinutes, endMinutes } = timelineWindow;
  const timelineLeft = getTimelinePosition(
    shift.startAt,
    timezone,
    startMinutes,
    endMinutes
  );
  const timelineWidth = getTimelineWidth(
    shift.startAt,
    shift.endAt,
    timezone,
    startMinutes,
    endMinutes
  );

  return (
    <div className={cn("relative rounded-sm bg-muted", className)}>
      <div
        className="absolute top-0 h-full rounded-sm bg-primary/80"
        style={{ left: `${timelineLeft}%`, width: `${timelineWidth}%` }}
      />
      {shift.breaks.map((breakItem) => {
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
}

export function ShiftCard({
  shift,
  teamMemberId,
  teamMemberIdByKey,
  teamMemberIdByOrganizationMemberId,
  className,
  onLogTimeEntry,
  onEditShiftBreak,
  onDeleteShiftBreak,
  showDetailLink = true,
}: ShiftCardProps) {
  const timezone = getShiftTimezone(shift);
  const timelineWindow = getShiftWorkingHoursTimelineWindow(shift);
  const shiftMinutes = getDurationMinutes(shift.startAt, shift.endAt);
  const workMinutes = getShiftWorkMinutes(shift);
  const member = shift.organizationMember;
  const memberName = member ? getShiftMemberDisplayName(member) : null;
  const memberEmail = member?.user?.email ?? null;
  const resolvedTeamMemberId =
    teamMemberId ??
    resolveShiftTeamMemberId(shift, {
      teamMemberIdByKey,
      teamMemberIdByOrganizationMemberId,
    });
  const memberHref =
    member && resolvedTeamMemberId
      ? buildTeamMemberDetailsHref(resolvedTeamMemberId, shift)
      : null;
  const canLogTimeEntry =
    Boolean(onLogTimeEntry) && shift.timeEntries.length === 0;
  const showCardMenu = showDetailLink || canLogTimeEntry;

  return (
    <div
      className={cn("flex flex-col rounded-sm bg-card text-sm", className)}
    >
      <div className="flex items-start gap-2 border-b border-border/50 pl-4 pr-1.5 pt-1.5 pb-3">
        <div className="min-w-0 flex-1 space-y-1 pt-1.5">
          <h4 className="text-base font-medium leading-snug">{shift.title}</h4>
          <p className="text-sm text-muted-foreground">
            {formatShiftTime(shift.startAt, timezone)} –{" "}
            {formatShiftTime(shift.endAt, timezone)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <StatusIndicator status={shift.status} />
          {showCardMenu ? (
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
                {showDetailLink ? (
                  <DropdownMenuItem
                    render={<Link href={getShiftDetailHref(shift.id)} />}
                  >
                    View shift
                  </DropdownMenuItem>
                ) : null}
                {canLogTimeEntry && onLogTimeEntry ? (
                  <DropdownMenuItem onClick={() => onLogTimeEntry(shift)}>
                    Log time entry
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTimelineMinutes(timelineWindow.startMinutes)}</span>
            <span>Timeline</span>
            <span>{formatTimelineMinutes(timelineWindow.endMinutes)}</span>
          </div>
          <ShiftTimeline
            shift={shift}
            timezone={timezone}
            timelineWindow={timelineWindow}
            className="h-3"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="mt-1 text-sm font-medium">{formatDuration(shiftMinutes)}</p>
          </div>
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Work time</p>
            <p className="mt-1 text-sm font-medium">{formatDuration(workMinutes)}</p>
          </div>
          <div className="rounded-sm border border-border/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Breaks</p>
            <p className="mt-1 text-sm font-medium">{shift.breaks.length}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {memberName ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="size-4 shrink-0" />
              {memberHref ? (
                <Link
                  href={memberHref}
                  className="min-w-0 transition-opacity hover:opacity-80"
                >
                  <span className="font-medium text-foreground hover:underline">
                    {memberName}
                  </span>
                  {memberEmail ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {memberEmail}
                    </span>
                  ) : null}
                </Link>
              ) : (
                <span>
                  <span className="font-medium text-foreground">{memberName}</span>
                  {memberEmail ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {memberEmail}
                    </span>
                  ) : null}
                </span>
              )}
            </div>
          ) : null}
          {shift.team ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UsersRound className="size-4 shrink-0" />
              <span>
                <span className="font-medium text-foreground">
                  {shift.team.name}
                </span>
                {!memberName ? (
                  <span className="text-muted-foreground"> · Whole team</span>
                ) : null}
              </span>
            </div>
          ) : null}
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="font-medium text-foreground">
                {shift.location.name}
              </span>
            </span>
          </div>
        </div>

        {shift.breaks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Coffee className="size-3.5" />
                Breaks
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatDuration(
                  shift.breaks.reduce(
                    (total, breakItem) =>
                      total + getBreakDurationMinutes(breakItem),
                    0
                  )
                )}{" "}
                total
              </span>
            </div>
            <div className="space-y-1.5">
              {shift.breaks.map((breakItem) => (
                <div
                  key={breakItem.id}
                  className="flex items-center gap-3 rounded-sm border border-border/50 px-3 py-2.5"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-amber-400/15 text-amber-600 dark:text-amber-400">
                    <Coffee className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium tabular-nums">
                      {formatShiftTime(breakItem.startAt, timezone)} –{" "}
                      {formatShiftTime(breakItem.endAt, timezone)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(getBreakDurationMinutes(breakItem))}
                    </p>
                  </div>
                  <Badge
                    variant={breakItem.isPaid ? "secondary" : "outline"}
                    className="shrink-0"
                  >
                    {breakItem.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                  {onEditShiftBreak || onDeleteShiftBreak ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditShiftBreak ? (
                          <DropdownMenuItem
                            onClick={() => onEditShiftBreak(breakItem)}
                          >
                            Edit break
                          </DropdownMenuItem>
                        ) : null}
                        {onEditShiftBreak && onDeleteShiftBreak ? (
                          <DropdownMenuSeparator />
                        ) : null}
                        {onDeleteShiftBreak ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeleteShiftBreak(breakItem)}
                          >
                            Delete break
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {shift.notes ? (
          <p className="rounded-sm bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {shift.notes}
          </p>
        ) : null}

        {onLogTimeEntry || shift.timeEntries.length > 0 ? (
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
        ) : null}
      </div>
    </div>
  );
}

interface ShiftStatsProps {
  stats: ReturnType<typeof computeShiftStats>;
}

export function ShiftStats({ stats }: ShiftStatsProps) {
  const items = [
    {
      label: "Total shifts",
      value: String(stats.totalShifts),
      icon: CalendarDays,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: "Scheduled",
      value: stats.totalHours,
      icon: Clock3,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      label: "Work time",
      value: stats.workHours,
      icon: Clock3,
      iconClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Paid breaks",
      value: stats.paidBreakHours,
      icon: Coffee,
      iconClassName: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Teams",
      value: String(stats.teamCount),
      icon: UsersRound,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      label: "Locations",
      value: String(stats.locationCount),
      icon: MapPin,
      iconClassName: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-2">
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ShiftDayGroupProps {
  dateKey: string;
  dateLabel: string;
  todayKey: string;
  shifts: Shift[];
  teamMemberIdByKey?: Record<string, string>;
  teamMemberIdByOrganizationMemberId?: Record<string, string>;
  onLogTimeEntry?: (shift: Shift) => void;
  className?: string;
}

export function ShiftDayGroup({
  dateKey,
  dateLabel,
  todayKey,
  shifts,
  teamMemberIdByKey,
  teamMemberIdByOrganizationMemberId,
  onLogTimeEntry,
  className,
}: ShiftDayGroupProps) {
  const timelineRange = useMemo(
    () => computeShiftDayTimelineRange(shifts, dateKey),
    [shifts, dateKey]
  );

  const [shiftHeights, setShiftHeights] = useState<Record<string, number>>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedNodesRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      setShiftHeights((previousHeights) => {
        let nextHeights = previousHeights;
        let hasChanges = false;

        for (const entry of entries) {
          const shiftId = entry.target.getAttribute("data-shift-id");

          if (!shiftId) {
            continue;
          }

          const measuredHeight =
            (entry.target.firstElementChild as HTMLElement | null)
              ?.scrollHeight ?? entry.target.scrollHeight;

          if (previousHeights[shiftId] !== measuredHeight) {
            if (!hasChanges) {
              nextHeights = { ...previousHeights };
              hasChanges = true;
            }

            nextHeights[shiftId] = measuredHeight;
          }
        }

        return hasChanges ? nextHeights : previousHeights;
      });
    });

    for (const node of observedNodesRef.current.values()) {
      resizeObserverRef.current.observe(node);
    }

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  const observeShiftNode = (shiftId: string) => (node: HTMLDivElement | null) => {
    const previousNode = observedNodesRef.current.get(shiftId);

    if (previousNode && resizeObserverRef.current) {
      resizeObserverRef.current.unobserve(previousNode);
    }

    if (!node) {
      observedNodesRef.current.delete(shiftId);
      return;
    }

    node.setAttribute("data-shift-id", shiftId);
    observedNodesRef.current.set(shiftId, node);
    resizeObserverRef.current?.observe(node);
  };

  const slotLayouts = useMemo(
    () =>
      computeShiftDaySlotLayouts(shifts, timelineRange, (shift) => {
        return shiftHeights[shift.id] ?? SHIFT_CARD_ESTIMATED_HEIGHT_PX;
      }),
    [shifts, timelineRange, shiftHeights]
  );

  const shiftBlocks = useMemo(
    () => computeShiftTimelineBlocks(shifts, timelineRange),
    [shifts, timelineRange]
  );

  const shiftDividerStartIndices = useMemo(
    () =>
      new Set(
        shiftBlocks
          .filter((block, blockIndex) => blockIndex > 0 || block.startIndex > 0)
          .map((block) => block.startIndex)
      ),
    [shiftBlocks]
  );

  const shiftDividerEndIndices = useMemo(
    () =>
      new Set(
        shiftBlocks
          .filter(
            (block, blockIndex) =>
              blockIndex === shiftBlocks.length - 1 &&
              block.endIndex < slotLayouts.length
          )
          .map((block) => block.endIndex)
      ),
    [shiftBlocks, slotLayouts.length]
  );

  const shiftDividerRowIndices = useMemo(() => {
    const indices = new Set<number>();

    for (const index of shiftDividerStartIndices) {
      indices.add(index);
    }

    for (const index of shiftDividerEndIndices) {
      indices.add(index);
    }

    return Array.from(indices).sort((left, right) => left - right);
  }, [shiftDividerStartIndices, shiftDividerEndIndices]);

  const occupiedSlotIndices = useMemo(() => {
    const indices = new Set<number>();

    for (const block of shiftBlocks) {
      for (let index = block.startIndex; index < block.endIndex; index++) {
        indices.add(index);
      }
    }

    return indices;
  }, [shiftBlocks]);

  const isToday = dateKey === todayKey;

  return (
    <section
      id={`shift-day-${dateKey}`}
      className={cn("scroll-mt-6 flex w-[26rem] shrink-0 flex-col pl-2", className)}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
        <h4 className="text-sm font-semibold">{dateLabel}</h4>
        <Badge variant="outline">{shifts.length} shifts</Badge>
      </div>

      {shifts.length === 0 ? (
        <div
          className={cn(
            "rounded-sm border bg-muted/30 p-3",
            isToday ? "border-dashed border-destructive" : "border-border/50"
          )}
        >
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No shifts
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "relative overflow-hidden rounded-sm border bg-background",
            isToday
              ? "border-dashed border-destructive"
              : "border-border/50"
          )}
        >          <div
          className="grid"
          style={{
            gridTemplateColumns: "5.5rem 1fr",
            gridTemplateRows: slotLayouts
              .map((slot) => `${slot.heightPx}px`)
              .join(" "),
          }}
        >
            {slotLayouts.map((slot) => (
              <div
                key={`${slot.minutes}-label`}
                className={cn(
                  "border-r border-border/50 px-2 pt-1.5 text-xs font-medium leading-snug text-muted-foreground",
                  occupiedSlotIndices.has(slot.index)
                    ? "bg-primary/5"
                    : "bg-muted/20",
                  slot.index < slotLayouts.length - 1 &&
                  "border-b border-border/50"
                )}
                style={{
                  gridColumn: 1,
                  gridRow: slot.index + 1,
                }}
              >
                {formatTimelineMinutes(slot.minutes)}
              </div>
            ))}

            {slotLayouts.map((slot) => (
              <div
                key={`${slot.minutes}-grid`}
                className={cn(
                  !occupiedSlotIndices.has(slot.index) && "bg-muted/10",
                  slot.index < slotLayouts.length - 1 && "border-b border-border/50"
                )}
                style={{
                  gridColumn: 2,
                  gridRow: slot.index + 1,
                }}
              />
            ))}

            {shiftDividerRowIndices.map((rowIndex) => (
              <div
                key={`divider-${rowIndex}`}
                className="pointer-events-none z-20 h-0 self-start border-t-1 border-t-destructive"

                style={{
                  gridColumn: "1 / -1",
                  gridRow: rowIndex + 1,
                }}
              />
            ))}

            {shiftBlocks.map((block) => {
              const fillsEntireTimeline =
                block.shifts.length === 1 &&
                block.startIndex === 0 &&
                block.endIndex === slotLayouts.length;

              return (
                <div
                  key={block.startIndex}
                  className={cn(
                    "z-10 box-border flex flex-col gap-2 bg-background px-1 py-1",
                    fillsEntireTimeline
                      ? "h-full min-h-0"
                      : "h-auto self-start overflow-visible"
                  )}
                  style={{
                    gridColumn: 2,
                    gridRow: `${block.startIndex + 1} / ${block.endIndex + 1}`,
                  }}
                >
                  {block.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      ref={observeShiftNode(shift.id)}
                      className={cn(
                        fillsEntireTimeline
                          ? "min-h-0 h-full"
                          : "h-auto shrink-0"
                      )}
                    >
                      <ShiftCard
                        shift={shift}
                        className={cn(fillsEntireTimeline && "h-full")}
                        teamMemberIdByKey={teamMemberIdByKey}
                        teamMemberIdByOrganizationMemberId={
                          teamMemberIdByOrganizationMemberId
                        }
                        onLogTimeEntry={onLogTimeEntry}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
