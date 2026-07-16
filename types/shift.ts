import type { Location } from "@/types/location";
import type { OrganizationMember } from "@/types/member";
import type { ShiftFormTemplate } from "@/types/shift-form-template";
import type { Team } from "@/types/team";
import type { TimeEntry } from "@/types/time-entry";

export interface ShiftBreak {
  id: string;
  shiftId: string;
  startAt: string;
  endAt: string;
  isPaid: boolean;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateShiftBreakInput {
  startAt: string;
  endAt: string;
  isPaid: boolean;
}

export type ShiftRepeatFrequency = "daily" | "weekly" | "monthly" | "montly";

export interface CreateShiftInput {
  teamId?: string;
  organizationMemberId?: string;
  locationId: string;
  title: string;
  startAt: string;
  endAt: string;
  notes?: string;
  breaks?: CreateShiftBreakInput[];
  requiredFormTemplateIds?: string[];
  repeat?: ShiftRepeatFrequency | null;
  repeatTimes?: number;
  repeatOn?: number[];
  dayOfMonth?: number;
}

export interface UpdateShiftInput {
  teamId?: string | null;
  organizationMemberId?: string | null;
  locationId?: string | null;
  title?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  notes?: string | null;
  status?: string | null;
  requiredFormTemplateIds?: string[] | null;
}

export interface UpdateShiftBreakInput {
  startAt?: string | null;
  endAt?: string | null;
  isPaid?: boolean | null;
  status?: string | null;
}

export interface ShiftApi {
  id: string;
  organizationId: string;
  team: Team | null;
  organizationMemberId: string | null;
  organizationMember: OrganizationMember | null;
  locationId: string;
  title: string;
  startAt: string;
  endAt: string;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  breaks: ShiftBreak[];
  timeEntries: TimeEntry[];
}

export interface ShiftDetailApi extends Omit<ShiftApi, "locationId"> {
  locationId?: string;
  location: Location;
  shiftFormTemplates?: ShiftFormTemplate[];
}

export interface OrganizationShiftsPayload {
  organizationId: string;
  locations: Location[];
  shifts: ShiftApi[];
}

export interface Shift extends ShiftApi {
  location: Location;
  shiftFormTemplates?: ShiftFormTemplate[];
}

export interface OrganizationShiftsData {
  locations: Location[];
  shifts: Shift[];
}
