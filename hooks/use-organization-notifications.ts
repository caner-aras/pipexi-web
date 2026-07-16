"use client";

import { useCallback, useEffect, useState } from "react";

import type { Notification } from "@/types/notification";

export function useOrganizationNotifications(organizationId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

    async function loadNotifications() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/notifications?organizationId=${encodeURIComponent(organizationId!)}`
        );
        const body = (await response.json()) as {
          data?: Notification[];
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load notifications.");
        }

        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId!);
        setNotifications(body.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId!);
        setNotifications([]);
        setError(
          err instanceof Error ? err.message : "Failed to load notifications."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [organizationId, refreshKey]);

  const isCurrentOrganization = loadedOrganizationId === organizationId;

  return {
    notifications:
      organizationId && isCurrentOrganization ? notifications : [],
    isLoading:
      Boolean(organizationId) && (!isCurrentOrganization || isLoading),
    error: organizationId && isCurrentOrganization ? error : null,
    refetch,
  };
}
