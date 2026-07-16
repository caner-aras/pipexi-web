import { redirect } from "next/navigation";

import { getOrganizations } from "@/lib/server/services/organization.service";
import { getSelectedOrganization } from "@/lib/server/selected-organization";

export default async function OrganizationMembersIndexRedirectPage() {
  const organizations = await getOrganizations();
  const selectedOrganization = await getSelectedOrganization(organizations);

  if (!selectedOrganization) {
    redirect("/organizations");
  }

  redirect(`/organizations/${selectedOrganization.id}/members`);
}
