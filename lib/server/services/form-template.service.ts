import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  FormTemplate,
  FormTemplateField,
  FormTemplateFieldInput,
  FormTemplateInput,
} from "@/types/form-template";

export async function getOrganizationFormTemplates(
  organizationId: string
): Promise<FormTemplate[]> {
  return backendFetch<FormTemplate[]>(
    `/organizations/${organizationId}/form-templates`
  );
}

export async function createOrganizationFormTemplate(
  organizationId: string,
  input: FormTemplateInput
): Promise<FormTemplate> {
  return backendFetch<FormTemplate>(
    `/organizations/${organizationId}/form-templates`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateOrganizationFormTemplate(
  organizationId: string,
  formTemplateId: string,
  input: FormTemplateInput
): Promise<FormTemplate> {
  return backendFetch<FormTemplate>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteOrganizationFormTemplate(
  organizationId: string,
  formTemplateId: string
): Promise<boolean> {
  return backendFetch<boolean>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getOrganizationFormTemplate(
  organizationId: string,
  formTemplateId: string
): Promise<FormTemplate> {
  return backendFetch<FormTemplate>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}`
  );
}

export async function createOrganizationFormTemplateField(
  organizationId: string,
  formTemplateId: string,
  input: FormTemplateFieldInput
): Promise<FormTemplateField> {
  return backendFetch<FormTemplateField>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}/fields`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateOrganizationFormTemplateField(
  organizationId: string,
  formTemplateId: string,
  fieldId: string,
  input: FormTemplateFieldInput
): Promise<FormTemplateField> {
  return backendFetch<FormTemplateField>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}/fields/${fieldId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteOrganizationFormTemplateField(
  organizationId: string,
  formTemplateId: string,
  fieldId: string
): Promise<boolean> {
  return backendFetch<boolean>(
    `/organizations/${organizationId}/form-templates/${formTemplateId}/fields/${fieldId}`,
    {
      method: "DELETE",
    }
  );
}
