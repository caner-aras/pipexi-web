import type { Organization } from "@/types/auth";
import type {
  OrganizationMember,
  OrganizationMemberUser,
} from "@/types/member";

export interface CreateLeaveRequestInput {
  organizationId: string;
  organizationMemberId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveRequestInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveRequestMember extends Omit<OrganizationMember, "user"> {
  user: OrganizationMemberUser | null;
}

export interface LeaveRequest {
  id: string;
  organizationId: string;
  organizationMemberId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  organization: Organization | null;
  organizationMember: LeaveRequestMember | null;
}

export const LEAVE_TYPE_OPTIONS = [
  { value: "annual", label: "Annual" },
  { value: "sick", label: "Sick" },
  { value: "unpaid", label: "Unpaid" },
  { value: "other", label: "Other" },
] as const;

export function getLeaveTypeLabel(leaveType: string): string {
  const option = LEAVE_TYPE_OPTIONS.find(
    (item) => item.value === leaveType.toLowerCase()
  );

  if (option) {
    return option.label;
  }

  if (!leaveType) {
    return "Unknown";
  }

  return leaveType.charAt(0).toUpperCase() + leaveType.slice(1);
}
