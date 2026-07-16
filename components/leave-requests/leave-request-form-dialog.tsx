"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useOrganization } from "@/components/layout/organization-provider";
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

function getTodayDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export interface LeaveRequestFormDefaults {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveRequestFormDialogProps {
  organizationId: string;
  organizationName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  leaveRequest?: LeaveRequest | null;
  defaults?: LeaveRequestFormDefaults | null;
  formInstanceKey?: string | number;
}

interface LeaveRequestFormBodyProps {
  organizationId: string;
  organizationName?: string | null;
  leaveRequest?: LeaveRequest | null;
  defaults?: LeaveRequestFormDefaults | null;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}

function LeaveRequestFormBody({
  organizationId,
  organizationName,
  leaveRequest,
  defaults,
  onOpenChange,
  onSubmitted,
}: LeaveRequestFormBodyProps) {
  const { organizations } = useOrganization();
  const isEdit = Boolean(leaveRequest);
  const today = getTodayDateKey();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    leaveRequest?.organizationId ?? organizationId
  );
  const [leaveType, setLeaveType] = useState(
    leaveRequest?.leaveType ?? defaults?.leaveType ?? LEAVE_TYPE_OPTIONS[0].value
  );
  const [startDate, setStartDate] = useState(
    leaveRequest?.startDate ?? defaults?.startDate ?? today
  );
  const [endDate, setEndDate] = useState(
    leaveRequest?.endDate ?? defaults?.endDate ?? today
  );
  const [reason, setReason] = useState(
    leaveRequest?.reason ?? defaults?.reason ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizationOptions = organizations.map((organization) => ({
    value: organization.id,
    label: organization.name,
  }));

  const selectedOrganization =
    organizations.find(
      (organization) => organization.id === selectedOrganizationId
    ) ?? null;

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        isEdit
          ? `/api/leave-requests/${leaveRequest!.id}`
          : "/api/leave-requests",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEdit
              ? {
                  leaveType,
                  startDate,
                  endDate,
                  reason: reason.trim(),
                }
              : {
                  organizationId: selectedOrganizationId,
                  leaveType,
                  startDate,
                  endDate,
                  reason: reason.trim(),
                }
          ),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          body.message ??
          (isEdit
            ? "Failed to update leave request."
            : "Failed to create leave request.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEdit ? "Leave request updated" : "Leave request submitted"
      );
      onSubmitted();
      onOpenChange(false);
    } catch {
      const message = isEdit
        ? "Failed to update leave request."
        : "Failed to create leave request.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(selectedOrganizationId) &&
    Boolean(leaveType) &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    Boolean(reason.trim()) &&
    endDate >= startDate;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit leave request" : "New leave request"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? selectedOrganization || organizationName
              ? `Update leave request for ${selectedOrganization?.name ?? organizationName}.`
              : "Update this leave request."
            : "Choose an organization and submit a leave request."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Organization</Label>
          <Select
            items={organizationOptions}
            value={selectedOrganizationId}
            onValueChange={(value) => {
              if (value) {
                setSelectedOrganizationId(value);
              }
            }}
            disabled={isSubmitting || isEdit || organizationOptions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((organization) => (
                <SelectItem key={organization.id} value={organization.id}>
                  <div className="flex flex-col gap-0.5">
                    <span>{organization.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {organization.slug}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            disabled={isSubmitting}
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
            <Label htmlFor="leave-form-start-date">Start date</Label>
            <Input
              id="leave-form-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave-form-end-date">End date</Label>
            <Input
              id="leave-form-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leave-form-reason">Reason</Label>
          <Input
            id="leave-form-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isSubmitting}
            placeholder="Brief reason for the leave"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting
            ? isEdit
              ? "Saving..."
              : "Submitting..."
            : isEdit
              ? "Save changes"
              : "Submit leave request"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function LeaveRequestFormDialog({
  organizationId,
  organizationName,
  open,
  onOpenChange,
  onOpenChangeComplete,
  leaveRequest = null,
  defaults = null,
  formInstanceKey = "default",
}: LeaveRequestFormDialogProps) {
  const router = useRouter();
  const shouldRefreshRef = useRef(false);
  const formKey = `${leaveRequest?.id ?? "create"}-${formInstanceKey}`;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen && shouldRefreshRef.current) {
          shouldRefreshRef.current = false;
          router.refresh();
        }

        onOpenChangeComplete?.(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <LeaveRequestFormBody
          key={formKey}
          organizationId={organizationId}
          organizationName={organizationName}
          leaveRequest={leaveRequest}
          defaults={defaults}
          onOpenChange={onOpenChange}
          onSubmitted={() => {
            shouldRefreshRef.current = true;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
