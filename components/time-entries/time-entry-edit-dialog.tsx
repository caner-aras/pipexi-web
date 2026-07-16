"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  combineDateTimeInTimezoneToIso,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format";
import { TIME_ENTRY_STATUS_OPTIONS } from "@/lib/record-status";
import {
  getShiftDateKey,
  getShiftTimezone,
  getTimeInputValueFromIso,
} from "@/lib/shift-format";
import type { Shift } from "@/types/shift";
import type { TimeEntry } from "@/types/time-entry";

interface TimeEntryEditDialogProps {
  shift: Shift;
  timeEntry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeEntryEditDialog({
  shift,
  timeEntry,
  open,
  onOpenChange,
}: TimeEntryEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit time entry</DialogTitle>
          <DialogDescription>
            Update clock in, clock out, and notes.
          </DialogDescription>
        </DialogHeader>
        {timeEntry ? (
          <TimeEntryEditForm
            key={timeEntry.id}
            shift={shift}
            timeEntry={timeEntry}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TimeEntryEditForm({
  shift,
  timeEntry,
  onCancel,
  onSaved,
}: {
  shift: Shift;
  timeEntry: TimeEntry;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const timezone = getShiftTimezone(shift);
  const dateKey = getShiftDateKey(shift);
  const [clockInTime, setClockInTime] = useState(
    getTimeInputValueFromIso(timeEntry.clockInAt, timezone)
  );
  const [clockOutTime, setClockOutTime] = useState(
    getTimeInputValueFromIso(timeEntry.clockOutAt, timezone)
  );
  const [employeeNote, setEmployeeNote] = useState(
    timeEntry.employeeNote ?? ""
  );
  const [managerNote, setManagerNote] = useState(timeEntry.managerNote ?? "");
  const [status, setStatus] = useState<string | null>(timeEntry.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildClockOutIso(clockInIso: string): string {
    const clockOutIsoSameDay = combineDateTimeInTimezoneToIso(
      dateKey,
      clockOutTime,
      timezone
    );

    if (
      new Date(clockOutIsoSameDay).getTime() > new Date(clockInIso).getTime()
    ) {
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

  async function handleSubmit() {
    if (!status) {
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

      const response = await fetch(`/api/time-entries/${timeEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clockInAt,
          clockOutAt,
          employeeNote: employeeNote.trim() || null,
          managerNote: managerNote.trim() || null,
          status,
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update time entry.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Time entry updated successfully");
      router.refresh();
      onSaved();
    } catch {
      setError("Failed to update time entry.");
      toast.error("Failed to update time entry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="te-clock-in">Clock in</Label>
            <Input
              id="te-clock-in"
              type="time"
              value={clockInTime}
              onChange={(event) => setClockInTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="te-clock-out">Clock out</Label>
            <Input
              id="te-clock-out"
              type="time"
              value={clockOutTime}
              onChange={(event) => setClockOutTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            items={TIME_ENTRY_STATUS_OPTIONS}
            value={status}
            onValueChange={(value) => {
              if (value) {
                setStatus(value);
              }
            }}
          >
            <SelectTrigger className="w-full" disabled={isSubmitting}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {TIME_ENTRY_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="te-employee-note">Employee note</Label>
          <Input
            id="te-employee-note"
            value={employeeNote}
            onChange={(event) => setEmployeeNote(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="te-manager-note">Manager note</Label>
          <Input
            id="te-manager-note"
            value={managerNote}
            onChange={(event) => setManagerNote(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !clockInTime || !clockOutTime}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
