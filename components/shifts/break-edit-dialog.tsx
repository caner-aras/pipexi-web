"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  combineDateTimeInTimezoneToIso,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format";
import { getTimeInputValueFromIso } from "@/lib/shift-format";

interface BreakLike {
  id: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
}

interface BreakEditDialogProps {
  breakItem: BreakLike | null;
  dateKey: string;
  timezone: string;
  apiPath: string | null;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BreakEditDialog({
  breakItem,
  dateKey,
  timezone,
  apiPath,
  title = "Edit break",
  open,
  onOpenChange,
}: BreakEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Update break start, end, and pay.</DialogDescription>
        </DialogHeader>
        {breakItem && apiPath ? (
          <BreakEditForm
            key={breakItem.id}
            breakItem={breakItem}
            dateKey={dateKey}
            timezone={timezone}
            apiPath={apiPath}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function BreakEditForm({
  breakItem,
  dateKey,
  timezone,
  apiPath,
  onCancel,
  onSaved,
}: {
  breakItem: BreakLike;
  dateKey: string;
  timezone: string;
  apiPath: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [startTime, setStartTime] = useState(
    getTimeInputValueFromIso(breakItem.startAt, timezone)
  );
  const [endTime, setEndTime] = useState(
    getTimeInputValueFromIso(breakItem.endAt, timezone)
  );
  const [isPaid, setIsPaid] = useState(breakItem.isPaid);
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
    setIsSubmitting(true);
    setError(null);

    try {
      const startAt = combineDateTimeInTimezoneToIso(
        dateKey,
        startTime,
        timezone
      );
      const endAt = buildEndIso(startAt);

      const response = await fetch(apiPath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt, endAt, isPaid }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update break.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Break updated successfully");
      router.refresh();
      onSaved();
    } catch {
      setError("Failed to update break.");
      toast.error("Failed to update break.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="break-start">Start</Label>
            <Input
              id="break-start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break-end">End</Label>
            <Input
              id="break-end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isPaid}
            onCheckedChange={(checked) => setIsPaid(checked === true)}
            disabled={isSubmitting}
          />
          Paid break
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !startTime || !endTime}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
