export interface ShiftFormTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  isFilled: boolean;
}
