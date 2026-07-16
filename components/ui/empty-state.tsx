import type { LucideIcon } from "lucide-react";
import { Inbox, Search } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  filtered?: boolean;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  filtered = false,
  className,
}: EmptyStateProps) {
  const ResolvedIcon = Icon ?? (filtered ? Search : Inbox);
  const resolvedDescription =
    description ?? (filtered ? "Try adjusting your search or filters." : undefined);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-sm border border-dashed border-border/50 bg-muted/15 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-sm bg-background ring-1 ring-border/60">
        <ResolvedIcon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {resolvedDescription ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {resolvedDescription}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
