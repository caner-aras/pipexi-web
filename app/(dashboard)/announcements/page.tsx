import { AnnouncementsPageContent } from "@/components/announcements/announcements-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { listAnnouncements } from "@/lib/server/services/announcement.service";
import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { Announcement } from "@/types/announcement";

export default async function AnnouncementsPage() {
  let announcements: Announcement[] = [];
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
      announcements = await listAnnouncements(selectedOrganization.id);
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load announcements.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Announcements"
        description="Select an organization to view its announcements."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <AnnouncementsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          announcements={announcements}
          error={error}
        />
      ) : null}
    </div>
  );
}
