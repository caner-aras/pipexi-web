export interface ReportOverview {
  membersCount: number;
  teamsCount: number;
  openTasksCount: number;
  overdueTasksCount: number;
  tasksCreatedToday: number;
  activeShiftsNow: number;
  completedShiftsCount: number;
  membersClockedInToday: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  formSubmissionsToday: number;
  missingRequiredShiftForms: number;
}

export interface ReportDistributionItem {
  key: string;
  count: number;
}

export interface ReportShiftTimeEntry {
  timeEntryId: string;
  organizationMemberId: string;
  memberName: string;
  clockInTime: string;
  clockOutTime: string | null;
  status: string;
}

export interface ReportShiftAssignment {
  shiftId: string;
  organizationMemberId: string;
  memberName: string;
  startTime: string;
  endTime: string;
  timeEntries?: ReportShiftTimeEntry[];
}

export interface ReportDailyActivity {
  date: string;
  tasksCreated: number;
  timeEntriesCreated: number;
  formSubmissionsCreated: number;
  shiftAssignments?: ReportShiftAssignment[];
}

export type ReportSignalTone = "default" | "warning" | "danger" | "success";

export interface ReportSignal {
  key: string;
  label: string;
  value: string;
  tone: ReportSignalTone | string;
}

export interface ReportSummary {
  organizationId: string;
  overview: ReportOverview;
  taskStatusDistribution: ReportDistributionItem[];
  taskPriorityDistribution: ReportDistributionItem[];
  shiftStatusDistribution: ReportDistributionItem[];
  leaveStatusDistribution: ReportDistributionItem[];
  dailyActivity: ReportDailyActivity[];
  signals: ReportSignal[];
}
