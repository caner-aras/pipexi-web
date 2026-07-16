"use client";

import { CalendarClock, CheckSquare, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CreateTaskDialog } from "@/components/team-members/team-member-tasks-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type {
  WorkTask,
  WorkTaskPriority,
  WorkTaskStatus,
} from "@/types/team-member-task";
import {
  WORK_TASK_STATUSES,
  formatWorkTaskLabel,
  normalizeWorkTaskStatus,
} from "@/types/team-member-task";

interface OrganizationTasksPageContentProps {
  organizationId: string;
  organizationName: string | null;
  tasks: WorkTask[];
  assignableMembers: TeamMember[];
  error: string | null;
}

const STATUS_COLUMNS: Array<{
  status: WorkTaskStatus;
  title: string;
}> = WORK_TASK_STATUSES.map((status) => ({
  status,
  title: formatWorkTaskLabel(status),
}));

function formatTaskDueAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function isTaskOverdue(task: WorkTask): boolean {
  const status = normalizeWorkTaskStatus(String(task.status));

  if (!task.dueAt || status === "done" || status === "canceled") {
    return false;
  }

  return new Date(task.dueAt).getTime() < Date.now();
}

function getPriorityBadgeVariant(
  priority: WorkTaskPriority | string
): "default" | "secondary" | "outline" | "destructive" {
  if (priority === "urgent" || priority === "high") {
    return "destructive";
  }

  if (priority === "medium") {
    return "default";
  }

  return "secondary";
}

function getPriorityDotClass(priority: WorkTaskPriority | string): string {
  if (priority === "urgent") {
    return "bg-destructive";
  }

  if (priority === "high") {
    return "bg-orange-500";
  }

  if (priority === "medium") {
    return "bg-amber-500";
  }

  return "bg-muted-foreground/40";
}

function OrganizationTaskCard({
  task,
  assignableMembers,
}: {
  task: WorkTask;
  assignableMembers: TeamMember[];
}) {
  const overdue = isTaskOverdue(task);
  const assignedMember = task.assignedToTeamMemberId
    ? assignableMembers.find(
        (member) => member.id === task.assignedToTeamMemberId
      )
    : null;
  const assignedName = assignedMember
    ? getShiftMemberDisplayName(assignedMember.organizationMember)
    : null;
  const href = task.assignedToTeamMemberId
    ? `/team-members/${task.assignedToTeamMemberId}/tasks/${task.id}`
    : null;

  const content = (
    <>
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            getPriorityDotClass(task.priority)
          )}
        />
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
          {task.title}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={getPriorityBadgeVariant(task.priority)}
          className="font-normal"
        >
          {formatWorkTaskLabel(String(task.priority))}
        </Badge>
      </div>

      {task.dueAt ? (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
            overdue ? "font-medium text-destructive" : "text-muted-foreground"
          )}
        >
          <CalendarClock className="size-3.5 shrink-0" />
          <span>
            {overdue ? "Overdue · " : "Due "}
            {formatTaskDueAt(task.dueAt)}
          </span>
        </div>
      ) : null}

      {assignedName ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">{assignedName}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          <span>Unassigned</span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block space-y-2.5 rounded-sm border border-border/50 bg-background p-3 transition-colors hover:border-border/50 hover:bg-muted/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="block space-y-2.5 rounded-sm border border-border/50 bg-background p-3">
      {content}
    </div>
  );
}

export function OrganizationTasksPageContent({
  organizationId,
  organizationName,
  tasks,
  assignableMembers,
  error,
}: OrganizationTasksPageContentProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      WORK_TASK_STATUSES.map((status) => [status, [] as WorkTask[]])
    ) as Record<WorkTaskStatus, WorkTask[]>;

    for (const task of tasks) {
      const status = normalizeWorkTaskStatus(String(task.status));
      grouped[status].push(task);
    }

    return grouped;
  }, [tasks]);

  return (
    <>
      <PageHeader
        title="Tasks"
        description={
          organizationName
            ? `All tasks for ${organizationName}.`
            : "All tasks for the selected organization."
        }
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        }
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create a task and assign it to a team member."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New task
            </Button>
          }
        />
      ) : (
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STATUS_COLUMNS.map((column) => {
              const columnTasks = tasksByStatus[column.status];

              return (
                <section
                  key={column.status}
                  className="flex min-w-0 flex-col rounded-sm bg-muted/40"
                >
                  <header className="flex items-center justify-between gap-2 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="size-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="font-normal">
                      {columnTasks.length}
                    </Badge>
                  </header>

                  <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-sm border border-dashed border-border/50 px-3 py-8 text-center text-xs text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <OrganizationTaskCard
                          key={task.id}
                          task={task}
                          assignableMembers={assignableMembers}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
        </div>
      )}

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
        defaultAssignedToTeamMemberId={assignableMembers[0]?.id}
        assignableMembers={assignableMembers}
      />
    </>
  );
}
