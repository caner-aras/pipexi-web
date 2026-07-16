import { notFound } from "next/navigation";

import { FormTemplateDetailContent } from "@/components/forms/form-template-detail-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationFormTemplate } from "@/lib/server/services/form-template.service";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { FormTemplate } from "@/types/form-template";

interface FormTemplateDetailPageProps {
  params: Promise<{ formTemplateId: string }>;
}

export default async function FormTemplateDetailPage({
  params,
}: FormTemplateDetailPageProps) {
  const { formTemplateId } = await params;
  let formTemplate: FormTemplate | null = null;
  let error: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      formTemplate = await getOrganizationFormTemplate(
        selectedOrganization.id,
        formTemplateId
      );
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      if (err.statusCode === 404) {
        notFound();
      }

      error = err.message;
    } else {
      error = "Failed to load form template.";
    }
  }

  if (noOrganization) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader
          title="Form"
          description="Select an organization to view form template details."
        />
      </div>
    );
  }

  if (!formTemplate && !error) {
    notFound();
  }

  if (!formTemplate) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <PageHeader title="Form" description="Form template details." />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <FormTemplateDetailContent formTemplate={formTemplate} error={error} />
    </div>
  );
}
