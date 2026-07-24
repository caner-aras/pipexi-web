export interface Position {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  defaultHourlyRate: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreatePositionInput {
  organizationId: string;
  title: string;
  defaultHourlyRate: number;
  description?: string | null;
}

export interface UpdatePositionInput {
  title?: string;
  defaultHourlyRate?: number;
  description?: string | null;
  status?: string;
}
