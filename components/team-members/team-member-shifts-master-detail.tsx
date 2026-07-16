"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

import { ShiftCard } from "@/components/shifts/shift-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDuration,
  formatShiftDateLabel,
  formatShiftTime,
  getDurationMinutes,
  getShiftDateKey,
  getShiftTimezone,
} from "@/lib/shift-format";
import type { LocationWorkingHour } from "@/types/location-working-hour";
import type { Shift } from "@/types/shift";

function withLocationWorkingHours(
  shift: Shift,
  workingHoursByLocationId: Record<string, LocationWorkingHour[]>
): Shift {
  const workingHours = workingHoursByLocationId[shift.location.id];

  if (!workingHours?.length) {
    return shift;
  }

  return {
    ...shift,
    location: {
      ...shift.location,
      workingHours,
    },
  };
}

interface TeamMemberShiftsMasterDetailProps {
  shifts: Shift[];
  focusShiftId?: string | null;
}

const DETAIL_SKELETON_MS = 220;

function resolveInitialShiftId(
  shifts: Shift[],
  focusShiftId?: string | null
): string | null {
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  if (focusShiftId && sortedShifts.some((shift) => shift.id === focusShiftId)) {
    return focusShiftId;
  }

  return sortedShifts[0]?.id ?? null;
}

function ShiftDetailSkeleton() {
  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="gap-3 border-b pb-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-3/5 rounded-sm" />
          <Skeleton className="h-6 w-16 rounded-sm" />
        </div>
        <Skeleton className="h-4 w-2/5 rounded-sm" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-sm" />
          <Skeleton className="h-6 w-28 rounded-sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12 rounded-sm" />
            <Skeleton className="h-3 w-14 rounded-sm" />
            <Skeleton className="h-3 w-12 rounded-sm" />
          </div>
          <Skeleton className="h-3 w-full rounded-sm" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-sm" />
          <Skeleton className="h-14 rounded-sm" />
          <Skeleton className="h-14 rounded-sm" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-4/5 rounded-sm" />
          <Skeleton className="h-4 w-3/5 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamMemberShiftsMasterDetail({
  shifts,
  focusShiftId = null,
}: TeamMemberShiftsMasterDetailProps) {
  const sortedShifts = useMemo(
    () =>
      [...shifts].sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ),
    [shifts]
  );

  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(() =>
    resolveInitialShiftId(sortedShifts, focusShiftId)
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const detailTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const selectedShift = useMemo(() => {
    const selected = sortedShifts.find((shift) => shift.id === selectedShiftId);
    return selected ?? sortedShifts[0] ?? null;
  }, [sortedShifts, selectedShiftId]);

  const organizationId = sortedShifts[0]?.organizationId ?? null;
  const locationIds = useMemo(
    () => [...new Set(sortedShifts.map((shift) => shift.location.id))],
    [sortedShifts]
  );
  const [workingHoursByLocationId, setWorkingHoursByLocationId] = useState<
    Record<string, LocationWorkingHour[]>
  >({});

  useEffect(() => {
    if (!organizationId || locationIds.length === 0) {
      return;
    }

    let isCancelled = false;

    async function loadWorkingHours() {
      const entries = await Promise.all(
        locationIds.map(async (locationId) => {
          try {
            const response = await fetch(
              `/api/organizations/${organizationId}/locations/${locationId}/working-hours`
            );
            const body = (await response.json()) as {
              data?: LocationWorkingHour[];
            };

            if (!response.ok) {
              return [locationId, []] as const;
            }

            return [locationId, body.data ?? []] as const;
          } catch {
            return [locationId, []] as const;
          }
        })
      );

      if (!isCancelled) {
        setWorkingHoursByLocationId(Object.fromEntries(entries));
      }
    }

    void loadWorkingHours();

    return () => {
      isCancelled = true;
    };
  }, [locationIds, organizationId]);

  const selectedShiftForCard = useMemo(() => {
    if (!selectedShift) {
      return null;
    }

    return withLocationWorkingHours(selectedShift, workingHoursByLocationId);
  }, [selectedShift, workingHoursByLocationId]);

  function handleSelectShift(shiftId: string) {
    if (shiftId === selectedShiftId && !isDetailLoading) {
      return;
    }

    if (detailTimeoutRef.current) {
      clearTimeout(detailTimeoutRef.current);
    }

    setSelectedShiftId(shiftId);
    setIsDetailLoading(true);

    detailTimeoutRef.current = setTimeout(() => {
      setIsDetailLoading(false);
      detailTimeoutRef.current = null;
    }, DETAIL_SKELETON_MS);
  }

  useEffect(() => {
    return () => {
      if (detailTimeoutRef.current) {
        clearTimeout(detailTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!focusShiftId || !tableScrollRef.current) {
      return;
    }

    const container = tableScrollRef.current;
    const row = container.querySelector(`[data-shift-id="${focusShiftId}"]`);

    if (!(row instanceof HTMLElement)) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const targetScrollTop =
      container.scrollTop +
      (rowRect.top - containerRect.top) -
      container.clientHeight / 2 +
      row.clientHeight / 2;

    container.scrollTo({
      top: targetScrollTop,
      behavior: "smooth",
    });
  }, [focusShiftId]);

  if (sortedShifts.length === 0) {
    return (
      <Card className="rounded-sm shadow-none">
        <CardHeader className="gap-2 border-b pb-6">
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Review scheduled shifts for the selected date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <EmptyState
            icon={CalendarDays}
            title="No shifts found for the selected date range"
            description="Try selecting a different date range to view shifts."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-sm shadow-none">
      <CardHeader className="gap-2 border-b pb-6">
        <CardTitle>Schedule</CardTitle>
        <CardDescription>
          Review scheduled shifts for the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="overflow-hidden rounded-sm border border-border/50">
            <div
              ref={tableScrollRef}
              className="max-h-[32rem] overflow-auto"
            >
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedShifts.map((shift) => {
                    const timezone = getShiftTimezone(shift);
                    const dateKey = getShiftDateKey(shift);
                    const durationMinutes = getDurationMinutes(
                      shift.startAt,
                      shift.endAt
                    );
                    const isSelected = selectedShift?.id === shift.id;

                    return (
                      <TableRow
                        key={shift.id}
                        data-shift-id={shift.id}
                        data-state={isSelected ? "selected" : undefined}
                        onClick={() => handleSelectShift(shift.id)}
                        className="cursor-pointer"
                      >
                        <TableCell className="text-muted-foreground">
                          {formatShiftDateLabel(dateKey)}
                        </TableCell>
                        <TableCell className="font-medium whitespace-normal">
                          {shift.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatShiftTime(shift.startAt, timezone)} –{" "}
                          {formatShiftTime(shift.endAt, timezone)}
                        </TableCell>
                        <TableCell className="max-w-[10rem] truncate text-muted-foreground">
                          {shift.location.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDuration(durationMinutes)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusIndicator status={shift.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            {isDetailLoading ? (
              <ShiftDetailSkeleton />
            ) : selectedShiftForCard ? (
              <ShiftCard shift={selectedShiftForCard} />
            ) : (
              <div className="rounded-sm border border-border/50 p-6 text-sm text-muted-foreground">
                Select a shift to view details.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
