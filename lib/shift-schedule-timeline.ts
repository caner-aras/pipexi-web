import { getShiftDateKey } from "@/lib/shift-format";
import { apiTimeToInputValue } from "@/lib/location-working-hours";
import type { Shift } from "@/types/shift";

export const SHIFT_TIMELINE_SLOT_MINUTES = 30;
export const SHIFT_TIMELINE_SLOT_HEIGHT_PX = 44;
export const SHIFT_CARD_ESTIMATED_HEIGHT_PX = 360;
export const SHIFT_TIMELINE_ROW_GAP_PX = 8;
export const SHIFT_TIMELINE_BLOCK_PADDING_PX = 8;

const WEEKDAY_TO_DAY_OF_WEEK: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface ShiftDayTimelineRange {
  timezone: string;
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  slotMinutes: number[];
}

export interface ShiftTimelineSlotLayout {
  index: number;
  minutes: number;
  heightPx: number;
}

export interface ShiftTimelineBlock {
  startIndex: number;
  endIndex: number;
  shifts: Shift[];
}

export function parseTimeStringToMinutes(time: string): number {
  const [hour, minute] = apiTimeToInputValue(time).split(":").map(Number);
  return hour * 60 + minute;
}

export function getMinutesInTimezone(iso: string, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));

  let hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );

  if (hour === 24) {
    hour = 0;
  }

  return hour * 60 + minute;
}

export function getDayOfWeekFromDateKey(
  dateKey: string,
  timezone: string
): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const anchor = Date.UTC(year, month - 1, day, 12, 0);

  for (let offsetMinutes = -24 * 60; offsetMinutes <= 24 * 60; offsetMinutes += 1) {
    const timestamp = anchor + offsetMinutes * 60 * 1000;
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(timestamp));

    const zonedYear = Number(parts.find((part) => part.type === "year")?.value);
    const zonedMonth = Number(
      parts.find((part) => part.type === "month")?.value
    );
    const zonedDay = Number(parts.find((part) => part.type === "day")?.value);

    if (zonedYear === year && zonedMonth === month && zonedDay === day) {
      const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
      }).format(new Date(timestamp));

      return WEEKDAY_TO_DAY_OF_WEEK[weekday] ?? 0;
    }
  }

  return new Date(`${dateKey}T12:00:00`).getUTCDay();
}

function roundDownToSlot(minutes: number, slotSize: number): number {
  return Math.floor(minutes / slotSize) * slotSize;
}

function roundUpToSlot(minutes: number, slotSize: number): number {
  return Math.ceil(minutes / slotSize) * slotSize;
}

function buildSlotMinutes(
  startMinutes: number,
  endMinutes: number,
  slotSize: number
): number[] {
  const slots: number[] = [];

  for (
    let minutes = startMinutes;
    minutes <= endMinutes;
    minutes += slotSize
  ) {
    slots.push(minutes);
  }

  return slots;
}

function getLocationWorkingHoursBoundsForDay(
  workingHours: Shift["location"]["workingHours"],
  dayOfWeek: number
): { startMinutes: number; endMinutes: number } | null {
  const workingHour = workingHours?.find((hour) => hour.dayOfWeek === dayOfWeek);

  if (
    workingHour &&
    !workingHour.isClosed &&
    workingHour.opensAt &&
    workingHour.closesAt
  ) {
    return {
      startMinutes: parseTimeStringToMinutes(workingHour.opensAt),
      endMinutes: parseTimeStringToMinutes(workingHour.closesAt),
    };
  }

  return null;
}

export function getShiftWorkingHoursTimelineWindow(shift: Shift): {
  startMinutes: number;
  endMinutes: number;
} {
  const timezone = shift.location.timezone || "UTC";
  const dayOfWeek = getDayOfWeekFromDateKey(getShiftDateKey(shift), timezone);
  const workingHoursBounds = getLocationWorkingHoursBoundsForDay(
    shift.location.workingHours,
    dayOfWeek
  );

  if (workingHoursBounds) {
    return workingHoursBounds;
  }

  return { startMinutes: 6 * 60, endMinutes: 22 * 60 };
}

function getWorkingHoursBoundsForDay(
  shifts: Shift[],
  dayOfWeek: number
): { startMinutes: number; endMinutes: number } | null {
  let startMinutes = Number.POSITIVE_INFINITY;
  let endMinutes = Number.NEGATIVE_INFINITY;
  let hasWorkingHours = false;

  for (const shift of shifts) {
    const bounds = getLocationWorkingHoursBoundsForDay(
      shift.location.workingHours,
      dayOfWeek
    );

    if (!bounds) {
      continue;
    }

    hasWorkingHours = true;
    startMinutes = Math.min(startMinutes, bounds.startMinutes);
    endMinutes = Math.max(endMinutes, bounds.endMinutes);
  }

  if (!hasWorkingHours) {
    return null;
  }

  return { startMinutes, endMinutes };
}

function getShiftBoundsFallback(
  shifts: Shift[],
  timezone: string
): { startMinutes: number; endMinutes: number } {
  let startMinutes = Number.POSITIVE_INFINITY;
  let endMinutes = Number.NEGATIVE_INFINITY;

  for (const shift of shifts) {
    const shiftTimezone = shift.location.timezone || timezone;
    startMinutes = Math.min(
      startMinutes,
      getMinutesInTimezone(shift.startAt, shiftTimezone)
    );
    endMinutes = Math.max(
      endMinutes,
      getMinutesInTimezone(shift.endAt, shiftTimezone)
    );
  }

  return { startMinutes, endMinutes };
}

export function computeShiftDayTimelineRange(
  shifts: Shift[],
  dateKey: string
): ShiftDayTimelineRange {
  const timezone = shifts[0]?.location.timezone ?? "UTC";
  const dayOfWeek = getDayOfWeekFromDateKey(dateKey, timezone);
  const slotSize = SHIFT_TIMELINE_SLOT_MINUTES;
  const workingHoursBounds = getWorkingHoursBoundsForDay(shifts, dayOfWeek);
  const bounds =
    workingHoursBounds ?? getShiftBoundsFallback(shifts, timezone);

  let startMinutes = roundDownToSlot(bounds.startMinutes, slotSize);
  let endMinutes = roundUpToSlot(bounds.endMinutes, slotSize);

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) {
    startMinutes = 9 * 60;
    endMinutes = 17 * 60;
  }

  return {
    timezone,
    dayOfWeek,
    startMinutes,
    endMinutes,
    slotMinutes: buildSlotMinutes(startMinutes, endMinutes, slotSize),
  };
}

export function formatTimelineMinutes(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  if (minute === 0) {
    return `${hour12}:00 ${period}`;
  }

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function getShiftSlotSpan(
  shift: Shift,
  range: ShiftDayTimelineRange
): { startIndex: number; endIndex: number } {
  const timezone = shift.location.timezone || range.timezone;
  const startMinutes = Math.max(
    roundDownToSlot(
      getMinutesInTimezone(shift.startAt, timezone),
      SHIFT_TIMELINE_SLOT_MINUTES
    ),
    range.startMinutes
  );
  const endMinutes = Math.min(
    roundUpToSlot(
      getMinutesInTimezone(shift.endAt, timezone),
      SHIFT_TIMELINE_SLOT_MINUTES
    ),
    range.endMinutes
  );

  const startIndex = Math.floor(
    (startMinutes - range.startMinutes) / SHIFT_TIMELINE_SLOT_MINUTES
  );

  let endIndex =
    endMinutes >= range.endMinutes
      ? range.slotMinutes.length
      : Math.floor(
          (endMinutes - range.startMinutes) / SHIFT_TIMELINE_SLOT_MINUTES
        );

  endIndex = Math.max(endIndex, startIndex + 1);
  endIndex = Math.min(endIndex, range.slotMinutes.length);

  return { startIndex, endIndex };
}

export function computeShiftTimelineBlocks(
  shifts: Shift[],
  range: ShiftDayTimelineRange
): ShiftTimelineBlock[] {
  const blocks = new Map<number, ShiftTimelineBlock>();

  for (const shift of shifts) {
    const { startIndex, endIndex } = getShiftSlotSpan(shift, range);

    if (startIndex < 0 || startIndex >= range.slotMinutes.length) {
      continue;
    }

    const existing = blocks.get(startIndex) ?? {
      startIndex,
      endIndex: startIndex,
      shifts: [],
    };

    existing.shifts.push(shift);
    existing.endIndex = Math.max(existing.endIndex, endIndex);
    blocks.set(startIndex, existing);
  }

  return Array.from(blocks.values()).sort(
    (left, right) => left.startIndex - right.startIndex
  );
}

export function computeShiftDaySlotLayouts(
  shifts: Shift[],
  range: ShiftDayTimelineRange,
  getShiftCardHeight: (shift: Shift) => number = () =>
    SHIFT_CARD_ESTIMATED_HEIGHT_PX
): ShiftTimelineSlotLayout[] {
  const slotCount = range.slotMinutes.length;
  const heights = Array.from(
    { length: slotCount },
    () => SHIFT_TIMELINE_SLOT_HEIGHT_PX
  );
  const blocks = computeShiftTimelineBlocks(shifts, range);

  for (const block of blocks) {
    const spanCount = Math.max(1, block.endIndex - block.startIndex);
    const blockHeight =
      block.shifts.reduce(
        (total, shift) => total + getShiftCardHeight(shift),
        0
      ) +
      Math.max(0, block.shifts.length - 1) * SHIFT_TIMELINE_ROW_GAP_PX +
      SHIFT_TIMELINE_BLOCK_PADDING_PX;
    const spanHeight = heights
      .slice(block.startIndex, block.endIndex)
      .reduce((total, height) => total + height, 0);

    if (blockHeight <= spanHeight) {
      continue;
    }

    const minHeightPerSlot = Math.ceil(blockHeight / spanCount);

    for (let index = block.startIndex; index < block.endIndex; index++) {
      heights[index] = Math.max(heights[index], minHeightPerSlot);
    }
  }

  return range.slotMinutes.map((minutes, index) => ({
    index,
    minutes,
    heightPx: heights[index],
  }));
}
