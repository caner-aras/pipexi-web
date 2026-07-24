"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

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
import type { Position } from "@/types/position";
import type { MemberPositionHistory } from "@/types/member-position";

interface MemberPositionAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationMemberId: string;
  positions: Position[];
  activePosition: MemberPositionHistory | null;
  onAssigned?: () => void;
}

export function MemberPositionAssignDialog({
  open,
  onOpenChange,
  organizationMemberId,
  positions,
  activePosition,
  onAssigned,
}: MemberPositionAssignDialogProps) {
  const router = useRouter();
  const [selectedPositionId, setSelectedPositionId] = useState<string>(
    activePosition?.positionId ?? ""
  );
  const [hourlyRate, setHourlyRate] = useState<string>(
    activePosition ? String(activePosition.hourlyRate) : "15"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const currentPosId = activePosition?.positionId ?? (positions[0]?.id || "");
      const matchedPos = positions.find((p) => p.id === currentPosId);
      setSelectedPositionId(currentPosId);
      setHourlyRate(
        activePosition
          ? String(activePosition.hourlyRate)
          : matchedPos
            ? String(matchedPos.defaultHourlyRate)
            : "15"
      );
      setError(null);
    }
  }, [open, activePosition, positions]);

  function handlePositionSelect(positionId: string | null) {
    if (!positionId) return;
    setSelectedPositionId(positionId);
    const selected = positions.find((p) => p.id === positionId);
    if (selected && !activePosition) {
      setHourlyRate(String(selected.defaultHourlyRate));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedPositionId) {
      setError("Please select a position.");
      return;
    }

    const rateNum = Number(hourlyRate);
    if (Number.isNaN(rateNum) || rateNum < 0) {
      setError("Hourly rate must be a valid non-negative number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/member-positions/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationMemberId,
          positionId: selectedPositionId,
          hourlyRate: rateNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign position.");
      }

      toast.success("Position assigned successfully.");
      onOpenChange(false);
      router.refresh();
      onAssigned?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign position.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" />
            Assign Position
          </DialogTitle>
          <DialogDescription>
            Assign or update the member&apos;s active position and custom hourly rate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error ? (
            <div className="rounded-sm bg-destructive/10 p-3 text-xs font-medium text-destructive">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="position-select">Position</Label>
            <Select
              value={selectedPositionId}
              onValueChange={handlePositionSelect}
              disabled={isSubmitting || positions.length === 0}
            >
              <SelectTrigger id="position-select">
                <SelectValue placeholder="Select position">
                  {(val) => positions.find((p) => p.id === val)?.title || val}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id} label={pos.title}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {positions.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No active positions found in this organization.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate</Label>
            <Input
              id="hourly-rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="15.00"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPositionId}>
              {isSubmitting ? "Assigning..." : "Assign Position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
