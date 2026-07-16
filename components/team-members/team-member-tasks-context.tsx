"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

import {
  extractTeamMemberIdFromPath,
  useTeamMemberTasks,
} from "@/hooks/use-team-member-tasks";
import type { TeamMemberTask } from "@/types/team-member-task";

interface TeamMemberTasksContextValue {
  teamMemberId: string | null;
  tasks: TeamMemberTask[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const TeamMemberTasksContext = createContext<TeamMemberTasksContextValue | null>(
  null
);

export function TeamMemberTasksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const teamMemberId = extractTeamMemberIdFromPath(pathname);
  const isMemberTasksPage = /\/team-members\/[^/]+\/tasks(?:\/|$)/.test(
    pathname
  );
  const { tasks, isLoading, error, refetch } = useTeamMemberTasks(
    isMemberTasksPage ? null : teamMemberId
  );

  const value = useMemo(
    () => ({
      teamMemberId,
      tasks,
      isLoading,
      error,
      refetch,
    }),
    [error, isLoading, refetch, tasks, teamMemberId]
  );

  return (
    <TeamMemberTasksContext.Provider value={value}>
      {children}
    </TeamMemberTasksContext.Provider>
  );
}

export function useTeamMemberTasksContext() {
  const context = useContext(TeamMemberTasksContext);

  if (!context) {
    throw new Error(
      "useTeamMemberTasksContext must be used within TeamMemberTasksProvider."
    );
  }

  return context;
}
