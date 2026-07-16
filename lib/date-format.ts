export function getTodayDateKeyUtc(): string {
  return formatDateKeyUtc(new Date());
}

export function getCurrentMonthDateRangeUtc(): {
  fromDate: string;
  toDate: string;
} {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();

  return {
    fromDate: formatDateKeyUtc(new Date(Date.UTC(year, month, 1))),
    toDate: formatDateKeyUtc(new Date(Date.UTC(year, month + 1, 0))),
  };
}

export function formatDateKeyUtc(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toFromDateIso(dateKey?: string | null): string {
  if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return `${dateKey}T00:00:00Z`;
  }

  return `${getTodayDateKeyUtc()}T00:00:00Z`;
}

export function fromDateIsoToDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function formatDateRangeLabel(fromDateKey: string, days = 7): string {
  const start = new Date(`${fromDateKey}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + days - 1);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDatePickerLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getTeamMemberLookupKey(
  teamId: string,
  organizationMemberId: string
): string {
  return `${teamId}:${organizationMemberId}`;
}

export function combineDateTimeInTimezoneToIso(
  dateKey: string,
  time: string,
  timeZone: string
): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const readZonedParts = (timestamp: number) => {
    const parts = formatter.formatToParts(new Date(timestamp));
    const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);

    return {
      year: valueOf("year"),
      month: valueOf("month"),
      day: valueOf("day"),
      hour: valueOf("hour") % 24,
      minute: valueOf("minute"),
    };
  };

  let utcTimestamp = desiredAsUtc;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const zoned = readZonedParts(utcTimestamp);
    const zonedAsUtc = Date.UTC(
      zoned.year,
      zoned.month - 1,
      zoned.day,
      zoned.hour,
      zoned.minute
    );
    const deltaMs = desiredAsUtc - zonedAsUtc;

    if (deltaMs === 0) {
      return new Date(utcTimestamp).toISOString();
    }

    utcTimestamp += deltaMs;
  }

  return new Date(utcTimestamp).toISOString();
}
