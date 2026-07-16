export interface TeamMemberDayOff {
  id: string;
  teamMemberId: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTeamMemberDayOffInput {
  startAt: string;
  endAt: string;
  reason?: string;
}

export interface UpdateTeamMemberDayOffInput {
  startAt?: string;
  endAt?: string;
  reason?: string;
  status?: string;
}
