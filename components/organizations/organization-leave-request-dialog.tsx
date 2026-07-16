"use client";

import { useEffect, useState } from "react";
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
import { LEAVE_TYPE_OPTIONS } from "@/types/leave-request";
import type { LeaveRequest } from "@/types/leave-request";
import type { Organization } from "@/types/auth";

function getTodayDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

interface OrganizationLeaveRequestDialogProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LeaveRequestDialogBodyProps {
  organization: Organization;
  onOpenChange: (open: boolean) => void;
}

function LeaveRequestDialogBody({
  organization,
  onOpenChange,
}: LeaveRequestDialogBodyProps) {
  const router = useRouter();
  const today = getTodayDateKey();
  const [leaveType, setLeaveType] = useState<string>(LEAVE_TYPE_OPTIONS[0].value);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [existingPendingRequest, setExistingPendingRequest] =
    useState<LeaveRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const organizationId = organization.id;
    let cancelled = false;

    async function loadExistingRequest() {
      try {
        const response = await fetch(
          `/api/leave-requests?organizationId=${encodeURIComponent(organizationId)}`
        );
        const body = (await response.json()) as {
          data?: LeaveRequest[];
          currentOrganizationMemberId?: string | null;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to check leave requests.");
        }

        if (cancelled) {
          return;
        }

        const memberId = body.currentOrganizationMemberId ?? null;
        const pendingRequest =
          body.data?.find(
            (request) =>
              memberId != null &&
              request.organizationMemberId === memberId &&
              request.status.toLowerCase() === "pending"
          ) ?? null;

        setExistingPendingRequest(pendingRequest);
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to check leave requests.";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) {
          setIsCheckingExisting(false);
        }
      }
    }

    void loadExistingRequest();

    return () => {
      cancelled = true;
    };
  }, [organization.id]);

  async function handleSubmit() {
    if (existingPendingRequest) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          leaveType,
          startDate,
          endDate,
          reason: reason.trim(),
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create leave request.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Leave request submitted");
      onOpenChange(false);
      router.refresh();
    } catch {
      const message = "Failed to create leave request.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(leaveType) &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    Boolean(reason.trim()) &&
    endDate >= startDate;
  const formDisabled =
    isSubmitting || isCheckingExisting || Boolean(existingPendingRequest);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Leave request</DialogTitle>
        <DialogDescription>
          Submit a leave request for {organization.name}.
        </DialogDescription>
      </DialogHeader>

      {isCheckingExisting ? (
        <p className="text-sm text-muted-foreground">
          Checking existing leave requests...
        </p>
      ) : existingPendingRequest ? (
        <div className="space-y-3 rounded-sm bg-muted/30 p-4 text-sm">
          <p className="font-medium">Pending leave request already exists</p>
          <p className="text-muted-foreground">
            You already have a pending leave request for this organization (
            {existingPendingRequest.startDate} → {existingPendingRequest.endDate}
            ). Submit another after it is reviewed, or check Leave Requests.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              router.push("/leave-requests");
            }}
          >
            View leave requests
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Leave type</Label>
            <Select
              items={LEAVE_TYPE_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={leaveType}
              onValueChange={(value) => {
                if (value) {
                  setLeaveType(value);
                }
              }}
              disabled={formDisabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-start-date">Start date</Label>
              <Input
                id="leave-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={formDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end-date">End date</Label>
              <Input
                id="leave-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                disabled={formDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-reason">Reason</Label>
            <Input
              id="leave-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={formDisabled}
              placeholder="Brief reason for the leave"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      )}

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          {existingPendingRequest ? "Close" : "Cancel"}
        </Button>
        {!existingPendingRequest && !isCheckingExisting ? (
          <Button onClick={handleSubmit} disabled={formDisabled || !isValid}>
            {isSubmitting ? "Submitting..." : "Submit leave request"}
          </Button>
        ) : null}
      </DialogFooter>
    </>
  );
}

export function OrganizationLeaveRequestDialog({
  organization,
  open,
  onOpenChange,
}: OrganizationLeaveRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        {open && organization ? (
          <LeaveRequestDialogBody
            key={organization.id}
            organization={organization}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
