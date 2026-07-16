export interface OrganizationFile {
  id: string;
  organizationId: string;
  fileName: string;
  contentType: string;
  storagePath: string;
  sizeBytes: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface OrganizationFileInput {
  fileName: string;
  contentType: string;
  storagePath: string;
  sizeBytes: number;
}
