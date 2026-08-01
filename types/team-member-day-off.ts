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

export interface PendingDayOff {
  id: string;
  teamMemberId: string;
  memberName: string;
  avatarUrl: string | null;
  teamName: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  createdAt: string;
}

export interface ActiveDayOff {
  id: string;
  teamMemberId: string;
  memberName: string;
  avatarUrl: string | null;
  teamName: string;
  startAt: string;
  endAt: string;
  reason: string | null;
}
