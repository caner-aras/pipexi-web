import "server-only";

import { cookies } from "next/headers";

import { SELECTED_ORGANIZATION_COOKIE } from "@/types/organization";
import type { Organization } from "@/types/auth";

export async function getSelectedOrganizationIdFromCookie(): Promise<
  string | null
> {
  const cookieStore = await cookies();
  return cookieStore.get(SELECTED_ORGANIZATION_COOKIE)?.value ?? null;
}

export function resolveSelectedOrganizationId(
  organizations: Organization[],
  cookieOrganizationId: string | null
): string | null {
  if (organizations.length === 0) {
    return null;
  }

  if (
    cookieOrganizationId &&
    organizations.some((organization) => organization.id === cookieOrganizationId)
  ) {
    return cookieOrganizationId;
  }

  return organizations[0].id;
}

export async function getSelectedOrganizationId(
  organizations: Organization[]
): Promise<string | null> {
  const cookieOrganizationId = await getSelectedOrganizationIdFromCookie();
  return resolveSelectedOrganizationId(organizations, cookieOrganizationId);
}

export async function getSelectedOrganization(
  organizations: Organization[]
): Promise<Organization | null> {
  const selectedOrganizationId = await getSelectedOrganizationId(organizations);

  if (!selectedOrganizationId) {
    return null;
  }

  return (
    organizations.find(
      (organization) => organization.id === selectedOrganizationId
    ) ?? null
  );
}
