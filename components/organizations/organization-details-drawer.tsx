"use client";

import { useEffect, useState } from "react";

import { OrganizationDrawer } from "@/components/organizations/organization-drawer";
import type { Organization } from "@/types/auth";

interface OrganizationDetailsDrawerProps {
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationDetailsDrawer({
  organizationId,
  open,
  onOpenChange,
}: OrganizationDetailsDrawerProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !organizationId) {
      return;
    }

    let cancelled = false;

    async function loadOrganization() {
      setIsLoading(true);
      setError(null);
      setOrganization(null);

      try {
        const response = await fetch(`/api/organizations/${organizationId}`);
        const body = (await response.json()) as {
          data?: Organization;
          message?: string;
        };

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setError(body.message ?? "Failed to load organization.");
          return;
        }

        setOrganization(body.data ?? null);
      } catch {
        if (!cancelled) {
          setError("Failed to load organization.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [open, organizationId]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setOrganization(null);
      setError(null);
      setIsLoading(false);
    }
  }

  if (!organizationId) {
    return null;
  }

  return (
    <OrganizationDrawer
      organization={organization}
      open={open}
      onOpenChange={handleOpenChange}
      loading={isLoading}
      error={error}
    />
  );
}
