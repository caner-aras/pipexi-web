export interface ShiftReportDataResponse {
  currency: string;
  timezone: string;
  shifts: ShiftReportItem[];
  summary: ShiftReportSummary[];
}

export interface ShiftReportItem {
  shiftId: string;
  employeeName: string;
  date: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  scheduledHours: number;
  actualHours: number;
  overtime: number;
  earnings: number;
  entries: ShiftReportEntry[];
}

export interface ShiftReportEntry {
  in: string | null;
  out: string | null;
  action: string;
}

export interface ShiftReportSummary {
  date: string;
  scheduledHours: number;
  actualHours: number;
  earnings: number;
}
