"use client";

import { useState } from "react";

import { TaskDrawer, TasksTrigger } from "@/components/tasks/task-drawer";
import { useTeamMemberTasksContext } from "@/components/team-members/team-member-tasks-context";

interface TeamMemberTasksPanelProps {
  memberName: string;
}

export function TeamMemberTasksPanel({ memberName }: TeamMemberTasksPanelProps) {
  const [open, setOpen] = useState(false);
  const { teamMemberId, tasks, isLoading, error } = useTeamMemberTasksContext();

  if (!teamMemberId) {
    return null;
  }

  return (
    <>
      <TasksTrigger
        label="Member tasks"
        taskCount={tasks.length}
        onClick={() => setOpen(true)}
      />
      <TaskDrawer
        title="Member tasks"
        subtitle={`${memberName} · ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} assigned`}
        emptyTitle="No assigned tasks"
        emptyDescription="Tasks assigned to this member will appear here."
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
