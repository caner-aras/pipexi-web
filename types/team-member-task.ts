export type WorkTaskPriority = "low" | "medium" | "high" | "urgent";
export type WorkTaskStatus =
  | "open"
  | "in_progress"
  | "blocked"
  | "done"
  | "canceled";

export const WORK_TASK_STATUSES: WorkTaskStatus[] = [
  "open",
  "in_progress",
  "blocked",
  "done",
  "canceled",
];

export const WORK_TASK_PRIORITIES: WorkTaskPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export interface WorkTaskCommentMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface WorkTaskCommentMember {
  teamMemberId: string;
  teamId: string;
  organizationMemberId: string;
  userId: string;
  jobTitle: string | null;
  user: WorkTaskCommentMemberUser | null;
}

export interface WorkTaskComment {
  id: string;
  workTaskId: string;
  teamMemberId: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  member?: WorkTaskCommentMember | null;
}

export interface TeamMemberTask {
  id: string;
  organizationId: string;
  reporterUserId: string | null;
  shiftId: string | null;
  locationId: string | null;
  title: string;
  description: string | null;
  assignedToTeamMemberId: string | null;
  assignedToTeamId: string | null;
  dueAt: string | null;
  priority: WorkTaskPriority;
  status: WorkTaskStatus | string;
  createdAt: string | null;
  updatedAt: string | null;
  comments: WorkTaskComment[];
}

export type WorkTask = TeamMemberTask;

export interface CreateTaskInput {
  organizationId: string;
  title: string;
  description?: string | null;
  assignedToTeamMemberId: string;
  dueAt?: string | null;
  priority?: WorkTaskPriority;
  shiftId?: string | null;
  locationId?: string | null;
  assignedToTeamId?: string | null;
}

export interface UpdateTaskInput {
  shiftId?: string | null;
  locationId?: string | null;
  title: string;
  description?: string | null;
  assignedToTeamMemberId: string;
  assignedToTeamId?: string | null;
  dueAt?: string | null;
  priority: WorkTaskPriority | string;
  status: WorkTaskStatus | string;
}

export interface CreateTaskCommentInput {
  workTaskId: string;
  userId: string;
  message: string;
}

export function normalizeWorkTaskStatus(status: string): WorkTaskStatus {
  const normalized = status.trim().toLowerCase();

  if (normalized === "completed") {
    return "done";
  }

  if (normalized === "cancelled" || normalized === "canceled") {
    return "canceled";
  }

  if (
    normalized === "open" ||
    normalized === "in_progress" ||
    normalized === "blocked" ||
    normalized === "done"
  ) {
    return normalized;
  }

  return "open";
}

export function formatWorkTaskLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
