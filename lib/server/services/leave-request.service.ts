import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreateLeaveRequestInput,
  LeaveRequest,
  UpdateLeaveRequestInput,
} from "@/types/leave-request";

export async function listLeaveRequests(
  organizationId: string
): Promise<LeaveRequest[]> {
  const query = new URLSearchParams({ organizationId });
  return backendFetch<LeaveRequest[]>(
    `/leave-requests?${query.toString()}`
  );
}

export async function createLeaveRequest(
  input: CreateLeaveRequestInput
): Promise<LeaveRequest> {
  return backendFetch<LeaveRequest>("/leave-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateLeaveRequest(
  leaveRequestId: string,
  input: UpdateLeaveRequestInput
): Promise<LeaveRequest> {
  return backendFetch<LeaveRequest>(`/leave-requests/${leaveRequestId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteLeaveRequest(leaveRequestId: string): Promise<void> {
  await backendFetch<unknown>(`/leave-requests/${leaveRequestId}`, {
    method: "DELETE",
  });
}
