"use client";

import { useCallback, useEffect, useState } from "react";

import type { TeamMemberTask } from "@/types/team-member-task";

export function extractTeamMemberIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/team-members\/([^/]+)/);
  return match?.[1] ?? null;
}

export function useTeamMemberTasks(teamMemberId: string | null) {
  const [tasks, setTasks] = useState<TeamMemberTask[]>([]);
  const [loadedMemberId, setLoadedMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!teamMemberId) {
      return;
    }

    let active = true;

    async function loadTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/teams/members/${teamMemberId}/tasks`);
        const body = (await response.json()) as {
          data?: TeamMemberTask[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load tasks.");
        }

        if (!active) {
          return;
        }

        setLoadedMemberId(teamMemberId);
        setTasks(body.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        setLoadedMemberId(teamMemberId);
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
  }, [refreshKey, teamMemberId]);

  const isCurrentMember = loadedMemberId === teamMemberId;

  return {
    tasks: teamMemberId && isCurrentMember ? tasks : [],
    isLoading: Boolean(teamMemberId) && (!isCurrentMember || isLoading),
    error: teamMemberId && isCurrentMember ? error : null,
    refetch,
  };
}
