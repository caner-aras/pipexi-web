"use client";

import { Plus, Building2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { OrganizationDrawer } from "@/components/organizations/organization-drawer";
import { OrganizationLeaveRequestDialog } from "@/components/organizations/organization-leave-request-dialog";
import { OrganizationList } from "@/components/organizations/organization-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Organization } from "@/types/auth";

interface OrganizationsPageContentProps {
  organizations: Organization[];
  error: string | null;
}

export function OrganizationsPageContent({
  organizations,
  error,
}: OrganizationsPageContentProps) {
  const router = useRouter();
  const { selectedOrganizationId } = useOrganization();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<Organization | null>(null);
  const [createDefaults, setCreateDefaults] = useState<Pick<
    Organization,
    "name" | "slug" | "timezone"
  > | null>(null);
  const [leaveRequestOrganization, setLeaveRequestOrganization] =
    useState<Organization | null>(null);
  const [leaveRequestOpen, setLeaveRequestOpen] = useState(false);

  function handleAddOrganization() {
    setEditingOrganization(null);
    setCreateDefaults(null);
    setDrawerOpen(true);
  }

  function handleEditOrganization(organization: Organization) {
    setCreateDefaults(null);
    setEditingOrganization(organization);
    setDrawerOpen(true);
  }

  function handleDuplicateOrganization(organization: Organization) {
    setEditingOrganization(null);
    setCreateDefaults({
      name: `${organization.name} Copy`,
      slug: `${organization.slug}-copy`,
      timezone: organization.timezone,
    });
    setDrawerOpen(true);
  }

  function handleViewMembers(organization: Organization) {
    router.push(`/organizations/${organization.id}/members`);
  }

  function handleOpenSelectedMembers() {
    if (!selectedOrganizationId) {
      return;
    }

    router.push(`/organizations/${selectedOrganizationId}/members`);
  }

  function handleLeaveRequest(organization: Organization) {
    setLeaveRequestOrganization(organization);
    setLeaveRequestOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingOrganization(null);
      setCreateDefaults(null);
    }
  }

  function handleLeaveRequestOpenChange(open: boolean) {
    setLeaveRequestOpen(open);

    if (!open) {
      setLeaveRequestOrganization(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Organizations"
        description="Manage and view all organizations in your workspace."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenSelectedMembers}
              disabled={!selectedOrganizationId}
            >
              <Users className="size-4" />
              Members
            </Button>
            <Button size="sm" onClick={handleAddOrganization}>
              <Plus className="size-4" />
              New organization
            </Button>
          </div>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : organizations.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No organizations found"
            description="Create your first organization to get started."
            action={
              <Button size="sm" onClick={handleAddOrganization}>
                <Plus className="size-4" />
                New organization
              </Button>
            }
          />
        ) : (
          <OrganizationList
            organizations={organizations}
            onEditOrganization={handleEditOrganization}
            onDuplicateOrganization={handleDuplicateOrganization}
            onViewMembers={handleViewMembers}
            onLeaveRequest={handleLeaveRequest}
          />
        )}
      </div>

      <OrganizationDrawer
        organization={editingOrganization}
        defaults={createDefaults}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />

      <OrganizationLeaveRequestDialog
        organization={leaveRequestOrganization}
        open={leaveRequestOpen}
        onOpenChange={handleLeaveRequestOpenChange}
      />
    </>
  );
}
