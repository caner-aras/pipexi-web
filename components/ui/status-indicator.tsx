"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatRecordStatusLabel,
  getRecordStatusMeta,
} from "@/lib/record-status";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
} as const;

interface StatusIndicatorProps {
  status: string;
  className?: string;
  iconClassName?: string;
  size?: keyof typeof SIZE_CLASS;
  /** Show the status label next to the icon. Defaults to icon-only. */
  showLabel?: boolean;
}

export function StatusIndicator({
  status,
  className,
  iconClassName,
  size = "md",
  showLabel = false,
}: StatusIndicatorProps) {
  const meta = getRecordStatusMeta(status);
  const Icon = meta.icon;
  const label = meta.label || formatRecordStatusLabel(status);

  const icon = (
    <Icon
      className={cn(SIZE_CLASS[size], "shrink-0", meta.className, iconClassName)}
      aria-hidden
    />
  );

  if (showLabel) {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5", className)}
        aria-label={label}
      >
        {icon}
        <span className="text-xs font-medium text-foreground">{label}</span>
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        className={cn("inline-flex cursor-default", className)}
        render={<span />}
        aria-label={label}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
