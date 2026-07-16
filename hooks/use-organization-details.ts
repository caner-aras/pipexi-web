"use client";

import { useCallback, useEffect, useState } from "react";

import type { Organization } from "@/types/auth";

export function useOrganizationDetails(organizationId: string | null) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadedOrganizationId, setLoadedOrganizationId] = useState<string | null>(
    null
  );
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

    async function loadOrganization() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/organizations/${organizationId}`);
        const body = (await response.json()) as {
          data?: Organization;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load organization.");
        }

        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId);
        setOrganization(body.data ?? null);
      } catch (err) {
        if (!active) {
          return;
        }

        setLoadedOrganizationId(organizationId);
        setOrganization(null);
        setError(
          err instanceof Error ? err.message : "Failed to load organization."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      active = false;
    };
  }, [organizationId, refreshKey]);

  const isCurrentOrganization = loadedOrganizationId === organizationId;

  return {
    organization:
      organizationId && isCurrentOrganization ? organization : null,
    isLoading: Boolean(organizationId) && (!isCurrentOrganization || isLoading),
    error: organizationId && isCurrentOrganization ? error : null,
    refetch,
  };
}
