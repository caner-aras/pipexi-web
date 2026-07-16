import type {
  LocationWorkingHour,
  LocationWorkingHourDraft,
  LocationWorkingHourInput,
} from "@/types/location-working-hour";

export const LOCATION_WORKING_DAYS: Array<{ dayOfWeek: number; label: string }> =
  [
    { dayOfWeek: 0, label: "Sunday" },
    { dayOfWeek: 1, label: "Monday" },
    { dayOfWeek: 2, label: "Tuesday" },
    { dayOfWeek: 3, label: "Wednesday" },
    { dayOfWeek: 4, label: "Thursday" },
    { dayOfWeek: 5, label: "Friday" },
    { dayOfWeek: 6, label: "Saturday" },
  ];

export function apiTimeToInputValue(time: string | null | undefined): string {
  if (!time) {
    return "09:00";
  }

  return time.slice(0, 5);
}

export function inputValueToApiTime(time: string): string {
  return time.length === 5 ? `${time}:00` : time;
}

export function createDefaultWorkingHourDrafts(): LocationWorkingHourDraft[] {
  return LOCATION_WORKING_DAYS.map(({ dayOfWeek, label }) => ({
    dayOfWeek,
    label,
    isClosed: true,
    opensAt: "09:00",
    closesAt: "17:00",
  }));
}

export function workingHoursToDrafts(
  workingHours: LocationWorkingHour[]
): LocationWorkingHourDraft[] {
  const byDay = new Map(
    workingHours.map((workingHour) => [workingHour.dayOfWeek, workingHour])
  );

  return LOCATION_WORKING_DAYS.map(({ dayOfWeek, label }) => {
    const existing = byDay.get(dayOfWeek);

    if (!existing) {
      return {
        dayOfWeek,
        label,
        isClosed: true,
        opensAt: "09:00",
        closesAt: "17:00",
      };
    }

    return {
      dayOfWeek,
      label,
      isClosed: existing.isClosed,
      opensAt: apiTimeToInputValue(existing.opensAt),
      closesAt: apiTimeToInputValue(existing.closesAt),
    };
  });
}

export function draftsToWorkingHourInputs(
  drafts: LocationWorkingHourDraft[]
): LocationWorkingHourInput[] {
  return drafts.map((draft) => ({
    dayOfWeek: draft.dayOfWeek,
    isClosed: draft.isClosed,
    opensAt: draft.isClosed ? null : inputValueToApiTime(draft.opensAt),
    closesAt: draft.isClosed ? null : inputValueToApiTime(draft.closesAt),
  }));
}

export function validateWorkingHourInputs(
  workingHours: LocationWorkingHourInput[]
): string | null {
  const seenDays = new Set<number>();

  for (const workingHour of workingHours) {
    const label =
      LOCATION_WORKING_DAYS.find((day) => day.dayOfWeek === workingHour.dayOfWeek)
        ?.label ?? `Day ${workingHour.dayOfWeek}`;

    if (workingHour.dayOfWeek < 0 || workingHour.dayOfWeek > 6) {
      return `${label}: day of week must be between 0 and 6.`;
    }

    if (seenDays.has(workingHour.dayOfWeek)) {
      return `${label}: duplicate day of week in request.`;
    }

    seenDays.add(workingHour.dayOfWeek);

    if (workingHour.isClosed) {
      if (workingHour.opensAt || workingHour.closesAt) {
        return `${label}: open and close times must be empty when closed.`;
      }

      continue;
    }

    if (!workingHour.opensAt || !workingHour.closesAt) {
      return `${label}: open and close times are required when not closed.`;
    }

    const opensAt = apiTimeToInputValue(workingHour.opensAt);
    const closesAt = apiTimeToInputValue(workingHour.closesAt);

    if (opensAt >= closesAt) {
      return `${label}: close time must be after open time.`;
    }
  }

  return null;
}

export function validateWorkingHourDrafts(
  drafts: LocationWorkingHourDraft[]
): string | null {
  return validateWorkingHourInputs(draftsToWorkingHourInputs(drafts));
}

export function formatWorkingHourSummary(
  workingHours: LocationWorkingHour[]
): string {
  if (workingHours.length === 0) {
    return "Closed every day";
  }

  const openDays = workingHours.filter((workingHour) => !workingHour.isClosed);

  if (openDays.length === 0) {
    return "Closed every day";
  }

  return `${openDays.length} open day${openDays.length === 1 ? "" : "s"}`;
}
