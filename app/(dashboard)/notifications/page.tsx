import { NotificationsPageContent } from "@/components/notifications/notifications-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { listNotifications } from "@/lib/server/services/notification.service";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { OrganizationMember } from "@/types/member";
import type { Notification } from "@/types/notification";

export default async function NotificationsPage() {
  let notifications: Notification[] = [];
  let members: OrganizationMember[] = [];
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
      const [loadedNotifications, loadedMembers] = await Promise.all([
        listNotifications(selectedOrganization.id),
        getOrganizationMembers(selectedOrganization.id),
      ]);
      notifications = loadedNotifications;
      members = loadedMembers;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load notifications.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Notifications"
        description="Select an organization to view its notifications."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <NotificationsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          notifications={notifications}
          members={members}
          error={error}
        />
      ) : null}
    </div>
  );
}
