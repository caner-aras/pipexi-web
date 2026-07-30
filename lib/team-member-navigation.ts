import { getTodayDateKeyUtc } from "@/lib/date-format";
import { getShiftDateKey } from "@/lib/shift-format";
import type { Shift } from "@/types/shift";

export type TeamMemberProfileTab =
  | "work-summary"
  | "schedule"
  | "day-offs"
  | "position-history"
  | "profile"
  | "payments";

export function buildTeamMemberProfileHref(
  teamMemberId: string,
  fromDateKey: string = getTodayDateKeyUtc(),
  tab?: TeamMemberProfileTab
): string {
  const params = new URLSearchParams({ fromDate: fromDateKey });

  if (tab) {
    params.set("tab", tab);
  }

  return `/team-members/${teamMemberId}?${params.toString()}`;
}

export function buildTeamMemberDetailsHref(
  teamMemberId: string,
  shift: Shift
): string {
  const params = new URLSearchParams({
    fromDate: getShiftDateKey(shift),
    shiftId: shift.id,
  });

  return `/team-members/${teamMemberId}?${params.toString()}`;
}
