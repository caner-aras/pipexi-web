import { cn } from "@/lib/utils";

interface ScreenshotPlaceholderProps {
  label: string;
  hint?: string;
  className?: string;
  ratio?: "video" | "wide" | "square";
}

const RATIO_CLASS = {
  video: "aspect-video",
  wide: "aspect-[16/10]",
  square: "aspect-[4/3]",
} as const;

export function ScreenshotPlaceholder({
  label,
  hint = "Drop a product screenshot here",
  className,
  ratio = "wide",
}: ScreenshotPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-brand/35 bg-brand/5",
        RATIO_CLASS[ratio],
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--primary) 14%, transparent), transparent 42%), radial-gradient(circle at 80% 70%, color-mix(in oklab, var(--brand) 16%, transparent), transparent 45%)",
        }}
      />
      <p className="relative z-10 px-4 text-center text-sm font-bold tracking-wide text-brand-hover">
        {label}
      </p>
      <p className="relative z-10 mt-1 max-w-xs px-4 text-center text-xs font-medium text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}
