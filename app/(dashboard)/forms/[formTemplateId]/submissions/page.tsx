import { notFound } from "next/navigation";

import { FormSubmissionsPageContent } from "@/components/forms/form-submissions-page-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import { getOrganizationFormSubmissions } from "@/lib/server/services/form-submission.service";
import { getOrganizationFormTemplate } from "@/lib/server/services/form-template.service";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getShiftById } from "@/lib/server/services/shift.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { FormSubmission } from "@/types/form-submission";
import type { FormTemplate } from "@/types/form-template";

interface FormSubmissionsPageProps {
  params: Promise<{ formTemplateId: string }>;
  searchParams: Promise<{ shiftId?: string }>;
}

export default async function FormSubmissionsPage({
  params,
  searchParams,
}: FormSubmissionsPageProps) {
  const { formTemplateId } = await params;
  const { shiftId } = await searchParams;
  let formTemplate: FormTemplate | null = null;
  let submissions: FormSubmission[] = [];
  let submittedByMemberId: string | null = null;
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

      const [loadedFormTemplate, loadedSubmissions, members, currentUser] =
        await Promise.all([
          getOrganizationFormTemplate(selectedOrganization.id, formTemplateId),
          getOrganizationFormSubmissions(
            selectedOrganization.id,
            formTemplateId
          ),
          getOrganizationMembers(selectedOrganization.id),
          getCurrentUser(),
        ]);

      formTemplate = loadedFormTemplate;
      submissions = loadedSubmissions;

      submittedByMemberId =
        members.find((member) => member.userId === currentUser.userId)?.id ??
        null;

      if (shiftId) {
        try {
          const linkedShift = await getShiftById(shiftId);
          submittedByMemberId = linkedShift.organizationMemberId;
        } catch {
          // Shift lookup is optional for pre-filling submitter.
        }
      }
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      if (err.statusCode === 404) {
        notFound();
      }

      error = err.message;
    } else {
      error = "Failed to load form submissions.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Submissions"
          description="Select an organization to view form submissions."
        />
      </div>
    );
  }

  if (!formTemplate && !error) {
    notFound();
  }

  if (!formTemplate || !organizationId) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Submissions" description="Form submissions." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <FormSubmissionsPageContent
        organizationId={organizationId}
        formTemplate={formTemplate}
        submissions={submissions}
        submittedByMemberId={submittedByMemberId}
        shiftId={shiftId ?? null}
        autoOpenCreateDialog={Boolean(shiftId)}
        error={error}
      />
    </div>
  );
}
