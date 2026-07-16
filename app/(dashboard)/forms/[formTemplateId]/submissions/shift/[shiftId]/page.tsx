import { notFound } from "next/navigation";

import { ShiftFormSubmissionPageContent } from "@/components/forms/shift-form-submission-page-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationFormSubmissions } from "@/lib/server/services/form-submission.service";
import { getOrganizationFormTemplate } from "@/lib/server/services/form-template.service";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { FormSubmission } from "@/types/form-submission";

interface ShiftFormSubmissionPageProps {
  params: Promise<{
    formTemplateId: string;
    shiftId: string;
  }>;
  searchParams: Promise<{
    name?: string;
  }>;
}

function pickShiftSubmission(
  submissions: FormSubmission[],
  shiftId: string
): FormSubmission | null {
  const normalizedShiftId = shiftId.trim().toLowerCase();
  const matching = submissions
    .filter(
      (submission) =>
        submission.shiftId?.trim().toLowerCase() === normalizedShiftId
    )
    .sort(
      (left, right) =>
        new Date(right.submittedAt).getTime() -
        new Date(left.submittedAt).getTime()
    );

  return matching[0] ?? null;
}

export default async function ShiftFormSubmissionPage({
  params,
  searchParams,
}: ShiftFormSubmissionPageProps) {
  const { formTemplateId, shiftId } = await params;
  const { name: formNameFromQuery } = await searchParams;
  let formTemplateName = formNameFromQuery?.trim() || null;
  let submission: FormSubmission | null = null;
  let error: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      const submissionsPromise = getOrganizationFormSubmissions(
        selectedOrganization.id,
        formTemplateId
      );

      const [submissions, formTemplate] = await Promise.all([
        submissionsPromise,
        formTemplateName
          ? Promise.resolve(null)
          : getOrganizationFormTemplate(
            selectedOrganization.id,
            formTemplateId
          ),
      ]);

      if (!formTemplateName) {
        formTemplateName = formTemplate?.name ?? "Form";
      }

      submission = pickShiftSubmission(submissions ?? [], shiftId);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      if (err.statusCode === 404) {
        notFound();
      }

      error = err.message;
    } else {
      error = "Failed to load form submission.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Form"
          description="Select an organization to view this form."
        />
      </div>
    );
  }

  if (!formTemplateName && !error) {
    notFound();
  }

  if (!formTemplateName) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Form" description="Shift form submission." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <ShiftFormSubmissionPageContent
        shiftId={shiftId}
        formTemplateName={formTemplateName}
        submission={submission}
        error={error}
      />
    </div>
  );
}
