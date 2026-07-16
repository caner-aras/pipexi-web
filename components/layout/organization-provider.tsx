"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Organization } from "@/types/auth";

interface OrganizationContextValue {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string) => Promise<void>;
  isUpdating: boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

async function persistSelectedOrganizationId(organizationId: string) {
  const response = await fetch("/api/organizations/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId }),
  });

  if (!response.ok) {
    const body = (await response.json()) as { message?: string };
    throw new Error(body.message ?? "Failed to select organization");
  }
}

export function OrganizationProvider({
  organizations,
  initialSelectedOrganizationId,
  children,
}: {
  organizations: Organization[];
  initialSelectedOrganizationId: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hasSyncedDefault = useRef(false);
  const [optimisticOrganizationId, setOptimisticOrganizationId] = useState<
    string | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedOrganizationId =
    optimisticOrganizationId ?? initialSelectedOrganizationId;

  useEffect(() => {
    if (hasSyncedDefault.current || organizations.length === 0) {
      return;
    }

    const cookieMatchesOrganization = organizations.some(
      (organization) => organization.id === initialSelectedOrganizationId
    );

    if (cookieMatchesOrganization) {
      hasSyncedDefault.current = true;
      return;
    }

    hasSyncedDefault.current = true;

    void persistSelectedOrganizationId(organizations[0].id)
      .then(() => {
        router.refresh();
      })
      .catch(() => {
        hasSyncedDefault.current = false;
      });
  }, [organizations, initialSelectedOrganizationId, router]);

  const setSelectedOrganizationId = useCallback(
    async (id: string) => {
      setOptimisticOrganizationId(id);
      setIsUpdating(true);

      try {
        await persistSelectedOrganizationId(id);
        setOptimisticOrganizationId(null);
        router.refresh();
      } catch {
        setOptimisticOrganizationId(null);
      } finally {
        setIsUpdating(false);
      }
    },
    [router]
  );

  const selectedOrganization = useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === selectedOrganizationId
      ) ?? null,
    [organizations, selectedOrganizationId]
  );

  const value = useMemo(
    () => ({
      organizations,
      selectedOrganization,
      selectedOrganizationId,
      setSelectedOrganizationId,
      isUpdating,
    }),
    [
      organizations,
      selectedOrganization,
      selectedOrganizationId,
      setSelectedOrganizationId,
      isUpdating,
    ]
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider.");
  }

  return context;
}
