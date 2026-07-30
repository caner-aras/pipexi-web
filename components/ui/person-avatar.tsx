"use client";

import { useState } from "react";

import { useTheme } from "@/hooks/use-theme";
import { resolveAvatarUrl } from "@/lib/avatar";
import { getPersonColorByKey } from "@/lib/person-colors";
import { getMemberInitials } from "@/lib/shift-format";
import { cn } from "@/lib/utils";

const sizeClasses = {
  xs: "size-7 text-[10px]",
  sm: "size-8 text-[11px]",
  md: "size-10 text-xs",
  lg: "size-16 text-xl",
  xl: "size-20 text-2xl",
} as const;

const roundedClasses = {
  full: "rounded-full",
  md: "rounded-md",
  sm: "rounded-sm",
} as const;

interface PersonAvatarProps {
  name: string;
  userId?: string | null;
  avatarUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
  rounded?: keyof typeof roundedClasses;
  title?: string;
}

export function PersonAvatar({
  name,
  userId,
  avatarUrl,
  size = "md",
  className,
  rounded = "full",
  title,
}: PersonAvatarProps) {
  const { isDark } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const colorKey = userId || name;
  const color = getPersonColorByKey(colorKey, isDark);
  const resolvedAvatarUrl = resolveAvatarUrl(userId, avatarUrl);
  const showImage = Boolean(resolvedAvatarUrl) && !imageFailed;
  const initials = getMemberInitials(name);

  return (
    <div
      title={title}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden font-semibold",
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
      style={
        showImage
          ? undefined
          : {
              backgroundColor: color.avatar,
              color: color.text,
            }
      }
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
        initials
      )}
    </div>
  );
}
