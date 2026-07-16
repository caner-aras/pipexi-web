import { PermissionsPageContent } from "@/components/permissions/permissions-page-content";
import { PageHeader } from "@/components/layout/page-header";
import { BackendApiError } from "@/lib/server/api-client";
import { getPermissions } from "@/lib/server/services/permission.service";
import type { Permission } from "@/types/permission";

export default async function SettingsPermissionsPage() {
  let permissions: Permission[] = [];
  let error: string | null = null;

  try {
    permissions = await getPermissions();
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load permissions.";
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PermissionsPageContent permissions={permissions} error={error} />
    </div>
  );
}
