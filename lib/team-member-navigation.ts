import { getTodayDateKeyUtc } from "@/lib/date-format";
import { getShiftDateKey } from "@/lib/shift-format";
import type { Shift } from "@/types/shift";

export function buildTeamMemberProfileHref(
  teamMemberId: string,
  fromDateKey: string = getTodayDateKeyUtc()
): string {
  const params = new URLSearchParams({ fromDate: fromDateKey });
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
