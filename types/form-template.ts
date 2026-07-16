export interface FormTemplateField {
  id: string;
  formTemplateId: string;
  type: string;
  label: string;
  isRequired: boolean;
  sortOrder: number;
  optionsJson: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface FormTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  fields: FormTemplateField[];
}

export interface FormTemplateInput {
  name: string;
  description: string;
}

export interface FormTemplateFieldInput {
  type: string;
  label: string;
  isRequired: boolean;
  sortOrder: number;
  optionsJson: string | null;
}

/** @deprecated Use FormTemplateFieldInput */
export type CreateFormTemplateFieldInput = FormTemplateFieldInput;
