import "server-only";

import { BackendApiError, backendFetch } from "@/lib/server/api-client";
import type {
  CreateTaskCommentInput,
  CreateTaskInput,
  TeamMemberTask,
  UpdateTaskInput,
  WorkTaskComment,
} from "@/types/team-member-task";

export async function createTask(input: CreateTaskInput): Promise<TeamMemberTask> {
  return backendFetch<TeamMemberTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTask(
  organizationId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<TeamMemberTask> {
  return backendFetch<TeamMemberTask>(
    `/organizations/${organizationId}/tasks/${taskId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function getCurrentUserTasks(
  organizationId: string
): Promise<TeamMemberTask[]> {
  const params = new URLSearchParams({ organizationId });

  return backendFetch<TeamMemberTask[]>(`/tasks/me?${params.toString()}`);
}

export async function getTaskById(taskId: string): Promise<TeamMemberTask> {
  const data = await backendFetch<TeamMemberTask | TeamMemberTask[]>(
    `/tasks/${taskId}`
  );

  // Backend currently returns a single-item array for task-by-id.
  const task = Array.isArray(data) ? data[0] : data;

  if (!task) {
    throw new BackendApiError("Task not found.", 404);
  }

  return task;
}

export async function getTaskComments(
  taskId: string
): Promise<WorkTaskComment[]> {
  return backendFetch<WorkTaskComment[]>(`/tasks/${taskId}/comments`);
}

export async function createTaskComment(
  input: CreateTaskCommentInput
): Promise<WorkTaskComment> {
  return backendFetch<WorkTaskComment>("/tasks/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
