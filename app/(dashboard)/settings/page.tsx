import Link from "next/link";
import { KeyRound } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        title="Settings"
        description="Manage system configuration and access controls."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/settings/permissions"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto flex-col items-start gap-2 rounded-sm px-4 py-4 text-left"
          )}
        >
          <KeyRound className="size-4" />
          <span className="text-sm font-medium">Permissions</span>
          <span className="text-xs font-normal text-muted-foreground">
            View system permission keys.
          </span>
        </Link>
      </div>
    </div>
  );
}
