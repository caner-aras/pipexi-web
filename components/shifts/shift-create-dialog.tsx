"use client";

import {
  Building2,
  ChevronRight,
  Coffee,
  FileText,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogAnchorRect,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  combineDateTimeInTimezoneToIso,
  formatLocalDateKey,
  getTodayDateKeyUtc,
  parseDateKey,
} from "@/lib/date-format";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { FormTemplate } from "@/types/form-template";
import type { Location } from "@/types/location";
import type { OrganizationMember } from "@/types/member";
import type { CreateShiftBreakInput, ShiftRepeatFrequency } from "@/types/shift";
import type { Team } from "@/types/team";

type AssigneeMode = "team" | "member";
type PickerKind = "team" | "member" | "location" | "forms" | "date";
type UiShiftRepeatFrequency = "daily" | "weekly" | "monthly";

const REPEAT_FREQUENCY_OPTIONS: {
  value: UiShiftRepeatFrequency;
  label: string;
}[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

interface ShiftBreakDraft {
  id: string;
  startTime: string;
  endTime: string;
  isPaid: boolean;
}

interface ShiftCreateFormProps {
  organizationId: string;
  teams: Team[];
  members: OrganizationMember[];
  locations: Location[];
  formTemplates: FormTemplate[];
  onCancel: () => void;
  onCreated: () => void;
  onShiftCreated?: () => void;
}

function getBreakEndTime(startTime: string): string {
  if (!/^\d{2}:\d{2}$/.test(startTime)) {
    return "";
  }

  const [hour, minute] = startTime.split(":").map(Number);
  const totalMinutes = hour * 60 + minute + 30;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
}

function createBreakDraft(startTime = "12:00"): ShiftBreakDraft {
  return {
    id: crypto.randomUUID(),
    startTime,
    endTime: getBreakEndTime(startTime),
    isPaid: false,
  };
}

function resolveShiftEndIso(
  shiftDateKey: string,
  startTime: string,
  endTime: string,
  timezone: string
): string {
  const startIso = combineDateTimeInTimezoneToIso(
    shiftDateKey,
    startTime,
    timezone
  );
  const endIsoSameDay = combineDateTimeInTimezoneToIso(
    shiftDateKey,
    endTime,
    timezone
  );

  if (new Date(endIsoSameDay).getTime() > new Date(startIso).getTime()) {
    return endIsoSameDay;
  }

  const nextDay = new Date(parseDateKey(shiftDateKey));
  nextDay.setDate(nextDay.getDate() + 1);

  return combineDateTimeInTimezoneToIso(
    formatLocalDateKey(nextDay),
    endTime,
    timezone
  );
}

function resolveBreakEndIso(
  shiftDateKey: string,
  breakStartTime: string,
  breakEndTime: string,
  timezone: string
): string {
  const breakStartIso = combineDateTimeInTimezoneToIso(
    shiftDateKey,
    breakStartTime,
    timezone
  );
  let breakEndIso = combineDateTimeInTimezoneToIso(
    shiftDateKey,
    breakEndTime,
    timezone
  );

  if (new Date(breakEndIso).getTime() <= new Date(breakStartIso).getTime()) {
    const nextDay = new Date(parseDateKey(shiftDateKey));
    nextDay.setDate(nextDay.getDate() + 1);
    breakEndIso = combineDateTimeInTimezoneToIso(
      formatLocalDateKey(nextDay),
      breakEndTime,
      timezone
    );
  }

  return breakEndIso;
}

function isBreakEndAfterShiftEnd(
  breakItem: ShiftBreakDraft,
  shiftDateKey: string,
  shiftStartTime: string,
  shiftEndTime: string,
  timezone: string
): boolean {
  if (
    !/^\d{2}:\d{2}$/.test(breakItem.endTime) ||
    !/^\d{2}:\d{2}$/.test(shiftEndTime)
  ) {
    return true;
  }

  const breakEndIso = resolveBreakEndIso(
    shiftDateKey,
    breakItem.startTime || breakItem.endTime,
    breakItem.endTime,
    timezone
  );
  const shiftEndIso = resolveShiftEndIso(
    shiftDateKey,
    shiftStartTime,
    shiftEndTime,
    timezone
  );

  return new Date(breakEndIso).getTime() > new Date(shiftEndIso).getTime();
}

function toPossessive(label: string): string {
  const trimmed = label.trim();

  if (!trimmed) {
    return "";
  }

  return /s$/i.test(trimmed) ? `${trimmed}'` : `${trimmed}'s`;
}

function buildDefaultShiftTitle(
  assigneeMode: AssigneeMode,
  team: Team | null,
  member: OrganizationMember | null
): string {
  if (assigneeMode === "member" && member) {
    const firstName = member.user.firstName.trim();
    const label =
      firstName || getShiftMemberDisplayName(member).split(" ")[0] || "Member";

    return `${toPossessive(label)} shift`;
  }

  if (assigneeMode === "team" && team) {
    return `${team.name} shift`;
  }

  return "";
}

function PickerListItem({
  title,
  subtitle,
  selected,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
        selected && "bg-muted/60"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function PickerCheckboxItem({
  title,
  subtitle,
  checked,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
        checked && "bg-muted/60"
      )}
    >
      <Checkbox checked={checked} className="pointer-events-none" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}

function getRequiredFormsSummary(
  selectedFormTemplateIds: string[],
  formTemplates: FormTemplate[]
): { title: string; subtitle: string } {
  if (selectedFormTemplateIds.length === 0) {
    return {
      title: "Select forms",
      subtitle: "Optional forms required for this shift",
    };
  }

  const selectedForms = formTemplates.filter((formTemplate) =>
    selectedFormTemplateIds.includes(formTemplate.id)
  );

  if (selectedForms.length === 1) {
    const [formTemplate] = selectedForms;

    return {
      title: formTemplate.name,
      subtitle: formTemplate.description || "1 required form",
    };
  }

  return {
    title: `${selectedForms.length} forms selected`,
    subtitle: selectedForms.map((formTemplate) => formTemplate.name).join(", "),
  };
}

function ShiftCreateForm({
  organizationId,
  teams,
  members,
  locations,
  formTemplates,
  onCancel,
  onCreated,
  onShiftCreated,
}: ShiftCreateFormProps) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [manualTitle, setManualTitle] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [assigneeMode, setAssigneeMode] = useState<AssigneeMode>("team");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    teams[0]?.id ?? null
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    members[0]?.id ?? null
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    locations[0]?.id ?? null
  );
  const [shiftDateKey, setShiftDateKey] = useState(getTodayDateKeyUtc());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [breaks, setBreaks] = useState<ShiftBreakDraft[]>([]);
  const [selectedFormTemplateIds, setSelectedFormTemplateIds] = useState<
    string[]
  >([]);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatFrequency, setRepeatFrequency] =
    useState<UiShiftRepeatFrequency>("daily");
  const [repeatTimes, setRepeatTimes] = useState("1");
  const [repeatOn, setRepeatOn] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState(
    String(Number.parseInt(getTodayDateKeyUtc().slice(8, 10), 10))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepOpenAfterCreate, setKeepOpenAfterCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activePicker, setActivePicker] = useState<PickerKind | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<DialogAnchorRect | null>(
    null
  );
  const activePickerRef = useRef<PickerKind | null>(null);
  const [teamSearch, setTeamSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [formSearch, setFormSearch] = useState("");

  const teamPickerOpen = activePicker === "team";
  const memberPickerOpen = activePicker === "member";
  const locationPickerOpen = activePicker === "location";
  const formPickerOpen = activePicker === "forms";
  const datePickerOpen = activePicker === "date";

  useEffect(() => {
    activePickerRef.current = activePicker;
  }, [activePicker]);

  function openPicker(
    picker: PickerKind,
    anchorEl?: HTMLElement | null
  ) {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPickerAnchor({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setPickerAnchor(null);
    }

    setActivePicker(picker);
  }

  function closePicker() {
    setActivePicker(null);
    setTeamSearch("");
    setMemberSearch("");
    setLocationSearch("");
    setFormSearch("");
  }

  function handlePickerOpenChange(picker: PickerKind, open: boolean) {
    if (open) {
      // Keep existing anchor — do not call openPicker() without an element
      // or the anchor is cleared and the dialog jumps mid-transition.
      setActivePicker(picker);
      return;
    }

    if (activePicker === picker) {
      closePicker();
    }
  }

  function handlePickerOpenChangeComplete(_picker: PickerKind, open: boolean) {
    if (!open && activePickerRef.current === null) {
      setPickerAnchor(null);
    }
  }

  function handleAssigneeModeChange(mode: AssigneeMode) {
    setAssigneeMode(mode);
    closePicker();
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? null;
  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null;
  const timezone = selectedLocation?.timezone ?? "UTC";
  const suggestedTitle = useMemo(
    () => buildDefaultShiftTitle(assigneeMode, selectedTeam, selectedMember),
    [assigneeMode, selectedTeam, selectedMember]
  );
  const title = manualTitle ?? suggestedTitle;
  const requiredFormsSummary = getRequiredFormsSummary(
    selectedFormTemplateIds,
    formTemplates
  );

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();

    if (!query) {
      return teams;
    }

    return teams.filter((team) => team.name.toLowerCase().includes(query));
  }, [teamSearch, teams]);

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const name = getShiftMemberDisplayName(member).toLowerCase();
      const email = member.user.email.toLowerCase();
      const jobTitle = member.jobTitle.toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        jobTitle.includes(query)
      );
    });
  }, [memberSearch, members]);

  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();

    if (!query) {
      return locations;
    }

    return locations.filter((location) => {
      return (
        location.name.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query)
      );
    });
  }, [locationSearch, locations]);

  const filteredFormTemplates = useMemo(() => {
    const query = formSearch.trim().toLowerCase();

    if (!query) {
      return formTemplates;
    }

    return formTemplates.filter((formTemplate) => {
      return (
        formTemplate.name.toLowerCase().includes(query) ||
        formTemplate.description.toLowerCase().includes(query)
      );
    });
  }, [formSearch, formTemplates]);

  function toggleFormTemplateSelection(formTemplateId: string) {
    setSelectedFormTemplateIds((current) =>
      current.includes(formTemplateId)
        ? current.filter((id) => id !== formTemplateId)
        : [...current, formTemplateId]
    );
  }

  function buildShiftEndIso(): string {
    return resolveShiftEndIso(shiftDateKey, startTime, endTime, timezone);
  }

  function buildBreakPayload(
    shiftStartIso: string,
    shiftEndIso: string
  ): CreateShiftBreakInput[] {
    return breaks.map((breakItem) => {
      const breakStartIso = combineDateTimeInTimezoneToIso(
        shiftDateKey,
        breakItem.startTime,
        timezone
      );
      const breakEndIso = resolveBreakEndIso(
        shiftDateKey,
        breakItem.startTime,
        breakItem.endTime,
        timezone
      );

      const startMs = new Date(shiftStartIso).getTime();
      const endMs = new Date(shiftEndIso).getTime();
      const breakStartMs = new Date(breakStartIso).getTime();
      const breakEndMs = new Date(breakEndIso).getTime();

      if (breakStartMs < startMs || breakEndMs > endMs) {
        throw new Error("Breaks must fall within the shift time range.");
      }

      return {
        startAt: breakStartIso,
        endAt: breakEndIso,
        isPaid: breakItem.isPaid,
      };
    });
  }

  function resetFormForNextShift() {
    setManualTitle(null);
    setNotes("");
    setBreaks([]);
    setSelectedFormTemplateIds([]);
    setError(null);
    titleInputRef.current?.focus();
  }

  function toggleRepeatDay(day: number) {
    setRepeatOn((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day].sort((left, right) => left - right)
    );
  }

  function getRepeatPayload(): {
    repeat: ShiftRepeatFrequency;
    repeatTimes: number;
    repeatOn?: number[];
    dayOfMonth?: number;
  } | null {
    if (!isRepeating) {
      return null;
    }

    const times = Number.parseInt(repeatTimes, 10);

    if (!Number.isFinite(times) || times < 1) {
      throw new Error("Repeat times must be greater than 0.");
    }

    if (repeatFrequency === "weekly") {
      if (repeatOn.length === 0) {
        throw new Error("Select at least one weekday for weekly repeats.");
      }

      return {
        repeat: "weekly",
        repeatTimes: times,
        repeatOn,
      };
    }

    if (repeatFrequency === "monthly") {
      const monthDay = Number.parseInt(dayOfMonth, 10);

      if (!Number.isFinite(monthDay) || monthDay < 1 || monthDay > 31) {
        throw new Error("Day of month must be between 1 and 31.");
      }

      return {
        repeat: "monthly",
        repeatTimes: times,
        dayOfMonth: monthDay,
      };
    }

    return {
      repeat: "daily",
      repeatTimes: times,
    };
  }

  async function handleSubmit() {
    if (!selectedLocationId) {
      setError("Select a location.");
      return;
    }

    if (assigneeMode === "team" && !selectedTeamId) {
      setError("Select a team.");
      return;
    }

    if (assigneeMode === "member" && !selectedMemberId) {
      setError("Select a member.");
      return;
    }

    if (
      breaks.some((breakItem) =>
        isBreakEndAfterShiftEnd(
          breakItem,
          shiftDateKey,
          startTime,
          endTime,
          timezone
        )
      )
    ) {
      setError("Break end time cannot be after the shift end time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startAt = combineDateTimeInTimezoneToIso(
        shiftDateKey,
        startTime,
        timezone
      );
      const endAt = buildShiftEndIso();
      const breakPayload = buildBreakPayload(startAt, endAt);
      const repeatPayload = getRepeatPayload();

      const response = await fetch(
        `/api/organizations/${organizationId}/shifts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(assigneeMode === "team"
              ? { teamId: selectedTeamId }
              : { organizationMemberId: selectedMemberId }),
            locationId: selectedLocationId,
            title: title.trim(),
            startAt,
            endAt,
            notes: notes.trim() || undefined,
            breaks: breakPayload.length > 0 ? breakPayload : undefined,
            requiredFormTemplateIds:
              selectedFormTemplateIds.length > 0
                ? selectedFormTemplateIds
                : undefined,
            ...(repeatPayload ?? {}),
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create shift.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isRepeating
          ? "Repeating shifts created successfully"
          : "Shift created successfully"
      );
      onShiftCreated?.();

      if (keepOpenAfterCreate) {
        resetFormForNextShift();
      } else {
        onCreated();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create shift.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const repeatTimesValue = Number.parseInt(repeatTimes, 10);
  const dayOfMonthValue = Number.parseInt(dayOfMonth, 10);
  const isRepeatValid =
    !isRepeating ||
    (Number.isFinite(repeatTimesValue) &&
      repeatTimesValue > 0 &&
      (repeatFrequency !== "weekly" || repeatOn.length > 0) &&
      (repeatFrequency !== "monthly" ||
        (Number.isFinite(dayOfMonthValue) &&
          dayOfMonthValue >= 1 &&
          dayOfMonthValue <= 31)));

  const isValid =
    Boolean(title.trim()) &&
    Boolean(selectedLocationId) &&
    ((assigneeMode === "team" && Boolean(selectedTeamId)) ||
      (assigneeMode === "member" && Boolean(selectedMemberId))) &&
    isRepeatValid;

  return (
    <>
      <div className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto px-1">
        <div className="space-y-3">
          <Label>Assign to</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={assigneeMode === "team" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAssigneeModeChange("team")}
              disabled={isSubmitting}
            >
              <Users className="size-4" />
              Team
            </Button>
            <Button
              type="button"
              variant={assigneeMode === "member" ? "default" : "outline"}
              size="sm"
              onClick={() => handleAssigneeModeChange("member")}
              disabled={isSubmitting}
            >
              <UserRound className="size-4" />
              Member
            </Button>
          </div>

          {assigneeMode === "team" ? (
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-between px-3 py-2.5"
              onClick={(event) => openPicker("team", event.currentTarget)}
              disabled={isSubmitting || teams.length === 0}
            >
              <span className="flex min-w-0 items-center gap-2 text-left">
                <Users className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">
                    {selectedTeam?.name ?? "Select team"}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Applies to the whole team
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-between px-3 py-2.5"
              onClick={(event) => openPicker("member", event.currentTarget)}
              disabled={isSubmitting || members.length === 0}
            >
              <span className="flex min-w-0 items-center gap-2 text-left">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">
                    {selectedMember
                      ? getShiftMemberDisplayName(selectedMember)
                      : "Select member"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {selectedMember?.user.email ?? "Single member shift"}
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full justify-between px-3 py-2.5"
            onClick={(event) => openPicker("location", event.currentTarget)}
            disabled={isSubmitting || locations.length === 0}
          >
            <span className="flex min-w-0 items-center gap-2 text-left">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate text-sm">
                  {selectedLocation?.name ?? "Select location"}
                </span>
                {selectedLocation ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {selectedLocation.address}
                  </span>
                ) : null}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift-title">Title</Label>
          <Input
            id="shift-title"
            ref={titleInputRef}
            value={title}
            onChange={(event) => setManualTitle(event.target.value)}
            disabled={isSubmitting}
            placeholder={
              assigneeMode === "member" ? "Caner's shift" : "Team name shift"
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <DatePicker
            value={shiftDateKey}
            open={datePickerOpen}
            onOpenChange={(open) => handlePickerOpenChange("date", open)}
            disabled={isSubmitting}
            showIcon
            onChange={(next) => {
              setShiftDateKey(next);
              setDayOfMonth(String(Number.parseInt(next.slice(8, 10), 10)));
            }}
          />
          {selectedLocation ? (
            <p className="text-xs text-muted-foreground">
              Times use {selectedLocation.timezone}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shift-start-time">Start time</Label>
            <Input
              id="shift-start-time"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift-end-time">End time</Label>
            <Input
              id="shift-end-time"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-sm border border-border/50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label htmlFor="repeating-shift">Repeating shift</Label>
              <p className="text-xs text-muted-foreground">
                Create additional copies based on a schedule.
              </p>
            </div>
            <Switch
              id="repeating-shift"
              checked={isRepeating}
              onCheckedChange={(checked) => {
                setIsRepeating(checked);

                if (checked && repeatOn.length === 0) {
                  const weekday = parseDateKey(shiftDateKey).getDay();
                  setRepeatOn([weekday]);
                }

                if (checked) {
                  setDayOfMonth(
                    String(Number.parseInt(shiftDateKey.slice(8, 10), 10))
                  );
                }
              }}
              disabled={isSubmitting}
            />
          </div>

          {isRepeating ? (
            <div className="space-y-3 border-t border-border/50 pt-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Repeat</Label>
                  <Select
                    items={REPEAT_FREQUENCY_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={repeatFrequency}
                    onValueChange={(value) => {
                      if (
                        value === "daily" ||
                        value === "weekly" ||
                        value === "monthly"
                      ) {
                        setRepeatFrequency(value);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPEAT_FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift-repeat-times">Repeat times</Label>
                  <Input
                    id="shift-repeat-times"
                    type="number"
                    min={1}
                    step={1}
                    value={repeatTimes}
                    onChange={(event) => setRepeatTimes(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {repeatFrequency === "weekly" ? (
                <div className="space-y-2">
                  <Label>Repeat on</Label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map((day) => {
                      const selected = repeatOn.includes(day.value);

                      return (
                        <Button
                          key={day.value}
                          type="button"
                          size="sm"
                          variant={selected ? "default" : "outline"}
                          onClick={() => toggleRepeatDay(day.value)}
                          disabled={isSubmitting}
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Creates the next matching weekdays after the first shift.
                  </p>
                </div>
              ) : null}

              {repeatFrequency === "monthly" ? (
                <div className="space-y-2">
                  <Label htmlFor="shift-day-of-month">Day of month</Label>
                  <Input
                    id="shift-day-of-month"
                    type="number"
                    min={1}
                    max={31}
                    step={1}
                    value={dayOfMonth}
                    onChange={(event) => setDayOfMonth(event.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shorter months clamp to the last valid day.
                  </p>
                </div>
              ) : null}

              {repeatFrequency === "daily" ? (
                <p className="text-xs text-muted-foreground">
                  Creates the first shift plus this many following days.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift-notes">Notes</Label>
          <textarea
            id="shift-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={isSubmitting}
            placeholder="Optional shift notes"
            rows={3}
            className="flex w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
          />
        </div>

        <div className="space-y-2">
          <Label>Required forms</Label>
          <Button
            type="button"
            variant="outline"
            className="h-auto w-full justify-between px-3 py-2.5"
            onClick={(event) => openPicker("forms", event.currentTarget)}
            disabled={isSubmitting || formTemplates.length === 0}
          >
            <span className="flex min-w-0 items-center gap-2 text-left">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate text-sm">
                  {requiredFormsSummary.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {requiredFormsSummary.subtitle}
                </span>
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Button>
          {formTemplates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No forms available yet.
            </p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Breaks</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {breaks.length === 0
                  ? "Optional paid or unpaid breaks"
                  : `${breaks.length} ${breaks.length === 1 ? "break" : "breaks"}`}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() =>
                setBreaks((current) => [...current, createBreakDraft()])
              }
              disabled={isSubmitting}
            >
              <Plus className="size-4" />
              Add
            </Button>
          </div>

          {breaks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 px-4 py-6 text-center">
              <Coffee className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No breaks added for this shift.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {breaks.map((breakItem, index) => (
                <li
                  key={breakItem.id}
                  className="overflow-hidden rounded-xl bg-muted/35"
                >
                  <div className="flex items-center justify-between gap-3 px-3.5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/15 dark:text-amber-400">
                        <Coffee className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          Break {index + 1}
                        </p>
                        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                          {breakItem.startTime || "--:--"} –{" "}
                          {breakItem.endTime || "--:--"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setBreaks((current) =>
                          current.filter((item) => item.id !== breakItem.id)
                        )
                      }
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove break</span>
                    </Button>
                  </div>

                  <div className="space-y-3 border-t border-border/50 px-3.5 py-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          Start
                        </Label>
                        <Input
                          type="time"
                          value={breakItem.startTime}
                          onChange={(event) => {
                            const nextStartTime = event.target.value;
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? {
                                      ...item,
                                      startTime: nextStartTime,
                                    }
                                  : item
                              )
                            );
                          }}
                          disabled={isSubmitting}
                          className="bg-background/70"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          End
                        </Label>
                        <Input
                          type="time"
                          value={breakItem.endTime}
                          onChange={(event) =>
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? { ...item, endTime: event.target.value }
                                  : item
                              )
                            )
                          }
                          disabled={isSubmitting}
                          className="bg-background/70"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md bg-background/70 px-2.5 py-2 text-sm">
                      <span className="text-muted-foreground">Pay type</span>
                      <div className="flex items-center gap-1 rounded-md bg-muted/60 p-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className={cn(
                            "h-6 px-2 text-xs",
                            !breakItem.isPaid &&
                              "bg-background text-foreground shadow-sm hover:bg-background"
                          )}
                          onClick={() =>
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? { ...item, isPaid: false }
                                  : item
                              )
                            )
                          }
                          disabled={isSubmitting}
                        >
                          Unpaid
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className={cn(
                            "h-6 px-2 text-xs",
                            breakItem.isPaid &&
                              "bg-background text-foreground shadow-sm hover:bg-background"
                          )}
                          onClick={() =>
                            setBreaks((current) =>
                              current.map((item) =>
                                item.id === breakItem.id
                                  ? { ...item, isPaid: true }
                                  : item
                              )
                            )
                          }
                          disabled={isSubmitting}
                        >
                          Paid
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>

      <DialogFooter className="mt-2 sm:items-center sm:justify-between">
        <label
          htmlFor="keep-open-after-create"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Checkbox
            id="keep-open-after-create"
            checked={keepOpenAfterCreate}
            onCheckedChange={(checked) =>
              setKeepOpenAfterCreate(checked === true)
            }
            disabled={isSubmitting}
          />
          Add another after create
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
            {isSubmitting
              ? "Creating..."
              : keepOpenAfterCreate
                ? "Create & continue"
                : "Create shift"}
          </Button>
        </div>
      </DialogFooter>

      <Dialog
        open={teamPickerOpen}
        onOpenChange={(open) => handlePickerOpenChange("team", open)}
        onOpenChangeComplete={(open) =>
          handlePickerOpenChangeComplete("team", open)
        }
      >
        <DialogContent
          className="w-[min(28rem,calc(100vw-2rem))] sm:max-w-md"
          anchor={pickerAnchor}
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            maxWidth: "28rem",
          }}
          initialFocus={false}
          finalFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Select team</DialogTitle>
            <DialogDescription>
              Create a shift for everyone on this team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={teamSearch}
              onChange={(event) => setTeamSearch(event.target.value)}
              placeholder="Search teams..."
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredTeams.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No teams found.
                </p>
              ) : (
                filteredTeams.map((team) => (
                  <PickerListItem
                    key={team.id}
                    title={team.name}
                    subtitle="Whole team"
                    selected={team.id === selectedTeamId}
                    onSelect={() => {
                      setSelectedTeamId(team.id);
                      closePicker();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={memberPickerOpen}
        onOpenChange={(open) => handlePickerOpenChange("member", open)}
        onOpenChangeComplete={(open) =>
          handlePickerOpenChangeComplete("member", open)
        }
      >
        <DialogContent
          className="w-[min(28rem,calc(100vw-2rem))] sm:max-w-md"
          anchor={pickerAnchor}
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            maxWidth: "28rem",
          }}
          initialFocus={false}
          finalFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Select member</DialogTitle>
            <DialogDescription>
              Create a shift for a single organization member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search members..."
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredMembers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No members found.
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <PickerListItem
                    key={member.id}
                    title={getShiftMemberDisplayName(member)}
                    subtitle={
                      member.jobTitle
                        ? `${member.user.email} · ${member.jobTitle}`
                        : member.user.email
                    }
                    selected={member.id === selectedMemberId}
                    onSelect={() => {
                      setSelectedMemberId(member.id);
                      closePicker();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={locationPickerOpen}
        onOpenChange={(open) => handlePickerOpenChange("location", open)}
        onOpenChangeComplete={(open) =>
          handlePickerOpenChangeComplete("location", open)
        }
      >
        <DialogContent
          className="w-[min(28rem,calc(100vw-2rem))] sm:max-w-md"
          anchor={pickerAnchor}
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            maxWidth: "28rem",
          }}
          initialFocus={false}
          finalFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Select location</DialogTitle>
            <DialogDescription>
              Shift times will use the location timezone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
              placeholder="Search locations..."
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredLocations.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No locations found.
                </p>
              ) : (
                filteredLocations.map((location) => (
                  <PickerListItem
                    key={location.id}
                    title={location.name}
                    subtitle={location.address}
                    selected={location.id === selectedLocationId}
                    onSelect={() => {
                      setSelectedLocationId(location.id);
                      closePicker();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={formPickerOpen}
        onOpenChange={(open) => handlePickerOpenChange("forms", open)}
        onOpenChangeComplete={(open) =>
          handlePickerOpenChangeComplete("forms", open)
        }
      >
        <DialogContent
          className="w-[min(28rem,calc(100vw-2rem))] sm:max-w-md"
          anchor={pickerAnchor}
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            maxWidth: "28rem",
          }}
          initialFocus={false}
          finalFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Select required forms</DialogTitle>
            <DialogDescription>
              Choose which forms must be completed for this shift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={formSearch}
              onChange={(event) => setFormSearch(event.target.value)}
              placeholder="Search forms..."
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredFormTemplates.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No forms found.
                </p>
              ) : (
                filteredFormTemplates.map((formTemplate) => (
                  <PickerCheckboxItem
                    key={formTemplate.id}
                    title={formTemplate.name}
                    subtitle={
                      formTemplate.description || `${formTemplate.status} form`
                    }
                    checked={selectedFormTemplateIds.includes(formTemplate.id)}
                    onToggle={() =>
                      toggleFormTemplateSelection(formTemplate.id)
                    }
                  />
                ))
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={closePicker}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ShiftCreateDialogProps {
  organizationId: string;
  teams: Team[];
  members: OrganizationMember[];
  locations: Location[];
  formTemplates: FormTemplate[];
  isLoading?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftCreated?: () => void;
}

export function ShiftCreateDialog({
  organizationId,
  teams,
  members,
  locations,
  formTemplates,
  isLoading = false,
  open,
  onOpenChange,
  onShiftCreated,
}: ShiftCreateDialogProps) {
  const canCreate =
    teams.length > 0 && members.length > 0 && locations.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New shift</DialogTitle>
          <DialogDescription>
            Schedule a shift for a team or a specific member.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Loading teams, members, and forms...
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        ) : !canCreate ? (
          <div className="space-y-4">
            <div className="rounded-sm bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Building2 className="mt-0.5 size-4 shrink-0" />
                Add at least one team, organization member, and location before
                creating shifts.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <ShiftCreateForm
            key={`${organizationId}-${open ? "open" : "closed"}`}
            organizationId={organizationId}
            teams={teams}
            members={members}
            locations={locations}
            formTemplates={formTemplates}
            onCancel={() => onOpenChange(false)}
            onCreated={() => onOpenChange(false)}
            onShiftCreated={onShiftCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
