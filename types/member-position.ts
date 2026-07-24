export interface MemberPositionHistory {
  id: string;
  organizationMemberId: string;
  positionId: string;
  hourlyRate: number;
  startDate: string;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface AssignMemberPositionInput {
  organizationMemberId: string;
  positionId: string;
  hourlyRate: number;
  startDate?: string | null;
}
