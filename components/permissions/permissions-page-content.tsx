"use client";

import { PermissionList } from "@/components/permissions/permission-list";
import { PageHeader } from "@/components/layout/page-header";
import type { Permission } from "@/types/permission";

interface PermissionsPageContentProps {
  permissions: Permission[];
  error: string | null;
}

export function PermissionsPageContent({
  permissions,
  error,
}: PermissionsPageContentProps) {
  return (
    <>
      <PageHeader
        title="Permissions"
        description="System permission keys available across the platform."
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <PermissionList permissions={permissions} />
        )}
      </div>
    </>
  );
}
