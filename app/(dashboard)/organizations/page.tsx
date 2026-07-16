import { OrganizationsPageContent } from "@/components/organizations/organizations-page-content";
import { BackendApiError } from "@/lib/server/api-client";
import { getOrganizations } from "@/lib/server/services/organization.service";
import type { Organization } from "@/types/auth";

export default async function OrganizationsPage() {
  let organizations: Organization[] = [];
  let error: string | null = null;

  try {
    organizations = await getOrganizations();
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load organizations.";
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <OrganizationsPageContent organizations={organizations} error={error} />
    </div>
  );
}
