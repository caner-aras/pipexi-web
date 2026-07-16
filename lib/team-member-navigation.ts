import { getTodayDateKeyUtc } from "@/lib/date-format";
import { getShiftDateKey, getShiftTeamMemberLookupKey } from "@/lib/shift-format";
import type { Shift } from "@/types/shift";

export function resolveShiftTeamMemberId(
  shift: Shift,
  lookups: {
    teamMemberIdByKey?: Record<string, string>;
    teamMemberIdByOrganizationMemberId?: Record<string, string>;
  } = {}
): string | null {
  const teamMemberLookupKey = getShiftTeamMemberLookupKey(shift);

  if (teamMemberLookupKey && lookups.teamMemberIdByKey?.[teamMemberLookupKey]) {
    return lookups.teamMemberIdByKey[teamMemberLookupKey];
  }

  return (
    (shift.organizationMemberId
      ? lookups.teamMemberIdByOrganizationMemberId?.[
          shift.organizationMemberId
        ]
      : null) ?? null
  );
}

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
