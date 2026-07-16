export interface LocationWorkingHour {
  id: string;
  locationId: string;
  dayOfWeek: number;
  isClosed: boolean;
  opensAt: string | null;
  closesAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface LocationWorkingHourInput {
  dayOfWeek: number;
  isClosed: boolean;
  opensAt?: string | null;
  closesAt?: string | null;
}

export interface SetLocationWorkingHoursInput {
  workingHours: LocationWorkingHourInput[];
}

export interface LocationWorkingHourDraft {
  dayOfWeek: number;
  label: string;
  isClosed: boolean;
  opensAt: string;
  closesAt: string;
}
