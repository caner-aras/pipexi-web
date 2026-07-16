import { AuditLogsPageContent } from "@/components/audit-logs/audit-logs-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { listAuditLogs } from "@/lib/server/services/audit-log.service";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import type { AuditLog } from "@/types/audit-log";
import type { OrganizationMember } from "@/types/member";

export default async function AuditLogsPage() {
  let auditLogs: AuditLog[] = [];
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
      const [loadedAuditLogs, loadedMembers] = await Promise.all([
        listAuditLogs(selectedOrganization.id),
        getOrganizationMembers(selectedOrganization.id),
      ]);
      auditLogs = loadedAuditLogs;
      members = loadedMembers;
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load audit logs.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Audit Logs"
        description="Select an organization to view its audit history."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      {selectedOrganizationId ? (
        <AuditLogsPageContent
          organizationId={selectedOrganizationId}
          organizationName={selectedOrganizationName}
          auditLogs={auditLogs}
          members={members}
          error={error}
        />
      ) : null}
    </div>
  );
}
