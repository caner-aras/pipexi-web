"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coffee,
  FileText,
  MapPin,
  MoreHorizontalIcon,
  User,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BreakEditDialog } from "@/components/shifts/break-edit-dialog";
import { ShiftCard } from "@/components/shifts/shift-card";
import { ShiftEditDialog } from "@/components/shifts/shift-edit-dialog";
import { TimeEntryCreateDialog } from "@/components/time-entries/time-entry-create-dialog";
import { TimeEntryEditDialog } from "@/components/time-entries/time-entry-edit-dialog";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { formatDatePickerLabel } from "@/lib/date-format";
import { normalizeRecordStatus } from "@/lib/record-status";
import {
  formatDuration,
  formatShiftDateLabel,
  formatShiftTime,
  getDurationMinutes,
  getShiftDateKey,
  getShiftMemberDisplayName,
  getShiftTimezone,
  getShiftWorkMinutes,
} from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { ShiftFormTemplate } from "@/types/shift-form-template";
import type { Shift, ShiftBreak } from "@/types/shift";
import type { TimeEntry, TimeEntryBreak } from "@/types/time-entry";

interface ShiftDetailPageContentProps {
  organizationId: string;
  shift: Shift;
  teamMemberIdByKey?: Record<string, string>;
  teamMemberIdByOrganizationMemberId?: Record<string, string>;
  error: string | null;
}

type DeleteTarget =
  | { type: "shift" }
  | { type: "shift-break"; breakItem: ShiftBreak }
  | { type: "time-entry"; timeEntry: TimeEntry }
  | { type: "time-entry-break"; breakItem: TimeEntryBreak };

function getShiftFormHref(
  shiftId: string,
  formTemplateId: string,
  formTemplateName: string
): string {
  const params = new URLSearchParams({ name: formTemplateName });
  return `/forms/${formTemplateId}/submissions/shift/${shiftId}?${params.toString()}`;
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

function ShiftMetaItem({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  icon: typeof Clock3;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-border/50 bg-background px-3 py-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-sm",
          iconClassName
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function ShiftFormTemplatesPanel({
  shiftId,
  formTemplates,
}: {
  shiftId: string;
  formTemplates: ShiftFormTemplate[];
}) {
  if (formTemplates.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-sm border border-border/50">
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4" />
          Required forms
        </div>
      </div>
      <div className="divide-y divide-border">
        {formTemplates.map((formTemplate) => (
          <div
            key={formTemplate.id}
            className="flex items-start justify-between gap-3 p-4"
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
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="size-3" />
                  Completed
                </Badge>
              ) : (
                <Badge variant="outline">Incomplete</Badge>
              )}
              <Link
                href={getShiftFormHref(
                  shiftId,
                  formTemplate.id,
                  formTemplate.name
                )}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View form
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShiftTimeEntriesPanel({
  shift,
  memberName,
  readOnly = false,
  onEditTimeEntry,
  onDeleteTimeEntry,
  onEditTimeEntryBreak,
  onDeleteTimeEntryBreak,
}: {
  shift: Shift;
  memberName: string | null;
  readOnly?: boolean;
  onEditTimeEntry: (timeEntry: TimeEntry) => void;
  onDeleteTimeEntry: (timeEntry: TimeEntry) => void;
  onEditTimeEntryBreak: (breakItem: TimeEntryBreak) => void;
  onDeleteTimeEntryBreak: (breakItem: TimeEntryBreak) => void;
}) {
  const timezone = getShiftTimezone(shift);
  const displayName = memberName ?? shift.team?.name ?? "Unassigned";
  const hasClockActivity = shift.timeEntries.length > 0;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Schedule</p>
        <p className="text-xs text-muted-foreground">
          {hasClockActivity
            ? `${shift.timeEntries.length} ${shift.timeEntries.length === 1 ? "entry" : "entries"
            }`
            : "1 assigned"}
        </p>
      </div>

      <ul className="space-y-3">
        <li className="overflow-hidden rounded-xl bg-muted/35">
          <div className="flex items-center gap-3 px-3.5 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold tracking-wide text-foreground ring-1 ring-border/60">
              {getMemberInitials(displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3 shrink-0" />
                <span className="tabular-nums">
                  {formatShiftTime(shift.startAt, timezone)} –{" "}
                  {formatShiftTime(shift.endAt, timezone)}
                </span>
                <span className="text-border">·</span>
                <span>Planned</span>
              </p>
            </div>
          </div>

          <div className="border-t border-border/50 px-3.5 py-3">
            {hasClockActivity ? (
              <ul className="space-y-3">
                {shift.timeEntries.map((timeEntry) => (
                  <li key={timeEntry.id} className="flex gap-3">
                    <div className="flex w-4 flex-col items-center pt-1">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="mt-1 w-px flex-1 bg-border/50" />
                      <span className="size-2 rounded-full bg-muted-foreground/40" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium">Clock activity</p>
                        <div className="flex items-center gap-1.5">
                          <StatusIndicator status={timeEntry.status} />
                          {!readOnly ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                  />
                                }
                              >
                                <MoreHorizontalIcon />
                                <span className="sr-only">Open menu</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEditTimeEntry(timeEntry)}
                                >
                                  Edit time entry
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => onDeleteTimeEntry(timeEntry)}
                                >
                                  Delete time entry
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : null}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md bg-background/70 px-2.5 py-2">
                          <p className="text-muted-foreground">Clock in</p>
                          <p className="mt-0.5 font-medium tabular-nums">
                            {formatShiftTime(timeEntry.clockInAt, timezone)}
                          </p>
                        </div>
                        <div className="rounded-md bg-background/70 px-2.5 py-2">
                          <p className="text-muted-foreground">Clock out</p>
                          <p className="mt-0.5 font-medium tabular-nums">
                            {timeEntry.clockOutAt
                              ? formatShiftTime(timeEntry.clockOutAt, timezone)
                              : "In progress"}
                          </p>
                        </div>
                      </div>

                      {timeEntry.breaks.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium text-muted-foreground">
                            Breaks
                          </p>
                          {timeEntry.breaks.map((breakItem) => (
                            <div
                              key={breakItem.id}
                              className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-2.5 py-2 text-xs"
                            >
                              <span className="tabular-nums">
                                {formatShiftTime(breakItem.startAt, timezone)} –{" "}
                                {formatShiftTime(breakItem.endAt, timezone)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">
                                  {formatDuration(
                                    getDurationMinutes(
                                      breakItem.startAt,
                                      breakItem.endAt
                                    )
                                  )}
                                  {breakItem.isPaid ? " · Paid" : " · Unpaid"}
                                </span>
                                {!readOnly ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      render={
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-7"
                                        />
                                      }
                                    >
                                      <MoreHorizontalIcon />
                                      <span className="sr-only">Open menu</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          onEditTimeEntryBreak(breakItem)
                                        }
                                      >
                                        Edit break
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                          onDeleteTimeEntryBreak(breakItem)
                                        }
                                      >
                                        Delete break
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {timeEntry.employeeNote ? (
                        <p className="rounded-md bg-background/70 px-2.5 py-2 text-xs text-muted-foreground">
                          {timeEntry.employeeNote}
                        </p>
                      ) : null}

                      {timeEntry.managerNote ? (
                        <p className="rounded-md bg-background/70 px-2.5 py-2 text-xs text-muted-foreground">
                          Manager note: {timeEntry.managerNote}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                <p>
                  Scheduled, but no time entry has been logged yet.
                </p>
              </div>
            )}
          </div>
        </li>
      </ul>
    </section>
  );
}

export function ShiftDetailPageContent({
  organizationId,
  shift,
  teamMemberIdByKey,
  teamMemberIdByOrganizationMemberId,
  error,
}: ShiftDetailPageContentProps) {
  const router = useRouter();
  const timezone = getShiftTimezone(shift);
  const dateKey = getShiftDateKey(shift);
  const scheduledMinutes = getDurationMinutes(shift.startAt, shift.endAt);
  const workMinutes = getShiftWorkMinutes(shift);
  const memberName = shift.organizationMember
    ? getShiftMemberDisplayName(shift.organizationMember)
    : null;
  const memberEmail = shift.organizationMember?.user?.email ?? null;
  const initialFormTemplates = shift.shiftFormTemplates ?? [];
  const isReadOnly = normalizeRecordStatus(shift.status) === "completed";

  const [timeEntryDialogOpen, setTimeEntryDialogOpen] = useState(false);
  const [shiftFormTemplates, setShiftFormTemplates] = useState<
    ShiftFormTemplate[]
  >(initialFormTemplates);
  const [shiftFormsLoading, setShiftFormsLoading] = useState(false);
  const [shiftFormsError, setShiftFormsError] = useState<string | null>(null);

  const [shiftEditOpen, setShiftEditOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(
    null
  );
  const [timeEntryEditOpen, setTimeEntryEditOpen] = useState(false);
  const [editingBreak, setEditingBreak] = useState<{
    item: ShiftBreak | TimeEntryBreak;
    apiPath: string;
    title: string;
  } | null>(null);
  const [breakEditOpen, setBreakEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadShiftFormTemplates() {
    setShiftFormsLoading(true);
    setShiftFormsError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/shifts/${shift.id}/form-templates`
      );
      const body = (await response.json()) as {
        data?: ShiftFormTemplate[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(body.message ?? "Failed to load required forms.");
      }

      setShiftFormTemplates(body.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load required forms.";
      setShiftFormsError(message);
      setShiftFormTemplates(initialFormTemplates);
    } finally {
      setShiftFormsLoading(false);
    }
  }

  function handleLogTimeEntry() {
    if (isReadOnly) {
      return;
    }

    setTimeEntryDialogOpen(true);
    void loadShiftFormTemplates();
  }

  function handleRefreshShiftForms() {
    void loadShiftFormTemplates();
  }

  function handleOpenDelete(target: DeleteTarget) {
    if (isReadOnly) {
      return;
    }

    setDeleteTarget(target);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setDeleteTarget(null);
    }
  }

  function handleBreakEditOpenChange(open: boolean) {
    setBreakEditOpen(open);

    if (!open) {
      setEditingBreak(null);
    }
  }

  function handleTimeEntryEditOpenChange(open: boolean) {
    setTimeEntryEditOpen(open);

    if (!open) {
      setEditingTimeEntry(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      let url = "";
      let successMessage = "";

      switch (deleteTarget.type) {
        case "shift":
          url = `/api/shifts/${shift.id}`;
          successMessage = "Shift deleted successfully";
          break;
        case "shift-break":
          url = `/api/shifts/breaks/${deleteTarget.breakItem.id}`;
          successMessage = "Shift break deleted successfully";
          break;
        case "time-entry":
          url = `/api/time-entries/${deleteTarget.timeEntry.id}`;
          successMessage = "Time entry deleted successfully";
          break;
        case "time-entry-break":
          url = `/api/time-entries/breaks/${deleteTarget.breakItem.id}`;
          successMessage = "Time entry break deleted successfully";
          break;
      }

      const response = await fetch(url, { method: "DELETE" });
      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete");
        return;
      }

      toast.success(successMessage);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      if (deleteTarget.type === "shift") {
        router.push("/shifts");
        router.refresh();
        return;
      }

      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteDialogCopy = (() => {
    if (!deleteTarget) {
      return {
        title: "Delete?",
        description: "This action cannot be undone.",
      };
    }

    switch (deleteTarget.type) {
      case "shift":
        return {
          title: "Delete shift?",
          description: `This will permanently delete "${shift.title}". This action cannot be undone.`,
        };
      case "shift-break":
        return {
          title: "Delete shift break?",
          description:
            "This will permanently delete this scheduled break. This action cannot be undone.",
        };
      case "time-entry":
        return {
          title: "Delete time entry?",
          description:
            "This will permanently delete this time entry and its breaks. This action cannot be undone.",
        };
      case "time-entry-break":
        return {
          title: "Delete time entry break?",
          description:
            "This will permanently delete this break. This action cannot be undone.",
        };
    }
  })();

  return (
    <>
      <PageHeader
        leading={
          <Link
            href="/shifts"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to shifts
          </Link>
        }
        title={shift.title}
        titleAddon={<StatusIndicator status={shift.status} showLabel />}
        description={`${formatShiftDateLabel(dateKey)} · ${formatDatePickerLabel(dateKey)} · ${formatShiftTime(shift.startAt, timezone)} – ${formatShiftTime(shift.endAt, timezone)}`}
        actions={
          !isReadOnly ? (
            <div className="flex items-center gap-2">
              {shift.timeEntries.length === 0 ? (
                <Button size="sm" onClick={handleLogTimeEntry}>
                  <Clock3 className="size-4" />
                  Log time entry
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="icon" className="size-8" />
                  }
                >
                  <MoreHorizontalIcon />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShiftEditOpen(true)}>
                    Edit shift
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleOpenDelete({ type: "shift" })}
                  >
                    Delete shift
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : undefined
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ShiftMetaItem
          label="Scheduled"
          value={formatDuration(scheduledMinutes)}
          icon={CalendarDays}
          iconClassName="bg-primary/10 text-primary"
        />
        <ShiftMetaItem
          label="Work time"
          value={formatDuration(workMinutes)}
          icon={Clock3}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <ShiftMetaItem
          label="Breaks"
          value={String(shift.breaks.length)}
          icon={Coffee}
          iconClassName="bg-amber-400/15 text-amber-600 dark:text-amber-400"
        />
        <ShiftMetaItem
          label="Time entries"
          value={String(shift.timeEntries.length)}
          icon={Clock3}
          iconClassName="bg-muted text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="space-y-6 rounded-sm border border-border/50">
          <ShiftCard
            shift={shift}
            teamMemberIdByKey={teamMemberIdByKey}
            teamMemberIdByOrganizationMemberId={
              teamMemberIdByOrganizationMemberId
            }
            showDetailLink={false}
            onLogTimeEntry={
              isReadOnly ? undefined : () => handleLogTimeEntry()
            }
            onEditShiftBreak={
              isReadOnly
                ? undefined
                : (breakItem) => {
                  setEditingBreak({
                    item: breakItem,
                    apiPath: `/api/shifts/breaks/${breakItem.id}`,
                    title: "Edit shift break",
                  });
                  setBreakEditOpen(true);
                }
            }
            onDeleteShiftBreak={
              isReadOnly
                ? undefined
                : (breakItem) =>
                  handleOpenDelete({ type: "shift-break", breakItem })
            }
          />

          <div className="mx-4">
            <section className="border-t border-border/50 px-2 py-5">
              <h2 className="text-sm font-medium">Assignment</h2>
              <dl className="mt-3 space-y-3 text-sm">
                {memberName ? (
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Member</dt>
                      <dd className="mt-0.5 font-medium">{memberName}</dd>
                      {memberEmail ? (
                        <dd className="text-muted-foreground">{memberEmail}</dd>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {shift.team ? (
                  <div className="flex items-start gap-2">
                    <UsersRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Team</dt>
                      <dd className="mt-0.5 font-medium">{shift.team.name}</dd>
                      {!memberName ? (
                        <dd className="text-muted-foreground">Whole team</dd>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Location</dt>
                    <dd className="mt-0.5 font-medium">{shift.location.name}</dd>
                  </div>
                </div>
              </dl>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <ShiftFormTemplatesPanel
            shiftId={shift.id}
            formTemplates={initialFormTemplates}
          />
          <ShiftTimeEntriesPanel
            shift={shift}
            memberName={memberName}
            readOnly={isReadOnly}
            onEditTimeEntry={(timeEntry) => {
              if (isReadOnly) {
                return;
              }

              setEditingTimeEntry(timeEntry);
              setTimeEntryEditOpen(true);
            }}
            onDeleteTimeEntry={(timeEntry) =>
              handleOpenDelete({ type: "time-entry", timeEntry })
            }
            onEditTimeEntryBreak={(breakItem) => {
              if (isReadOnly) {
                return;
              }

              setEditingBreak({
                item: breakItem,
                apiPath: `/api/time-entries/breaks/${breakItem.id}`,
                title: "Edit time entry break",
              });
              setBreakEditOpen(true);
            }}
            onDeleteTimeEntryBreak={(breakItem) =>
              handleOpenDelete({ type: "time-entry-break", breakItem })
            }
          />
        </div>
      </div>

      <TimeEntryCreateDialog
        organizationId={organizationId}
        shift={shift}
        formTemplates={shiftFormTemplates}
        formsLoading={shiftFormsLoading}
        formsError={shiftFormsError}
        onRefreshForms={handleRefreshShiftForms}
        open={timeEntryDialogOpen}
        onOpenChange={setTimeEntryDialogOpen}
      />

      <ShiftEditDialog
        shift={shift}
        open={shiftEditOpen}
        onOpenChange={setShiftEditOpen}
      />

      <TimeEntryEditDialog
        shift={shift}
        timeEntry={editingTimeEntry}
        open={timeEntryEditOpen}
        onOpenChange={handleTimeEntryEditOpenChange}
      />

      <BreakEditDialog
        breakItem={editingBreak?.item ?? null}
        dateKey={dateKey}
        timezone={timezone}
        apiPath={editingBreak?.apiPath ?? null}
        title={editingBreak?.title}
        open={breakEditOpen}
        onOpenChange={handleBreakEditOpenChange}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialogCopy.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogCopy.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
