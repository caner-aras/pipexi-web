import { notFound } from "next/navigation";

import { ShiftDetailPageContent } from "@/components/shifts/shift-detail-page-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getShiftById } from "@/lib/server/services/shift.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Shift } from "@/types/shift";

interface ShiftDetailPageProps {
  params: Promise<{ shiftId: string }>;
}

export default async function ShiftDetailPage({ params }: ShiftDetailPageProps) {
  const { shiftId } = await params;
  let shift: Shift | null = null;
  let error: string | null = null;
  let noOrganization = false;
  let organizationId: string | null = null;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      organizationId = selectedOrganization.id;

      const loadedShift = await getShiftById(shiftId);

      if (loadedShift.organizationId !== selectedOrganization.id) {
        notFound();
      }

      shift = loadedShift;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      if (err.statusCode === 404) {
        notFound();
      }

      error = err.message;
    } else {
      error = "Failed to load shift.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Shift"
          description="Select an organization to view shift details."
        />
      </div>
    );
  }

  if (!shift && !error) {
    notFound();
  }

  if (!shift || !organizationId) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Shift" description="Shift details." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <ShiftDetailPageContent
        organizationId={organizationId}
        shift={shift}
        error={error}
      />
    </div>
  );
}
