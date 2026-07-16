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
  formatDatePickerLabel,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format";
import { SHIFT_STATUS_OPTIONS } from "@/lib/record-status";
import {
  getShiftDateKey,
  getShiftTimezone,
  getTimeInputValueFromIso,
} from "@/lib/shift-format";
import type { Shift } from "@/types/shift";

interface ShiftEditDialogProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftEditDialog({
  shift,
  open,
  onOpenChange,
}: ShiftEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit shift</DialogTitle>
          <DialogDescription>
            Update schedule details for this shift.
          </DialogDescription>
        </DialogHeader>
        {shift ? (
          <ShiftEditForm
            key={shift.id}
            shift={shift}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ShiftEditForm({
  shift,
  onCancel,
  onSaved,
}: {
  shift: Shift;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const timezone = getShiftTimezone(shift);
  const dateKey = getShiftDateKey(shift);
  const [title, setTitle] = useState(shift.title);
  const [startTime, setStartTime] = useState(
    getTimeInputValueFromIso(shift.startAt, timezone)
  );
  const [endTime, setEndTime] = useState(
    getTimeInputValueFromIso(shift.endAt, timezone)
  );
  const [notes, setNotes] = useState(shift.notes ?? "");
  const [status, setStatus] = useState<string | null>(shift.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildEndIso(startIso: string): string {
    const endIsoSameDay = combineDateTimeInTimezoneToIso(
      dateKey,
      endTime,
      timezone
    );

    if (new Date(endIsoSameDay).getTime() > new Date(startIso).getTime()) {
      return endIsoSameDay;
    }

    const nextDay = new Date(parseDateKey(dateKey));
    nextDay.setDate(nextDay.getDate() + 1);

    return combineDateTimeInTimezoneToIso(
      formatLocalDateKey(nextDay),
      endTime,
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
      const startAt = combineDateTimeInTimezoneToIso(
        dateKey,
        startTime,
        timezone
      );
      const endAt = buildEndIso(startAt);

      const response = await fetch(`/api/shifts/${shift.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          startAt,
          endAt,
          notes: notes.trim() || null,
          status,
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update shift.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Shift updated successfully");
      router.refresh();
      onSaved();
    } catch {
      setError("Failed to update shift.");
      toast.error("Failed to update shift.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Boolean(title.trim()) && Boolean(startTime) && Boolean(endTime);

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {formatDatePickerLabel(dateKey)} · {timezone}
        </p>

        <div className="space-y-2">
          <Label htmlFor="shift-title">Title</Label>
          <Input
            id="shift-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="shift-start">Start</Label>
            <Input
              id="shift-start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift-end">End</Label>
            <Input
              id="shift-end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            items={SHIFT_STATUS_OPTIONS}
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
              {SHIFT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift-notes">Notes</Label>
          <Input
            id="shift-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={isSubmitting}
            placeholder="Optional"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
