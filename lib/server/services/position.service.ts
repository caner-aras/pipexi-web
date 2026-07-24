import "server-only";

import { backendFetch } from "@/lib/server/api-client";
import type {
  CreatePositionInput,
  Position,
  UpdatePositionInput,
} from "@/types/position";

export async function getOrganizationPositions(
  organizationId: string
): Promise<Position[]> {
  return backendFetch<Position[]>(
    `/organizations/${organizationId}/positions`
  );
}

export async function createPosition(
  input: CreatePositionInput
): Promise<Position> {
  return backendFetch<Position>(
    `/organizations/${input.organizationId}/positions`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updatePosition(
  positionId: string,
  input: UpdatePositionInput
): Promise<Position> {
  return backendFetch<Position>(`/positions/${positionId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deletePosition(positionId: string): Promise<boolean> {
  return backendFetch<boolean>(`/positions/${positionId}`, {
    method: "DELETE",
  });
}
