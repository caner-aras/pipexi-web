export interface OrganizationTimezoneOption {
  id: string;
  label: string;
  offset: string;
}

const FALLBACK_TIMEZONES: OrganizationTimezoneOption[] = [
  {
    id: "Europe/Istanbul",
    label: "Istanbul (UTC+3)",
    offset: "UTC+3",
  },
  {
    id: "Europe/Berlin",
    label: "Berlin (UTC+1)",
    offset: "UTC+1",
  },
  {
    id: "Europe/London",
    label: "London (UTC)",
    offset: "UTC",
  },
  {
    id: "America/New_York",
    label: "New York (UTC-5)",
    offset: "UTC-5",
  },
  {
    id: "Asia/Dubai",
    label: "Dubai (UTC+4)",
    offset: "UTC+4",
  },
];

let cachedTimezones: OrganizationTimezoneOption[] | null = null;

function getTimezoneCityLabel(timeZone: string): string {
  const segments = timeZone.split("/");
  return (segments[segments.length - 1] ?? timeZone).replace(/_/g, " ");
}

function getTimezoneOffsetLabel(timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    });
    const part = formatter
      .formatToParts(new Date())
      .find((item) => item.type === "timeZoneName");

    return part?.value?.replace("GMT", "UTC") ?? "UTC";
  } catch {
    return "UTC";
  }
}

function buildTimezoneOption(timeZone: string): OrganizationTimezoneOption {
  const offset = getTimezoneOffsetLabel(timeZone);
  const city = getTimezoneCityLabel(timeZone);

  return {
    id: timeZone,
    label: `${city} (${offset})`,
    offset,
  };
}

export function getOrganizationTimezones(): OrganizationTimezoneOption[] {
  if (cachedTimezones) {
    return cachedTimezones;
  }

  if (typeof Intl.supportedValuesOf === "function") {
    cachedTimezones = Intl.supportedValuesOf("timeZone")
      .map(buildTimezoneOption)
      .sort((left, right) => left.label.localeCompare(right.label));
  } else {
    cachedTimezones = FALLBACK_TIMEZONES;
  }

  return cachedTimezones;
}

export function getOrganizationTimezoneSelectItems(currentTimezone?: string) {
  const items = getOrganizationTimezones().map((timezone) => ({
    value: timezone.id,
    label: timezone.label,
  }));

  if (
    currentTimezone &&
    !items.some((item) => item.value === currentTimezone)
  ) {
    items.unshift({
      value: currentTimezone,
      label: buildTimezoneOption(currentTimezone).label,
    });
  }

  return items;
}

export function getOrganizationTimezoneLabel(timezoneId: string): string {
  return (
    getOrganizationTimezones().find((timezone) => timezone.id === timezoneId)
      ?.label ?? buildTimezoneOption(timezoneId).label
  );
}
