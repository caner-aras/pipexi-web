import Image from "next/image";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Taller mark for login / marketing surfaces. */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const SIZE_CLASS = {
  sm: "h-6 w-auto",
  md: "h-7 w-auto",
  lg: "h-8 w-auto",
} as const;

export function BrandLogo({
  className,
  size = "md",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/assets/logo/pipexi-logo.png"
      alt="Pipexi"
      width={160}
      height={40}
      priority={priority}
      className={cn(SIZE_CLASS[size], "object-contain object-left", className)}
    />
  );
}
