"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ShiftCreateDialog } from "@/components/shifts/shift-create-dialog";
import { ShiftsView } from "@/components/shifts/shifts-view";
import { TimeEntryCreateDialog } from "@/components/time-entries/time-entry-create-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { toFromDateIso } from "@/lib/date-format";
import type { FormTemplate } from "@/types/form-template";
import type { Location } from "@/types/location";
import type { OrganizationMember } from "@/types/member";
import type { ShiftFormTemplate } from "@/types/shift-form-template";
import type { Shift } from "@/types/shift";
import type { Team } from "@/types/team";

interface ShiftCreateOptions {
  teams: Team[];
  members: OrganizationMember[];
  formTemplates: FormTemplate[];
}

interface ShiftsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  initialFromDateKey: string;
  shifts: Shift[];
  locations: Location[];
  error: string | null;
}

export function ShiftsPageContent({
  organizationId,
  organizationName,
  initialFromDateKey,
  shifts: initialShifts,
  locations: initialLocations,
  error: initialError,
}: ShiftsPageContentProps) {
  const [fromDateKey, setFromDateKey] = useState(initialFromDateKey);
  const [shifts, setShifts] = useState(initialShifts);
  const [locations, setLocations] = useState(initialLocations);
  const [shiftsError, setShiftsError] = useState<string | null>(null);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createOptions, setCreateOptions] = useState<ShiftCreateOptions | null>(
    null
  );
  const [createOptionsLoading, setCreateOptionsLoading] = useState(false);
  const [createOptionsError, setCreateOptionsError] = useState<string | null>(
    null
  );
  const [timeEntryDialogOpen, setTimeEntryDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftFormTemplates, setShiftFormTemplates] = useState<
    ShiftFormTemplate[]
  >([]);
  const [shiftFormsLoading, setShiftFormsLoading] = useState(false);
  const [shiftFormsError, setShiftFormsError] = useState<string | null>(null);
  const [teamMemberIdByKey, setTeamMemberIdByKey] = useState<
    Record<string, string>
  >({});
  const [teamMemberIdByOrganizationMemberId, setTeamMemberIdByOrganizationMemberId] =
    useState<Record<string, string>>({});

  const loadShifts = useCallback(
    async (nextFromDateKey: string) => {
      setShiftsLoading(true);
      setShiftsError(null);

      try {
        const fromDate = toFromDateIso(nextFromDateKey);
        const response = await fetch(
          `/api/organizations/${organizationId}/shifts?fromDate=${encodeURIComponent(fromDate)}`
        );
        const body = (await response.json()) as {
          data?: { shifts: Shift[]; locations: Location[] };
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load shifts.");
        }

        setShifts(body.data?.shifts ?? []);
        setLocations(body.data?.locations ?? []);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load shifts.";
        setShiftsError(message);
      } finally {
        setShiftsLoading(false);
      }
    },
    [organizationId]
  );

  const loadCreateOptions = useCallback(async () => {
    if (createOptions || createOptionsLoading) {
      return createOptions;
    }

    setCreateOptionsLoading(true);
    setCreateOptionsError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/shift-create-options`
      );
      const body = (await response.json()) as {
        data?: ShiftCreateOptions;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(body.message ?? "Failed to load shift create options.");
      }

      const options = body.data ?? {
        teams: [],
        members: [],
        formTemplates: [],
      };
      setCreateOptions(options);
      return options;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load shift create options.";
      setCreateOptionsError(message);
      return null;
    } finally {
      setCreateOptionsLoading(false);
    }
  }, [createOptions, createOptionsLoading, organizationId]);

  useEffect(() => {
    let cancelled = false;

    async function loadTeamMemberLookups() {
      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/team-member-lookups`
        );
        const body = (await response.json()) as {
          data?: {
            teamMemberIdByKey: Record<string, string>;
            teamMemberIdByOrganizationMemberId: Record<string, string>;
          };
        };

        if (!response.ok || !body.data || cancelled) {
          return;
        }

        setTeamMemberIdByKey(body.data.teamMemberIdByKey);
        setTeamMemberIdByOrganizationMemberId(
          body.data.teamMemberIdByOrganizationMemberId
        );
      } catch {
        // Member profile links are optional; ignore background lookup failures.
      }
    }

    void loadTeamMemberLookups();

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  function handleFromDateChange(nextFromDateKey: string) {
    setFromDateKey(nextFromDateKey);
    void loadShifts(nextFromDateKey);
  }

  async function handleOpenCreateDialog() {
    setCreateDialogOpen(true);
    await loadCreateOptions();
  }

  async function loadShiftFormTemplates(shiftId: string) {
    setShiftFormsLoading(true);
    setShiftFormsError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/shifts/${shiftId}/form-templates`
      );
      const body = (await response.json()) as {
        data?: ShiftFormTemplate[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(body.message ?? "Failed to load required forms.");
      }

      setShiftFormTemplates(body.data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load required forms.";
      setShiftFormsError(message);
      setShiftFormTemplates([]);
    } finally {
      setShiftFormsLoading(false);
    }
  }

  function handleLogTimeEntry(shift: Shift) {
    setSelectedShift(shift);
    setTimeEntryDialogOpen(true);
    void loadShiftFormTemplates(shift.id);
  }

  function handleRefreshShiftForms() {
    if (!selectedShift) {
      return;
    }

    void loadShiftFormTemplates(selectedShift.id);
  }

  const error = initialError ?? shiftsError;

  return (
    <>
      <PageHeader
        className="shrink-0"
        title="Shifts"
        description={
          organizationName
            ? `Shift schedule and coverage for ${organizationName}.`
            : "Organization shift schedule."
        }
        actions={
          <Button
            size="sm"
            onClick={() => void handleOpenCreateDialog()}
            disabled={locations.length === 0}
          >
            <Plus className="size-4" />
            New shift
          </Button>
        }
      />

      <div className="min-w-0 w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : createOptionsError ? (
          <p className="text-sm text-destructive">{createOptionsError}</p>
        ) : null}

        {!initialError ? (
          <ShiftsView
            shifts={shifts}
            organizationName={organizationName ?? "Organization"}
            fromDateKey={fromDateKey}
            onFromDateChange={handleFromDateChange}
            isLoading={shiftsLoading}
            teamMemberIdByKey={teamMemberIdByKey}
            teamMemberIdByOrganizationMemberId={
              teamMemberIdByOrganizationMemberId
            }
            onLogTimeEntry={handleLogTimeEntry}
          />
        ) : null}
      </div>

      <ShiftCreateDialog
        organizationId={organizationId}
        teams={createOptions?.teams ?? []}
        members={createOptions?.members ?? []}
        locations={locations}
        formTemplates={createOptions?.formTemplates ?? []}
        isLoading={createOptionsLoading && !createOptions}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onShiftCreated={() => {
          void loadShifts(fromDateKey);
        }}
      />

      <TimeEntryCreateDialog
        organizationId={organizationId}
        shift={selectedShift}
        formTemplates={shiftFormTemplates}
        formsLoading={shiftFormsLoading}
        formsError={shiftFormsError}
        onRefreshForms={handleRefreshShiftForms}
        open={timeEntryDialogOpen}
        onOpenChange={setTimeEntryDialogOpen}
      />
    </>
  );
}
