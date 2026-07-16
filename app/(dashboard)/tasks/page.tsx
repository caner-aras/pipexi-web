import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { OrganizationTasksPageContent } from "@/components/tasks/organization-tasks-page-content";
import { BackendApiError } from "@/lib/server/api-client";
import {
  getOrganizations,
  getOrganizationTasks,
  getOrganizationTeamMembers,
  getOrganizationTeams,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import { redirectIfUnauthorized } from "@/lib/server/redirect-if-unauthorized";
import type { TeamMember } from "@/types/team";
import type { WorkTask } from "@/types/team-member-task";

export default async function TasksPage() {
  let tasks: WorkTask[] = [];
  let assignableMembers: TeamMember[] = [];
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

      const [organizationTasks, teams] = await Promise.all([
        getOrganizationTasks(selectedOrganization.id),
        getOrganizationTeams(selectedOrganization.id),
      ]);

      tasks = organizationTasks;

      const membersByTeam = await Promise.all(
        teams.map((team) =>
          getOrganizationTeamMembers(selectedOrganization.id, team.id)
        )
      );
      assignableMembers = membersByTeam.flat();
    }
  } catch (err) {
    redirectIfUnauthorized(err);

    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load tasks.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Tasks"
        description="Select an organization to view its tasks."
      />
    );
  }

  return (
    <div className="flex min-w-0 w-full flex-col gap-6 overflow-x-hidden p-6">
      {selectedOrganizationId ? (
        <OrganizationTasksPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          tasks={tasks}
          assignableMembers={assignableMembers}
          error={error}
        />
      ) : null}
    </div>
  );
}
