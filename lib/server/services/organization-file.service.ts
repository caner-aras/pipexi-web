import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  OrganizationFile,
  OrganizationFileInput,
} from "@/types/organization-file";

export async function getOrganizationFiles(
  organizationId: string
): Promise<OrganizationFile[]> {
  return backendFetch<OrganizationFile[]>(
    `/organizations/${organizationId}/files`
  );
}

export async function createOrganizationFile(
  organizationId: string,
  input: OrganizationFileInput
): Promise<OrganizationFile> {
  return backendFetch<OrganizationFile>(
    `/organizations/${organizationId}/files`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateOrganizationFile(
  organizationId: string,
  fileId: string,
  input: OrganizationFileInput
): Promise<OrganizationFile> {
  return backendFetch<OrganizationFile>(
    `/organizations/${organizationId}/files/${fileId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}
