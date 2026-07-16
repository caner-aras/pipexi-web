import { getTeamMemberLookupKey } from "@/lib/date-format";
import type { Shift, ShiftBreak } from "@/types/shift";
import type { OrganizationMember } from "@/types/member";

export function getShiftMemberDisplayName(
  member:
    | Pick<OrganizationMember, "user">
    | { user: OrganizationMember["user"] | null }
    | null
    | undefined
): string {
  if (!member?.user) {
    return "Unknown member";
  }

  const fullName = `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim();
  return fullName || member.user.email || "Unknown member";
}

export function getShiftAssigneeLabel(shift: Shift): string {
  if (shift.organizationMember) {
    return getShiftMemberDisplayName(shift.organizationMember);
  }

  if (shift.team) {
    return shift.team.name;
  }

  return "Unassigned";
}

export function getShiftTimezone(shift: Shift): string {
  return shift.location.timezone || "UTC";
}

export function getShiftDateKey(shift: Shift): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getShiftTimezone(shift),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(shift.startAt));
}

export function getShiftDetailHref(shiftId: string): string {
  return `/shifts/${shiftId}`;
}

export function formatShiftDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatShiftTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function getTimeInputValueFromIso(iso: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export function getDurationMinutes(startAt: string, endAt: string): number {
  return Math.max(
    0,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
  );
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

export function getBreakDurationMinutes(breakItem: ShiftBreak): number {
  return getDurationMinutes(breakItem.startAt, breakItem.endAt);
}

export function getShiftWorkMinutes(shift: Shift): number {
  const shiftMinutes = getDurationMinutes(shift.startAt, shift.endAt);
  const breakMinutes = shift.breaks.reduce(
    (total, breakItem) => total + getBreakDurationMinutes(breakItem),
    0
  );

  return Math.max(0, shiftMinutes - breakMinutes);
}

export function groupShiftsByDate(shifts: Shift[]): Map<string, Shift[]> {
  const grouped = new Map<string, Shift[]>();

  for (const shift of [...shifts].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )) {
    const dateKey = getShiftDateKey(shift);
    const existing = grouped.get(dateKey) ?? [];
    existing.push(shift);
    grouped.set(dateKey, existing);
  }

  return grouped;
}

export function getShiftTeamId(shift: Shift): string | null {
  return shift.team?.id ?? null;
}

export function getShiftTeamMemberLookupKey(shift: Shift): string | null {
  if (!shift.team || !shift.organizationMemberId) {
    return null;
  }

  return getTeamMemberLookupKey(shift.team.id, shift.organizationMemberId);
}

export function computeShiftStats(shifts: Shift[]) {
  const totalMinutes = shifts.reduce(
    (total, shift) => total + getDurationMinutes(shift.startAt, shift.endAt),
    0
  );
  const paidBreakMinutes = shifts.reduce(
    (total, shift) =>
      total +
      shift.breaks
        .filter((breakItem) => breakItem.isPaid)
        .reduce(
          (breakTotal, breakItem) =>
            breakTotal + getBreakDurationMinutes(breakItem),
          0
        ),
    0
  );
  const workMinutes = shifts.reduce(
    (total, shift) => total + getShiftWorkMinutes(shift),
    0
  );

  return {
    totalShifts: shifts.length,
    totalHours: formatDuration(totalMinutes),
    workHours: formatDuration(workMinutes),
    paidBreakHours: formatDuration(paidBreakMinutes),
    teamCount: new Set(
      shifts.map((shift) => getShiftTeamId(shift)).filter(Boolean)
    ).size,
    locationCount: new Set(shifts.map((shift) => shift.location.id)).size,
  };
}

export function getTimelinePosition(
  iso: string,
  timezone: string,
  windowStartMinutes = 6 * 60,
  windowEndMinutes = 22 * 60
): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date(iso));

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const totalMinutes = hour * 60 + minute;
  const clamped = Math.min(Math.max(totalMinutes, windowStartMinutes), windowEndMinutes);

  return (
    ((clamped - windowStartMinutes) / (windowEndMinutes - windowStartMinutes)) *
    100
  );
}

export function getTimelineWidth(
  startAt: string,
  endAt: string,
  timezone: string,
  windowStartMinutes = 6 * 60,
  windowEndMinutes = 22 * 60
): number {
  const start = getTimelinePosition(
    startAt,
    timezone,
    windowStartMinutes,
    windowEndMinutes
  );
  const end = getTimelinePosition(
    endAt,
    timezone,
    windowStartMinutes,
    windowEndMinutes
  );

  return Math.max(end - start, 4);
}
