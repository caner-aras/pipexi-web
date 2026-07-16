"use client";

import { useState } from "react";

import { useOrganizationTasksContext } from "@/components/tasks/organization-tasks-context";
import { TaskDrawer, TasksTrigger } from "@/components/tasks/task-drawer";

export function OrganizationTasksHeaderAction() {
  const [open, setOpen] = useState(false);
  const { organizationId, organizationName, tasks, isLoading, error } =
    useOrganizationTasksContext();

  if (!organizationId) {
    return null;
  }

  return (
    <>
      <TasksTrigger
        label="Tasks"
        taskCount={tasks.length}
        size="sm"
        hideWhenEmpty={false}
        onClick={() => setOpen(true)}
      />
      <TaskDrawer
        title="Organization tasks"
        subtitle={
          organizationName
            ? `${organizationName} · ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`
            : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`
        }
        emptyTitle="No tasks"
        emptyDescription="Tasks will appear here."
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        open={open}
        onOpenChange={setOpen}
        getTaskHref={(task) =>
          task.assignedToTeamMemberId
            ? `/team-members/${task.assignedToTeamMemberId}/tasks/${task.id}`
            : null
        }
      />
    </>
  );
}
