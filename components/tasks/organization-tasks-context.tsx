"use client";

import { createContext, useContext, useMemo } from "react";

import { useOrganization } from "@/components/layout/organization-provider";
import { useOrganizationTasks } from "@/hooks/use-organization-tasks";
import type { WorkTask } from "@/types/team-member-task";

interface OrganizationTasksContextValue {
  organizationId: string | null;
  organizationName: string | null;
  tasks: WorkTask[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const OrganizationTasksContext =
  createContext<OrganizationTasksContextValue | null>(null);

export function OrganizationTasksProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedOrganization, selectedOrganizationId } = useOrganization();
  const { tasks, isLoading, error, refetch } = useOrganizationTasks(
    selectedOrganizationId
  );

  const value = useMemo(
    () => ({
      organizationId: selectedOrganizationId,
      organizationName: selectedOrganization?.name ?? null,
      tasks,
      isLoading,
      error,
      refetch,
    }),
    [
      error,
      isLoading,
      refetch,
      selectedOrganization?.name,
      selectedOrganizationId,
      tasks,
    ]
  );

  return (
    <OrganizationTasksContext.Provider value={value}>
      {children}
    </OrganizationTasksContext.Provider>
  );
}

export function useOrganizationTasksContext() {
  const context = useContext(OrganizationTasksContext);

  if (!context) {
    throw new Error(
      "useOrganizationTasksContext must be used within OrganizationTasksProvider."
    );
  }

  return context;
}
