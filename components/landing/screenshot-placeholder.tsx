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
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-[#e86a3d]/35 bg-[#fff8f1]/70",
        RATIO_CLASS[ratio],
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(31,168,85,0.14), transparent 42%), radial-gradient(circle at 80% 70%, rgba(232,106,61,0.16), transparent 45%)",
        }}
      />
      <p className="relative z-10 px-4 text-center text-sm font-bold tracking-wide text-[#c45a2c]">
        {label}
      </p>
      <p className="relative z-10 mt-1 max-w-xs px-4 text-center text-xs font-medium text-[#78716c]">
        {hint}
      </p>
    </div>
  );
}
