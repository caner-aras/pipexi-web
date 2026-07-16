import { FormsPageContent } from "@/components/forms/forms-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationFormTemplates } from "@/lib/server/services/form-template.service";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { FormTemplate } from "@/types/form-template";

export default async function FormsPage() {
  let formTemplates: FormTemplate[] = [];
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let selectedOrganizationName: string | null = null;
  let noOrganization = false;

  try {
    const organizations = await getOrganizations();
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      selectedOrganizationName = selectedOrganization.name;
      formTemplates = await getOrganizationFormTemplates(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load form templates.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Forms"
        description="Select an organization to view its form templates."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <FormsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          formTemplates={formTemplates}
          error={error}
        />
      ) : null}
    </div>
  );
}
