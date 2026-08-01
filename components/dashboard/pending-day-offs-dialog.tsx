"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonAvatar } from "@/components/ui/person-avatar";
import type { PendingDayOff } from "@/types/team-member-day-off";

function formatDayOffRange(startAt: string, endAt: string): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(startAt))} – ${formatter.format(
    new Date(endAt)
  )}`;
}

interface PendingDayOffsDialogProps {
  pendingDayOffs: PendingDayOff[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PendingDayOffsDialog({
  pendingDayOffs,
  open,
  onOpenChange,
}: PendingDayOffsDialogProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAction(
    teamMemberId: string,
    dayOffId: string,
    status: "active" | "declined"
  ) {
    setProcessingId(dayOffId);
    try {
      const response = await fetch(
        `/api/teams/members/${teamMemberId}/day-offs/${dayOffId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message || "Failed to update day off");
      }

      toast.success(
        `Day-off request ${status === "active" ? "approved" : "declined"}.`
      );
      router.refresh();

      if (pendingDayOffs.length <= 1) {
        onOpenChange(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update day off request."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pending Day-off Requests</DialogTitle>
          <DialogDescription>
            Review and approve or decline pending day-off requests.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3 mt-4">
          {pendingDayOffs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pending day-off requests.
            </div>
          ) : (
            pendingDayOffs.map((day) => {
              const isProcessing = processingId === day.id;

              return (
                <div
                  key={day.id}
                  className={`flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card transition-opacity ${isProcessing ? "opacity-50 pointer-events-none" : ""
                    }`}
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <PersonAvatar
                      name={day.memberName}
                      avatarUrl={day.avatarUrl}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate text-foreground">
                          {day.memberName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {day.teamName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-foreground">
                        <CalendarIcon className="size-3.5 text-muted-foreground" />
                        {formatDayOffRange(day.startAt, day.endAt)}
                      </div>

                      {day.reason ? (
                        <p className="mt-2 text-xs text-muted-foreground italic truncate">
                          "{day.reason}"
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleAction(day.teamMemberId, day.id, "declined")
                      }
                      disabled={isProcessing}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(day.teamMemberId, day.id, "active")
                      }
                      disabled={isProcessing}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
