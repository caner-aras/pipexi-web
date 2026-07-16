"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  createDefaultWorkingHourDrafts,
  draftsToWorkingHourInputs,
  validateWorkingHourDrafts,
  workingHoursToDrafts,
} from "@/lib/location-working-hours";
import type { Location } from "@/types/location";
import type {
  LocationWorkingHour,
  LocationWorkingHourDraft,
} from "@/types/location-working-hour";

const DISPLAY_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface LocationWorkingHoursFormProps {
  organizationId: string;
  location: Location;
  onCancel: () => void;
  onSaved: () => void;
}

function LocationWorkingHoursForm({
  organizationId,
  location,
  onCancel,
  onSaved,
}: LocationWorkingHoursFormProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<LocationWorkingHourDraft[]>(
    createDefaultWorkingHourDrafts()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkingHours() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/locations/${location.id}/working-hours`
        );
        const body = (await response.json()) as {
          data?: LocationWorkingHour[];
          message?: string;
        };

        if (!response.ok) {
          if (!cancelled) {
            setError(body.message ?? "Failed to load working hours.");
          }
          return;
        }

        if (!cancelled) {
          setDrafts(
            body.data && body.data.length > 0
              ? workingHoursToDrafts(body.data)
              : createDefaultWorkingHourDrafts()
          );
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load working hours.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkingHours();

    return () => {
      cancelled = true;
    };
  }, [organizationId, location.id]);

  const orderedDrafts = useMemo(
    () =>
      DISPLAY_DAY_ORDER.map(
        (dayOfWeek) =>
          drafts.find((draft) => draft.dayOfWeek === dayOfWeek) ??
          createDefaultWorkingHourDrafts().find(
            (draft) => draft.dayOfWeek === dayOfWeek
          )!
      ),
    [drafts]
  );

  function updateDraft(
    dayOfWeek: number,
    updates: Partial<Pick<LocationWorkingHourDraft, "isClosed" | "opensAt" | "closesAt">>
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.dayOfWeek === dayOfWeek ? { ...draft, ...updates } : draft
      )
    );
  }

  async function handleSubmit() {
    const validationError = validateWorkingHourDrafts(drafts);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/locations/${location.id}/working-hours`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workingHours: draftsToWorkingHourInputs(drafts),
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to save working hours.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Working hours saved successfully");
      onSaved();
      router.refresh();
    } catch {
      const message = "Failed to save working hours.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="max-h-[min(70vh,560px)] space-y-3 overflow-y-auto py-1">
        {orderedDrafts.map((draft) => (
          <div
            key={draft.dayOfWeek}
            className="rounded-sm border border-border/50 bg-muted/20 p-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-[7rem]">
                <p className="text-sm font-medium">{draft.label}</p>
              </div>

              <label className="flex items-center gap-2 mt-4 text-sm">
                <Checkbox
                  checked={draft.isClosed}
                  onCheckedChange={(checked) =>
                    updateDraft(draft.dayOfWeek, { isClosed: checked === true })
                  }
                  disabled={isSubmitting}
                />
                Closed
              </label>

              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`opens-${draft.dayOfWeek}`}>Opens</Label>
                  <Input
                    id={`opens-${draft.dayOfWeek}`}
                    type="time"
                    value={draft.opensAt}
                    onChange={(event) =>
                      updateDraft(draft.dayOfWeek, {
                        opensAt: event.target.value,
                      })
                    }
                    disabled={isSubmitting || draft.isClosed}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`closes-${draft.dayOfWeek}`}>Closes</Label>
                  <Input
                    id={`closes-${draft.dayOfWeek}`}
                    type="time"
                    value={draft.closesAt}
                    onChange={(event) =>
                      updateDraft(draft.dayOfWeek, {
                        closesAt: event.target.value,
                      })
                    }
                    disabled={isSubmitting || draft.isClosed}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter className="mt-2">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save hours"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
}

interface LocationWorkingHoursDialogProps {
  organizationId: string;
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationWorkingHoursDialog({
  organizationId,
  location,
  open,
  onOpenChange,
}: LocationWorkingHoursDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock3 className="size-4 text-muted-foreground" />
            Working hours
          </DialogTitle>
          <DialogDescription>
            {location
              ? `Set weekly hours for ${location.name}.`
              : "Set weekly location hours."}
          </DialogDescription>
        </DialogHeader>

        {location ? (
          <LocationWorkingHoursForm
            key={location.id}
            organizationId={organizationId}
            location={location}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
