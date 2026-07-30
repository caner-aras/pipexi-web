"use client";

import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";

interface TaskPersonRowProps {
  label: string;
  name: string;
  userId?: string | null;
  avatarUrl?: string | null;
  className?: string;
  compact?: boolean;
}

export function TaskPersonRow({
  label,
  name,
  userId,
  avatarUrl,
  className,
  compact = false,
}: TaskPersonRowProps) {
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <PersonAvatar
        name={name}
        userId={userId}
        avatarUrl={avatarUrl}
        size={compact ? "xs" : "sm"}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn("truncate text-foreground", textSize)}>{name}</p>
      </div>
    </div>
  );
}
