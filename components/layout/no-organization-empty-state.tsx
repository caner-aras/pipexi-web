import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface NoOrganizationEmptyStateProps {
  title: string;
  description: string;
}

export function NoOrganizationEmptyState({
  title,
  description,
}: NoOrganizationEmptyStateProps) {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader title={title} description={description} />

      <EmptyState
        icon={Building2}
        title="No organizations found"
        description="Create your first organization to get started."
        action={
          <Link
            href="/organizations"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="size-4" />
            New organization
          </Link>
        }
      />
    </div>
  );
}
