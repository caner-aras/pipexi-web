"use client";

import { useState } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { TaskDrawer, TasksTrigger } from "@/components/tasks/task-drawer";
import { useOrganizationTasks } from "@/hooks/use-organization-tasks";

export function OrganizationTasksHeaderAction() {
  const [open, setOpen] = useState(false);
  const { selectedOrganization, selectedOrganizationId } = useOrganization();
  const { tasks, isLoading, error } = useOrganizationTasks(
    selectedOrganizationId,
    { enabled: open }
  );

  if (!selectedOrganizationId) {
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
          selectedOrganization?.name
            ? `${selectedOrganization.name} · ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`
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
