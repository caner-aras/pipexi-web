export interface WorkSummaryTimeEntryBreak {
  id: string;
  timeEntryId: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface WorkSummaryTimeEntry {
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
  breaks: WorkSummaryTimeEntryBreak[];
}

export interface WorkSummaryShift {
  shiftId: string;
  startAt: string;
  endAt: string;
  shiftDurationMinutes: number;
  shiftBreakDurationMinutes: number;
  timeEntryDurationMinutes: number;
  timeEntryBreakDurationMinutes: number;
  workedDurationMinutes: number;
  timeEntries: WorkSummaryTimeEntry[];
}

export interface WorkSummaryDay {
  date: string;
  shifts: WorkSummaryShift[];
}

export interface WorkSummaryTotals {
  totalShiftCount: number;
  totalShiftDurationMinutes: number;
  totalShiftBreakDurationMinutes: number;
  totalTimeEntryCount: number;
  totalTimeEntryDurationMinutes: number;
  totalTimeEntryBreakDurationMinutes: number;
  totalWorkedDurationMinutes: number;
  totalShiftDurationText: string;
  totalBreakDurationText: string;
  totalWorkedDurationText: string;
}

export interface WorkSummaryMember {
  teamMemberId: string;
  organizationMemberId: string;
  teamMemberStatus: string;
  days: WorkSummaryDay[];
  totals: WorkSummaryTotals;
}

export interface TeamMemberWorkSummary {
  fromDate: string;
  toDate: string;
  members: WorkSummaryMember[];
}
