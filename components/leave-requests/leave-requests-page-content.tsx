"use client";

import { CalendarCheck2, Plus } from "lucide-react";
import { useState } from "react";

import { LeaveRequestFormDialog } from "@/components/leave-requests/leave-request-form-dialog";
import { LeaveRequestList } from "@/components/leave-requests/leave-request-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeaveRequest } from "@/types/leave-request";

interface LeaveRequestsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  leaveRequests: LeaveRequest[];
  error: string | null;
}

export function LeaveRequestsPageContent({
  organizationId,
  organizationName,
  leaveRequests,
  error,
}: LeaveRequestsPageContentProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [editingLeaveRequest, setEditingLeaveRequest] =
    useState<LeaveRequest | null>(null);

  function handleCreate() {
    setEditingLeaveRequest(null);
    setFormInstanceKey((key) => key + 1);
    setFormOpen(true);
  }

  function handleEdit(leaveRequest: LeaveRequest) {
    setEditingLeaveRequest(leaveRequest);
    setFormInstanceKey((key) => key + 1);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
  }

  function handleFormOpenChangeComplete(open: boolean) {
    if (!open) {
      setEditingLeaveRequest(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Leave Requests"
        description={
          organizationName
            ? `Leave requests for ${organizationName}.`
            : "View leave requests for the selected organization."
        }
        actions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            New leave request
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : leaveRequests.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No leave requests"
            description="Leave requests submitted for this organization will appear here."
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="size-4" />
                New leave request
              </Button>
            }
          />
        ) : (
          <LeaveRequestList
            leaveRequests={leaveRequests}
            onEditLeaveRequest={handleEdit}
          />
        )}
      </div>

      <LeaveRequestFormDialog
        organizationId={organizationId}
        organizationName={organizationName}
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onOpenChangeComplete={handleFormOpenChangeComplete}
        leaveRequest={editingLeaveRequest}
        formInstanceKey={formInstanceKey}
      />
    </>
  );
}
