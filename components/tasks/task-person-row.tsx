"use client";

import { useState } from "react";

import { resolveAvatarUrl } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

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
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedAvatarUrl = resolveAvatarUrl(userId, avatarUrl);
  const showImage = Boolean(resolvedAvatarUrl) && !imageFailed;
  const avatarSize = compact ? "size-7" : "size-9";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
          avatarSize,
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedAvatarUrl!}
            alt=""
            className="size-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          getInitials(name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn("truncate text-foreground", textSize)}>{name}</p>
      </div>
    </div>
  );
}
