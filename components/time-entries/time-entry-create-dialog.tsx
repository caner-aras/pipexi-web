"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coffee,
  ExternalLink,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  combineDateTimeInTimezoneToIso,
  formatDatePickerLabel,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format";
import {
  formatShiftTime,
  getShiftDateKey,
  getShiftMemberDisplayName,
  getShiftTimezone,
  getTimeInputValueFromIso,
} from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { ShiftFormTemplate } from "@/types/shift-form-template";
import type { Shift } from "@/types/shift";
import type { CreateTimeEntryBreakInput } from "@/types/time-entry";

interface TimeEntryBreakDraft {
  id: string;
  startTime: string;
  endTime: string;
  isPaid: boolean;
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

function getDefaultEndTime(startTime: string): string {
  const [hour, minute] = startTime.split(":").map(Number);
  const endHour = Math.min(hour + 1, 23);

  return `${String(endHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function createBreakDraft(
  isPaid = false,
  startTime = "12:00"
): TimeEntryBreakDraft {
  return {
    id: crypto.randomUUID(),
    startTime,
    endTime: getDefaultEndTime(startTime),
    isPaid,
  };
}

function createBreakDraftFromShiftBreak(
  startAt: string,
  endAt: string,
  isPaid: boolean,
  timezone: string
): TimeEntryBreakDraft {
  return {
    id: crypto.randomUUID(),
    startTime: getTimeInputValueFromIso(startAt, timezone),
    endTime: getTimeInputValueFromIso(endAt, timezone),
    isPaid,
  };
}

function getShiftFormLink(formTemplateId: string, shiftId: string): string {
  const params = new URLSearchParams({ shiftId });
  return `/forms/${formTemplateId}/submissions?${params.toString()}`;
}

function ShiftRequiredFormsSection({
  shiftId,
  formTemplates,
  formsLoading,
  formsError,
  onRefresh,
}: {
  shiftId: string;
  formTemplates: ShiftFormTemplate[];
  formsLoading: boolean;
  formsError: string | null;
  onRefresh: () => void;
}) {
  const unfilledCount = formTemplates.filter(
    (formTemplate) => !formTemplate.isFilled
  ).length;

  if (formsLoading && formTemplates.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Required forms</Label>
        <p className="text-sm text-muted-foreground">Loading required forms...</p>
      </div>
    );
  }

  if (formsError) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Required forms</Label>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
        <p className="text-sm text-destructive">{formsError}</p>
      </div>
    );
  }

  if (formTemplates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Required forms</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={formsLoading}
        >
          <RefreshCw className={formsLoading ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
      </div>

      {unfilledCount > 0 ? (
        <div className="flex items-start gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>
            Complete all required forms before logging this time entry.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {formTemplates.map((formTemplate) => (
          <div
            key={formTemplate.id}
            className="flex items-start justify-between gap-3 rounded-sm border border-border/50 p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">{formTemplate.name}</p>
              {formTemplate.description ? (
                <p className="text-xs text-muted-foreground">
                  {formTemplate.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-row items-center gap-2">
              {formTemplate.isFilled ? (
                <Badge variant="default" className="gap-1 h-7">
                  <CheckCircle2 className="size-3" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 h-7">
                  <AlertCircle className="size-3" />
                  Incomplete
                </Badge>
              )}
              {!formTemplate.isFilled ? (
                <Link
                  href={getShiftFormLink(formTemplate.id, shiftId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  Complete form
                  <ExternalLink className="size-4" />
                </Link>
              ) : null}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function TimeEntryCreateForm({
  organizationId,
  shift,
  formTemplates,
  formsLoading,
  formsError,
  onRefreshForms,
  onCancel,
  onCreated,
}: {
  organizationId: string;
  shift: Shift;
  formTemplates: ShiftFormTemplate[];
  formsLoading: boolean;
  formsError: string | null;
  onRefreshForms: () => void;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const timezone = getShiftTimezone(shift);
  const dateKey = getShiftDateKey(shift);
  const [clockInTime, setClockInTime] = useState(() =>
    getTimeInputValueFromIso(shift.startAt, timezone)
  );
  const [clockOutTime, setClockOutTime] = useState(() =>
    getTimeInputValueFromIso(shift.endAt, timezone)
  );
  const [employeeNote, setEmployeeNote] = useState("");
  const [managerNote, setManagerNote] = useState("");
  const [breaks, setBreaks] = useState<TimeEntryBreakDraft[]>(() =>
    shift.breaks.map((breakItem) =>
      createBreakDraftFromShiftBreak(
        breakItem.startAt,
        breakItem.endAt,
        breakItem.isPaid,
        timezone
      )
    )
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUnfilledRequiredForms = formTemplates.some(
    (formTemplate) => !formTemplate.isFilled
  );

  function buildClockOutIso(clockInIso: string): string {
    const clockOutIsoSameDay = combineDateTimeInTimezoneToIso(
      dateKey,
      clockOutTime,
      timezone
    );

    if (new Date(clockOutIsoSameDay).getTime() > new Date(clockInIso).getTime()) {
      return clockOutIsoSameDay;
    }

    const nextDay = new Date(parseDateKey(dateKey));
    nextDay.setDate(nextDay.getDate() + 1);

    return combineDateTimeInTimezoneToIso(
      formatLocalDateKey(nextDay),
      clockOutTime,
      timezone
    );
  }

  function buildBreakPayload(): CreateTimeEntryBreakInput[] {
    return breaks.map((breakItem) => {
      const breakStartIso = combineDateTimeInTimezoneToIso(
        dateKey,
        breakItem.startTime,
        timezone
      );
      let breakEndIso = combineDateTimeInTimezoneToIso(
        dateKey,
        breakItem.endTime,
        timezone
      );

      if (new Date(breakEndIso).getTime() <= new Date(breakStartIso).getTime()) {
        const nextDay = new Date(parseDateKey(dateKey));
        nextDay.setDate(nextDay.getDate() + 1);
        breakEndIso = combineDateTimeInTimezoneToIso(
          formatLocalDateKey(nextDay),
          breakItem.endTime,
          timezone
        );
      }

      return {
        startAt: breakStartIso,
        endAt: breakEndIso,
        isPaid: breakItem.isPaid,
      };
    });
  }

  async function handleSubmit() {
    if (!shift.organizationMemberId) {
      const message =
        "Select a member shift to log time. Team shifts are not assigned to a single member.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const clockInAt = combineDateTimeInTimezoneToIso(
        dateKey,
        clockInTime,
        timezone
      );
      const clockOutAt = buildClockOutIso(clockInAt);
      const breakPayload = buildBreakPayload();

      const response = await fetch(
        `/api/organizations/${organizationId}/time-entries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shiftId: shift.id,
            organizationMemberId: shift.organizationMemberId,
            locationId: shift.locationId,
            clockInAt,
            clockOutAt,
            employeeNote: employeeNote.trim() || undefined,
            managerNote: managerNote.trim() || undefined,
            breaks: breakPayload.length > 0 ? breakPayload : undefined,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create time entry.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Time entry created successfully");
      router.refresh();
      onCreated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create time entry.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const memberName = shift.organizationMember
    ? getShiftMemberDisplayName(shift.organizationMember)
    : shift.team?.name ?? "Unassigned";

  return (
    <>
      <div className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto px-1">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-xl bg-muted/35 px-3 py-2.5 text-left hover:bg-muted/50"
              />
            }
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tracking-wide ring-1 ring-border/60">
              {getMemberInitials(memberName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{shift.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                <span className="tabular-nums">
                  {formatShiftTime(shift.startAt, timezone)} –{" "}
                  {formatShiftTime(shift.endAt, timezone)}
                </span>
                <span className="text-border"> · </span>
                <span>{memberName}</span>
              </p>
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 gap-3 p-3">
            <PopoverHeader className="gap-1">
              <div className="flex items-start justify-between gap-2">
                <PopoverTitle className="text-sm">{shift.title}</PopoverTitle>
                <StatusIndicator status={shift.status} className="shrink-0" />
              </div>
              <PopoverDescription>
                {formatDatePickerLabel(dateKey)} ·{" "}
                {formatShiftTime(shift.startAt, timezone)} –{" "}
                {formatShiftTime(shift.endAt, timezone)}
              </PopoverDescription>
            </PopoverHeader>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="size-3.5 shrink-0" />
                <span className="font-medium text-foreground">{memberName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="font-medium text-foreground">
                  {shift.location.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock3 className="size-3.5 shrink-0" />
                <span className="font-medium text-foreground">{timezone}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ShiftRequiredFormsSection
          shiftId={shift.id}
          formTemplates={formTemplates}
          formsLoading={formsLoading}
          formsError={formsError}
          onRefresh={onRefreshForms}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="time-entry-clock-in">Clock in</Label>
            <Input
              id="time-entry-clock-in"
              type="time"
              value={clockInTime}
              onChange={(event) => setClockInTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-entry-clock-out">Clock out</Label>
            <Input
              id="time-entry-clock-out"
              type="time"
              value={clockOutTime}
              onChange={(event) => setClockOutTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Times use {timezone}
        </p>

        <div className="space-y-2">
          <Label htmlFor="time-entry-employee-note">Employee note</Label>
          <textarea
            id="time-entry-employee-note"
            value={employeeNote}
            onChange={(event) => setEmployeeNote(event.target.value)}
            disabled={isSubmitting}
            placeholder="Optional note from the employee"
            rows={2}
            className="flex w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-entry-manager-note">Manager note</Label>
          <textarea
            id="time-entry-manager-note"
            value={managerNote}
            onChange={(event) => setManagerNote(event.target.value)}
            disabled={isSubmitting}
            placeholder="Optional note from the manager"
            rows={2}
            className="flex w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Breaks</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {breaks.length === 0
                  ? "Optional paid or unpaid breaks"
                  : `${breaks.length} ${breaks.length === 1 ? "break" : "breaks"}`}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() =>
                setBreaks((current) => [...current, createBreakDraft(false)])
              }
              disabled={isSubmitting}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {breaks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 px-4 py-6 text-center">
              <Coffee className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No breaks added for this entry.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {breaks.map((breakItem, index) => (
                <li
                  key={breakItem.id}
                  className="overflow-hidden rounded-xl bg-muted/35"
                >
                  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-400">
                        <Coffee className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Break {index + 1}
                        </p>
                        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                          {breakItem.startTime || "--:--"} –{" "}
                          {breakItem.endTime || "--:--"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setBreaks((current) =>
                          current.filter((item) => item.id !== breakItem.id)
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove break</span>
                    </Button>
                  </div>

                  <div className="space-y-3 border-t border-border/50 px-3.5 py-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Start
                        </Label>
                        <Input
                          type="time"
                          value={breakItem.startTime}
                          onChange={(event) =>
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? { ...item, startTime: event.target.value }
                                  : item
                              )
                            )
                          }
                          disabled={isSubmitting}
                          className="bg-background/70"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          End
                        </Label>
                        <Input
                          type="time"
                          value={breakItem.endTime}
                          onChange={(event) =>
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? { ...item, endTime: event.target.value }
                                  : item
                              )
                            )
                          }
                          disabled={isSubmitting}
                          className="bg-background/70"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-2.5 py-2 text-sm">
                      <span className="text-muted-foreground">Pay type</span>
                      <Badge
                        variant={breakItem.isPaid ? "secondary" : "outline"}
                        className="capitalize"
                      >
                        {breakItem.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter className="mt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            hasUnfilledRequiredForms ||
            formsLoading ||
            Boolean(formsError)
          }
        >
          {isSubmitting ? "Saving..." : "Create time entry"}
        </Button>
      </DialogFooter>
    </>
  );
}

interface TimeEntryCreateDialogProps {
  organizationId: string;
  shift: Shift | null;
  formTemplates: ShiftFormTemplate[];
  formsLoading: boolean;
  formsError: string | null;
  onRefreshForms: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeEntryCreateDialog({
  organizationId,
  shift,
  formTemplates,
  formsLoading,
  formsError,
  onRefreshForms,
  open,
  onOpenChange,
}: TimeEntryCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock3 className="size-4" />
            Log time entry
          </DialogTitle>
          <DialogDescription>
            Record clock in, clock out, and breaks for this shift.
          </DialogDescription>
        </DialogHeader>

        {shift ? (
          <TimeEntryCreateForm
            key={shift.id}
            organizationId={organizationId}
            shift={shift}
            formTemplates={formTemplates}
            formsLoading={formsLoading}
            formsError={formsError}
            onRefreshForms={onRefreshForms}
            onCancel={() => onOpenChange(false)}
            onCreated={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
