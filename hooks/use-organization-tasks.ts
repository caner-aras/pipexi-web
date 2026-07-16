"use client";

import { useCallback, useEffect, useState } from "react";

import type { WorkTask } from "@/types/team-member-task";

export function useOrganizationTasks(organizationId: string | null) {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [loadedOrganizationId, setLoadedOrganizationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    let active = true;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/organizations/${organizationId}/tasks`
        );
        const body = (await response.json()) as {
          data?: WorkTask[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load tasks.");
        }

        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId);
        setTasks(body.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId);
        setTasks([]);
        setError(
          err instanceof Error ? err.message : "Failed to load tasks."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      active = false;
    };
  }, [organizationId, refreshKey]);

  const isCurrentOrganization = loadedOrganizationId === organizationId;

  return {
    tasks: organizationId && isCurrentOrganization ? tasks : [],
    isLoading: Boolean(organizationId) && (!isCurrentOrganization || isLoading),
    error: organizationId && isCurrentOrganization ? error : null,
    refetch,
  };
}
