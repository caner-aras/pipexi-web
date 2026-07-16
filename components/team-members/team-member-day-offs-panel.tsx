"use client";

import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatDatePickerLabel,
  formatLocalDateKey,
  getTodayDateKeyUtc,
} from "@/lib/date-format";
import { cn } from "@/lib/utils";
import type { TeamMemberDayOff } from "@/types/team-member-day-off";

interface TeamMemberDayOffsPanelProps {
  teamMemberId: string;
  fromDateKey: string;
  dayOffs: TeamMemberDayOff[];
}

function combineLocalDateTimeToIso(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function isoToLocalDateKey(iso: string): string {
  return formatLocalDateKey(new Date(iso));
}

function isoToLocalTime(iso: string): string {
  const date = new Date(iso);

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDayOffDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDayOffRange(startAt: string, endAt: string): string {
  return `${formatDayOffDateTime(startAt)} – ${formatDayOffDateTime(endAt)}`;
}

function DateField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <DatePicker
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        showIcon
      />
    </div>
  );
}

function DayOffDialog({
  teamMemberId,
  dayOff,
  open,
  onOpenChange,
}: {
  teamMemberId: string;
  dayOff: TeamMemberDayOff | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const isEditing = Boolean(dayOff);
  const today = getTodayDateKeyUtc();
  const [startDate, setStartDate] = useState(
    dayOff ? isoToLocalDateKey(dayOff.startAt) : today
  );
  const [endDate, setEndDate] = useState(
    dayOff ? isoToLocalDateKey(dayOff.endAt) : today
  );
  const [startTime, setStartTime] = useState(
    dayOff ? isoToLocalTime(dayOff.startAt) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    dayOff ? isoToLocalTime(dayOff.endAt) : "17:00"
  );
  const [reason, setReason] = useState(dayOff?.reason ?? "Day-off");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const startAt = combineLocalDateTimeToIso(startDate, startTime);
    const endAt = combineLocalDateTimeToIso(endDate, endTime);

    if (Date.parse(endAt) <= Date.parse(startAt)) {
      const message = "End must be after start.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        isEditing
          ? `/api/teams/members/${teamMemberId}/day-offs/${dayOff!.id}`
          : `/api/teams/members/${teamMemberId}/day-offs`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startAt,
            endAt,
            reason: reason.trim() || undefined,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          body.message ??
          (isEditing ? "Failed to update day off." : "Failed to create day off.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing ? "Day off updated successfully" : "Day off created successfully"
      );
      onOpenChange(false);
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update day off."
        : "Failed to create day off.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const startAtPreview = combineLocalDateTimeToIso(startDate, startTime);
  const endAtPreview = combineLocalDateTimeToIso(endDate, endTime);
  const isValid = Date.parse(endAtPreview) > Date.parse(startAtPreview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit day off" : "New day off"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this day off schedule."
              : "Schedule time away for this team member."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              id="day-off-start-date"
              label="Start date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                if (endDate < value) {
                  setEndDate(value);
                }
              }}
              disabled={isSubmitting}
            />
            <div className="space-y-2">
              <Label htmlFor="day-off-start-time">Start time</Label>
              <Input
                id="day-off-start-time"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateField
              id="day-off-end-date"
              label="End date"
              value={endDate}
              onChange={setEndDate}
              disabled={isSubmitting}
            />
            <div className="space-y-2">
              <Label htmlFor="day-off-end-time">End time</Label>
              <Input
                id="day-off-end-time"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="day-off-reason">Reason</Label>
            <Input
              id="day-off-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSubmitting}
              placeholder="Day-off"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create day off"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeamMemberDayOffsPanel({
  teamMemberId,
  fromDateKey,
  dayOffs,
}: TeamMemberDayOffsPanelProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDayOff, setEditingDayOff] = useState<TeamMemberDayOff | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayOffToDelete, setDayOffToDelete] = useState<TeamMemberDayOff | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedDayOffs = useMemo(
    () =>
      [...dayOffs].sort((left, right) =>
        left.startAt.localeCompare(right.startAt)
      ),
    [dayOffs]
  );

  const windowEndLabel = useMemo(() => {
    const start = new Date(`${fromDateKey}T12:00:00Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 30);

    return formatDatePickerLabel(
      `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, "0")}-${String(end.getUTCDate()).padStart(2, "0")}`
    );
  }, [fromDateKey]);

  function handleOpenCreate() {
    setEditingDayOff(null);
    setDialogOpen(true);
  }

  function handleOpenEdit(dayOff: TeamMemberDayOff) {
    setEditingDayOff(dayOff);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
  }

  function handleOpenDelete(dayOff: TeamMemberDayOff) {
    setDayOffToDelete(dayOff);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);
  }

  async function handleConfirmDelete() {
    if (!dayOffToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/teams/members/${teamMemberId}/day-offs/${dayOffToDelete.id}`,
        { method: "DELETE" }
      );
      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete day off.");
        return;
      }

      toast.success("Day off deleted successfully");
      setDeleteDialogOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete day off.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card className="flex min-h-[28rem] flex-col rounded-sm shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Day offs</CardTitle>
            <CardDescription>
              Showing day offs from {formatDatePickerLabel(fromDateKey)} to{" "}
              {windowEndLabel}.
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="size-4" />
            New day off
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {sortedDayOffs.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No day offs found"
              description="Create a day off to mark when this member is unavailable."
              className="flex-1"
              action={
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="size-4" />
                  New day off
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border rounded-sm border border-border/50">
              {sortedDayOffs.map((dayOff) => (
                <div
                  key={dayOff.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">
                      {formatDayOffRange(dayOff.startAt, dayOff.endAt)}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {dayOff.reason?.trim() || "No reason provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={dayOff.status} />
                    <button
                      type="button"
                      title="Edit day off"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" })
                      )}
                      onClick={() => handleOpenEdit(dayOff)}
                      disabled={isDeleting && dayOffToDelete?.id === dayOff.id}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">Edit day off</span>
                    </button>
                    <button
                      type="button"
                      title="Delete day off"
                      onClick={() => handleOpenDelete(dayOff)}
                      disabled={isDeleting && dayOffToDelete?.id === dayOff.id}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Delete day off</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DayOffDialog
        key={editingDayOff?.id ?? "create"}
        teamMemberId={teamMemberId}
        dayOff={editingDayOff}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete day off?</AlertDialogTitle>
            <AlertDialogDescription>
              {dayOffToDelete
                ? `This will permanently remove the day off from ${formatDayOffRange(dayOffToDelete.startAt, dayOffToDelete.endAt)}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
