import type { FormTemplateField } from "@/types/form-template";
import type { OrganizationMember } from "@/types/member";

export interface FormSubmissionAnswer {
  id: string;
  formSubmissionId: string;
  formFieldId: string;
  formField: FormTemplateField;
  value: string;
  fileId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  file: unknown | null;
}

export interface FormSubmission {
  id: string;
  organizationId: string;
  formTemplateId: string;
  submittedByMemberId: string;
  submittedByMember: OrganizationMember;
  taskId: string | null;
  shiftId: string | null;
  submittedAt: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  answers: FormSubmissionAnswer[];
}

export interface CreateFormSubmissionAnswerInput {
  formFieldId: string;
  value: string;
  fileId?: string;
}

export interface CreateFormSubmissionInput {
  formTemplateId: string;
  submittedByMemberId: string;
  taskId?: string;
  shiftId?: string;
  submittedAt: string;
  answers: CreateFormSubmissionAnswerInput[];
}
