import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreateFormSubmissionInput,
  FormSubmission,
} from "@/types/form-submission";

export async function getOrganizationFormSubmissions(
  organizationId: string,
  formTemplateId: string
): Promise<FormSubmission[]> {
  const query = new URLSearchParams({ formTemplateId });

  return backendFetch<FormSubmission[]>(
    `/organizations/${organizationId}/form-submissions?${query.toString()}`
  );
}

export async function createOrganizationFormSubmission(
  organizationId: string,
  input: CreateFormSubmissionInput
): Promise<FormSubmission> {
  return backendFetch<FormSubmission>(
    `/organizations/${organizationId}/form-submissions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteOrganizationFormSubmission(
  organizationId: string,
  formSubmissionId: string
): Promise<boolean> {
  return backendFetch<boolean>(
    `/organizations/${organizationId}/form-submissions/${formSubmissionId}`,
    {
      method: "DELETE",
    }
  );
}

export async function deleteOrganizationFormAnswer(
  organizationId: string,
  formSubmissionId: string,
  formAnswerId: string
): Promise<boolean> {
  return backendFetch<boolean>(
    `/organizations/${organizationId}/form-submissions/${formSubmissionId}/answers/${formAnswerId}`,
    {
      method: "DELETE",
    }
  );
}
