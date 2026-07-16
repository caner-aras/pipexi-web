export interface CreateTimeEntryBreakInput {
  startAt: string;
  endAt: string;
  isPaid: boolean;
}

export interface CreateTimeEntryInput {
  shiftId: string;
  organizationMemberId: string;
  locationId: string;
  clockInAt: string;
  clockOutAt: string;
  employeeNote?: string;
  managerNote?: string;
  breaks?: CreateTimeEntryBreakInput[];
}

export interface UpdateTimeEntryInput {
  shiftId?: string | null;
  organizationMemberId?: string | null;
  locationId?: string | null;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  employeeNote?: string | null;
  managerNote?: string | null;
  status?: string | null;
}

export interface UpdateTimeEntryBreakInput {
  startAt?: string | null;
  endAt?: string | null;
  isPaid?: boolean | null;
  status?: string | null;
}

export interface TimeEntryBreak {
  id: string;
  timeEntryId: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TimeEntry {
  id: string;
  organizationId: string;
  shiftId: string;
  organizationMemberId: string;
  locationId: string;
  clockInAt: string;
  clockOutAt: string;
  employeeNote: string | null;
  managerNote: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  breaks: TimeEntryBreak[];
}
