"use client";

import { Building2, ChevronRight } from "lucide-react";
import { useState } from "react";

import { OrganizationDetailsDrawer } from "@/components/organizations/organization-details-drawer";
import { cn } from "@/lib/utils";

interface OrganizationDetailsTriggerProps {
  organizationId: string;
  organizationName: string;
  className?: string;
}

export function OrganizationDetailsTrigger({
  organizationId,
  organizationName,
  className,
}: OrganizationDetailsTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm bg-background px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border/60 transition-colors hover:bg-muted hover:text-foreground",
          className
        )}
      >
        <Building2 className="size-3.5" />
        {organizationName}
        <ChevronRight className="size-3.5 opacity-70" />
      </button>
      <OrganizationDetailsDrawer
        organizationId={organizationId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
