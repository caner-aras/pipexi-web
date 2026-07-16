import { FilesPageContent } from "@/components/files/files-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizationFiles } from "@/lib/server/services/organization-file.service";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { OrganizationFile } from "@/types/organization-file";

export default async function FilesPage() {
  let files: OrganizationFile[] = [];
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
      files = await getOrganizationFiles(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load files.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Files"
        description="Select an organization to view its files."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <FilesPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          files={files}
          error={error}
        />
      ) : null}
    </div>
  );
}
